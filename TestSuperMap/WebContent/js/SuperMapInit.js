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
    
    resolutions : [] ,
	scales : [] ,
    // 반경 
    measureCircle : null,
    controlers : [],
	init : function(){
		var resLen = 20;
        var resStart = 0;
    	var dpi = 95.99999999999984;
        for(var i=resStart;i<=resLen;i++){
            var res3857 = 156543.0339/Math.pow(2,i);
            this.resolutions.push(res3857);

            var scale3857 = 0.0127/dpi/res3857;
            this.scales.push(scale3857);
        }
		map=superMapInit.map = new SuperMap.Map("map", {
			units:"m",
			numZoomLevels : 19,
			//allOverlays : true ,
			//restrictedExtent :mapExtent,
			//maxExtent : mapExtent,
			//minResolution  : superMapInit.resolutions[6] ,
			///maxResolution :"auto",
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
		smEvent.layerSetting();
		// 맵 control 설정 
		smEvent.controlerSetting();
		// 베이스 맵 변경 이벤트 설정 
		smEvent.baseMapChange();
		// 오른쪽 툴박스 버튼 이벤트 설정 
		smEvent.toolbarEventSetting();
		
	},
	//Asynchronous loading layer
	addLayer : function(){
		$("img").attr('crossOrigin', 'anonymous');//img.setAttribute('crossOrigin', 'anonymous');
		superMapInit.map.addLayers([baseLayer, satelliteLayer,hybridLayer,imsangdo7c,vectorLayer,drawLayer,editLayer,searchLayer]);
		superMapInit.map.setCenter(new SuperMap.LonLat(14174150.9795765, 4495339.98139926), 7);
		//superMapInit.getEditData();
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
////				
//				console.log(feature);
//				var transformedFeature = new SuperMap.Feature.Vector(geometry, feature.data);
				var test = feature.clone();
				//console.log(test);
				searchLayer.addFeatures(feature.clone());
				
			});
			searchLayer.refresh();
			//map.zoomToExtent(searchLayer.getDataExtent());
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
	var host = "http://61.32.6.18:18080/iserver";
	var capturUrl = host+"/services/spatialanalyst-sample/restjsr/"+type+".jsonp";
	var restService = new SuperMap.ServiceBase(capturUrl+"?returnContent=true");
	restService.isInTheSameDomain = false;
	
	var option = {
		method : "POST",
		scope:this,
		data :jsonParameters,//mapViewPort.children().children().html()
		success :callback,
		failure : function(error){
			alert(error);
		}
	}
	
	restService.request(option);
}

