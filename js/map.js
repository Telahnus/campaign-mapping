/*
file: /js/map.js
desc: javascript and jquery for index.html
*/

var centreLat=0.0;
var centreLon=0.0;
var initialZoom=2;
var imageWraps=false; //SET THIS TO false TO PREVENT THE IMAGE WRAPPING AROUND

var map; //the GMap3 itself
var gmicMapType;
var editing = false;

function GMICMapType() {
    this.Cache = Array();
    this.opacity = 1.0;
}

GMICMapType.prototype.tileSize = new google.maps.Size(256, 256);
GMICMapType.prototype.maxZoom = 19;
GMICMapType.prototype.getTile = function(coord, zoom, ownerDocument) {
    var c = Math.pow(2, zoom);
    var c = Math.pow(2, zoom);
    var tilex=coord.x,tiley=coord.y;
    if (imageWraps) {
        if (tilex<0) tilex=c+tilex%c;
        if (tilex>=c) tilex=tilex%c;
        if (tiley<0) tiley=c+tiley%c;
        if (tiley>=c) tiley=tiley%c;
    } else {
        if ((tilex<0)||(tilex>=c)||(tiley<0)||(tiley>=c)){
            var blank = ownerDocument.createElement('DIV');
            blank.style.width = this.tileSize.width + 'px';
            blank.style.height = this.tileSize.height + 'px';
            return blank;
        }
    }
    var img = ownerDocument.createElement('IMG');
    var d = tilex;
    var e = tiley;
    var f = "t";
    for (var g = 0; g < zoom; g++) {
        c /= 2;
        if (e < c) {
            if (d < c) { f += "q" }
            else { f += "r"; d -= c }
        } else {
            if (d < c) { f += "t"; e -= c }
            else { f += "s"; d -= c; e -= c }
        }
    }
    img.id = "t_" + f;
    img.style.width = this.tileSize.width + 'px';
    img.style.height = this.tileSize.height + 'px';
    img.src = "legrica4k-tiles/"+f+".jpg";
    this.Cache.push(img);
    return img;
}

GMICMapType.prototype.realeaseTile = function(tile) {
    var idx = this.Cache.indexOf(tile);
    if(idx!=-1) this.Cache.splice(idx, 1);
    tile=null;
}

GMICMapType.prototype.name = "Image Cutter";
GMICMapType.prototype.alt = "Image Cutter Tiles";
GMICMapType.prototype.setOpacity = function(newOpacity) {
    this.opacity = newOpacity;
    for (var i = 0; i < this.Cache.length; i++) {
        this.Cache[i].style.opacity = newOpacity; //mozilla
        this.Cache[i].style.filter = "alpha(opacity=" + newOpacity * 100 + ")"; //ie
    }
}

function getWindowHeight() {
    if (window.self&&self.innerHeight) {
        return self.innerHeight;
    }
    if (document.documentElement&&document.documentElement.clientHeight) {
        return document.documentElement.clientHeight;
    }
    return 0;
}

function resizeMapDiv() {
    //Resize the height of the div containing the map.
    //Do not call any map methods here as the resize is called before the map is created.
    var d=document.getElementById("map");
    var offsetTop=0;
    for (var elem=d; elem!=null; elem=elem.offsetParent) {
        offsetTop+=elem.offsetTop;
    }
    var height=getWindowHeight()-offsetTop-16;
    if (height>=0) {
        d.style.height=height+"px";
    }
}

function load() {
    resizeMapDiv();
    var latlng = new google.maps.LatLng(centreLat, centreLon);
    var myOptions = {
        zoom: initialZoom,
        minZoom: 2,
        maxZoom: 5,
        center: latlng,
        panControl: true,
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: false,
        streetViewControl: false,
        overviewMapControl: true,
        mapTypeControlOptions: { mapTypeIds: ["ImageCutter"] },
        mapTypeId: "ImageCutter"
    }
    map = new google.maps.Map(document.getElementById("map"), myOptions);
    gmicMapType = new GMICMapType();
    map.mapTypes.set("ImageCutter",gmicMapType);

    google.maps.event.addListener(map, 'rightclick', function(event) {
        if (editing==true)
            placeMarker(event.latLng);
    });
}

function placeMarker(location) {
    var marker = new google.maps.Marker({
        position: location, 
        map: map
    });
    //Content structure of info Window for the Markers
    var contentString = $(
        '<div class="marker-info-win">'+
        '<div class="marker-inner-win">'+
        '<span class="info-content">'+
        '<h1 class="marker-heading">New Marker</h1>'+
        'This is a new marker infoWindow'+
        '</span><br>'+
        '<button name="remove-marker" class="remove-marker" title="Remove Marker">Remove Marker</button>'+
        '</div></div>'
    );
       
    //Create an infoWindow
    var infowindow = new google.maps.InfoWindow();
    //set the content of infoWindow
    infowindow.setContent(contentString[0]);
    //add click event listener to marker which will open infoWindow          
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map,marker); // click on marker opens info window
    });
    var removeBtn = contentString.find('button.remove-marker')[0];
    google.maps.event.addDomListener(removeBtn, "click", function(event) {
        if (editing)
            marker.setMap(null);
    });

}

function switchEditing(){
    if (editing==false){
        editing = true;
        $("#edit_btn").val("Edit (on)");
    }else{
        editing = false;
        $("#edit_btn").val("Edit (off)");
    }
}