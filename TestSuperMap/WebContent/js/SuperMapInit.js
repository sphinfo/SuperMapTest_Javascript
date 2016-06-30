

var superMapInit = {
	feutureCallBack  : {
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
    // 반경 
    measureCircle : null,
    controlers : [],
	init : function(){
		map=superMapInit.map = new SuperMap.Map("map", {
			units:"m",
			//displayProjection:new SuperMap.Projection("EPSG:4326"),
			projection:'EPSG:5186',
			//maxExtent: new SuperMap.Bounds(13871489.33 , 3910407.08, 14680019.87,  4666488.83),
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
		superMapInit.map.addLayers([baseLayer, satelliteLayer,hybridLayer,imsangdo8c,imsangdo7c,vectorLayer,drawLayer]);
		superMapInit.map.setCenter(new SuperMap.LonLat(14174150.9795765, 4495339.98139926), 1);
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
		
		// 그리기 control  설정
		superMapInit.drawPoint = new SuperMap.Control.DrawFeature(drawLayer, SuperMap.Handler.Point, { multi: true});
		superMapInit.drawLine = new SuperMap.Control.DrawFeature(drawLayer, SuperMap.Handler.Path, { multi: true});
		superMapInit.drawPolygon = new SuperMap.Control.DrawFeature(drawLayer, SuperMap.Handler.Polygon);
		
		//Vector feature editing control
		modifyFeature=new SuperMap.Control.ModifyFeature(drawLayer);
		modifyFeature.mode |= SuperMap.Control.ModifyFeature.DRAG;
		//modifyFeature.mode |= SuperMap.Control.ModifyFeature.RESIZE;
		modifyFeature.mode |= SuperMap.Control.ModifyFeature.ROTATE;
		
		// control 추가  
		superMapInit.controlers = [
			superMapInit.measurePolygon,superMapInit.measureLine,superMapInit.measureCircle,
			superMapInit.drawPoint,superMapInit.drawLine,superMapInit.drawPolygon,
			modifyFeature
		];
		
		// 선,면 그리기 완료 이벤트 설정 
		superMapInit.drawPolygon.events.on({"featureadded": superMapInit.drawPolygonCompleted});
		superMapInit.drawLine.events.on({"featureadded": superMapInit.drawLineCompleted});
		
		
		superMapInit.map.addControls(superMapInit.controlers);
	},
	layerSetting : function(){
		//Initialize the layer
		baseLayer = new SuperMap.Layer.VWorldLayer("Base");
		satelliteLayer = new SuperMap.Layer.VWorldLayer("영상");
		hybridLayer = new SuperMap.Layer.VWorldLayer("Hybrid");
		
		baseLayer.url = ['http://xdworld.vworld.kr:8080/2d/Base/201512/${z}/${x}/${y}.png'];
		satelliteLayer.url = ['http://xdworld.vworld.kr:8080/2d/Satellite/201301/${z}/${x}/${y}.jpeg'];			
		hybridLayer.url = ['http://xdworld.vworld.kr:8080/2d/Hybrid/201512/${z}/${x}/${y}.png'];	
		hybridLayer.isBaseLayer = false;
		//iServer8c
		var url2 = "http://192.168.0.56:8090/iserver/services/map-IM_SANG_500/rest/maps/Tile_Map";
		//iServer7c
		var url3 = "http://192.168.0.56:9090/iserver/services/map-Test_7c/rest/maps/Map_Imsando";
		imsangdo7c = new SuperMap.Layer.TiledDynamicRESTLayer(
			"임상도 7c", url3, 
			{
				transparent: true, 
				cacheEnabled: false
			},{
				//projection:'EPSG:3857',
				maxResolution : "auto",
				isBaseLayer :false
			}
		);
		imsangdo8c = new SuperMap.Layer.TiledDynamicRESTLayer(
				"임상도 8c", url2, 
				{
					transparent: true, 
					cacheEnabled: false
				},{
					//projection:'EPSG:3857',
					maxResolution : "auto",
					isBaseLayer :false
				}
			);
		vectorLayer = new SuperMap.Layer.Vector("Vector Layer", {
		    isBaseLayer: false,
		    style : style1
		});
		vectorLayer.events.on({"click":function(e){
			console.log(e);
		}});
		
		// 그리기 도구 레이어
		drawLayer = new SuperMap.Layer.Vector("Draw Layer",{
			isBaseLayer: false,
			styleMap : drawStyleMap
		});
		
		
		imsangdo7c.events.on({
			"layerInitialized" : superMapInit.addLayer
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
			MapToImg&&MapToImg.excute(map);
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
		$("#btnSearch").on("click",function(){
			superMapInit.queryResult();
		});
	},
	// 선 그리기 완료 이벤트 함수 
	drawLineCompleted : function(evt){
		var feature = evt.feature;
		$("#btnDrawSelect").trigger("click");
		feature.style= drawLineStyle;
		feature.geotype = "line";
	},
	// 면 그리기 완료 이벤트 함수 
	drawPolygonCompleted : function(evt){
		var feature = evt.feature;
		$("#btnDrawSelect").trigger("click");
		feature.style= drawFillStyle;
		feature.geotype = "polygon";
	},
	processFailed : function (e) {
		alert(e.error.errorMsg);
	},
	clearFeatures : function() {
		//Remove the previous display result
		vectorLayer.removeAllFeatures();
		vectorLayer.refresh();
	},
	// 전체 control deactivate 
	clearControlAll : function(){
		$.each(superMapInit.controlers,function(idx,control){
			control.deactivate();	
		});
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
};
