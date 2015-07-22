<!DOCTYPE html>

<html>

<head>
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
    <meta http-equiv="content-type" content="text/html/xml; charset=utf-8"/>
    <title>Legrica Sector</title>
    <link rel="stylesheet" type="text/css" href="css/map.css">
    <script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false"></script>
    <script type="text/javascript" src="js/jquery-1.10.2.min.js"></script>
    <script src="js/map.js" type="text/javascript"></script>
    <!-- <link rel="stylesheet" type="text/css" href="css/map.css"> -->
</head>

<body onresize="resizeMapDiv()" onload="map_initialize()">
    <div id="overmap">
        <input id="edit_btn" type="button" onclick="" value="Edit">
        <br>
        <input id="save_btn" type="button" onclick="save()" value="Save">
        <br>
        <input id="test_btn" type="button" onclick="test()" value="Test">
    </div>
    <div id="map"></div>
</body>

</html>