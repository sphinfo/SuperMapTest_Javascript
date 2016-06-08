/**
 * @requires SuperMap/Util.js
 * @requires SuperMap/Handler/Path.js
 */

/**
 * Class: SuperMap.Handler.SmcPathMeasure
 *
 * Inherits from:
 *  - <SuperMap.Handler.Path>
 */
// 거리재기 클래스
SuperMap.Handler.SmcPathMeasure = SuperMap.Class(SuperMap.Handler.Path, {
	popup : null,		// 외부에서 사용하던 팝업을 내부로 이동
	partDist : [],		// 중간 거리
	
	/**
	 * 측정 완료 시 수행
	 * parameter : cancel - 취소 이벤트 여부
	 * return :  
	 */
	finalize: function(cancel) {
        var key = cancel ? "cancel" : "done";
        this.drawing = false;
        this.mouseDown = false;
        this.lastDown = null;
        this.lastUp = null;
        this.lastTouchPx = null;
        this.callback(key, [this.geometryClone()]);
        if(cancel || !this.persist) {
        	this.destroyFeature(cancel);
        }
    },

    /**
	 * 지도에서 그린 선의 거리를 계산
	 * parameter : geometry - 공간객체
	 * return : 거리 값과 단위
	 */
	measureDistance : function(geometry) {
		var subLength = geometry.getLength();
    	var tempLength = subLength;
    	var unit = "";
    	tempLength *= (SuperMap.INCHES_PER_UNIT["m"] / SuperMap.INCHES_PER_UNIT['km']);
        if(tempLength > 1) {
        	subLength = tempLength.toFixed(2);
        	unit = "km";
        } else {
        	subLength = subLength.toFixed(2);
        	unit = "m";
        }

		return [subLength, unit];
	},
	
	
	//지도에서 그린 마지막 선의 거리를 계산
	measureDistancePart : function() {
		var geometry = this.geometryClone();
		var vertices = geometry.getVertices();
		var points = [
		    new SuperMap.Geometry.Point(vertices[vertices.length-2].x, vertices[vertices.length-2].y),
		    new SuperMap.Geometry.Point(vertices[vertices.length-1].x, vertices[vertices.length-1].y)
		];
		var lineString = new SuperMap.Geometry.LineString(points);
		return this.measureDistance(lineString);		
	},

	/**
	 * 지도에서 그린 전체 선의 거리를 계산
	 * parameter :
	 * return : 거리 값과 단위
	 */
	measureDistanceAll : function() {
		var geometry = this.geometryClone();
		return this.measureDistance(geometry);		
	},
	
	/**
	 * 지도에서 마우스 다운 이벤트가 발생할 때 실행되는 함수
	 * parameter : evt (이벤트 객체)
	 * return : 거리 값과 단위
	 */
	mousedown: function(evt) {
		if (this.lastDown && this.lastDown.equals(evt.xy)) {
	        return false;
	    }
		if(this.lastDown == null) {
			if(!this.multiLine) {
				this.destroyFeature("cancel");
				this.removePopup();
			}
	        this.createFeature(evt.xy);
	    } else if((this.lastUp == null) || !this.lastUp.equals(evt.xy)) {
	        this.addPoint(evt.xy);
	    }
	    this.lastDown = evt.xy;
	    this.drawing = true;
		
        if(this.freehandMode(evt)) {
            this.removePoint();
            this.finalize();
        } else {
            if(this.lastUp == null) {
               this.addPoint(evt.xy);
            }
            this.lastUp = evt.xy;
        }
        var lonlat = this.map.getLonLatFromPixel(evt.xy);
        
    	var pointFeature = new SuperMap.Feature.Vector(new SuperMap.Geometry.Point(lonlat.lon, lonlat.lat));
    	pointFeature.type = "measure";
    	this.layer.addFeatures(pointFeature);
		var popup;
        if(!this.count) {
			var contentHtml = "<div id='measureStart' class='smControlMeasurePopup smControlMeasurePopupStart'>시작</div>";
			popup = new SuperMap.SmcPopup("measurePopup", lonlat, this.getBrowserSize(38, 22), contentHtml, new SuperMap.Pixel(5,5));
			popup.attributes = {
				print : true,
				contentHtml : "시작",
				offsetX : 5,
				offsetY : 5
			};
			if(this.movePopup) {
				contentHtml = '<div class="smControlMeasureContent">'
					+ '<div class="MeasureAllDist" >'
					+ '<span class="measureResTit">총거리</span>'
					+ '<span class="measureResCon"></span>'
					+ '<span class="measureResUnit"></span>'
					+ '</div>'
					+ '<div class="MeasureEndDescript">마우스 왼쪽버튼을 더블클릭 하시면 끝마칩니다</div>'
					+ '</div>';
	        	this.popup = new SuperMap.SmcPopup("measurePopup", lonlat, new this.getBrowserSize(152, 40, true), contentHtml, new SuperMap.Pixel(5,5));
	        	this.map.addPopup(this.popup);
				this.popup.type = "measure";
			}
            this.count = 1;
	    } else {
	    	var distance = this.measureDistanceAll();
	    	contentHtml = "<div class='smControlMeasurePopup smControlMeasurePopupDefault'><span class='MeasureColorRed'>"+ distance[0] + "</span> " + distance[1] + "</div>";
	    	popup = new SuperMap.SmcPopup("measurePopup", lonlat, new this.getBrowserSize(92, 22), contentHtml, new SuperMap.Pixel(5,5));
	    	popup.attributes = {
				print : true,
				contentHtml : distance[0] + distance[1],
				offsetX : 5,
				offsetY : 5
			};
	    }
		if (popup) {
			this.map.addPopup(popup);
			popup.type = "measure";
		}
        if(evt.button == "2") {
			this.rightclick(evt);
	        return true;
		}
        return false;
	},
	/**
	 * 마우스 이동 이벤트
	 * parameter : evt (이벤트 객체)
	 * return : 
	 */
	mousemove: function (evt) {
		if(this.drawing) { 
            if(this.mouseDown && this.freehandMode(evt)) {
                this.addPoint(evt.xy);
            } else {
                this.modifyFeature(evt.xy);
				if(this.popup) {
					var allDist = this.measureDistanceAll();
					$(this.popup.contentDiv).find(".MeasureAllDist .measureResCon").text(allDist[0]);
					$(this.popup.contentDiv).find(".MeasureAllDist .measureResUnit").text(" " + allDist[1]);
	                this.popup.moveTo(evt.xy);	
				}
            }
        }
        return true;
    },
    
    /**
	 * 마우스 우 클릭 시 거리 측정 종료
	 * parameter : evt (이벤트 객체)
	 * return : 
	 */
    rightclick: function(evt) {
    	this.dblclick(evt);
    	return false;
    },
    
    /**
	 * 더블 클릭 시 거리 측정 종료.
	 * parameter : evt (이벤트 객체)
	 * return : 
	 */
    dblclick: function(evt) {
    	if(this.map.popups[this.map.popups.length-1].type == "measure") {
			this.map.removePopup(this.map.popups[this.map.popups.length-1]);
		}
        var lonlat = this.map.getLonLatFromPixel(evt.xy);
        var allDist = this.measureDistanceAll();
		var contentHtml = "<div class='smControlMeasurePopup smControlMeasurePopupEnd'>총거리 : <span class='MeasureColorRed'>"+ allDist[0] + "</span> " + allDist[1] + "</div>";
	    var popup = new SuperMap.SmcPopup("measurePopup", lonlat, new this.getBrowserSize(132, 22), contentHtml, new SuperMap.Pixel(5,5));
		this.map.addPopup(popup);
		popup.type = "measure";
		popup.attributes = {
			print : true,
			contentHtml : "총거리 : " + allDist[0] + allDist[1],
			offsetX : 5,
			offsetY : 5
		};
		this.count = 0;
        if(!this.freehandMode(evt)) {
            this.removePoint();
            this.finalize();
        }
		if(this.popup) {
			this.map.removePopup(this.popup);
			this.popup = null;
		}
		//smActiveControl("pan");
        return false;
    },
    //컨트롤 활성화
    activate: function() {
    	//this.removeFeature();
        if(!SuperMap.Handler.prototype.activate.apply(this, arguments)) {
            return false;
        }
        var options = SuperMap.Util.extend({
            displayInLayerSwitcher: false,
            calculateInRange: SuperMap.Function.True,
            wrapDateLine: this.citeCompliant
        }, this.layerOptions);
        this.layer = new SuperMap.Layer.SmcVector(this.CLASS_NAME, options);
        this.map.addLayer(this.layer);
        return true;
    },
    
    //설명 :컨트롤 비 활성화
    deactivate: function() {
        if(!SuperMap.Handler.prototype.deactivate.apply(this, arguments)) {
            return false;
        }
        if(this.drawing) {
        	this.removePopup();
            this.cancel();
        }
        if(!this.persistControl) {
        	this.layer.destroy(false);
			this.removePopup();
        }
        this.layer = null;
        return true;
    },
    
    // 도형, 팝업 삭제
    cleanFeature : function() {
		this.removeFeature();
		this.removePopup();
	},
	// 도형 삭제
	removeFeature : function() {
		var layers = this.map.getLayersByName("SuperMap.Handler.SmcPathMeasure");
    	if(layers && layers.length > 0) {
    		this.map.removeLayer(layers[0]);
    		this.removePopup();
    	}
	},
    
	// 팝업 삭제
    removePopup : function() {
    	var len = this.map.popups.length;
		for(var i=len-1; i >= 0; i--) {
			if(this.map.popups[i].type == "measure") {
				this.map.removePopup(this.map.popups[i]);
			}
		}
	},
	
	/**
	 * 브라우저에 따라 화면 크기 픽셀 반환 - msie 의 경우 크기에 테두리 까지 포함 하므로 테두리 크기 2 제외 
	 * parameter : 
	 * 		width - 너비
	 *  	height - 높이
	 *  return : 브라우저에 따라 변환된 크기
	 */
	getBrowserSize : function(width, height, move) {
		if(SuperMap.BROWSER_NAME == "msie") {
			return new SuperMap.Size(width-2, height-2);
		} else {
			if(move) {
				if(SuperMap.BROWSER_NAME == "firefox") 
					return new SuperMap.Size(width, height+10);
				else
					return new SuperMap.Size(width, height+6);
			}
			else {
				return new SuperMap.Size(width, height);	
			}
		}
	},
	
	CLASS_NAME: "SuperMap.Handler.SmcPathMeasure"
});

/**
 * Class: SuperMap.Handler.SmcPolygonMeasure
 *
 * Inherits from:
 *  - <SuperMap.Handler.Polygon>
 */
SuperMap.Handler.SmcPolygonMeasure = SuperMap.Class(SuperMap.Handler.Polygon, {
	popup : null,		// 외부에서 사용하던 팝업을 내부로 이동
	
	layerName : null,
	
	 /**
	 * 측정 완료 시 수행
	 * parameter : cancel - 취소 이벤트 여부
	 * return :  
	 */
	finalize: function(cancel) {
        var key = cancel ? "cancel" : "done";
        this.drawing = false;
        this.mouseDown = false;
        this.lastDown = null;
        this.lastUp = null;
        this.lastTouchPx = null;
        this.callback(key, [this.geometryClone()]);
        if(cancel || !this.persist) {
        	this.destroyFeature(cancel);
        }
    },
	
    /**
	 * 면적 계산
	 * parameter : evt (이벤트 객체)
	 * return :  면적값과 단위
	 */
	measureArea : function() {
		var geometry = this.geometryClone();
		var subLength = geometry.getArea();
		var tempLength = subLength;
    	var unit = "";
		tempLength *= Math.pow(SuperMap.INCHES_PER_UNIT["m"] / SuperMap.INCHES_PER_UNIT['km'], 2);
		
	    if(tempLength > 1) {
	    	subLength = tempLength.toFixed(2);
	    	unit = "km<sup>2</sup>";
	    } else {
	    	subLength = subLength.toFixed(2);
	    	unit = "m<sup>2</sup>";
	    }
		return [subLength, unit];
	},
	/**
	 * 지도에서 마우스 다운 이벤트가 발생할 때 실행되는 함수
	 * parameter : evt (이벤트 객체)
	 * return : 거리 값과 단위
	 */
	mousedown: function(evt) {
		if (this.lastDown && this.lastDown.equals(evt.xy)) {
	        return false;
	    }
		if(this.lastDown == null) {
			if(!this.multiLine) {
				this.destroyFeature("cancel");
				this.removePopup();
			}
	        this.createFeature(evt.xy);
	    } else if((this.lastUp == null) || !this.lastUp.equals(evt.xy)) {
	        this.addPoint(evt.xy);
	    }
	    this.lastDown = evt.xy;
	    this.drawing = true;
		
        if(this.freehandMode(evt)) {
            this.removePoint();
            this.finalize();
        } else {
            if(this.lastUp == null) {
               this.addPoint(evt.xy);
            }
            this.lastUp = evt.xy;
        }
        var lonlat = this.map.getLonLatFromPixel(evt.xy);
    	var pointFeature = new SuperMap.Feature.Vector(new SuperMap.Geometry.Point(lonlat.lon, lonlat.lat));
    	pointFeature.type = this.layerName;
    	this.layer.addFeatures(pointFeature);
		var popup = null;
        if(!this.count) {
			var contentHtml = "<div id='measureStart' class='smControlMeasurePopup smControlMeasurePopupStart'><span class='MeasureColorRed'>시작</span></div>";
			popup = new SuperMap.SmcPopup("measurePopup", lonlat, this.getBrowserSize(38, 22), contentHtml, new SuperMap.Pixel(5,5));
			if(this.movePopup) {
				contentHtml = '<div class="smControlMeasureContent">'
					+ '<div class="MeasureAllArea" >'
					+ '<span class="measureResTit">총면적</span>'
					+ '<span class="measureResCon"></span>'
					+ '<span class="measureResUnit"></span>'
					+ '</div>'
					+ '<div class="MeasureEndDescript">마우스 왼쪽버튼을 더블클릭 하시면 끝마칩니다</div>'
					+ '</div>';
	        	this.popup = new SuperMap.SmcPopup("measurePopup", lonlat, new this.getBrowserSize(152, 43, true), contentHtml, new SuperMap.Pixel(5,5));
	        	this.popup.attributes = {
        			print : true,
        			contentHtml : "시작",
        			offsetX : 5,
        			offsetY : 5
        		};
	        	this.map.addPopup(this.popup);
				this.popup.type = this.layerName;
			}
            this.count = 1;
	    }
	    else {
	    	this.count += 1;
	    }
		if (popup) {
			this.map.addPopup(popup);
			popup.type = this.layerName;
		}
        if(evt.button == "2") {
			this.rightclick(evt);
	        return true;
		}
        return false;
	},
	
	/**
	 * 마우스 이동 이벤트
	 * parameter : evt (이벤트 객체)
	 * return : 
	 */
	mousemove: function (evt) {
		if(this.drawing) { 
            if(this.mouseDown && this.freehandMode(evt)) {
                this.addPoint(evt.xy);
            } else {
                this.modifyFeature(evt.xy);
				if(this.popup) {
					var allArea = this.measureArea();
					$(this.popup.contentDiv).find(".MeasureAllArea .measureResCon").text(allArea[0]);
					$(this.popup.contentDiv).find(".MeasureAllArea .measureResUnit").html(allArea[1]);
	                this.popup.moveTo(evt.xy);	
				}
            }
        }
        return true;
    },
    
    /**
	 * 마우스 우 클릭 시 거리 측정 종료
	 * parameter : evt (이벤트 객체)
	 * return : 
	 */
    rightclick: function(evt) {
    	this.dblclick(evt);
    	return false;
    },
    
    /**
	 * 더블 클릭 시 거리 측정 종료.
	 * parameter : evt (이벤트 객체)
	 * return : 
	 */
    dblclick: function(evt) {
    	if(this.count < 3) {
			alert('면적은 3개 이상의 지점을 선택해야 합니다.');
			return false;
		}
    	if(this.map.popups[this.map.popups.length-1].type == this.layerName) {
			this.map.removePopup(this.map.popups[this.map.popups.length-1]);
		}
        var lonlat = this.map.getLonLatFromPixel(evt.xy);
        var measureArea = this.measureArea();
        var contentHtml = "<div class='smControlMeasurePopup smControlMeasurePopupEndPoly' >총면적 : <span class='MeasureColor'>"+ measureArea[0] +"</span>" + measureArea[1] + "</div>";
	    var popup = new SuperMap.SmcPopup("measurePopup", lonlat, new this.getBrowserSize(152, 22), contentHtml, new SuperMap.Pixel(5,5));
		this.map.addPopup(popup);
		popup.type = this.layerName;
		popup.attributes = {
			print : true,
			contentHtml : "총면적 : " + measureArea[0] + measureArea[1],
			offsetX : 5,
			offsetY : 5
		};
		this.count = 0;
        if(!this.freehandMode(evt)) {
            this.removePoint();
            this.finalize();
        }
		if(this.popup) {
			this.map.removePopup(this.popup);
			this.popup = null;
		}
		//smActiveControl("pan");
        return false;
    },
    
    /**
	 * offset 을 고려한 팝업 생성
	 * parameter : geometry - 공간객체
	 * return : 
	 */
    activate: function() {
    	//this.removeFeature();
        if(!SuperMap.Handler.prototype.activate.apply(this, arguments)) {
            return false;
        }
        var options = SuperMap.Util.extend({
            displayInLayerSwitcher: false,
            calculateInRange: SuperMap.Function.True,
            wrapDateLine: this.citeCompliant
        }, this.layerOptions);
        this.layer = new SuperMap.Layer.SmcVector(this.layerName, options);
        this.map.addLayer(this.layer);
        return true;
    },
    
    // 컨트롤 비 활성화
    deactivate: function() {
        if(!SuperMap.Handler.prototype.deactivate.apply(this, arguments)) {
            return false;
        }
        if(this.drawing) {
        	this.count = 0;
        	this.removePopup();
            this.cancel();
        }
        if(!this.persistControl) {
        	this.layer.destroy(false);
			this.removePopup();
        }
        this.layer = null;
        return true;
    },
    
    // 도형, 팝업 삭제
    cleanFeature : function() {
		this.removeFeature();
		this.removePopup();
	},
	
	// 도형삭제
	removeFeature : function() {
		var layers = this.map.getLayersByName(this.layerName);
    	if(layers && layers.length > 0) {
    		this.map.removeLayer(layers[0]);
    		this.removePopup();
    	}
	},

	// 팝업 삭제 
    removePopup : function() {
    	var len = this.map.popups.length;
		for(var i=len-1; i >= 0; i--) {
			if(this.map.popups[i].type == this.layerName) {
				this.map.removePopup(this.map.popups[i]);
			}
		}
	},
	

	/**
	 * 브라우저에 따라 화면 크기 픽셀 반환 - msie 의 경우 크기에 테두리 까지 포함 하므로 테두리 크기 2 제외 
	 * parameter : 
	 * 		width - 너비
	 *  	height - 높이
	 *  return : 브라우저에 따라 변환된 크기
	 */
	getBrowserSize : function(width, height, move) {
		if(SuperMap.BROWSER_NAME == "msie") {
			return new SuperMap.Size(width-2, height-2);
		} else {
			if(move) {
				if(SuperMap.BROWSER_NAME == "firefox") 
					return new SuperMap.Size(width, height+9);
				else
					return new SuperMap.Size(width, height+4);
			}
			else {
				return new SuperMap.Size(width, height);	
			}
		}
	},
	CLASS_NAME: "SuperMap.Handler.SmcPolygonMeasure"
});


/**
 * Class: SuperMap.Handler.SmcCircle
 *
 * Inherits from:
 *  - <SuperMap.Handler.RegularPolygon>
 */
//그린 원의 반경 표시
SuperMap.Handler.SmcCircle = SuperMap.Class(SuperMap.Handler.RegularPolygon, {
	isDown: false,
	startLoc: null,
	mousedown: function (evt) {
		
		this.removePopup();

		this.isDown = true;
		this.startLoc = this.map.getLonLatFromPixel(evt.xy);
		
		var contentHtml = "<div class='test'>시작</div>";
		this.popup = new SuperMap.SmcPopup("measurePopup", this.startLoc, this.getBrowserSize(80, 32), contentHtml, new SuperMap.Pixel(5,5));
		this.popup.type = "circleSize";
		this.popup.attributes = {
			print : true,
			contentHtml : "시작",
			offsetX : 5,
			offsetY : 5
		};
		this.map.addPopup(this.popup);
        return SuperMap.Handler.RegularPolygon.prototype.mousedown.apply(this, arguments);
    },	mousemove: function (evt) {
		if(this.isDown){
			if(this.popup){
				this.popup.moveTo(evt.xy);	
				
				var currentLoc = this.map.getLonLatFromPixel(evt.xy);
				
				var lon = Math.abs(this.startLoc.lon - currentLoc.lon);
				var lat = Math.abs(this.startLoc.lat - currentLoc.lat);
				
				$(this.popup.contentDiv).find(".test").text(String(parseInt(Math.sqrt((lon*lon) + (lat*lat)) * 100, 10) / 100) + "m");
				circle_size = parseInt(Math.sqrt((lon*lon) + (lat*lat)) * 100, 10) / 100
				
			}
		}
        return SuperMap.Handler.RegularPolygon.prototype.mousemove.apply(this, arguments);
    }, mouseup: function (evt) {
		if(this.isDown){
			this.isDown = false;
		}
		
		
		circel_start = this.startLoc;
		circel_end = this.map.getLonLatFromPixel(evt.xy);
		this.map.getControl("pan").activate();
		
        return SuperMap.Handler.RegularPolygon.prototype.mouseup.apply(this, arguments);
    }, getBrowserSize : function(width, height, move) {
		
		if(SuperMap.BROWSER_NAME == "msie") {
			return new SuperMap.Size(width-2, height-2);
		}
		else {
			if(move) {
				if(SuperMap.BROWSER_NAME == "firefox") 
					return new SuperMap.Size(width, height+10);
				else
					return new SuperMap.Size(width, height+6);
			}
			else {
				return new SuperMap.Size(width, height);	
			}
		}
	},

	// 팝업 삭제
    removePopup : function() {
		//console.log(this.map.popups.length);
    	var len = this.map.popups.length;
		for(var i=len-1; i >= 0; i--) {
			if(this.map.popups[i].type == "circleSize") {
				this.map.removePopup(this.map.popups[i]);
			}
		}
	},
	
	
	CLASS_NAME: "SuperMap.Handler.SmcCircle"
});

/**
 * Class: SuperMap.SmcPopup
 *
 * Inherits from:
 *  - <SuperMap.Popup>
 */
// 거리측정, 면적 측정 결과 팝업 클래스 
SuperMap.SmcPopup = SuperMap.Class(SuperMap.Popup, {
	
	//팝업을 거리를 두고 그림
	offsetPixel : null,

	/**
	 * SuperMap.SmcPopup 생성자
	 * parameter :
	 * 		id - 팝업 아이디
	 * 		lonlat - 팝업을 표시할 좌표 객체
	 * 		contentSize - 팝업 크기
	 * 		contentHtml - 팝업 내용
	 * 		contentHtml - 팝업 내용
	 * return :
	 */
	initialize:function(id, lonlat, contentSize, contentHTML, offsetPixel) {
		if(offsetPixel) {
			this.offsetPixel = offsetPixel;
		}
        if (id == null) {
            id = SuperMap.Util.createUniqueID(this.CLASS_NAME + "_");
        }
        this.id = id;
        this.lonlat = lonlat;
        this.contentSize = (contentSize != null) ? contentSize 
                                  : new SuperMap.Size(
                                                   SuperMap.Popup.WIDTH,
                                                   SuperMap.Popup.HEIGHT);
        if (contentHTML != null) { 
             this.contentHTML = contentHTML;
        }
        this.backgroundColor = SuperMap.Popup.COLOR;
        this.opacity = SuperMap.Popup.OPACITY;
        this.border = SuperMap.Popup.BORDER;
        this.div = SuperMap.Util.createDiv(this.id, null, null, 
                                             null, null, null, "hidden");
        this.div.className = this.displayClass;
        var groupDivId = this.id + "_GroupDiv";
        this.groupDiv = SuperMap.Util.createDiv(groupDivId, null, null, 
                                                    null, "relative", null,
                                                    "hidden");
        var id = this.div.id + "_contentDiv";
        this.contentDiv = SuperMap.Util.createDiv(id, null, this.contentSize.clone(), 
                                                    null, "relative");
        this.contentDiv.className = this.contentDisplayClass;
        this.groupDiv.appendChild(this.contentDiv);
        this.div.appendChild(this.groupDiv);
        this.registerEvents();
    },
	
    /**
	 * 팝업의 위치 반환
	 * parameter :
	 * return : 팝업의 위치 (지도 좌표)
	 */
	getLonLat : function() {
		return this.lonlat;
	},

	/**
	 * offset 을 고려한 팝업 생성
	 * parameter : px (화면 좌표)
	 * return : 
	 */
    moveTo: function(px) {
        if ((px != null) && (this.div != null)) {
			// x, y 좌표의 픽셀을 offset으로 지정한 값만큼 증가 시킴
	    	if(this.offsetPixel) {
				px = px.add(this.offsetPixel.x, this.offsetPixel.y);
	    	}
			
			this.div.style.left = px.x + "px";
        	this.div.style.top = px.y + "px";
        }
    },
		
	CLASS_NAME: "SuperMap.SmcPopup"
});

/**
 * Class: SuperMap.Layer.SmcVector
 *
 * Inherits from:
 *  - <SuperMap.Layer.Vector,>
 */
//SuperMap.Layer.SmcVector 클래스
SuperMap.Layer.SmcVector = SuperMap.Class(SuperMap.Layer.Vector, {

	// 동적 변수를 적용한 도형 스타일의 실제 스타일을 반환
	parseStyle : function(feature, style) {
		// don't try to draw the feature with the renderer if the layer is not 
	    // drawn itself

	    if (typeof style != "object") {
	        if(!style && feature.state === SuperMap.State.DELETE) {
	            style = "delete";
	        }
	        var renderIntent = style || feature.renderIntent;
	        style = feature.style || this.style;
	        if (!style) {
	            style = this.styleMap.createSymbolizer(feature, renderIntent);
	        }
	    }

		return style;
	},
	
	CLASS_NAME: "SuperMap.Layer.SmcVector"
});

function smActiveControl(ctls) {
	
	for(var i in map.controls) {
		if(map.controls[i].type != SuperMap.Control.TYPE_TOGGLE && map.controls[i].active) {
			map.controls[i].deactivate();	
		}
	}
	if(typeof ctls === "object") {
		if(ctls.length && ctls.length > 0) {
			for(var i = 0; i < ctrs.length; i++) {
				map.getControl(ctls[i]).activate();
			}
		}
	}
	else {
		map.getControl(ctls).activate();
	}
	
}