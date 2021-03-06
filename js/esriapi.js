define([
	"esri/layers/ArcGISDynamicMapServiceLayer", "esri/geometry/Extent", "esri/SpatialReference", "esri/tasks/query" ,"esri/tasks/QueryTask", "dojo/_base/declare", "esri/layers/FeatureLayer", 
	"esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol", "esri/graphic", "dojo/_base/Color", "dojo/_base/lang", "dojo/on"
],
function ( 	ArcGISDynamicMapServiceLayer, Extent, SpatialReference, Query, QueryTask, declare, FeatureLayer, 
			SimpleLineSymbol, SimpleFillSymbol, Graphic, Color, lang, on) {
        "use strict";

        return declare(null, {
			esriApiFunctions: function(t){	
				// Define dynamic layer numbers and layer def array
				t.selHb = "0";
				t.fwRare = "1";
				t.terRate = "2";
				t.avExt = "3";
				t.bioTgt = "4";
				t.hbNoData = "5";
				t.hbFil = "6";
				t.hbSwh = "7";
				t.layerDefinitions = [];
				// Add dynamic map service
				t.dynamicLayer = new ArcGISDynamicMapServiceLayer(t.url, {opacity:0.8});
				t.map.addLayer(t.dynamicLayer);
				if (t.obj.visibleLayers.length > 0){	
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				}
				t.dynamicLayer.on("load", lang.hitch(t, function () { 			
					t.layersArray = t.dynamicLayer.layerInfos;
					// Start with empty expressions
					t.standingc = ""; 
					t.forloss = "";
					t.refor = "";
					t.freshbiot = "";
					t.terrsp = "";
					t.imperiledFish = "";
					t.azeCount = "";
					t.ibaCount = "";
					t.vita = "";
					t.agloss = "";
					t.nitrogen = "";
					t.map.setMapCursor("pointer");
					// Save and Share 
					if (t.obj.stateSet == "yes"){
						//extent
						var extent = new Extent(t.obj.extent.xmin, t.obj.extent.ymin, t.obj.extent.xmax, t.obj.extent.ymax, new SpatialReference({ wkid:4326 }))
						t.map.setExtent(extent, true);
						// accordion visibility
						$('#' + t.id + t.obj.accordVisible).show();
						$('#' + t.id + t.obj.accordHidden).hide();
						$('#' + t.id + 'getHelpBtn').html(t.obj.buttonText);
						t.clicks.updateAccord(t);
						$('#' + t.id + t.obj.accordVisible).accordion( "option", "active", t.obj.accordActive );
						// hydrobasin click
						if (t.obj.selHbDef.length > 0){
							var q = new Query();
							q.where = t.obj.selHbDef;
							t.basinFl.selectFeatures(q,esri.layers.FeatureLayer.SELECTION_NEW);
						}
						// benefit checkboxes and sliders
						$.each(t.obj.checkedBenefits,lang.hitch(t,function(i,v){
							$('#' + t.id + 'basinByBensWrap input').each(lang.hitch(t,function(j,w){
								if ( v[0] == $(w).val() ){
									$('#' + t.id + '-' + v[0]).slider('values', v[1]);
									$(w).trigger('click')
								}
							}))	
						}))
						// additional data checkboxes
						if (t.obj.addDatalyr > -1){
							$('#' + this.id + 'supDataWrap input').each(lang.hitch(this,function(i,v){
								if( $(v).val() == "lyr-" + t.obj.addDatalyr ){
									$(v).prop('checked', true)
								}
							}));
						}
						t.obj.stateSet = "no";
					}else{
						t.clicks.layerDefsUpdate(t);
					}
				}));	
				var sym = new SimpleFillSymbol( SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(
					SimpleLineSymbol.STYLE_SOLID, new Color([0,0,255]), 2 ), new Color([0,0,0,0.1])
				);
				t.basinFl = new FeatureLayer(t.url + "/" + t.hbFil, { mode: FeatureLayer.MODE_SELECTION, outFields: ["*"] });
				t.basinFl.setSelectionSymbol(sym);
				t.basinFl.on('selection-complete', lang.hitch(t,function(evt){
					var index = t.obj.visibleLayers.indexOf(t.selHb);
					if (evt.features.length > 0){
						if ( $('#' + t.id + 'mainAccord').is(':hidden') ){
							$('#' + t.id + 'getHelpBtn').trigger('click');
						}
						$('#' + t.id + 'hydroHeader').html('Selected HydroBASIN Attributes');
						var atts = evt.features[0].attributes;
						t.obj.selHbDef = "OBJECTID = " + atts.OBJECTID;
						t.layerDefinitions[t.selHb] = t.obj.selHbDef;
						t.dynamicLayer.setLayerDefinitions(t.layerDefinitions);
						if (index == -1) {
							t.obj.visibleLayers.push(t.selHb);
							t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
						}
						var b = [['standingc',atts.standingc,6568.95], ['forloss',atts.forloss,19429.33], ['refor',atts.refor,65038.4], ['freshbiot',atts.freshbiot/10,1], 
								 ['terrsp',atts.terrsp,219], ["imperiledFish",atts.imperiledFish,41], ['azeCount',atts.azeCount,29], ['ibaCount',atts.ibaCount,99], ['vita',atts.vita,84.06], 
								 ['agloss',atts.agloss,68], ['nitrogen',atts.nitrogen,611.6]];
						t.hbar.updateHbar(t,b);
						
						if ($('#' + t.id + 'basinByBensWrap').is(":visible")){
							$('#' + t.id + 'hbbHeader').trigger('click');
						};
						if ($('#' + t.id + 'supDataWrap').is(":visible")){
							$('#' + t.id + 'sdWrap').trigger('click');
						};
						if ($('#' + t.id + 'hydroWrap').is(":hidden")){
							$('#' + t.id + 'hydroSection').trigger('click');
						};
						$('#' + t.id + 'graphWrap').slideDown();
					}else{
						if (index > -1) {
							t.obj.visibleLayers.splice(index, 1);
							t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);							
						}
						$('#' + t.id + 'hydroHeader').html('Click map to select a HydroBASIN');
						$('#' + t.id + 'graphWrap').slideUp();
						t.obj.selHbDef = "";	
					}	
				}));	
				t.map.on("click", lang.hitch(t, function(evt) {
					if (t.open == "yes"){
						t.obj.pnt = evt.mapPoint;
						var q = new Query();
						q.geometry = t.obj.pnt;
						t.basinFl.selectFeatures(q,esri.layers.FeatureLayer.SELECTION_NEW);
					}	
				}));
				t.map.on("zoom-end", lang.hitch(t,function(e){
					t.map.setMapCursor("pointer");
				}));
				t.map.on("update-end", lang.hitch(t,function(e){
					t.map.setMapCursor("pointer");
				}));				
			}
		});
    }
);
