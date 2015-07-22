/*
file: /js/map.js
desc: javascript and jquery for map.php
*/

var centreLat=0.0;
var centreLon=0.0;
var initialZoom=2;
var imageWraps=false; //SET THIS TO false TO PREVENT THE IMAGE WRAPPING AROUND

var map; //the GMap3 itself
var gmicMapType;
var editing = false;
var markers = [];
var windows = [];

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

   
//############### Google Map Initialize ##############
function map_initialize()
{
    resizeMapDiv();
    var mapCenter = new google.maps.LatLng(centreLat, centreLon);
    var googleMapOptions =
    {
        zoom: initialZoom,
        minZoom: 2,
        maxZoom: 5,
        center: mapCenter,
        panControl: true,
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: false,
        streetViewControl: false,
        overviewMapControl: true,
        mapTypeControlOptions: { mapTypeIds: ["ImageCutter"] },
        mapTypeId: "ImageCutter"
    };

    map = new google.maps.Map(document.getElementById("map"), googleMapOptions);        
    gmicMapType = new GMICMapType();
    map.mapTypes.set("ImageCutter",gmicMapType);
   
    //drop a new marker on right click
    google.maps.event.addListener(map, 'rightclick', function(event) {
        addMarker(event.latLng);
    });
                      
}

//############### Create Marker Function ##############
// Add a marker to the map and push to the array.
function addMarker(location) {
    var marker = new google.maps.Marker({
        position: location,
        draggable: true,
        animation: google.maps.Animation.DROP,
        map: map
    });
    var texter = "mwahahaha";
    var contentString = $("<form>"+
        "<input type='text' name='title' class='title' placeholder='title'><br>"+
        "<input type='text' name='link' class='link' placeholder='link'><br>"+
        "<textarea name='desc' class='desc' placeholder='desc'></textarea><br>"+
        "<button type='button' name='save' class='save'>Save</button>"+
        "<button type='button' name='edit' class='edit'>Edit</button>"+
        "<button type='button' name='delete' class='delete'>Delete</button>"+
        "</form>");

    var save_btn = contentString.find('button.save')[0];
    var edit_btn = contentString.find('button.edit')[0];
    var del_btn = contentString.find('button.delete')[0];
/*    var title = contentString.find('input.title')[0].value;
    var link = contentString.find('input.link')[0].value;
    var desc = contentString.find('textarea.desc')[0].value;
    var pos = marker.position;
    var data = title+","+link+","+desc+","+pos;*/
    //$(edit_btn).hide();

    google.maps.event.addDomListener(save_btn, "click", function(event) {
        saveMarker(marker);
    });
    google.maps.event.addDomListener(edit_btn, "click", function(event) {
        var title = contentString.find('input.title')[0].value;
        var link = contentString.find('input.link')[0].value;
        var desc = contentString.find('textarea.desc')[0].value;
        var pos = marker.position;
        var data = title+","+link+","+desc+","+pos;
        test(data);
    });
    google.maps.event.addDomListener(del_btn, "click", function(event) {
        deleteMarker(marker);
    });

    var infowindow = new google.maps.InfoWindow();
    infowindow.setContent(contentString[0]);

    windows.push(infowindow);
    markers.push(marker);

    google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map,marker);
    });

}

// Sets the map on all markers in the array.
function setAllMap(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setAllMap(null);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}

function deleteMarker(marker){
    marker.setMap(null);
}

function saveMarker(marker){
    alert(marker.position);
}

function test(param){

    $.ajax({
        type : "POST",
        url : "test.php",
        data : param,
        success: function(data){
            alert(data);
        },
        error: function( status, errorThrown ) {
            alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
        },
    });

/*    $.ajax({
        url: "test.php", 
        //data: JSON.stringify(param),
        //type: "POST",
        error: function( status, errorThrown ) {
            alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
        },
        success: function(result){
            alert( "The request is complete!" );
        }
    });*/

    //alert(param);

}