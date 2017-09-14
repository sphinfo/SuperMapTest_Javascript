SmDraw = {
	control : function(){
		// 텍스트, 선, 면 그리기 도구 설정 

		superMapInit.drawPoint = new SuperMap.Control.DrawFeature(drawLayer, SuperMap.Handler.Point, { multi: false,persist:true,double:false});
		superMapInit.drawLine = new SuperMap.Control.DrawFeature(drawLayer, SuperMap.Handler.Path, { multi: false,handlerOptions:{freehand:true}});
		superMapInit.drawPolygon = new SuperMap.Control.DrawFeature(drawLayer, SuperMap.Handler.Polygon,{handlerOptions:{freehand:true}});
		
		// 그리기 수정 도구 설정 
		modifyFeature = new SuperMap.Control.ModifyFeature(drawLayer);
		modifyFeature.mode |= SuperMap.Control.ModifyFeature.DRAG;
		//modifyFeature.mode |= SuperMap.Control.ModifyFeature.RESIZE;
		modifyFeature.mode |= SuperMap.Control.ModifyFeature.ROTATE;
		
		// 텍스트,선,면 그리기 완료 이벤트 설정 
		superMapInit.drawPoint.events.on({"featureadded": SmDraw.drawTextCompleted});
		superMapInit.drawPolygon.events.on({"featureadded": SmDraw.drawPolygonCompleted});
		superMapInit.drawLine.events.on({"featureadded": SmDraw.drawLineCompleted});
	},
	layer :function(){
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
		
		// 그리기 도구 레이어
		drawLayer = new SuperMap.Layer.Vector("Draw Layer",{
			isBaseLayer: false,
			strategies: [strategy] ,
			styleMap : drawStyleMap
		});
	},
	// 맵 클릭 후 텍스트 등록 팝업 함수 
	drawTextCompleted : function(evt){
		var feature = evt.feature;
		
		superMapInit.clearControlAll();
		var contentHTML = '<div class="input-group" style="width:180px;">' ;
		contentHTML += '<input type="text" class="form-control" placeholder="">' ;
		contentHTML += '<span class="input-group-btn">' ;
		contentHTML += '<button onClick="SmDraw.drawText()" class="btn btn-default" type="button">등록</button>' ;
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
	}
	
}