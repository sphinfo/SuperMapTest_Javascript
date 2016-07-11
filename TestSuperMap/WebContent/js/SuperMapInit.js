

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
    editPolygon : null,
    
    resolutions : [
		2445.98, 1222.99, 611.50, 305.75, 
		152.87,  76.44,   38.22,  19.11,
		9.55,    4.78,    2.39,   1.19,
		0.60,    0.30
	] ,
//	scales : [
//		8735665.08, 4367832.54, 2183916.27, 1091958.14, 
//		545979.07,  272989.53,  136494.77,  68247.38,
//		34123.69,   17061.85,   8530.92,    4265.46,
//		2132.73,    1066.37
//	] ,
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
			allOverlays : true,
			//maxResolution : 2445.98,
			//maxScale : 8735665.08,
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
		$("img").attr('crossOrigin', 'anonymous');//img.setAttribute('crossOrigin', 'anonymous');
		
		superMapInit.map.addLayers([baseLayer, satelliteLayer,hybridLayer,imsangdo7c,vectorLayer,drawLayer]);
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
		superMapInit.drawPoint = new SuperMap.Control.DrawFeature(drawLayer, SuperMap.Handler.Point, { multi: false,persist:true,double:false});
		superMapInit.drawLine = new SuperMap.Control.DrawFeature(drawLayer, SuperMap.Handler.Path, { multi: false});
		superMapInit.drawPolygon = new SuperMap.Control.DrawFeature(drawLayer, SuperMap.Handler.Polygon);
		
		//Vector feature editing control
		modifyFeature=new SuperMap.Control.ModifyFeatureD(drawLayer,{
			callbacks : {
				click : function(currentFeature){
					console.log(currentFeature.geometry.CLASS_NAME);
				}
			}
		});
		modifyFeature.mode |= SuperMap.Control.ModifyFeature.DRAG;
		//modifyFeature.mode |= SuperMap.Control.ModifyFeature.RESIZE;
		modifyFeature.mode |= SuperMap.Control.ModifyFeature.ROTATE;
		
		// control 추가  
		superMapInit.controlers = [
			superMapInit.measurePolygon,superMapInit.measureLine,superMapInit.measureCircle,
			superMapInit.drawPoint,superMapInit.drawLine,superMapInit.drawPolygon,
			modifyFeature
		];

		// 텍스트,선,면 그리기 완료 이벤트 설정 
		superMapInit.drawPoint.events.on({"featureadded": superMapInit.drawTextCompleted});
		superMapInit.drawPolygon.events.on({"featureadded": superMapInit.drawPolygonCompleted});
		superMapInit.drawLine.events.on({"featureadded": superMapInit.drawLineCompleted});
		
		
		superMapInit.map.addControls(superMapInit.controlers);
	},
	layerSetting : function(){
		//Initialize the layer
		//http://61.32.6.18:8090/iserver/services/online_vWorld/rest/maps/OSM
		
		baseLayer = new SuperMap.Layer.TiledDynamicRESTLayer(
			"기본", "http://192.168.0.206:8090/iserver/services/vworld2d/rest/maps/OSM", 
			{
				transparent: true, 
				cacheEnabled: false
			},{
				//maxResolution : "auto",
				projection:'EPSG:3857',
				//resolutions :superMapInit.resolutions,
				scales :superMapInit.scales,
				//maxResolution : 2445.98,
				//maxScale : 8735665.08,
				isBaseLayer :true
			}
		);
		//baseLayer = new SuperMap.Layer.VWorldLayer("Base");
		satelliteLayer = new SuperMap.Layer.VWorldLayer("영상");
		hybridLayer = new SuperMap.Layer.VWorldLayer("Hybrid");
	
		
		//baseLayer.url = ['http://xdworld.vworld.kr:8080/2d/Base/201512/${z}/${x}/${y}.png'];
		satelliteLayer.url = ['http://xdworld.vworld.kr:8080/2d/Satellite/201301/${z}/${x}/${y}.jpeg'];			
		hybridLayer.url = ['http://xdworld.vworld.kr:8080/2d/Hybrid/201512/${z}/${x}/${y}.png'];	
		hybridLayer.isBaseLayer = false;
		
		baseLayer.useCORS = true;
		satelliteLayer.useCORS = true;
		hybridLayer.useCORS = true;
		baseLayer.useCanvas = false;
		
		//iServer8c
		var url2 = "http://61.32.6.18:8091/iserver/services/map-vWorld_Test/rest/maps/SGG_5186";
		var urlWms = "http://61.32.6.18:8091/iserver/services/map-Asiana/wms111/Asiana";
		//iServer7c
		var url3 = "http://61.32.6.18:8090/iserver/services/map-im5000/rest/maps/Dynamic_IM5000";
		var url5 = "http://192.168.0.247:8090/iserver/services/map-Change_SuperMan/rest/maps/행정구역" ;
		
		//imsangdo7c = new SuperMap.Layer.WMS("Asiana",urlWms,{layers: "Asiana"});
		
		
		imsangdo7c = new SuperMap.Layer.TiledDynamicRESTLayer(
			"임상도 7c", url2, 
			{
				transparent: true, 
				cacheEnabled: false,
			},{
				projection:'EPSG:5186',
				//maxResolution : "auto",
				//resolutions :superMapInit.resolutions,
				scales :superMapInit.scales,
				isBaseLayer :false
			}
		);
		imsangdo7c.useCORS = true;
		imsangdo7c.useCanvas = false;
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
		
		// 그리기 도구 텍스트 설정
		var strategy = new SuperMap.Strategy.GeoText();
		strategy.style = {
			fontColor:"#333",
			fontWeight:"normal",
			fontSize:"14px",
			fill: true,
			fillColor: "#FFFFFF",
			fillOpacity: 1,
			stroke: true,
			strokeColor:"#8B7B8B"
		};
		
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
			strategies: [strategy] ,
			styleMap : drawStyleMap
		});
		editLayer = new SuperMap.Layer.Vector("Eidt Layer",{
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
			
//			var mapElem = document.getElementById('map'); // the id of your map div here
//
//	        html2canvas(mapElem, {
//	          useCORS: true,
//	          onrendered: function(canvas) {
//	             mapImg = canvas.toDataURL('image/png');
//	             console.log(mapImg);
//	            // reset the map to original styling
//
//	            // do something here with your mapImg
//	            // e.g. I then use the dataURL in a pdf using jsPDF...
//	            // createPDFObject();
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
			//superMapInit.queryResult();
			drawPointCompleted();
		});
	},
	// 맵 클릭 후 텍스트 등록 팝업 함수 
	drawTextCompleted : function(evt){
		var feature = evt.feature;
		
		superMapInit.clearControlAll();
		var contentHTML = '<div class="input-group" style="width:180px;">' ;
		contentHTML += '<input type="text" class="form-control" placeholder="">' ;
		contentHTML += '<span class="input-group-btn">' ;
		contentHTML += '<button onClick="superMapInit.drawText()" class="btn btn-default" type="button">등록</button>' ;
		contentHTML += '</span>' ;
		contentHTML += '</div>'
		if(popwin) map.removePopup(popwin);
		try{
			popwin = new SuperMap.Popup.FramedCloud(
				"drawText",
				new SuperMap.LonLat(feature.geometry.x,feature.geometry.y),
				new SuperMap.Size(80,20),
				contentHTML,
				null,
				false,
				null
			);
			map.addPopup(popwin);
			drawLayer.removeFeatures(feature);
		}catch(err){
			console.log(err);
		}
	},
	// 텍스트 지도 표시 함수 
	drawText : function(){
		var geoText = new SuperMap.Geometry.GeoText(popwin.lonlat.lon, popwin.lonlat.lat,$("#drawText input").val());
		geoText.components=[];
		var feature = new SuperMap.Feature.Vector(geoText);
		console.log(feature.geometry.CLASS_NAME);
		drawLayer.addFeatures([feature]);
		map.removePopup(popwin);
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

function drawPointCompleted() {
	var mapCenter = map.getCenter();
    var geometry = new SuperMap.Geometry.Point(mapCenter.lon, mapCenter.lat);
    vectorLayer.removeAllFeatures();
    var getFeaturesByGeometryParameters, getFeaturesByGeometryService;
    getFeaturesByGeometryParameters = new SuperMap.REST.GetFeaturesByGeometryParameters({
        datasetNames: ["PostgreSQL:TL_SPBD_BULD"],
        toIndex:-1,
        spatialQueryMode:SuperMap.REST.SpatialQueryMode.INTERSECT,
        geometry: geometry
    });
    getFeaturesByGeometryService = new SuperMap.REST.GetFeaturesByGeometryService(
            		"http://192.168.0.247:8090/iserver/services/data-Change_SuperMan/rest/data", {
        eventListeners: {
            "processCompleted": processCompleted,
            "processFailed": superMapInit.processFailed
        }
    });
    getFeaturesByGeometryService.processAsync(getFeaturesByGeometryParameters);
}
function processCompleted(getFeaturesEventArgs) {
    var i, len, features, feature, result = getFeaturesEventArgs.result;
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
