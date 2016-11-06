var mapExtent = new SuperMap.Bounds(13730000, 3860000,14840000, 4680000);
var superMapInit = {
	featureCallBack  : {
		over: function(currentFeature){
	    	//todo
	    	console.log(" over: ");
	    	console.log(currentFeature);
	    },
	    out: function(currentFeature){
	    	//todo
	    	console.log(" out: ");
	    	console.log(currentFeature);
	    },
	    click: function(currentFeature){
	    	//todo
	    	console.log(" click: ");
	    	console.log(currentFeature);
	    },
	    clickout: function(lastFeature){
	    	//todo
	    	console.log(" clickout: ");
	    	console.log(lastFeature);
	    },
	    rightclick:function(currentFeature){
	    	//todo
	    	console.log(" rightclick:function: ");
	    	console.log(currentFeature);
	    },
	    dblclick: function(currentFeature){
	    	//todo
	    	console.log(" dblclick: ");
	    	console.log(currentFeature);
	    }
	},
	map: null,
	drawPoint : null,
	drawLine : null,
	drawPolygon : null,
	measurePolygon : null,
    measureLine : null,
    editPoint : null,
	editLine : null,
	editPolygon : null,
    
    resolutions : [
		2445.98, 1222.99, 611.50, 305.75, 
		152.87,  76.44,   38.22,  19.11,
		9.55,    4.78,    2.39,   1.19,
		0.60,    0.30
	] ,
	scales : [
  		9244667.3, 4622333.6, 2311166.8, 1155583.4, 
  		577791.7,  288895.8,  144447.9,  72223.9,
  		36111.9,   18055.9,   9027.9,    4513.9,
  		2256.9,    1128.9
  	] ,
    // 반경 
    measureCircle : null,
    controlers : [],
	init : function(){
		map=superMapInit.map = new SuperMap.Map("map", {
			units:"m",
			numZoomLevels : 19,
			//allOverlays : true ,
			//restrictedExtent :mapExtent,
			maxExtent : mapExtent,
			controls : [
				new SuperMap.Control.LayerSwitcher(), 
				// 면적 
				new SuperMap.Control.Zoom() ,
				new SuperMap.Control.Navigation({
					id:"pan",
	                dragPanOptions: {
	                	documentDrag:true,
	                    enableKinetic: true
	                }
				})
			]
		});
		map.events.on({
			"moveend" : function(e){
				
			}
		});
		// 레이어 설정 
		superMapInit.layerSetting();
		// 맵 control 설정 
		superMapInit.controlerSetting();
		// 베이스 맵 변경 이벤트 설정 
		superMapInit.baseMapChange();
		// 오른쪽 툴박스 버튼 이벤트 설정 
		superMapInit.toolbarEventSetting();
		
	},
	//Asynchronous loading layer
	addLayer : function(){
		$("img").attr('crossOrigin', 'anonymous');//img.setAttribute('crossOrigin', 'anonymous');
		superMapInit.map.addLayers([baseLayer, satelliteLayer,hybridLayer,imsangdo7c,vectorLayer,drawLayer,editLayer,searchLayer]);
		superMapInit.map.setCenter(new SuperMap.LonLat(14174150.9795765, 4495339.98139926), 1);
		superMapInit.getEditData();
	},
	controlerSetting : function(){
		superMapInit.map.addControl(new SuperMap.Control.MousePosition());
		
		superMapInit.measurePolygon = new SuperMap.Control.Measure(SuperMap.Handler.SmcPolygonMeasure, {
	     	id : "area",
	     	persist : true,
	     	handlerOptions: {
	     		multiLine : true,
	     		movePopup : true,
	     		persistControl : true,
	     		layerName : "BiesPolygonMeasure",
	     		layerOptions : {
	     			styleMap: measureStyleMap
	     		}
	 		}
	    });
		superMapInit.measureLine = new SuperMap.Control.Measure(SuperMap.Handler.SmcPathMeasure, {
	    	id : "distance", 
	    	persist : true,
	    	handlerOptions: {
	    		multiLine : true,
	    		movePopup : true,
	    		persistControl : true,
	    		layerOptions : {
	    			styleMap: measureStyleMap
	    		}
			}
	    });
	    // 반경 
		superMapInit.measureCircle = new SuperMap.Control.Measure(SuperMap.Handler.SmcCircle, {
	    	id : "circle",
	    	persist : true,
	    	handlerOptions: {
	    		multiLine : false,
	    		movePopup : true,
	    		persistControl : true,
	    		sides:50,
	    		radius:0,
	    		angle:0
			}
	    });
		
		// 그리기 control 설정
		SmDraw.control();
		// 편집 control 설정
		SmEdit.control();
		
		// control 추가  
		superMapInit.controlers = [
			superMapInit.measurePolygon,superMapInit.measureLine,superMapInit.measureCircle,
			superMapInit.drawPoint,superMapInit.drawLine,superMapInit.drawPolygon,
			superMapInit.editPoint,superMapInit.editLine,superMapInit.editPolygon,
			modifyFeature,editFeature
		];

		superMapInit.map.addControls(superMapInit.controlers);
	},
	layerSetting : function(){
		//Initialize the layer
		//http://61.32.6.18:8090/iserver/services/online_vWorld/rest/maps/OSM
		var points =[
             new SuperMap.Geometry.Point(13730000,4600000),
             new SuperMap.Geometry.Point(14800000,4600000),
             new SuperMap.Geometry.Point(14800000,3860000)
		],
		linearRings = new SuperMap.Geometry.LinearRing(points),
		region = new SuperMap.Geometry.Polygon([linearRings]);
		
		baseLayer = new SuperMap.Layer.TiledDynamicRESTLayer(
			"기본", "http://61.32.6.18:9090/iserver/services/vworld/rest/maps/OSM", 
			//"기본", "http://localhost:8090/iserver/services/vworld/rest/maps/OSM", 
			{
				transparent: true, 
				cacheEnabled: false
			},{
				projection:'EPSG:3857',
				scales :superMapInit.scales,
				isBaseLayer :true
			}
		);
		//baseLayer = new SuperMap.Layer.VWorldLayer("Base");
		satelliteLayer = new SuperMap.Layer.VWorldLayer("영상");
		hybridLayer = new SuperMap.Layer.VWorldLayer("Hybrid");
	
		
		//baseLayer.url = ['http://61.32.6.18:18080/2d/Base/201512/${z}/${x}/${y}.png'];
		satelliteLayer.url = ['http://61.32.6.18:18080/2d/Satellite/201512/${z}/${x}/${y}.jpeg'];			
		hybridLayer.url = ['http://61.32.6.18:18080/2d/Hybrid/201512/${z}/${x}/${y}.png'];	
		hybridLayer.isBaseLayer = false;
		
		//baseLayer.useCORS = true;
		satelliteLayer.useCORS = true;
		hybridLayer.useCORS = true;
		//baseLayer.useCanvas = false;
		
		//iServer8c
		var url2 = "http://61.32.6.18:9090/iserver/services/map-Change_SuperMan/rest/maps/도시가스지도";
		var urlWms = "http://61.32.6.18:8090/iserver/services/map-edit_test/rest/maps/test_point@test5186";
		//iServer7c
		var url3 = "http://61.32.6.18:18080/iserver/services/map-world/rest/maps/World Map";
		var url5 = "http://192.168.0.247:8090/iserver/services/map-Change_SuperMan/rest/maps/행정구역" ;
		
		//imsangdo7c = new SuperMap.Layer.WMS("Asiana",urlWms,{layers: "Asiana"});
		
		
		imsangdo7c = new SuperMap.Layer.TiledDynamicRESTLayer(
			"임상도 7c", url3, 
			{
				transparent: true, 
				cacheEnabled: false,
				layersID : "[0:0,5]"
			},{
				projection:'EPSG:3857',
				resolutions :satelliteLayer.resolutions,
				isBaseLayer :false
			}
		);
		imsangdo7c.useCORS = true;
		//imsangdo7c.useCanvas = false;
//		imsangdo8c = new SuperMap.Layer.TiledDynamicRESTLayer(
//			"임상도 8c", url2, 
//			{
//				transparent: true, 
//				cacheEnabled: false
//			},{
//				//projection:'EPSG:3857',
//				maxResolution : "auto",
//				isBaseLayer :false
//			}
//		);
//		imsangdo8c.useCORS = true;
//		imsangdo8c.useCanvas = false;
		
		vectorLayer = new SuperMap.Layer.Vector("Vector Layer", {
		    isBaseLayer: false,
		    style : style1
		});
		vectorLayer.events.on({"click":function(e){
			console.log(e);
		}});
		
		SmDraw.layer();
		SmEdit.layer();
		imsangdo7c.events.on({
			"layerInitialized" : superMapInit.addLayer,
			"loadend" : function(){
				
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
	toolbarEventSetting:function(){
		
		$("#btnMove").on("click",function(){
			superMapInit.clearControlAll();
			superMapInit.map.getControl("pan").activate();
		});
		
		// 거리 측정 
		$("#btnDist").on("click",function(){
			superMapInit.clearControlAll();
			superMapInit.measureLine.activate();
		});
		
		// 면적 측정
		$("#btnArea").on("click",function(){
			superMapInit.clearControlAll();
			superMapInit.measurePolygon.activate();
		});
		
		// 거리, 면적 측정 값 초기화 및 팝업 제거 
		$("#btnTrash").on("click",function(){
			superMapInit.clearControlAll();
			map.getControl("distance").handler.cleanFeature();
			map.getControl("area").handler.cleanFeature();
			if(popwin) map.removePopup(popwin);
			superMapInit.map.getControl("pan").activate();
			//areaMeasure();
		});
		
		$("#btnCapture").on("click",function(){
			var host = "http://61.32.6.18:18080/iserver";
			var size = map.getCurrentSize();
			var mapViewPort = $("#map div:first-child");
			
//			var jsonParameters = SuperMap.Util.toJSON({
//				"width" :size.w,
//				"height" :size.h,
//				"html" :mapViewPort.children().html()
//			});
//			getServerResource("capture",jsonParameters,function(json){
//				var result = SuperMap.Util.transformResult(json);
//				var link = document.createElement('a');
//				link.href = host+"/"+result.path;
//				link.download = 'Download.png';
//				link.target= "_blank";
//				document.body.appendChild(link);
//				link.click();
//				link.remove();
//			});
			
			//MapToImg&&MapToImg.excute(map);
			
			var mapElem = mapViewPort.children()[0]; // the id of your map div here
//
//	        html2canvas(mapElem, {
//	          useCORS: true,
//	          onrendered: function(canvas) {
//	        	 
//	             mapImg = canvas.toDataURL('image/png');
//	             var jsonCanvasParameters = SuperMap.Util.toJSON({
//	 				"width" :size.w,
//	 				"height" :size.h,
//	 				"html" :"<img src='"+mapImg+"'/>"
//	 			});
//	            getServerResource("capture",jsonCanvasParameters,function(json){
//	            	var host = "http://127.0.0.1:8090/iserver";
//	            	var result = SuperMap.Util.transformResult(json);
//	 				var link = document.createElement('a');
//	 				console.log(host+"/"+result.path);
//	 				link.href = host+"/"+result.path;
//	 				link.download = 'Download.png';
//	 				link.target= "_blank";
//	 				document.body.appendChild(link);
//	 				link.click();
//	 				link.remove();
//	 				
//	 			});
//	          }
//	        });
		});
		$("#btnPrintPopup").on("click",function(){
			$("#printPopup").dialog("open");
		});
		
		$("#btnPrint").on("click",function(){
			var host = "http://127.0.0.1:8090/iserver";
			var size = map.getCurrentSize();
			var layers = map.layers;
			var layerInfos = [];
			$.each(layers,function(idx,layer){
				if(layer.getVisibility()){
					var pLayer = {};
					if(layer.CLASS_NAME == "SuperMap.Layer.TiledDynamicRESTLayer"){
						pLayer.type = "REST";
						pLayer.url = layer.url;
						pLayer.layersID = layer.params.layersID;
						//console.log(pLayer.layersID);
						layerInfos.push(pLayer);
					}else if(layer.CLASS_NAME == "SuperMap.Layer.Vector"){
						console.log(layer.style);
						if(layer.features.length>0){
							pLayer.type = "VECTOR";
							var style = null ;
							
							if(layer.style !=null){
								style = layer.style;
							} 
							var styleMapRules = layer.styleMap.styles["default"].rules;
							
							pLayer.features = [];
							$.each(layer.features,function(idx,feature){
								var serverGeom={};
								var pFeature = {};
								if(feature.geometry.text != undefined){
									console.log(feature.geometry);
									var point = new SuperMap.LonLat(feature.geometry.x,feature.geometry.y);
									point = point.transform(new SuperMap.Projection('EPSG:3857'), new SuperMap.Projection('EPSG:4326'));
									serverGeom.parts = [1];
									serverGeom.points = [{x:point.lon,y:point.lat}];
									serverGeom.type= "TEXT";
									serverGeom.text = feature.geometry.text;
									pFeature.geometry = serverGeom;
								}else {
									var geometry = feature.geometry.clone();
									geometry.transform(new SuperMap.Projection('EPSG:3857'), new SuperMap.Projection('EPSG:4326'));
									serverGeom = SuperMap.REST.ServerGeometry.fromGeometry(geometry);
									pFeature.geometry = serverGeom;
								}
								if(feature.style != null){
									pFeature.style = feature.style;
								} else if(style != null){
									pFeature.style = style;
								} else if(styleMapRules.length>0){
									symbolizer = styleMapRules[0].symbolizer;
									if(serverGeom.type=="POINT"){
										pFeature.style = symbolizer["Point"];
									} else if(serverGeom.type=="LINE"){
										pFeature.style = symbolizer["Line"];
									} else if(serverGeom.type=="REGION"){
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
			var jsonParameters = SuperMap.Util.toJSON({
				"imgInfo" : {
					"pageSize": $("#printPageSize").val(),
					"orientation": pageSize,
					"extents":[
					    {"epsgCode":3857,"extent":map.getExtent()},
					    {"epsgCode":4326,"extent":map.getExtent().transform(new SuperMap.Projection('EPSG:3857'), new SuperMap.Projection('EPSG:4326'))},
					    {"epsgCode":5186,"extent":map.getExtent().transform(new SuperMap.Projection('EPSG:3857'), new SuperMap.Projection('EPSG:5186'))}
					],//.transform(new SuperMap.Projection('EPSG:3857'), new SuperMap.Projection('EPSG:4326')),
					"sacle":map.getScale()
				},
				"layerInfos" :layerInfos
			});
			//console.log(jsonParameters);
			getServerResource("print",jsonParameters,function(json){
				var result = SuperMap.Util.transformResult(json);
				var url="print.jsp?imgUrl="+host+"/"+result.path+"&pageSize="+pageSize;
				var newWindow = window.open(url, "newWindow", "height=600, width=800, resizable=yes");
			});

//			getServerResource("print",jsonParameters,function(json){
//				var result = SuperMap.Util.transformResult(json);
//				$("#printView").empty();
//				$("<iframe></iframe>")
//					.attr("src",host+"/"+result.path)
//					.appendTo($("#printView"));
//			});
			
//			var mapElem = mapViewPort.children()[0]; // the id of your map div here
//	        html2canvas(mapElem, {
//	          useCORS: true,
//	          onrendered: function(canvas) {
//	        	 mapImg = canvas.toDataURL('image/png');
//	        	  var jsonCanvasParameters = SuperMap.Util.toJSON({
//					"width" :size.w,
//					"height" :size.h,
//					"html" :"<img src='"+mapImg+"'/>",
//					"pageSize": $("#printPageSize").val(),
//					"orientation": $("#printOrientation").val()
//	        	  });
//	            getServerResource("print",jsonCanvasParameters,function(json){
//					var result = SuperMap.Util.transformResult(json);
//					$("#printView").empty();
//					$("<iframe width='450' height='400'></iframe>")
//						.attr("src",host+"/"+result.path)
//						.appendTo($("#printView"));
//	 				
//	 			});
//	          }
//	        });
		});
		// Anchored 팝업 offset 설정 (REQ-0006)
		$("#btnPopup").on("click",function(){
			var contentHTML = "<div style='width:80px; border-width:2px; border-style:solid; border-color:red;font-size:12px; opacity: 0.8'>";
			contentHTML += "Test  Test";
			contentHTML += "</div>";

			var lonLat = map.getCenter();
			var anchor = {'size': new SuperMap.Size(0,0), 'offset': new SuperMap.Pixel(0, 0)};
			if(popwin) map.removePopup(popwin);
			popwin = new SuperMap.Popup.Anchored(
				"chicken",
				lonLat,
				new SuperMap.Size(90,25),
				contentHTML,
				anchor,
				false,null
			);
			var point = new SuperMap.Geometry.Point(lonLat.lon, lonLat.lat);
			var feature = new SuperMap.Feature.Vector(point,null, style1);
			vectorLayer.addFeatures(feature);
			map.addPopup(popwin);
		});
		
		// 그리기 버튼 클릭 이벤트
		$("#btnDraw").on("click",function(){
			$("#drawPanel").toggle();
		});
		$("#btnEdit").on("click",function(){
			$("#editPanel").toggle();
		});
		// 텍스트 그리기 버튼 클릭 이벤트
		$("#btnTextLine").on("click",function(){
			superMapInit.clearControlAll();
			superMapInit.drawPoint.activate()
		});
		
		// 선 그리기 버튼 클릭 이벤트
		$("#btnDrawLine").on("click",function(){
			superMapInit.clearControlAll();
			superMapInit.drawLine.activate()
		});
		// 면 그리기 버튼 클릭 이벤트
		$("#btnDrawPolygon").on("click",function(){
			superMapInit.clearControlAll();
			superMapInit.drawPolygon.activate()
		});
		// 도형 선택 버튼 이벤트 
		$("#btnDrawSelect").on("click",function(){
			superMapInit.clearControlAll();
			superMapInit.moveLayerToTop(drawLayer);
			modifyFeature.activate()
		});
		// 선/면등 도형을 레이어에서 삭제
		$("#btnDrawTrash").on("click",function(){
			superMapInit.clearControlAll();
			drawLayer.removeAllFeatures();
		});
		// 선/면 도형 설정 
		$("#btnDrawSetting").on("click",function(){
			if($("#drowSettingPopup").dialog("isOpen")){
				$("#drowSettingPopup").dialog("close");
			}
			if(drawLayer.selectedFeatures.length>0){
				$("#drowSettingPopup").dialog("open");
			}else {
				alert("선택된 도형이 없습니다.");
			}
		});
		
		// 텍스트 그리기 버튼 클릭 이벤트
		$("#btnEditPoint").on("click",function(){
			superMapInit.clearControlAll();
			superMapInit.editPoint.activate()
		});
		
		// 선 그리기 버튼 클릭 이벤트
		$("#btnEditLine").on("click",function(){
			superMapInit.clearControlAll();
			superMapInit.editLine.activate()
		});
		// 면 그리기 버튼 클릭 이벤트
		$("#btnEditPolygon").on("click",function(){
			superMapInit.clearControlAll();
			superMapInit.editPolygon.activate()
		});
		// 도형 선택 버튼 이벤트 
		$("#btnEditSelect").on("click",function(){
			superMapInit.clearControlAll();
			superMapInit.moveLayerToTop(searchLayer);
			editFeature.activate()
		});
		// 선/면등 도형을 레이어에서 삭제
		$("#btnEditTrash").on("click",function(){
			superMapInit.clearControlAll();
			editLayer.removeAllFeatures();
			
			if(searchLayer.selectedFeatures.length>0){
				SmEdit.editDelete(searchLayer.selectedFeatures);
			}else {
				alert("선택된 도형이 없습니다.");
			}
		});
		
		$("#btnSearch").on("click",function(){
			//superMapInit.queryResult();
			drawPointCompleted();
		});
	},
	processFailed : function (e) {
		alert(e.error.errorMsg);
	},
	clearFeatures : function() {
		//Remove the previous display result
		vectorLayer.removeAllFeatures();
		vectorLayer.refresh();
	},

	
	// 도형편집 데이터 호출  
	getEditData :function(){
		searchLayer.removeAllFeatures();
		var editUrl = SmEdit.editDataUrl;
		var getFeatureParam, getFeatureBySQLService, getFeatureBySQLParams;

		getFeatureParam = new SuperMap.REST.FilterParameter({
			//name: "Countries@World"
			attributeFilter: "1=1"
		});
		getFeatureBySQLParams = new SuperMap.REST.GetFeaturesBySQLParameters({
			queryParameter: getFeatureParam,
			datasetNames:["PostgreSQL:Point","PostgreSQL:Line","PostgreSQL:Polygon"]
		});
		getFeatureBySQLService = new SuperMap.REST.GetFeaturesBySQLService(editUrl, {
		eventListeners: {"processCompleted": superMapInit.editDataCompleted, "processFailed": superMapInit.processFailed}});

		getFeatureBySQLService.processAsync(getFeatureBySQLParams);
	},
	
	// 도형 편집 데이터 호출 완료 함수 
	editDataCompleted:function(queryEventArgs){
		var i, j, feature, 
		result = queryEventArgs.result;
		if (result && result.features) {
			$.each(result.features,function(idx,feature){
				
//				var geometry = feature.geometry.transform(
//			    	new SuperMap.Projection('EPSG:5186'), 
//			        new SuperMap.Projection('EPSG:900913')
//			    );
//				
//				console.log(feature);
//				var transformedFeature = new SuperMap.Feature.Vector(geometry, feature.data);
				var test = feature.clone();
				//console.log(test);
				searchLayer.addFeatures(feature.clone());
				
			});
			searchLayer.refresh();
		}
	},
	// 전체 control deactivate 
	clearControlAll : function(){
		$.each(superMapInit.controlers,function(idx,control){
			control.deactivate();	
		});
		if(popwin)map.removePopup(popwin);
		editLayer.removeAllFeatures();
		editLayer.refresh();
	},
	
	//레이어 z인덱스 최상위로 변경
	moveLayerToTop: function(targetLayer) {
		var targetIndex = targetLayer.getZIndex();
		var maxIndex = targetLayer.getZIndex();
		$.each(map.layers,function(idx,layer){
			var layerIdx = layer.getZIndex();
			if(targetIndex<layerIdx){
				maxIndex = layerIdx
				layer.setZIndex(layerIdx-1);
			}
		});
		targetLayer.setZIndex(maxIndex);
    },
	queryResult : function(){
		vectorLayer.removeAllFeatures();
		var url4=host+"/iserver/services/data-vWorld_Test/rest/data";
		var getFeaturesByIDsParameters, getFeaturesByIDsService;
		
		getFeaturesByIDsParameters = new SuperMap.REST.GetFeaturesByIDsParameters({
			returnContent: true,
			datasetNames: ["sgg3:TB_FGDI_LP_AA_SGG"],
			fromIndex: 0,
			toIndex:-1,
			IDs: [7]
		});
		var parms = SuperMap.REST.GetFeaturesByIDsParameters.toJsonParameters(getFeaturesByIDsParameters);
		console.log(parms);
		$.ajax({
			async : false ,
			url : url4+"/featureResults.jsonp?returnContent=true",
			dataType : "jsonp",
			method : "POST",
			data :{
				'requestEntity': parms
				, _method:"POST"
			},
			success : function(json){
				console.log(json);
				var result = SuperMap.REST.GetFeaturesResult.fromJson(json);
				if (result && result.features) {
					$.each(result.features,function(idx,feature){
						var geometry = feature.geometry.transform(
					    	new SuperMap.Projection('EPSG:5179'), 
					        new SuperMap.Projection('EPSG:900913')
					    );
						var transformedFeature = new SuperMap.Feature.Vector(geometry, feature.data, style2);
						vectorLayer.addFeatures(transformedFeature);
						console.log(transformedFeature);
					});
				}
			}
		});
		
		getFeaturesByIDsParameters = new SuperMap.REST.GetFeaturesByIDsParameters({
			returnContent: true,
			datasetNames: ["sgg3:TB_FGDI_LP_AA_SGG"],
			fromIndex: 0,
			toIndex:-1,
			IDs: [8,9,10]
		});
		
		getFeaturesByIDsService = new SuperMap.REST.GetFeaturesByIDsService(url4, {
			eventListeners: {
				"processCompleted": superMapInit.processCompleted, 
				"processFailed": superMapInit.processFailed
			}
		});
		getFeaturesByIDsService.processAsync(getFeaturesByIDsParameters);
		
	},
	processCompleted : function(queryEventArgs){
		var i, j, feature, 
		result = queryEventArgs.result;
		if (result && result.features) {
			$.each(result.features,function(idx,feature){
				var geometry = feature.geometry.transform(
			    	new SuperMap.Projection('EPSG:5179'), 
			        new SuperMap.Projection('EPSG:900913')
			    );
				var transformedFeature = new SuperMap.Feature.Vector(geometry, feature.data, style1);
				feature.style = style1;
				vectorLayer.addFeatures(transformedFeature);
			});
		}
	},
	queryResult2 :function(){
		
	}
	
	
};

function drawPointCompleted() {
	var mapCenter = map.getCenter();
    var geometry = new SuperMap.Geometry.Point(mapCenter.lon, mapCenter.lat);
    geometry = geometry.transform(
    	new SuperMap.Projection('EPSG:900913'), 
        new SuperMap.Projection('EPSG:4326')
    );
    vectorLayer.removeAllFeatures();
    var getFeaturesByGeometryParameters, getFeaturesByGeometryService;
    getFeaturesByGeometryParameters = new SuperMap.REST.GetFeaturesByGeometryParameters({
        datasetNames: ["PostgreSQL:TL_SPBD_BULD"],
        fields : ["RN_CD"],
        toIndex:-1,
        spatialQueryMode:SuperMap.REST.SpatialQueryMode.INTERSECT,
        geometry: geometry
    });
    getFeaturesByGeometryService = new SuperMap.REST.GetFeaturesByGeometryService(
            		"http://192.168.0.78:9090/iserver/services/data-Change_SuperMan/rest/data", {
        eventListeners: {
            "processCompleted": processCompleted,
            "processFailed": superMapInit.processFailed
        }
    });
    getFeaturesByGeometryService.processAsync(getFeaturesByGeometryParameters);
}
function processCompleted(getFeaturesEventArgs) {
    var i, len, features, feature, result = getFeaturesEventArgs.result;
    console.log(result);
    if (result && result.features) {
    	features = result.features
    	if(features.length>0){
            for (i=0, len=features.length; i<len; i++) {
                feature = features[i];
                feature.style = style1;
                vectorLayer.addFeatures(feature);
            }
    	}else {
    		alert("No Data");
    	}
        
    }else {
    	alert("No Result");
    }
}

function getServerResource(type,jsonParameters,callback){
	var host = "http://127.0.0.1:8090/iserver";
	var capturUrl = host+"/services/spatialanalyst-sample/restjsr/getImage.json";
	var restService = new SuperMap.ServiceBase(capturUrl+"?returnContent=true");
	restService.isInTheSameDomain = true;
	var option = {
		method : "POST",
		scope:this,
		data :jsonParameters,//mapViewPort.children().children().html()
		success :callback
	}
	restService.request(option);
}