var smEvent = {
	controlerSetting : function() {
		superMapInit.map.addControl(new SuperMap.Control.MousePosition());

		superMapInit.measurePolygon = new SuperMap.Control.Measure(
				SuperMap.Handler.SmcPolygonMeasure, {
					id : "area",
					persist : true,
					handlerOptions : {
						multiLine : true,
						movePopup : true,
						persistControl : true,
						layerName : "BiesPolygonMeasure",
						layerOptions : {
							styleMap : measureStyleMap
						}
					}
				});
		superMapInit.measureLine = new SuperMap.Control.Measure(
				SuperMap.Handler.SmcPathMeasure, {
					id : "distance",
					persist : true,
					handlerOptions : {
						multiLine : true,
						movePopup : true,
						persistControl : true,
						layerOptions : {
							styleMap : measureStyleMap
						}
					}
				});
		// 반경
		superMapInit.measureCircle = new SuperMap.Control.Measure(
				SuperMap.Handler.SmcCircle, {
					id : "circle",
					persist : true,
					handlerOptions : {
						multiLine : false,
						movePopup : true,
						persistControl : true,
						sides : 50,
						radius : 0,
						angle : 0
					}
				});

		// 그리기 control 설정
		SmDraw.control();
		// 편집 control 설정
		SmEdit.control();

		// control 추가
		superMapInit.controlers = [ superMapInit.measurePolygon,
				superMapInit.measureLine, superMapInit.measureCircle,
				superMapInit.drawPoint, superMapInit.drawLine,
				superMapInit.drawPolygon, superMapInit.editPoint,
				superMapInit.editLine, superMapInit.editPolygon, modifyFeature,
				editFeature ];

		superMapInit.map.addControls(superMapInit.controlers);
	},
	layerSetting : function() {
		// Initialize the layer
		// http://61.32.6.18:8090/iserver/services/online_vWorld/rest/maps/OSM
		var points = [ new SuperMap.Geometry.Point(13730000, 4600000),
				new SuperMap.Geometry.Point(14800000, 4600000),
				new SuperMap.Geometry.Point(14800000, 3860000) ], linearRings = new SuperMap.Geometry.LinearRing(
				points), region = new SuperMap.Geometry.Polygon([ linearRings ]);

		baseLayer = new SuperMap.Layer.TiledDynamicRESTLayer("기본",
				"http://61.32.6.18:9090/iserver/services/vworld/rest/maps/OSM",
				// "기본",
				// "http://localhost:8090/iserver/services/vworld/rest/maps/OSM",
				{
					transparent : true,
					cacheEnabled : false
				}, {
					projection : 'EPSG:3857',
					scales : superMapInit.scales,
					isBaseLayer : true
				});
		baseLayer.useCanvas = false;
		satelliteLayer = new SuperMap.Layer.TiledDynamicRESTLayer("영상",
				"http://61.32.6.18:9090/iserver/services/Satellite/rest/maps/OSM",
				// "기본",
				 //"http://localhost:8090/iserver/services/vworld/rest/maps/OSM",
				{
					transparent : true,
					cacheEnabled : false,
					format : "jpeg"
				}, {
					projection : 'EPSG:3857',
					scales : superMapInit.scales,
					isBaseLayer : true
				});
		satelliteLayer.useCanvas = false;
//		hybridLayer = new SuperMap.Layer.TiledDynamicRESTLayer("Hybrid",
//				"http://61.32.6.18:9090/iserver/services/Hybrid/rest/maps/OSM",
//				// "기본",
//				// "http://localhost:8090/iserver/services/vworld/rest/maps/OSM",
//				{
//					transparent : true,
//					cacheEnabled : false
//				}, {
//					projection : 'EPSG:3857',
//					scales : superMapInit.scales,
//					isBaseLayer : false
//				});
//		hybridLayer.useCanvas = false;
		// baseLayer = new SuperMap.Layer.VWorldLayer("Base");
//		satelliteLayer = new SuperMap.Layer.VWorldLayer("영상");
		hybridLayer = new SuperMap.Layer.VWorldLayer("Hybrid");

		// baseLayer.url =
		// ['http://61.32.6.18:18080/2d/Base/201512/${z}/${x}/${y}.png'];
//		satelliteLayer.url = [ 'http://xdworld.vworld.kr:8080/2d/Satellite/201512/${z}/${x}/${y}.jpeg' ];
		hybridLayer.url = [ 'http://xdworld.vworld.kr:8080/2d/Hybrid/201512/${z}/${x}/${y}.png' ];
//		hybridLayer.isBaseLayer = false;
//
//		// baseLayer.useCORS = true;
//		satelliteLayer.useCORS = true;
//		hybridLayer.useCORS = true;
		// baseLayer.useCanvas = false;

		// iServer8c
		var url2 = "http://61.32.6.18:9090/iserver/services/map-Change_SuperMan/rest/maps/도시가스지도";
		var urlWms = "http://61.32.6.18:8090/iserver/services/map-edit_test/rest/maps/test_point@test5186";
		// iServer7c
		var url3 = "http://61.32.6.18:9090/iserver/services/map-POC_3/rest/maps/법정경계_읍면동";
		var url5 = "http://211.44.239.144:8090/iserver/services/map-map1/rest/maps/BUS_ROUTE";

		// imsangdo7c = new SuperMap.Layer.WMS("Asiana",urlWms,{layers:
		// "Asiana"});

		imsangdo7c = new SuperMap.Layer.TiledDynamicRESTLayer("임상도 7c", url3, {
			transparent : true,
			cacheEnabled : false,
			//layersID : "[0:5]"
		}, {
			projection : 'EPSG:3857',
			resolutions : satelliteLayer.resolutions,
			isBaseLayer : false
		});
		imsangdo7c.useCORS = true;
		imsangdo7c.useCanvas = false;
		//imsangdo7c.setOpacity(0.4);
		var wmsurl = "http://localhost:8090/iserver/services/map-china400/wms130/China";
		wms= new SuperMap.Layer.WMS("China", wmsurl, 
			{ layers: "China", version: '1.3.0' }, 
			{projection:"EPSG:3857",resolutions : satelliteLayer.resolutions,isBaseLayer :false,transparent : true}
		);
		//wms.setOpacity(0.4);
		var vWmsurl = "http://map.vworld.kr/js/wms.do";
		wms2= new SuperMap.Layer.WMS("vWm", vWmsurl, 
			{ layers: "LT_C_UQ111", version: '1.3.0',APIKEY:"EFAB70F4-EFB1-3AF1-9E61-34A79EB32D2D",DOMAIN:"http://localhost:8080" }, 
			{projection:"EPSG:3857",resolutions : satelliteLayer.resolutions,maxExtent: new SuperMap.Bounds(-20037508.34 , -20037508.34,20037508.34 , 20037508.34),isBaseLayer :false}
		);
		wms2.CLASS_NAME = "SuperMap.Layer.VWMS";
		
		// imsangdo8c = new SuperMap.Layer.TiledDynamicRESTLayer(
		// "임상도 8c", url2,
		// {
		// transparent: true,
		// cacheEnabled: false
		// },{
		// //projection:'EPSG:3857',
		// maxResolution : "auto",
		// isBaseLayer :false
		// }
		// );
		// imsangdo8c.useCORS = true;
		// imsangdo8c.useCanvas = false;

		vectorLayer = new SuperMap.Layer.Vector("Vector Layer", {
			isBaseLayer : false,
			style : style1
		});
		vectorLayer.events.on({
			"click" : function(e) {
				console.log(e);
			}
		});

		SmDraw.layer();
		SmEdit.layer();
		imsangdo7c.events.on({
			"layerInitialized" : superMapInit.addLayer,
			"loadend" : function() {
				$("#map img").attr("alt","test");
				$("#map canvas").attr("alt","test");
			}
		});
	},
	baseMapChange :function(){
		baseLayer.setVisibility(true);
		satelliteLayer.setVisibility(false);
		hybridLayer.setVisibility(false);
		superMapInit.map.setBaseLayer(baseLayer);
		$("#btnBaseMap").on("click",function(){
			$(this).attr("disabled","disabled");
			$("#btnSatelliteMap").removeAttr("disabled","disabled");
			baseLayer.setVisibility(true);
			satelliteLayer.setVisibility(false);
			hybridLayer.setVisibility(false);
			superMapInit.map.setBaseLayer(baseLayer);
			
		});
		$("#btnSatelliteMap").on("click",function(){
			$(this).attr("disabled","disabled");
			$("#btnBaseMap").removeAttr("disabled","disabled");
			baseLayer.setVisibility(false);
			satelliteLayer.setVisibility(true);
			hybridLayer.setVisibility(true);
			superMapInit.map.setBaseLayer(satelliteLayer);
		});
	},
	toolbarEventSetting : function() {

		$("#btnMove").on("click", function() {
			superMapInit.clearControlAll();
			superMapInit.map.getControl("pan").activate();
		});

		// 거리 측정
		$("#btnDist").on("click", function() {
			superMapInit.clearControlAll();
			superMapInit.measureLine.activate();
		});

		// 면적 측정
		$("#btnArea").on("click", function() {
			superMapInit.clearControlAll();
			superMapInit.measurePolygon.activate();
		});

		// 거리, 면적 측정 값 초기화 및 팝업 제거
		$("#btnTrash").on("click", function() {
			superMapInit.clearControlAll();
			map.getControl("distance").handler.cleanFeature();
			map.getControl("area").handler.cleanFeature();
			if (popwin)
				map.removePopup(popwin);
			superMapInit.map.getControl("pan").activate();
			// areaMeasure();
		});

		$("#btnCapture").on("click", function() {
			var host = "http://61.32.6.18:18080/iserver";
			var size = map.getCurrentSize();
			var mapViewPort = $("#map div:first-child");

			var jsonParameters = SuperMap.Util.toJSON({
				"width" :size.w,
				"height" :size.h,
				//"pageSize" : "A4",
				//"orientation" : "Landscape",
				"html" :mapViewPort.children().html()
			});
			getServerResource("capture",jsonParameters,function(json){
				var result = SuperMap.Util.transformResult(json);
				var pdfurl = "download.jsp?url="+host+"/" + result.path;
				alert(pdfurl);
				var link = document.createElement('a');
				link.href = pdfurl;
				link.target= "_blank";
				document.body.appendChild(link);
				link.click();
				link.remove();
			 });

			// MapToImg&&MapToImg.excute(map);

			var mapElem = mapViewPort.children()[0]; // the id of your map
														// div here
			//
			// html2canvas(mapElem, {
			// useCORS: true,
			// onrendered: function(canvas) {
			//	        	 
			// mapImg = canvas.toDataURL('image/png');
			// var jsonCanvasParameters = SuperMap.Util.toJSON({
			// "width" :size.w,
			// "height" :size.h,
			// "html" :"<img src='"+mapImg+"'/>"
			// });
			// getServerResource("capture",jsonCanvasParameters,function(json){
			// var host = "http://127.0.0.1:8090/iserver";
			// var result = SuperMap.Util.transformResult(json);
			// var link = document.createElement('a');
			// console.log(host+"/"+result.path);
			// link.href = host+"/"+result.path;
			// link.download = 'Download.png';
			// link.target= "_blank";
			// document.body.appendChild(link);
			// link.click();
			// link.remove();
			//	 				
			// });
			// }
			// });
		});
		$("#btnPrintPopup").on("click", function() {
			$("#printPopup").dialog("open");
		});

		$("#btnPrint").on("click",function() {
			//var host = "http://61.32.6.18:18080/iserver";
			var host = "http://localhost:8090/iserver";
			var size = map.getCurrentSize();
			var layers = map.layers;
			var layerInfos = [];
			$.each(layers, function(idx, layer) {
				if (layer.getVisibility()) {
					var pLayer = {};
					if (layer.CLASS_NAME == "SuperMap.Layer.TiledDynamicRESTLayer") {
						pLayer.type = "REST";
						pLayer.url = layer.url;
						pLayer.layersID = layer.params.layersID;
						layerInfos.push(pLayer);
					} else if(layer.CLASS_NAME == "SuperMap.Layer.VWMS"){
						pLayer.type = "VWMS";
						pLayer.url = layer.url;
						pLayer.params = layer.params;
						layerInfos.push(pLayer);
					}  else if(layer.CLASS_NAME == "SuperMap.Layer.WMS"){
						pLayer.type = "WMS";
						pLayer.url = layer.url;
						pLayer.params = layer.params;
						layerInfos.push(pLayer);
					} else if (layer.CLASS_NAME == "SuperMap.Layer.Vector") {
						console.log(layer.style);
						if (layer.features.length > 0) {
							pLayer.type = "VECTOR";
							var style = null;

							if (layer.style != null) {
								tyle = layer.style;
							}
							var styleMapRules = layer.styleMap.styles["default"].rules;

							pLayer.features = [];
							$.each(layer.features, function(idx, feature) {
								var serverGeom = {};
								var pFeature = {};
								if (feature.geometry.text != undefined) {
									var point = new SuperMap.LonLat(feature.geometry.x,feature.geometry.y);
									//point = point.transform(new SuperMap.Projection('EPSG:3857'),new SuperMap.Projection('EPSG:4326'));
									serverGeom.parts = [ 1 ];
									serverGeom.points = [ {x : point.lon,y : point.lat} ];
									serverGeom.type = "TEXT";
									serverGeom.text = feature.geometry.text;
									pFeature.geometry = serverGeom;
								} else {
									var geometry = feature.geometry.clone();
									//geometry.transform(new SuperMap.Projection('EPSG:3857'),new SuperMap.Projection('EPSG:4326'));
									serverGeom = SuperMap.REST.ServerGeometry.fromGeometry(geometry);
									pFeature.geometry = serverGeom;
								}
								if (feature.style != null) {
									pFeature.style = feature.style;
								} else if (style != null) {
									pFeature.style = style;
								} else if (styleMapRules.length > 0) {
									symbolizer = styleMapRules[0].symbolizer;
									if (serverGeom.type == "POINT") {
										pFeature.style = symbolizer["Point"];
									} else if (serverGeom.type == "LINE") {
										pFeature.style = symbolizer["Line"];
									} else if (serverGeom.type == "REGION") {
										pFeature.style = symbolizer["Polygon"];
									}
								}

								pLayer.features.push(pFeature);
							});
							layerInfos.push(pLayer);
						}
					}

				}
			});
			var pageSize = $("#printPageSize").val();
			var docType = $("#docType").val();
			var jsonParameters = SuperMap.Util.toJSON({
				"imgInfo" : {
					"pageSize" : pageSize,
					"orientation" : pageSize,
					"docType" : docType,
					"extents" : [{
					            	 "epsgCode" : 3857,
					            	 "extent" : map.getExtent()
					             }, {
					            	 "epsgCode" : 4326,
					            	 "extent" : map.getExtent().transform(new SuperMap.Projection('EPSG:3857'),new SuperMap.Projection('EPSG:4326'))
					             },{
					            	 "epsgCode" : 5186,
					            	 "extent" : map.getExtent().transform(new SuperMap.Projection('EPSG:3857'),new SuperMap.Projection('EPSG:5186'))
					             }],
					"scale" : map.getScale(),
					"resolution" : map.getResolution(),
					"title" : $("#printTitle").val(),
					"content" : $("#printContent").val()
				},
				"layerInfos" : layerInfos
			});
			// console.log(jsonParameters);
			getServerResource("getImage",jsonParameters,function(json) {
				var result = SuperMap.Util
						.transformResult(json);
				if(docType=="PDF"){
					var pdfurl = host+"/" + result.path;
					var link = document.createElement('a');
					link.href = pdfurl;
					link.download = 'Download.png';
					link.target= "_blank";
					document.body.appendChild(link);
					link.click();
					link.remove();
				}else {
					var imgurl = "print.jsp?imgUrl=" + host
							+ "/" + result.path
							+ "&pageSize=" + pageSize;
					var newWindow = window.open(imgurl, "newWindow","height=600, width=800, resizable=yes");
				}
			});
		});
		// Anchored 팝업 offset 설정 (REQ-0006)
		$("#btnPopup").on("click",function() {
			var contentHTML = "<div style='width:80px; border-width:2px; border-style:solid; border-color:red;font-size:12px; opacity: 0.8'>";
			contentHTML += "Test  Test";
			contentHTML += "</div>";

			var lonLat = map.getCenter();
			var anchor = {
				'size' : new SuperMap.Size(0, 0),
				'offset' : new SuperMap.Pixel(0, 0)
			};
			if (popwin)
				map.removePopup(popwin);
			popwin = new SuperMap.Popup.Anchored("chicken",
					lonLat, new SuperMap.Size(90, 25),
					contentHTML, anchor, false, null);
			var point = new SuperMap.Geometry.Point(lonLat.lon,
					lonLat.lat);
			var feature = new SuperMap.Feature.Vector(point,
					null, style1);
			vectorLayer.addFeatures(feature);
			map.addPopup(popwin);
		});

		// 그리기 버튼 클릭 이벤트
		$("#btnDraw").on("click", function() {
			$("#drawPanel").toggle();
		});
		$("#btnEdit").on("click", function() {
			$("#editPanel").toggle();
		});
		// 텍스트 그리기 버튼 클릭 이벤트
		$("#btnTextLine").on("click", function() {
			superMapInit.clearControlAll();
			superMapInit.drawPoint.activate()
		});

		// 선 그리기 버튼 클릭 이벤트
		$("#btnDrawLine").on("click", function() {
			superMapInit.clearControlAll();
			superMapInit.drawLine.activate()
		});
		// 면 그리기 버튼 클릭 이벤트
		$("#btnDrawPolygon").on("click", function() {
			superMapInit.clearControlAll();
			superMapInit.drawPolygon.activate()
		});
		// 도형 선택 버튼 이벤트
		$("#btnDrawSelect").on("click", function() {
			superMapInit.clearControlAll();
			superMapInit.moveLayerToTop(drawLayer);
			modifyFeature.activate()
		});
		// 선/면등 도형을 레이어에서 삭제
		$("#btnDrawTrash").on("click", function() {
			superMapInit.clearControlAll();
			drawLayer.removeAllFeatures();
		});
		// 선/면 도형 설정
		$("#btnDrawSetting").on("click", function() {
			if ($("#drowSettingPopup").dialog("isOpen")) {
				$("#drowSettingPopup").dialog("close");
			}
			if (drawLayer.selectedFeatures.length > 0) {
				$("#drowSettingPopup").dialog("open");
			} else {
				alert("선택된 도형이 없습니다.");
			}
		});

		// 텍스트 그리기 버튼 클릭 이벤트
		$("#btnEditPoint").on("click", function() {
			superMapInit.clearControlAll();
			superMapInit.editPoint.activate()
		});

		// 선 그리기 버튼 클릭 이벤트
		$("#btnEditLine").on("click", function() {
			superMapInit.clearControlAll();
			superMapInit.editLine.activate()
		});
		// 면 그리기 버튼 클릭 이벤트
		$("#btnEditPolygon").on("click", function() {
			superMapInit.clearControlAll();
			superMapInit.editPolygon.activate()
		});
		// 도형 선택 버튼 이벤트
		$("#btnEditSelect").on("click", function() {
			superMapInit.clearControlAll();
			superMapInit.moveLayerToTop(searchLayer);
			editFeature.activate()
		});
		// 선/면등 도형을 레이어에서 삭제
		$("#btnEditTrash").on("click", function() {
			superMapInit.clearControlAll();
			editLayer.removeAllFeatures();

			if (searchLayer.selectedFeatures.length > 0) {
				SmEdit.editDelete(searchLayer.selectedFeatures);
			} else {
				alert("선택된 도형이 없습니다.");
			}
		});

		$("#btnSearch").on("click", function() {
			 superMapInit.queryResult();
			//drawPointCompleted();
		});
	}
}