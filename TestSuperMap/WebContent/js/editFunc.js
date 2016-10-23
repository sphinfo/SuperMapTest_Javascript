SmEdit = {
	editDataUrl : "http://61.32.6.18:9090/iserver/services/data-Change_SuperMan/rest/data",
	control : function (){
		editFeature = new SuperMap.Control.SelectFeature(searchLayer,{
			toggle : true,
			onSelect : SmEdit.openEditAttrPopup
		});
		superMapInit.editPoint = new SuperMap.Control.DrawFeature(editLayer, SuperMap.Handler.Point, { multi: false,persist:true,double:false});
		superMapInit.editLine = new SuperMap.Control.DrawFeature(editLayer, SuperMap.Handler.Path, { multi: false});
		superMapInit.editPolygon = new SuperMap.Control.DrawFeature(editLayer, SuperMap.Handler.Polygon);
		
		superMapInit.editPoint.events.on({"featureadded": SmEdit.editCompleted});
		superMapInit.editLine.events.on({"featureadded": SmEdit.editCompleted});
		superMapInit.editPolygon.events.on({"featureadded": SmEdit.editCompleted});
		
	},
	layer :function(){
		editLayer = new SuperMap.Layer.Vector("Eidt Layer",{
			isBaseLayer: false,
			styleMap : drawStyleMap
		});
		searchLayer = new SuperMap.Layer.Vector("Search Layer",{
			isBaseLayer: false,
			styleMap : editStyleMap
		});
	},
	editCompleted : function(evt){
		//superMapInit.clearControlAll();
		var feature = evt.feature;
		var contentHTML = '' ;
		contentHTML += 	'<form id="editFrm">' ;
		contentHTML += 		'<div class="form-group">' ;
		contentHTML += 			'<label for="title"> 제목 </label>' ;
		contentHTML += 			'<input type="text" class="form-control" id="editText" placeholder="제목">' ;
		contentHTML += 		'</div>' ;
		contentHTML += 		'<div class="form-group">' ;
		contentHTML += 			'<label for="editContent"> 내용 </label>' ;
		contentHTML += 			'<input type="text" class="form-control" id="editContent" placeholder="내용">' ;
		contentHTML += 		'</div>' ;
		contentHTML += 	'</form>' ;
		contentHTML += 	'<button onClick="SmEdit.editAttr(\''+feature.id+'\')" class="btn btn-default" type="button">등록</button>' ;
		
		if(popwin) map.removePopup(popwin);
		try{
			var popupLonLat;
			if(feature.geometry.bounds){
				popupLonLat = feature.geometry.bounds.getCenterLonLat();
			}else{
				popupLonLat=new SuperMap.LonLat(feature.geometry.x,feature.geometry.y);
			}
			popwin = new SuperMap.Popup.FramedCloud(
				"editText",
				popupLonLat,
				new SuperMap.Size(80,20),
				contentHTML,
				null,
				true,
				function(){
					map.removePopup(popwin);
					editLayer.removeFeatures(feature);
				}
			);
			map.addPopup(popwin);
		}catch(err){
			console.log(err);
		}
	},
	// 도형편집에서 도형그리기 완료 후 속성 등록 팝업
	// 팝업 등록 버튼 클릭 후 속성 및 도형 데이터 등
	editAttr : function(id){
		var feature = editLayer.getFeatureById(id);
		
		// 7c일 경우 ESPG 4326으로 좌표 변환 
		var geometry = feature.geometry.transform(
			new SuperMap.Projection('EPSG:900913'), 
		    new SuperMap.Projection('EPSG:4326')
		);
		// 8c일 경우 서비스 좌표계로 변환 
//		var geometry = feature.geometry.transform(
//			new SuperMap.Projection('EPSG:900913'), 
//		    new SuperMap.Projection('EPSG:5186')
//		);
			
		var editFeatureParameter,
        editFeatureService,
        features = {
            fieldNames:[],
            fieldValues:[],
            geometry:geometry
        };
		var titleText = $("#editText input#editText").val();
		var contentText = $("#editText input#editContent").val();
		features.fieldNames=["title","content"];
		features.fieldValues=[titleText,contentText];
		
		editFeatureParameter = new SuperMap.REST.EditFeaturesParameters({
            features: [features],
            editType: SuperMap.REST.EditType.ADD,
            returnContent:false
        });
		var editUrl = SmEdit.editDataUrl+"/";
		if(geometry.CLASS_NAME=="SuperMap.Geometry.Point"){
			editUrl += "datasources/test5186/datasets/test_point/";
		}else if(geometry.CLASS_NAME=="SuperMap.Geometry.LineString"){
			editUrl += "datasources/test5186/datasets/test_line/";
		}else if(geometry.CLASS_NAME=="SuperMap.Geometry.Polygon"){
			editUrl += "datasources/test5186/datasets/test_polygon/";
		}
		
		editFeatureService = new SuperMap.REST.EditFeaturesService(editUrl, {
            eventListeners: {
                "processCompleted": SmEdit.addFeaturesProcessCompleted,
                "processFailed": superMapInit.processFailed
            }
        });
		editFeatureService.processAsync(editFeatureParameter);
	},
	// 서비스에 데이터 등록 후 완료 함수
	addFeaturesProcessCompleted:function(editFeaturesEventArgs){
		var addResultIds = editFeaturesEventArgs.result.IDs,
        resourceInfo = editFeaturesEventArgs.result.resourceInfo;
		if(addResultIds === null && resourceInfo === null) return;
		if((addResultIds && addResultIds.length > 0) || (resourceInfo && resourceInfo.succeed)) {
			map.removePopup(popwin);
			alert("Add feature successed");
			editLayer.removeAllFeatures();
			//Reload layer
			superMapInit.getEditData();
		}else {
			alert("","Add feature failed",true);
		}
	},
	// 도형 데이터 삭제 함수 
	editDelete:function(features){
		var editFeatureParameter, editFeatureService;
		var ids = [];
		if(features.length>0){
			var feature = features[0];
			ids.push(feature.data.SMID);
			var editUrl = SmEdit.editDataUrl+"/";
			if(feature.geometry.CLASS_NAME=="SuperMap.Geometry.Point"){
				editUrl += "datasources/test5186/datasets/test_point/";
			}else if(feature.geometry.CLASS_NAME=="SuperMap.Geometry.LineString"){
				editUrl += "datasources/test5186/datasets/test_line/";
			}else if(feature.geometry.CLASS_NAME=="SuperMap.Geometry.Polygon"){
				editUrl += "datasources/test5186/datasets/test_polygon/";
			}
			
			editFeatureParameter = new SuperMap.REST.EditFeaturesParameters({
				IDs: ids,
				editType: SuperMap.REST.EditType.DELETE
			});
			editFeatureService = new SuperMap.REST.EditFeaturesService(editUrl, {
				eventListeners: {
					"processCompleted": SmEdit.deleteFeaturesProcessCompleted,
					"processFailed": superMapInit.processFailed
				}
			});
			editFeatureService.processAsync(editFeatureParameter);
		}else {
			
		}
	},
	// 도형 데이터 삭제 완료 함수 
	deleteFeaturesProcessCompleted:function(editFeaturesEventArgs){
		 if(editFeaturesEventArgs.result.resourceInfo.succeed) {
			 //Reload layer
			 superMapInit.getEditData();
			 alert("Feature deleted completed");
		 }  else {
			 alert("Failed to delete feature");
		 }
	},
	// 편집 도형선택시 팝업 
	openEditAttrPopup :function(feature){
		var contentHTML = '' ;
		contentHTML += 	'<div>' ;
		contentHTML += 		'<div>' ;
		contentHTML += 			' 제목 : '+feature.data.TITLE ;
		contentHTML += 		'</div>' ;
		contentHTML += 		'<div class="form-group">' ;
		contentHTML += 			' 내용 : '+feature.data.CONTENT ;
		contentHTML += 		'</div>' ;
		contentHTML += 	'</div>' ;
		
		if(popwin) map.removePopup(popwin);
		try{
			var popupLonLat;
			if(feature.geometry.bounds){
				popupLonLat = feature.geometry.bounds.getCenterLonLat();
			}else{
				popupLonLat=new SuperMap.LonLat(feature.geometry.x,feature.geometry.y);
			}
			popwin = new SuperMap.Popup.FramedCloud(
				"editAttrText",
				popupLonLat,
				new SuperMap.Size(120,20),
				contentHTML,
				null,
				true,
				null
			);
			map.addPopup(popwin);
		}catch(err){
			console.log(err);
		}
	}
}