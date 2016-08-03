
/**
 * @requires SuperMap/Util.js
 * @requires SuperMap/Layer/CanvasLayer.js
 */

/**
 * Class: SuperMap.Layer.VWorld
 *
 * Inherits from:
 *  - <SuperMap.Layer.CanvasLayer>
 */

SuperMap.Layer.VWorldLayer = SuperMap.Class(SuperMap.CanvasLayer, {
    /**
     * APIProperty: name
     * {String} Layer name. Default is "VWorld", which is used to prevent that users don't set the layer name during the initialization.
     *
     */
    name: "VWorld",

    /**
     * Property: url
     * {String} Three server URLs of the default VWorld, which doesn't need to be set up
     */
    url: [
        'http://xdworld.vworld.kr:8080/2d/Base/201310/${z}/${x}/${y}.png'
    ],
    

    /**
     * Constructor: SuperMap.Layer.VWorld
     * Create an VWorld layer which can browse an OpenStreetMap map
     * Example:
     * (code)
     *
     * var VWorld = new SuperMap.Layer.VWorld("MyName");
     *                                    
     * (end)
     *
     * Default is Mercator projection, so both map positioning and adding elements on maps need the coordinate conversion. 
     * Example:
     * (code)
     *
     * var markers = new SuperMap.Layer.Markers( "Markers" );
     * map.addLayer(markers);
     * var size = new SuperMap.Size(21,25);
     * var offset = new SuperMap.Pixel(-(size.w/2), -size.h);
     * var icon = new SuperMap.Icon('figure's url', size, offset);
     * markers.addMarker(new SuperMap.Marker(new SuperMap.LonLat(118,40 ).transform(
     * new SuperMap.Projection("EPSG:4326"),
     * map.getProjectionObject()),icon));
     *
     * (end)
     * Parameters:
     * name - {String} Layer name
     */
    initialize: function(name, options) {
    	var resLen = 13;
        var resStart = 0;
    	var resolutionsArr = [] ;
    	var scalesArr = [] ;
    	var dpi = 95.99999999999984;
        for(var i=resStart;i<=resLen;i++){
            var res3857 = 2445.9849/Math.pow(2,i);
            resolutionsArr.push(res3857);

            var scale3857 = 0.0127/dpi/res3857;
            scalesArr.push(scale3857);
        }
        options = SuperMap.Util.extend({
            projection: "EPSG:3857",
            
            //minZoom : 7
            resolutions :resolutionsArr,
            scales : scalesArr
        }, options);
        SuperMap.CanvasLayer.prototype.initialize.apply(this,[name,this.url,{},options] );
    },

    /**
     * Method: clone
     */
    clone: function(obj) {
        if (obj == null) {
            obj = new SuperMap.Layer.VWorldLayer(
                this.name, this.url, this.getOptions());
        }
        obj = SuperMap.CanvasLayer.prototype.clone.apply(this, [obj]);
        return obj;
    },

    /**
     * APIMethod: destroy
     * Deconstruct an VWorldLayer class and dispose resources.
     */
    destroy: function () {
        var me = this;
        SuperMap.CanvasLayer.prototype.destroy.apply(me, arguments);
    },
    /**
     * Method: getTileUrl
     * Get the URL of the tile.
     *
     * Parameters:
     * xyz - {Object} A group key value pair denotes the index of the X, Y and Z direction.
     *
     * Returns
     * {String} The URL of the tile .
     */
    getTileUrl: function (xyz) {
        var me = this,  url;
        console.log(xyz.z);
        if (SuperMap.Util.isArray(this.url)) {

            url = me.selectUrl(xyz, this.url);
        }
        url= SuperMap.String.format(url, {
            x: xyz.x,
            y: xyz.y,
            z: xyz.z+6
        });
        return  url;
    },
    /**
     * Method: selectUrl
     * Select a reasonable url from a group of url arrays with a certain method
     * Parameters:
     * xyz - {Object}  A group key value pair denotes the index of the X, Y and Z direction.
     * urls - {Array(String)} url array
     *
     * Returns:
     * {String} A reasonable url which is mainly used to visit multiple servers for plotting, and improve efficiency
     */
    selectUrl: function(xyz, urls) {
        var id=Math.abs(xyz.x+xyz.y)%urls.length;
        var url=urls[id];
        return url;
    },
    //CLASS_NAME: "SuperMap.Layer.VWorldLayer"
});
