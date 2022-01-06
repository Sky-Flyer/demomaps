String.prototype.contains = function(it) { return this.indexOf(it) != -1; };

var lock=false;
var permahash=false;
var next=false;
var marker=null;
var aktLayer=null;
var baseMaps = null;
var mCoordCtr = null; //utm coord control
var w3wCtrl = null; //what-3-words control
var akt_protocol= window.location.protocol=='file:'?'http:':window.location.protocol;

var maxzoom_std=20;
var maxzoom_osm=19;
var maxzoom_topo=16
var maxzoom_g_sat=20;
var maxzoom_esri_sat=18;
var maxzoom_amap=13;
var maxzoom_natgeo=12;
var maxzoom_mapboxctry=7;
var minzoom_amap=8;
var maxzoom_19=19;
var maxzoom_14=14;
var maxzoom_11=11;
var maxzoom_10=10;
var maxzoom_6=6;
var maxzoom_5=5;

var southWest = L.latLng(46.2520,8.7891),
    northEast = L.latLng(49.2714,17.6660),
    boundsAUT = L.latLngBounds(southWest, northEast);

var layerAdrMapSurfer=akt_protocol+"//korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}";
var layerMapSurfer = new L.TileLayer(layerAdrMapSurfer,{maxZoom: maxzoom_osm,detectRetina: true, attribution: 'Kartendaten: © <a href="http://mapsurfernet.com/">Mapsurfer</a>'});
var stdLayer = layerMapSurfer;
var stdLayerName = "OpenStreetMap Standard";

function cookie_read(cookiename) {
    var cookies=document.cookie.split("; ");
    for(var i=0;i<cookies.length;i++) {
        var a=cookies[i].split("=");
        if(a[0] == cookiename) {
            a.shift();
            return a.join("=");
        }
    }
    return null;
}

function delete_permahash(){
    document.cookie="permahash=;";
}

/* overloaded function to set browser hash and cookie 
*	no parameter: normal mode
*	with parameter: update marker hash
*/
function set_hash(marker_position) {
    var digits=Math.ceil(2*Math.log(map.getZoom())-1);
    var position=map.getZoom()+"/"+map.getCenter().lat.toFixed(digits)+"/"+map.getCenter().lng.toFixed(digits);
    var layer = aktLayer;
    var e=new Date;e.setYear(e.getFullYear()+10);
    document.cookie="map="+position+";layer="+layer+" ;expires="+e;
    if(marker==null) {
        if(next==true){
            window.location.hash="map="+position+"/"+layer;
            fixFavIcon();
            next=false;
        } else {
            window.location.replace('#map='+position+"/"+layer);
        }
        if((permahash==true) || (cookie_read("permahash")==window.location.hash.substr(1))){
            next=true;
            permahash=false;
            document.cookie="permahash="+position;
        }
    } else if(marker_position!=null) {
        window.location.hash="marker="+map.getZoom()+"/"+marker_position.lat.toFixed(digits)+"/"+marker_position.lng.toFixed(digits)+"/"+layer;
        fixFavIcon();
    }
}

function set_view() {
    if(lock==false) {
        var hash=window.location.hash;
        if((hash.contains("map")) && (hash.split("/").length-1 == 3)) {
            var position = hash.substr(1).split("map=")[1].split("/");
            if(isValid(position)) {
                map.setView(new L.LatLng(position[1], position[2]), position[0]);
            }
            if(marker!=null) {
                map.removeLayer(marker);
                marker=null;
            }
            aktLayer=decodeURIComponent(position[3] == null || position[3].length == 0 ? stdLayerName : position[3]);
        } else if((hash.contains("marker")) && (hash.split("/").length-1 == 2)) {
            var position = hash.substr(1).split("marker=")[1].split("/");
            if((marker==null) && (isValid(position))){
                map.setView(new L.LatLng(position[1], position[2]), position[0]);
                marker = L.marker([position[1], position[2]],{draggable:true}).addTo(map).on('dragend', function(event){
                        set_hash(event.target.getLatLng());
                        setMarkerPopup(event.target.getLatLng());
                    });
            } else if((marker!=null) && (isValid(position))) {
                marker.setLatLng(new L.LatLng(position[1], position[2]));
            }
            aktLayer=decodeURIComponent(position[3] === undefined ? stdLayerName : position[3]);
            setMarkerPopup(new L.LatLng(position[1], position[2]));
        } else if(cookie_read("map")) {
            var position = cookie_read("map").split("/");
            aktLayer=decodeURIComponent(position[3] === undefined ? stdLayerName : position[3]);
            map.setView(new L.LatLng(position[1], position[2]), position[0]);
        } else {
            map.setView(new L.LatLng(46, 16), 5);
            aktLayer=stdLayerName;
        }
        //console.log("Debug: set-view: aktlayer="+aktLayer)
        setAktLayer(aktLayer);
        set_hash();
    }

    lock=false;
}

function setAktLayer(layerToSet){
    //console.log("Debug: setAktLayer: aktlayer="+aktLayer)
    var l = readLayer(layerToSet);
    if(l){
        //console.log("Debug: setAktLayer: readlayer="+ l.name+"/"+ l.layerObj)
        map.addLayer(l.layerObj);
    }
}
function readLayer(searchedLayer){
    if (searchedLayer==null || searchedLayer.length<1){return}
    for (baseMap in baseMaps)
    {
        var maxZoom;
        var layerObj;
        for (layerName in baseMaps[baseMap].layers){
            var layerObj = baseMaps[baseMap].layers[layerName];
            var layerOptions=layerObj.options;
            if (layerOptions!=null){
                maxZoom=layerOptions.maxZoom;
            }
            if (searchedLayer===layerName){
                //found!!!
                //console.log("Debug: found: "+layerName);
                return {name: layerName, maxZoom: maxZoom, layerObj: layerObj};
            }
            //console.log("Debug: not right layer: "+layerName);
        }
    }
    return {name: "Standard layer", maxZoom: maxzoom_19, layerObj: stdLayer};
}

function setMarkerPopup(latLngPos){
    var digits=Math.ceil(2*Math.log(map.getZoom())-1);
    var content="<h3>Position:</h3>"
    content+="<table class='table table-condensed' style='font: 12px Calibri, Arial, Helvetica, sans-serif; width: 250px;'>"
    content+="<tr> <td ><b>Grad (Länge, Breite)</b></td> <td>"+latLngPos.lng.toFixed(digits)+"</td> <td>"+latLngPos.lat.toFixed(digits)+"</td> </tr>"
    if (mCoordCtr){
        var utm = mCoordCtr._geo2utm(latLngPos);
        content += "<tr> <td><b>UTM easting/northing</b> </td> <td colspan='2'>"+utm.zone+"&nbsp;" +utm.x+"&nbsp;" +utm.y+"</td> </tr>"; 
    
        var utmref = mCoordCtr._utm2mgr(mCoordCtr._geo2utm(latLngPos));
        content += "<tr> <td><b>UTMREF / MGRS</b> </td> <td colspan='2'>"+utmref.zone+"&nbsp;" +utmref.band+"&nbsp;" +utmref.x+"&nbsp;" +utmref.y+"</td> </tr>"; 
    }
    if(w3wCtrl){
        w3wCtrl._getJSON('https://api.what3words.com/v2/reverse?key='+w3wCtrl.options.apikey+'&coords='+latLngPos.lat+','+latLngPos.lng+'&lang=de', function(data) {
            content += "<tr> <td><b><a target='_blank' href='http://w3w.co/"+ data.words+"'>w3w (de)</a></b> </td> <td colspan='2'>"+ data.words+"</td> </tr>";
            marker.bindPopup(content);
        }, function(status) {
            console.log('Something went wrong at w3w api call.');
        });
        w3wCtrl._getJSON('https://api.what3words.com/v2/reverse?key='+w3wCtrl.options.apikey+'&coords='+latLngPos.lat+','+latLngPos.lng+'&lang=en', function(data) {
            content += "<tr> <td><b><a target='_blank' href='http://w3w.co/"+ data.words+"'>w3w (en)</a></b> </td> <td colspan='2'>"+ data.words+"</td> </tr>";
            marker.bindPopup(content);
        }, function(status) {
            console.log('Something went wrong at w3w api call.');
        });
    }

    marker.bindPopup(content);
}

/* check if coordinates are valid numbers; if not zoom to Europe default */
function isValid(p) { //(parseFloat(p[0]) != parseInt(p[0])) ||
    if(isNaN(p[0]) || isNaN(p[1]) || isNaN(p[2])) {
        window.location.replace("");
        map.setView(new L.LatLng(46, 16), 5);
        alert("invalid coordinates");
        return false;
    } else {
        return true;
    }
}

function fixFavIcon(){
    var link = document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = 'favicon.ico';
    document.getElementsByTagName('head')[0].appendChild(link);
}

//main function
// create opentopomap layer
var layerAdrTopo=akt_protocol+"//{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
var layerOpenTopo = new L.TileLayer(layerAdrTopo,{maxZoom: maxzoom_topo, maxNativeZoom: maxzoom_topo-1, detectRetina: true, attribution: 'Kartendaten: Kartendaten: © <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende, SRTM | Kartendarstellung: © <a href="http://opentopomap.org">OpenTopoMap</a>'});

//mapquest open (normal, sat und overlay)
//https://c.tiles.mapbox.com/v4/mapquest.streets/10/301/385.png?access_token=pk.eyJ1IjoibWFwcXVlc3QiLCJhIjoiY2Q2N2RlMmNhY2NiZTRkMzlmZjJmZDk0NWU0ZGJlNTMifQ.mPRiEubbajc6a5y9ISgydg
//layerAdrMapquest=akt_protocol+"//otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png"
//layerAdrMapquest="https://{s}.tiles.mapbox.com/v4/mapquest.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwcXVlc3QiLCJhIjoiY2Q2N2RlMmNhY2NiZTRkMzlmZjJmZDk0NWU0ZGJlNTMifQ.mPRiEubbajc6a5y9ISgydg"
//layerMapquest = new L.TileLayer(layerAdrMapquest,{ 
//	maxZoom: maxzoom_osm, tms: false, subdomains: 'abcd', attribution: 'Kartendaten: Maps © <a href="http://mapquest.com/">Mapquest</a>, Data © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'});
//layerMapqSatName=akt_protocol+"//ttiles0{s}.mqcdn.com/tiles/1.0.0/vy/sat/{z}/{x}/{y}.png"
//layerMapqSatName=akt_protocol+"//otile{s}-s.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg"
//layerMapquestSat = new L.TileLayer(layerMapqSatName,{ 
//	maxZoom: maxzoom_osm,detectRetina: true, subdomains: '1234', attribution: 'Kartendaten: Maps © <a href="http://mapquest.com/">Mapquest</a>, Data © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'});
//var layerOSMOvl = new L.TileLayer("http://otile{s}-s.mqcdn.com/tiles/1.0.0/hyb/{z}/{x}/{y}.png",
//   {maxZoom: maxzoom_osm,detectRetina: true, subdomains: '1234',attribution: 'Kartendaten: Maps © <a href="http://mapquest.com/">Mapquest</a>, Data © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'});


// create open railway map layer
var layerAdrWikiMedia=akt_protocol+"//maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png"
var layerWikiMedia = new L.TileLayer(layerAdrWikiMedia,{maxZoom: maxzoom_osm,detectRetina: true, attribution: 'Wikimedia maps beta | Map data &copy; <a href=akt_protocol+"//openstreetmap.org/copyright">OpenStreetMap contributors</a>'});

// create open railway map layer
var layerAdrORailw=akt_protocol+"//{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
var layerORailw = new L.TileLayer(layerAdrORailw,{maxZoom: maxzoom_osm,detectRetina: true, attribution: 'Kartendaten: <a href="http://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>, Style: <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA 2.0</a> <a href="http://www.openrailwaymap.org/">OpenRailwayMap</a>'});
// create osm cyclemap layer
var layerAdrOSMCyle=akt_protocol+"//{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png"
var layerOSMCycle = new L.TileLayer(layerAdrOSMCyle,{maxZoom: maxzoom_osm,detectRetina: true, attribution: 'Kartendaten: Maps © <a href=akt_protocol+"//www.thunderforest.com">Thunderforest</a>, Data © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'});
// create osm landscape layer
var layerAdrOSMLands=akt_protocol+"//{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png"
var layerOSMLands = new L.TileLayer(layerAdrOSMLands,{maxZoom: maxzoom_osm,detectRetina: true, attribution: 'Kartendaten: Maps © <a href="http://www.thunderforest.com">Thunderforest</a>, Data © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'});
// create osm outdoors layer
var layerAdrOSMOutd=akt_protocol+"//{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png"
var layerOSMOutd = new L.TileLayer(layerAdrOSMOutd,{maxZoom: maxzoom_osm,detectRetina: true, attribution: 'Kartendaten: Maps © <a href="http://www.thunderforest.com">Thunderforest</a>, Data © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'});
// create osm transport layer
var layerAdrOSMTransp=akt_protocol+"//{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png"
var layerOSMTransp = new L.TileLayer(layerAdrOSMTransp,{maxZoom: maxzoom_osm,detectRetina: true, attribution: 'Kartendaten: Maps © <a href="http://www.thunderforest.com">Thunderforest</a>, Data © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'});

// create osm standard layer
var layerAdrOSMStd = akt_protocol+'//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
layerOSMStd = new L.TileLayer(layerAdrOSMStd,{maxZoom: maxzoom_osm,detectRetina: true, attribution: 'Kartendaten: © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'});
// create osm standard overlay layer
var layerAdrOSMStdDe = akt_protocol+'//tile.geofabrik.de/23228979966ae9040ceb0597251e12a2/{z}/{x}/{y}.png'
var layerOSMStdDe = new L.TileLayer(layerAdrOSMStdDe,{maxZoom: maxzoom_osm,detectRetina: true, attribution: 'Kartendaten: © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'});

var layerAdrOSMOvl = akt_protocol+'//{s}.sm.mapstack.stamen.com/toner-hybrid/{z}/{x}/{y}.png'
var layerOSMOvl = new L.TileLayer(layerAdrOSMOvl,{maxZoom: maxzoom_osm,detectRetina: true, attribution: 'Kartendaten: © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'});

//webatlas.no
var layerWebAtlNo = new L.TileLayer(akt_protocol+"//www.webatlas.no/maptiles/tiles/webatlas-standard-vektor/wa_grid/{z}/{x}/{y}.png",{maxZoom: maxzoom_osm,detectRetina: true, attribution: 'Kartendaten: © Norkart AS/EEA CLC2006/<a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'});

//Basemap.at
var layerAdrBasem=akt_protocol+"//maps{s}.wien.gv.at/basemap/bmaphidpi/normal/google3857/{z}/{y}/{x}.jpg"
var layerBasem = new L.TileLayer(layerAdrBasem,{ maxZoom: maxzoom_osm, bounds: boundsAUT, detectRetina: true, subdomains: '1234', attribution: 'Kartendaten: © <a href="http://www.basemap.at">Basemap.at<a/>'});
var layerAdrBasemVerd=akt_protocol+"//maps{s}.wien.gv.at/wmts/bmapverdichtung/normal/google3857/{z}/{y}/{x}.png"
var layerBasemVerd = new L.TileLayer(layerAdrBasemVerd,{ maxZoom: 20, minZoom: 18, bounds: boundsAUT, detectRetina: true, format: 'image/png', subdomains: '1234', attribution: 'Kartendaten: © <a href="http://www.basemap.at">Basemap.at<a/>'});
var layerAdrBasemOvl=akt_protocol+"//maps{s}.wien.gv.at/basemap/bmapoverlay/normal/google3857/{z}/{y}/{x}.png"
var layerBasemOvl = new L.TileLayer(layerAdrBasemOvl,{ maxZoom: maxzoom_std, bounds: boundsAUT, detectRetina: true, transparent: true, format: 'image/png', subdomains: '1234', attribution: 'Kartendaten: © <a href="http://www.basemap.at">Basemap.at<a/>'});
var layerGrpBasemVd = L.layerGroup().addLayer(layerBasem).addLayer(layerBasemVerd);

var layerAdrBasemOrtho = akt_protocol+"//maps{s}.wien.gv.at/basemap/bmaporthofoto30cm/normal/google3857/{z}/{y}/{x}.jpeg";
var layerBasemOrtho = new L.TileLayer(layerAdrBasemOrtho,{ maxZoom: maxzoom_osm, bounds: boundsAUT, detectRetina: true, subdomains: '1234', attribution: 'Kartendaten: © <a href="http://www.basemap.at">Basemap.at<a/>'});

//kartenwerkstatt.at bounds: boundsAUT,
//var layerKwStattOsm = new L.TileLayer(akt_protocol+"//tilestream.kartenwerkstatt.at/1.0.0/austria-osm-imposm-bright/{z}/{x}/{y}.png",{ maxZoom: maxzoom_osm, minZoom: 3,  detectRetina: true, subdomains: '1234', attribution: 'Kartendaten: © <a href="http://www.kartenwerkstatt.at">Kartenwerkstatt.at<a/>'});

var layerAdrOpFlightMap = akt_protocol+"//snapshots.openflightmaps.org/live/1712/tiles/world/noninteractive/epsg3857/merged/512/latest/{z}/{x}/{y}.png";
var layerOpFlightMap = new L.TileLayer(layerAdrOpFlightMap,{ maxZoom: maxzoom_osm, detectRetina: true, subdomains: '1234', attribution: 'Karte: <a href="https://www.openflightmaps.org/">openflightmap.org</a>'});


//Esri - Arcgis online
var layerAdrEsriTopo=akt_protocol+"//server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
var layerEsriTopo = new L.TileLayer(layerAdrEsriTopo,{ maxZoom: maxzoom_osm, attribution: 'Kartendaten: © ArGIS Online'});
var layerAdrEsriStreet=akt_protocol+"//server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
var layerEsriStreet = new L.TileLayer(layerAdrEsriStreet,{ maxZoom: maxzoom_osm, attribution: 'Kartendaten: © ArGIS Online'});
var layerEsriGray = new L.TileLayer(akt_protocol+"//server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",{ 
    maxZoom: maxzoom_osm, attribution: 'Kartendaten: © ArGIS Online'});
var layerEsriWldImg = new L.TileLayer(akt_protocol+"//server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{ 
    maxZoom: maxzoom_esri_sat, attribution: 'Kartendaten: © ArGIS Online'});
var layerEsriBoundOvlUrl=akt_protocol+"//server.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places_Alternate/MapServer/tile/{z}/{y}/{x}";
var layerEsriBoundOvl = new L.TileLayer(layerEsriBoundOvlUrl,
{ maxZoom: 13, opacity: 1, attribution: 'Kartendaten: © ArGIS Online'});
var layerEsriWldRefOvlUrl=akt_protocol+"//services.arcgisonline.com/arcgis/rest/services/Reference/World_Reference_Overlay/MapServer/tile/{z}/{y}/{x}";
var layerEsriWldRefOvl = new L.TileLayer(layerEsriWldRefOvlUrl,
{ maxZoom: 9, opacity: 1, attribution: 'Kartendaten: © ArGIS Online'});

    // Google layers
var g_roadmap   = new L.Google('ROADMAP',{maxZoom: maxzoom_std,attribution: 'Kartendaten: © Google'});
var g_satellite = new L.Google('SATELLITE', {maxZoom: maxzoom_g_sat,attribution: 'Kartendaten: © Google'});
var g_hybrid   = new L.Google('HYBRID', {maxZoom: maxzoom_g_sat,attribution: 'Kartendaten: © Google'});
var g_terrain   = new L.Google('TERRAIN',{maxZoom: maxzoom_topo,attribution: 'Kartendaten: © Google'});
var layerGoogleStd = new L.TileLayer(akt_protocol+"//mt{s}.google.com/vt/hl=de&x={x}&y={y}&z={z}",{ maxZoom: maxzoom_std, detectRetina: true, subdomains: '01', attribution: 'Kartendaten: © Google'});
var layerGoogleTer = new L.TileLayer(akt_protocol+"//mt{s}.google.com/vt/hl=de&lyrs=p&x={x}&y={y}&z={z}",{ maxZoom: maxzoom_std, detectRetina: true, subdomains: '01', attribution: 'Kartendaten: © Google'});
var layerGoogleHyb = new L.TileLayer(akt_protocol+"//mt{s}.google.com/vt/hl=de&lyrs=y&x={x}&y={y}&z={z}",{ maxZoom: maxzoom_g_sat, detectRetina: true, subdomains: '01', attribution: 'Kartendaten: © Google'});
var layerGoogleSat = new L.TileLayer(akt_protocol+"//mt{s}.google.com/vt/hl=de&lyrs=s&x={x}&y={y}&z={z}",{ maxZoom: maxzoom_g_sat, detectRetina: true, subdomains: '01', attribution: 'Kartendaten: © Google'});
var layerGoogleLbl = new L.TileLayer(akt_protocol+"//mt{s}.google.com/vt/hl=de&lyrs=h&x={x}&y={y}&z={z}",{ maxZoom: maxzoom_g_sat, detectRetina: true, subdomains: '01', attribution: 'Kartendaten: © Google'});

//apple layers
//https://sat-cdn1.apple-mapkit.com/tile?style=7&size=1&scale=1&z=19&x=285841&y=181835&v=3021&accessKey=1535055201_1221420413073044_%2F_tlIV55%2ByUmacZNPQ7MvFmqlmlKrUocGxSOjl1QU25kA%3D
layerAdrAppleStd="https://cdn{s}.apple-mapkit.com/ti/tile?type=tile&style=0&size=1&x={x}&y={y}&z={z}&scale=1&lang=de-DE&imageFormat=jpg&accessKey=1535055201_1221420413073044_%2F_tlIV55%2ByUmacZNPQ7MvFmqlmlKrUocGxSOjl1QU25kA%3D"
layerAppleStd = new L.TileLayer(layerAdrAppleStd,{ maxZoom: maxzoom_std, detectRetina: true, subdomains: '1234', attribution: 'Kartendaten: © Apple Inc.'});
layerAdrAppleSat="https://sat-cdn{s}.apple-mapkit.com/tile?style=7&size=1&scale=1&z={z}&x={x}&y={y}&accessKey=1535055201_1221420413073044_%2F_tlIV55%2ByUmacZNPQ7MvFmqlmlKrUocGxSOjl1QU25kA%3D&v=203"
layerAppleSat = new L.TileLayer(layerAdrAppleSat,{ maxZoom: maxzoom_g_sat, detectRetina: true, subdomains: '1234', attribution: 'Kartendaten: © Apple Inc.'});
layerAdrAppleOverlay="https://cdn{s}.apple-mapkit.com/ti/tile?type=tile&style=46&size=1&x={x}&y={y}&z={z}&scale=1&lang=de-DE&imageFormat=png&accessKey=1535055201_1221420413073044_%2F_tlIV55%2ByUmacZNPQ7MvFmqlmlKrUocGxSOjl1QU25kA%3D"
layerAppleOverlay = new L.TileLayer(layerAdrAppleOverlay,{ maxZoom: maxzoom_g_sat,detectRetina: true, 	transparent: true, format: 'image/png', subdomains: '1234', attribution: 'Kartendaten: © Apple Inc.'});
layerAdrAppleStdAlt=akt_protocol+"//gsp2.apple.com/tile?api=1&style=slideshow&layers=default&lang=de_DE&z={z}&x={x}&y={y}&v=10"
layerAppleStdAlt = new L.TileLayer(layerAdrAppleStdAlt,{ maxZoom: maxzoom_14, detectRetina: true, subdomains: '1234', attribution: 'Kartendaten: © Apple Inc.'});

// Bing layers
var bing_areal = new L.BingLayer("AuhiCJHlGzhg93IqUH_oCpl_-ZUrIE6SPftlyGYUvr9Amx5nzA-WqGcPquyFZl4L", {type: 'Aerial',maxZoom: maxzoom_std});
var bing_areal_label = new L.BingLayer("AuhiCJHlGzhg93IqUH_oCpl_-ZUrIE6SPftlyGYUvr9Amx5nzA-WqGcPquyFZl4L", {type: 'AerialWithLabels',maxZoom: maxzoom_std});
//		var bing_birdseye = new L.BingLayer("AuhiCJHlGzhg93IqUH_oCpl_-ZUrIE6SPftlyGYUvr9Amx5nzA-WqGcPquyFZl4L", {type: 'Birdview',maxZoom: maxzoom_std});
var bing_road = new L.BingLayer("AuhiCJHlGzhg93IqUH_oCpl_-ZUrIE6SPftlyGYUvr9Amx5nzA-WqGcPquyFZl4L", {type: 'Road',maxZoom: maxzoom_std});


//ÖPNV "http://tile.memomaps.de/tilegen/14/8575/5624.png"
layerÖPNV = new L.TileLayer(akt_protocol+"//tile.memomaps.de/tilegen/{z}/{x}/{y}.png",{ 
    maxZoom: maxzoom_std,detectRetina: true, attribution: 'Kartendaten: © ÖPNV'});

layerOpenSeaMap = new L.TileLayer(akt_protocol+"//t1.openseamap.org/seamark/{z}/{x}/{y}.png",{ 
    maxZoom: maxzoom_std,detectRetina: true, attribution: 'Karte: <a href="https://www.openseamap.org/index.php?id=imprint">openseamap.org</a>'});

layerOpenSnowMap = new L.TileLayer(akt_protocol+"//www.opensnowmap.org/pistes/{z}/{x}/{y}.png",{ 
    maxZoom: maxzoom_std,detectRetina: true, attribution: 'Karte: <a href="https://www.openstreetmap.org/copyright">Open Street Map - Mitwirkende</a>'});

layerWayMarketTrails = new L.TileLayer(akt_protocol+"//tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png",{ 
    maxZoom: maxzoom_std,detectRetina: true, attribution: 'Karte: <a href="https://hiking.waymarkedtrails.org/help/legal">waymarkedtrails.org</a>'});
layerWayMarketTrailsCycling = new L.TileLayer(akt_protocol+"//tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png",{ 
    maxZoom: maxzoom_std,detectRetina: true, attribution: 'Karte: <a href="https://hiking.waymarkedtrails.org/help/legal">waymarkedtrails.org</a>'});
layerWayMarketTrailsMtb = new L.TileLayer(akt_protocol+"//tile.waymarkedtrails.org/mtb/{z}/{x}/{y}.png",{ 
    maxZoom: maxzoom_std,detectRetina: true, attribution: 'Karte: <a href="https://hiking.waymarkedtrails.org/help/legal">waymarkedtrails.org</a>'});
layerWayMarketTrailsSkating = new L.TileLayer(akt_protocol+"//tile.waymarkedtrails.org/skating/{z}/{x}/{y}.png",{ 
    maxZoom: maxzoom_std,detectRetina: true, attribution: 'Karte: <a href="https://hiking.waymarkedtrails.org/help/legal">waymarkedtrails.org</a>'});
layerWayMarketTrailsSlopes = new L.TileLayer(akt_protocol+"//tile.waymarkedtrails.org/slopes/{z}/{x}/{y}.png",{ 
    maxZoom: maxzoom_std,detectRetina: true, attribution: 'Karte: <a href="https://hiking.waymarkedtrails.org/help/legal">waymarkedtrails.org</a>'});

//Geofabrik topo "http://a.tile.geofabrik.de/15173cf79060ee4a66573954f6017ab0/14/8574/5625.png"
layerGeofTopo = new L.TileLayer(akt_protocol+"//{s}.tile.geofabrik.de/15173cf79060ee4a66573954f6017ab0/{z}/{x}/{y}.png",{ 
    maxZoom: maxzoom_std,detectRetina: true, attribution: 'Kartendaten: © Geofabrik'});

//Hike and Bike
layerHikeBike = new L.TileLayer(akt_protocol+"//{s}.tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png",{
    maxZoom: maxzoom_std,detectRetina: true, attribution: 'Kartendaten: Kartendaten: © <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende, Hike and Bike'});

//Humanitarian
layerHumanitarian = new L.TileLayer(akt_protocol+"//{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",{
    maxZoom: maxzoom_std,detectRetina: true, attribution: 'Kartendaten: Kartendaten: © <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende'});

//Here-Maps (ehem. Nokia) https://www.here.com
var heremapsAttrib='Kartendaten: © <a href="https://www.here.com">Here-Maps';
var nokiaKey="?app_id=xWVIueSv6JL0aJ5xqTxb&app_code=djPZyynKsbTjIUDOBcHZ2g&lg=ger&ppi=72";
layerNokiaRoad = new L.TileLayer(akt_protocol+"//{s}.base.maps.api.here.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/256/png8" + nokiaKey,{
    maxZoom: maxzoom_std,detectRetina: true, subdomains: '1234', format: 'image/png', attribution: heremapsAttrib});
layerNokiaSat = new L.TileLayer(akt_protocol+"//{s}.aerial.maps.api.here.com/maptile/2.1/maptile/newest/satellite.day/{z}/{x}/{y}/256/png8" + nokiaKey,{
    maxZoom: maxzoom_g_sat,detectRetina: true, subdomains: '1234', format: 'image/png', attribution: heremapsAttrib});
layerNokiaHybrid = new L.TileLayer(akt_protocol+"//{s}.aerial.maps.api.here.com/maptile/2.1/maptile/newest/hybrid.day/{z}/{x}/{y}/256/png8" + nokiaKey,{
    maxZoom: maxzoom_g_sat,detectRetina: true, subdomains: '1234', format: 'image/png', attribution: heremapsAttrib});
layerNokiaLabel = new L.TileLayer(akt_protocol+"//{s}.base.maps.api.here.com/maptile/2.1/streettile/newest/normal.day/{z}/{x}/{y}/256/png8" + nokiaKey,{ 
maxZoom: maxzoom_std,detectRetina: true, subdomains: '1234', format: 'image/png', attribution: heremapsAttrib});
layerNokiaTerr = new L.TileLayer(akt_protocol+"//{s}.aerial.maps.api.here.com/maptile/2.1/maptile/newest/terrain.day/{z}/{x}/{y}/256/png8"+ nokiaKey,{
    maxZoom: maxzoom_std,detectRetina: true, subdomains: '1234', format: 'image/png', attribution: heremapsAttrib});
layerNokiaTrafic = new L.TileLayer(akt_protocol+"//{s}.traffic.maps.api.here.com/maptile/2.1/traffictile/newest/normal.day/{z}/{x}/{y}/256/png8" + nokiaKey,{ 
maxZoom: maxzoom_std,detectRetina: true, subdomains: '1234', format: 'image/png', attribution: heremapsAttrib});

//gibts nimmer
// lyerAdrOSMLyrk=akt_protocol+"//{s}.tiles.lyrk.org/ls/{z}/{x}/{y}?apikey=3949c1b430e64bbe98886bc44e4eb8e4";
// layerOSMLyrk = new L.TileLayer(lyerAdrOSMLyrk,{ 
// 	maxZoom: maxzoom_std,detectRetina: true, format: 'image/png', attribution: 'Karten: © LyrkGeodienste, Data © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'});
// layerOSMLyrkRetina = new L.TileLayer(akt_protocol+"//{s}.tiles.lyrk.org/lr/{z}/{x}/{y}?apikey=3949c1b430e64bbe98886bc44e4eb8e4",{ 
// 	maxZoom: maxzoom_std,detectRetina: true, format: 'image/png', attribution: 'Karten: © LyrkGeodienste, Data © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'});

//stemen watercolor
layerStamenWaterc = new L.TileLayer(akt_protocol+"//tile.stamen.com/watercolor/{z}/{x}/{y}.jpg",{ 
    maxZoom: maxzoom_std,detectRetina: true, format: 'image/jpg', attribution: 'Kartendaten: © Stamen'});

//Bergfex AMap Karte
// layerBergfexAmapUrl=akt_protocol+"//static{s}.bergfex.com/images/amap/{z}/{z}_{x}_{y}.png";
// layerBergfexAmapUrl_14=akt_protocol+"//static{s}.bergfex.com/images/amap/{z}/89/{z}_{x}_{y}.png";
// layerBergfexAmapUrl_14b=akt_protocol+"//static{s}.bergfex.com/images/amap/{z}/88/{z}_{x}_{y}.png";
// layerBergfexAmapUrl_15=akt_protocol+"//static{s}.bergfex.com/images/amap/{z}/178/{z}_{x}_{y}.png";
// var layerBergfexAmap = new L.TileLayer(layerBergfexAmapUrl,
// {maxZoom: maxzoom_amap+2, minZoom: minzoom_amap, maxNativeZoom: maxzoom_amap, bounds: boundsAUT, subdomains: '1234567', detectRetina: true, format: 'image/png', attribution: 'Kartendaten: © Map Data 2008, 2013 BEV, bergfex GmbH'});
// var layerBergfexAmap_14 = new L.TileLayer(layerBergfexAmapUrl_14,
// {maxZoom: maxzoom_amap+1, minZoom: maxzoom_amap+1, subdomains: '1234567', detectRetina: true, format: 'image/png', attribution: 'Kartendaten: © Map Data 2008, 2013 BEV, bergfex GmbH'});
// var layerBergfexAmap_14b = new L.TileLayer(layerBergfexAmapUrl_14b,
// {maxZoom: maxzoom_amap+1, minZoom: maxzoom_amap+1, subdomains: '1234567', detectRetina: true, format: 'image/png', attribution: 'Kartendaten: © Map Data 2008, 2013 BEV, bergfex GmbH'});
// var layerBergfexAmap_15 = new L.TileLayer(layerBergfexAmapUrl_15,
// {maxZoom: maxzoom_amap+2, minZoom: maxzoom_amap+2, subdomains: '1234567', detectRetina: true, format: 'image/png', attribution: 'Kartendaten: © Map Data 2008, 2013 BEV, bergfex GmbH'});
// var layerBergfexAmapGrp=L.layerGroup([layerBergfexAmap,layerBergfexAmap_14,layerBergfexAmap_14b,layerBergfexAmap_15],{bounds: boundsAUT});

//Bergfex ÖK Karte
var layerBergfexOek = new L.TileLayer(akt_protocol+"//maps.bergfex.at/oek/standard/{z}/{x}/{y}.jpg",
{maxZoom: maxzoom_topo+1, maxNativeZoom: maxzoom_topo, bounds: boundsAUT, detectRetina: true, format: 'image/jpg', attribution: 'Kartendaten: © Map Data 2008, 2013 BEV, bergfex GmbH'});
var layerBergfexOsm = new L.TileLayer(akt_protocol+"//maps.bergfex.at/osm/standard/{z}/{x}/{y}.jpg",
{maxZoom: maxzoom_topo+1, maxNativeZoom: maxzoom_topo, detectRetina: true, format: 'image/jpg', attribution: 'Kartendaten: © Map Data <a href="openpistemap.org">Openstreemap</a>, bergfex GmbH'}); //bounds: boundsAUT, 

//tomtom
var layerTomtomUrl="https://{s}.api.tomtom.com/lbs/map/3/basic/1/{z}/{x}/{y}.png?key=26m229t628ghqqdu5t27xjzf";
var layerTomtom = new L.TileLayer(layerTomtomUrl,
{maxZoom: maxzoom_osm, detectRetina: true, subdomains: 'abcd', format: 'image/png', attribution: 'Kartendaten: © Tomtom'});

//OpenStreetBrowser
var layerOpenStreetBrowserUrl = akt_protocol+"//tiles-base.openstreetbrowser.org/tiles/basemap_base/{z}/{x}/{y}.png";
var layerOpenStreetBrowser = new L.TileLayer(layerOpenStreetBrowserUrl,{maxZoom: maxzoom_osm,detectRetina: true, attribution: 'Kartendaten: © <a href="http://www.openstreetbrowser.org">OpenStreetBrowser</a>'});

//Mapsurfer
var layerMapSurferHillOvl = new L.TileLayer(akt_protocol+"//korona.geog.uni-heidelberg.de/tiles/asterh/x={x}&y={y}&z={z}",{maxZoom: maxzoom_osm,detectRetina: true, transparent: true, attribution: 'Kartendaten: © <a href="http://mapsurfernet.com/">Mapsurfer</a>'});
var layerMapSurferAdminOvl = new L.TileLayer(akt_protocol+"//korona.geog.uni-heidelberg.de/tiles/adminb/x={x}&y={y}&z={z}",{maxZoom: maxzoom_osm,detectRetina: true, transparent: true, attribution: 'Kartendaten: © <a href="http://mapsurfernet.com/">Mapsurfer</a>'});
var layerAdrMapSurferOvl=akt_protocol+"//korona.geog.uni-heidelberg.de/tiles/hybrid/x={x}&y={y}&z={z}"
var layerMapSurferOvl = new L.TileLayer(layerAdrMapSurferOvl,{maxZoom: maxzoom_osm,detectRetina: true, transparent: true, attribution: 'Kartendaten: © <a href="http://mapsurfernet.com/">Mapsurfer</a>'});

//Map-Box
//var layerAdrMapbox = "https://{s}.tiles.mapbox.com/v3/examples.map-i86l3621/{z}/{x}/{y}.png";
//var layerMapBox = new L.TileLayer(layerAdrMapbox,{maxZoom: maxzoom_osm,detectRetina: true, attribution: 'Kartendaten: © <a href="http://mapbox.com/">Mapbox</a>'});
var layerAdrMapboxStreets = akt_protocol+"//{s}.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGF0aWFuYSIsImEiOiJjaW9nNWdjb3QwMWZ3dGJrbXkxZXJxMWl2In0.3zTvo9rLv02xq-a15-odxg"
var layerMapBoxStreets = new L.TileLayer(layerAdrMapboxStreets,{maxZoom: maxzoom_osm,detectRetina: true, attribution: 'Kartendaten: © <a href="http://mapbox.com/">Mapbox</a>'});
var layerMapBoxStreetsBas = new L.TileLayer(akt_protocol+"//{s}.tiles.mapbox.com/v4/mapbox.streets-basic/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGF0aWFuYSIsImEiOiJjaW9nNWdjb3QwMWZ3dGJrbXkxZXJxMWl2In0.3zTvo9rLv02xq-a15-odxg",{maxZoom: maxzoom_osm,detectRetina: true, attribution: 'Kartendaten: © <a href="http://mapbox.com/">Mapbox</a>'});
var layerMapBoxStreetsWheat = new L.TileLayer(akt_protocol+"//{s}.tiles.mapbox.com/v4/mapbox.wheatpaste/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGF0aWFuYSIsImEiOiJjaW9nNWdjb3QwMWZ3dGJrbXkxZXJxMWl2In0.3zTvo9rLv02xq-a15-odxg",{maxZoom: maxzoom_osm,detectRetina: true, attribution: 'Kartendaten: © <a href="http://mapbox.com/">Mapbox</a>'});
var layerAdrMapboxCtry="https://{s}.tiles.mapbox.com/v3/aj.geography-class-2/{z}/{x}/{y}.png";
var layerMapBoxCtry = new L.TileLayer(layerAdrMapboxCtry,{maxZoom: maxzoom_mapboxctry+3, maxNativeZoom: maxzoom_mapboxctry,detectRetina: true, attribution: 'Kartendaten: © <a href="http://mapbox.com/">Mapbox</a>'});
//https://a.tiles.mapbox.com/v4/mapbox.streets-satellite/7/34/54.png?access_token=pk.eyJ1IjoidGF0aWFuYSIsImEiOiJjaW9nNWdjb3QwMWZ3dGJrbXkxZXJxMWl2In0.3zTvo9rLv02xq-a15-odxg
var layerAdrMapboxSat = "https://{s}.tiles.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGF0aWFuYSIsImEiOiJjaW9nNWdjb3QwMWZ3dGJrbXkxZXJxMWl2In0.3zTvo9rLv02xq-a15-odxg"
var layerMapBoxSat = new L.TileLayer(layerAdrMapboxSat,{maxZoom: maxzoom_g_sat,detectRetina: true, attribution: 'Kartendaten: © <a href="http://mapbox.com/">Mapbox</a>'});
var layerAdrMapboxHybr = "https://{s}.tiles.mapbox.com/v4/mapbox.streets-satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGF0aWFuYSIsImEiOiJjaW9nNWdjb3QwMWZ3dGJrbXkxZXJxMWl2In0.3zTvo9rLv02xq-a15-odxg"
var layerMapBoxHybr = new L.TileLayer(layerAdrMapboxHybr,{maxZoom: maxzoom_g_sat,detectRetina: true, attribution: 'Kartendaten: © <a href="http://mapbox.com/">Mapbox</a>'});
var layerMapBoxPirate = new L.TileLayer("https://{s}.tiles.mapbox.com/v3/aj.Sketchy2/{z}/{x}/{y}.png",{maxZoom: maxzoom_6,detectRetina: true, attribution: 'Kartendaten: © <a href="http://mapbox.com/">Mapbox</a>'});
var layerMapBoxBlm8bit = new L.TileLayer("https://{s}.tiles.mapbox.com/v3/colemanm.blue-marble-8bit/{z}/{x}/{y}.png",{maxZoom: maxzoom_5,detectRetina: true, attribution: 'Kartendaten: © <a href="http://mapbox.com/">Mapbox</a>'});
var layerMapBoxPopFire = new L.TileLayer("https://{s}.tiles.mapbox.com/v3/aj.population-fire/{z}/{x}/{y}.png",{maxZoom: maxzoom_6,detectRetina: true, attribution: 'Kartendaten: © <a href="http://mapbox.com/">Mapbox</a>'});
var layerMapBoxPir2 = new L.TileLayer("https://{s}.tiles.mapbox.com/v3/lrqdo.me2bng9n/{z}/{x}/{y}.png",{maxZoom: maxzoom_19,detectRetina: true, attribution: 'Kartendaten: © <a href="http://mapbox.com/">Mapbox</a>'});

//var layerMapBoxDataUpd = new L.TileLayer("https://{s}.tiles.mapbox.com/v4/aaronlidman.4aae1384/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImdQMzI4WjgifQ.d-Uyr7NBjrJVz9z82uk5Xg",{maxZoom: maxzoom_19,detectRetina: true, attribution: 'Kartendaten: © <a href="http://mapbox.com/">Mapbox</a>'});

var layerMapBoxEmerald = new L.TileLayer(akt_protocol+"//{s}.tiles.mapbox.com/v4/mapbox.emerald/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGF0aWFuYSIsImEiOiJjaW9nNWdjb3QwMWZ3dGJrbXkxZXJxMWl2In0.3zTvo9rLv02xq-a15-odxg",{maxZoom: maxzoom_19,detectRetina: true, attribution: 'Kartendaten: © <a href="http://mapbox.com/">Mapbox</a>'});
var layerMapBoxComic = new L.TileLayer(akt_protocol+"//{s}.tiles.mapbox.com/v4/mapbox.comic/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGF0aWFuYSIsImEiOiJjaW9nNWdjb3QwMWZ3dGJrbXkxZXJxMWl2In0.3zTvo9rLv02xq-a15-odxg",{maxZoom: maxzoom_19,detectRetina: true, attribution: 'Kartendaten: © <a href="http://mapbox.com/">Mapbox</a>'});
var layerMapBoxRunBikeHike = new L.TileLayer(akt_protocol+"//{s}.tiles.mapbox.com/v4/mapbox.run-bike-hike/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGF0aWFuYSIsImEiOiJjaW9nNWdjb3QwMWZ3dGJrbXkxZXJxMWl2In0.3zTvo9rLv02xq-a15-odxg",{maxZoom: maxzoom_19,detectRetina: true, attribution: 'Kartendaten: © <a href="http://mapbox.com/">Mapbox</a>'});
var layerMapBoxOutdoor = new L.TileLayer(akt_protocol+"//{s}.tiles.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGF0aWFuYSIsImEiOiJjaW9nNWdjb3QwMWZ3dGJrbXkxZXJxMWl2In0.3zTvo9rLv02xq-a15-odxg",{maxZoom: maxzoom_19,detectRetina: true, attribution: 'Kartendaten: © <a href="http://mapbox.com/">Mapbox</a>'});
//National Geographic World Map
var layerAdrNatGeoWorld = akt_protocol+"//services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}/";
var layerNatGeoWorld = new L.TileLayer(layerAdrNatGeoWorld,{maxZoom: maxzoom_natgeo+1, maxNativeZoom: maxzoom_natgeo,detectRetina: true, attribution: 'Kartendaten: © <a href="http://www.nationalgeographic.com">Nationalgeographic</a>'});

//Harvard World Country Borders
var layerHarvWld = new L.TileLayer.WMS(akt_protocol+"//worldmap.harvard.edu/geoserver/wms",
        {maxZoom: maxzoom_std,layers: 'geonode:Digital_Chart_of_the_World',format: 'image/png',transparent: true,attribution: 'Kartendaten: © <a href="http://worldmap.harvard.edu">Harvard Worldmap</a>'});

//Open Map Tiles
var layerOpenTileMapOsmBright = new L.TileLayer(akt_protocol+"//maps.tilehosting.com/styles/bright/{z}/{x}/{y}.png?key=hWWfWrAiWGtv68r8wA6D",{maxZoom: maxzoom_19,detectRetina: true, attribution: 'Kartendaten: © <a href="https://openmaptiles.org/">OpenMapTiles</a>'});
var layerOpenTileMapOsmTopo = new L.TileLayer(akt_protocol+"//maps.tilehosting.com/styles/topo/{z}/{x}/{y}.png?key=hWWfWrAiWGtv68r8wA6D",{maxZoom: maxzoom_19,detectRetina: true, attribution: 'Kartendaten: © <a href="https://openmaptiles.org/">OpenMapTiles</a>'});

//Neuseeland LINZ-Dataservice
// var layerLinzNzTopo250 = new L.TileLayer("https://tiles-a.data-cdn.linz.govt.nz/services;key=9fccd3c148c24bf1b11cbadfcb3d9d89/tiles/v4/layer=798,style=auto/{z}/{x}/{y}.png",{maxZoom: 12, minZoom: 9, detectRetina: true, attribution: 'Kartendaten: © <a href="https://data.linz.govt.nz/">Land Information New Zealand</a>'})
// var layerLinzNzTopo50 = new L.TileLayer("https://tiles-a.data-cdn.linz.govt.nz/services;key=a23e7b655e11475788582b1c230cb0ac/tiles/v4/layer=767,style=auto//{z}/{x}/{y}.png",{maxZoom: 15, minZoom: 13, detectRetina: true, attribution: 'Kartendaten: © <a href="https://data.linz.govt.nz/">Land Information New Zealand</a>'})
// var layerMapBoxStreets2 = new L.TileLayer(layerAdrMapboxStreets,{maxZoom: 8,detectRetina: true, attribution: 'Kartendaten: © <a href=akt_protocol+"//mapbox.com/">Mapbox</a>'});
// var layerGrpLinzNz = L.layerGroup().addLayer(layerMapBoxStreets2).addLayer(layerLinzNzTopo250).addLayer(layerLinzNzTopo50);

//
//layerOpenTopoMLandsat=new L.TileLayer(akt_protocol+"//irs.gis-lab.info/?layers=landsat&request=GetTile&z={z}&x={x}&y={y}",{maxZoom: 15, maxNativeZoom: maxzoom_14, detectRetina: true, attribution: 'Kartendaten: Kartendaten: © <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende, SRTM | Kartendarstellung: © <a href="http://opentopomap.org">OpenTopoMap</a>'})

layerEcmapsOsmWinter=new L.TileLayer(akt_protocol+"//ec{s}.cdn.ecmaps.de/WmsGateway.ashx.jpg?ZoomLevel={z}&TileX={x}&TileY={y}&Experience=ecmaps&MapStyle=Winter OSM",{maxZoom: 18, maxNativeZoom: 17, subdomains: '0123', detectRetina: true, attribution: 'Kartendaten: © ecmaps.de'})

layerEcmapsOsmSummer=new L.TileLayer(akt_protocol+"//ec{s}.cdn.ecmaps.de/WmsGateway.ashx.jpg?ZoomLevel={z}&TileX={x}&TileY={y}&Experience=ecmaps&MapStyle=Summer OSM",{maxZoom: 17, maxNativeZoom: 16, subdomains: '0123', detectRetina: true, attribution: 'Kartendaten: © ecmaps.de'})

layerMapsForFreeRelief=new L.TileLayer("https://maps-for-free.com/layer/relief/z{z}/row{y}/{z}_{x}-{y}.jpg",{maxZoom: 14,maxNativeZoom: maxzoom_11, detectRetina: true, attribution: 'Kartendaten: Kartendaten: © <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende, SRTM | Kartendarstellung: © a< href="https://maps-for-free.com/">Maps For Free</a>'})

//dianacht.de - Gradgitter
//var layerUtm3233Grid = new L.tileLayer.wms("https://wms.dianacht.de/cgi-bin2/mapserv6", {
//	layers: 'utmz32,utmz33',
//	format: 'image/png',
//	style: '',
//	transparent: true,
//	attribution: 'Kartendaten: <a href="http://vermessung.bayern.de/">Bayerische Vermessungsverwaltung</a>'
//});



//lokale tiles
/*		var layerBasemapLocal = new L.TileLayer("tilecache-bs/{z}/{y}/{x}.png",
{maxZoom: maxzoom_19, bounds: boundsAUT, format: 'image/png', attribution: 'Kartendaten: © <a href=akt_protocol+"//www.basemap.at">Basemap.at</a> (lokale Tiles)'});
var layerBasemapAltLocal = new L.TileLayer("tilecache-bs-alt/{z}/{y}/{x}.png",
{maxZoom: maxzoom_19, bounds: boundsAUT, format: 'image/png', attribution: 'Kartendaten: © <a href=akt_protocol+"//www.basemap.at">Basemap.at</a> (lokale Tiles)'});
var layerBasemapOrthoLocal = new L.TileLayer("tilecache-bs-ortho/{z}/{y}/{x}.jpeg",
{maxZoom: maxzoom_19, bounds: boundsAUT, format: 'image/png', attribution: 'Kartendaten: © <a href=akt_protocol+"//www.basemap.at">Basemap.at</a> (lokale Tiles)'});
var layerBasemapOrthoSpfldLocal = new L.TileLayer("tilecache-bs-ortho-spfld/{z}/{y}/{x}.jpeg",
{maxZoom: maxzoom_19, bounds: boundsAUT, format: 'image/png', attribution: 'Kartendaten: © <a href=akt_protocol+"//www.basemap.at">Basemap.at</a> (lokale Tiles)'});
var layerBasemapOvlLocal = new L.TileLayer("tilecache-bs-ovl/{z}/{y}/{x}.png",
{maxZoom: maxzoom_19, transparent: true, bounds: boundsAUT, format: 'image/png', attribution: 'Kartendaten: © <a href="http://www.basemap.at">Basemap.at</a> (lokale Tiles)'});

var layerGrpBmAlt = L.layerGroup().addLayer(layerBasemapLocal).addLayer(layerBasemapAltLocal);
var layerGrpBmOrtho = L.layerGroup().addLayer(layerBasemapOrthoLocal).addLayer(layerBasemapOrthoSpfldLocal);
*/
//Viennagis - WMS map
var layerWienBaust = new L.tileLayer.wms(akt_protocol+"//data.wien.gv.at/daten/geo", {
    layers: 'ogdwien:BAUSTELLENLINOGD,ogdwien:BAUSTELLENPKTOGD',
    format: 'image/png',
    style: 'BAUSTELLENPKTOGD',
    transparent: true,
    attribution: 'Kartendaten: <a href="http://www.wien.gv.at">Wiener Stadtverwaltung</a>'
});
//		var layerCountries = new L.KML("collins-Laender_pol.kml", {async: true});
//		var layerYandex = new L.TileLayer("https://vec0{s}.maps.yandex.net/tiles?l=map&v=4.49.1&x={x}&y={y}&z={z}&scale=1&lang=en_US",
//				{maxZoom: maxzoom_19,subdomains: '1234',detectRetina: true, attribution: 'Kartendaten: © <a href="http://yandex.com/">Yandex</a>'});




// Koord.grid
var grid = L.grid({redraw: 'moveend'});

//Layer-Switcher
baseMaps = [
    {groupName : "Open Streetmap",
        expanded : true,
        layers    : {
            //"OpenStreetMap Mapsurfer": layerMapSurfer,
            "OpenStreetMap Standard": layerOSMStd,
            "Openstreetmap Humanitarian": layerHumanitarian,
            "OpenStreetMap Deutschland": layerOSMStdDe,
            //"Wikimedia Maps": layerWikiMedia,
            //"Mapbox Streets Basic": layerMapBoxStreetsBas,
            //"Mapbox Emerald": layerMapBoxEmerald,
            //"Ecmaps OSM Summer": layerEcmapsOsmSummer,
            //"Ecmaps OSM Winter":layerEcmapsOsmWinter,
            "WebAtlas.no": layerWebAtlNo,
            //"Open Map Tiles OSM Bright":layerOpenTileMapOsmBright,
        }
    },
    {groupName : "Standard Karten",
        expanded : false,
        layers    : {
            "Basemap.at Grundkarte": layerGrpBasemVd,
            "Google Standard (alternativ)": layerGoogleStd,
            "Google Standard": g_roadmap,
            "Here-Maps Standard": layerNokiaRoad,
            "Here-Maps Verkehr": layerNokiaTrafic,
            "Bing Standard":  bing_road,
            "Apple Standard": layerAppleStd,
            //"Tomtom Standard": layerTomtom,
            "Esri Streetmap": layerEsriStreet,
            "National Geographic Countries": layerNatGeoWorld,
            "Mapbox Political":layerMapBoxCtry,
        }
    },
    {groupName : "Topographische",
        expanded : false,
        layers    : {
            "OpenStreetMap (Bergfex)": layerBergfexOsm,
            "ÖsterrreichKarte (Bergfex)":layerBergfexOek,
            // "AustriaMap (Bergfex)": layerBergfexAmapGrp,
            "OpenTopoMap": layerOpenTopo,
            //"Mapbox Topo": layerMapBoxStreets,
            "Geofabrik Topo": layerGeofTopo,
            "OpenStreetMap Landscape": layerOSMLands,
            "Esri Topo Map": layerEsriTopo,
            "Here-Maps Terrain": layerNokiaTerr,
            "Google Terrain":  layerGoogleTer,
            "Maps For Free Relief":layerMapsForFreeRelief,
            //"Open Tile Maps OSM Topo": layerOpenTileMapOsmTopo,
            // "Land Information New Zealand Topo":layerGrpLinzNz,
        }
    },
    {groupName : "Transport und Outdoor",
        expanded : false,
        layers    : {
            "ÖPNV Verkehrskarte": layerÖPNV,
            "Thunderforest Transport":layerOSMTransp,
            "Mapbox Outdoor": layerMapBoxOutdoor,
            "Mapbox Run, Hike, Bike": layerMapBoxRunBikeHike,
            "OpenStreetMap Outdoors": layerOSMOutd,
            "OpenStreetMap Cycle": layerOSMCycle,
            "OpenStreetMap Hike and Bike": layerHikeBike,
    }
    },
    {groupName : "Lustige und Diverse",
        expanded : false,
        layers    : {
            "Esri light gray": layerEsriGray,
            //"Apple (alternativ)": layerAppleStdAlt,
            "Stamen Watercolor": layerStamenWaterc,
            "Mapbox Pirate Map": layerMapBoxPirate,
            //"Mapbox Pirate Map 2": layerMapBoxPir2,
            //"Mapbox Comic": layerMapBoxComic,
            //"Mapbox Wheatpaste": layerMapBoxStreetsWheat,
            "Mapbox Bluemarbel 8 bit": layerMapBoxBlm8bit,
            "Mapbox Populationfire": layerMapBoxPopFire,
            //"Mapbox Data-Updates": layerMapBoxDataUpd,
    }
    },
    {groupName : "Satellit",
        expanded : false,
        layers    : {
            "Google Satellit (alternativ)":  layerGoogleSat,
            "Google Satellit":  g_satellite,
            "Here-Maps Satellit": layerNokiaSat,
            "Bing Satellit":  bing_areal,
            "Apple Satellit": layerAppleSat,
            "Mapbox Satellit":layerMapBoxSat,
            "Esri Satellit": layerEsriWldImg,
            "Basemap Orthofoto": layerBasemOrtho,
            //"OpenTopomap Landsat":layerOpenTopoMLandsat,
        }
    },
    {groupName : "Satellit (Hybrid)",
        expanded : false,
        layers    : {
            "Google Hybrid (alternativ)": layerGoogleHyb,
            "Google Hybrid": g_hybrid,
            "Here-Maps Hybrid": layerNokiaHybrid,
            "Bing Hybrid":  bing_areal_label,
            //"Mapbox Hybrid":layerMapBoxHybr,
        }
    },
/*
    {groupName : "Lokale Karten",
        expanded : false,
        layers    : {
            "Basemap (lokal)":layerGrpBmAlt,
            "Basemap Luftbild (lokal)":layerGrpBmOrtho,
        }
    }
*/
]
var overlayMaps = [
        {groupName : "Beschriftungen",
            expanded : false,
            layers    : {
                //"Mapsurfer Beschriftungen": layerMapSurferOvl,
                "OSM Beschriftungen": layerOSMOvl,
                "Google Beschriftungen": layerGoogleLbl,
                "Nokia Heremaps Beschriftungen":layerNokiaLabel,
                //"Apple Beschriftungen": layerAppleOverlay,
                "Basemap Beschriftungen": layerBasemOvl,
                //"Basemap Beschriftung (lokal)":layerBasemapOvlLocal,
            }
        },
    {groupName : "Diverse Overlays",
        expanded : false,
        layers    : {
            //"Mapsurfer Administrative Grenzen": layerMapSurferAdminOvl,
            //"Harvard Internationale Grenzen":layerHarvWld,
            "Mapsurfer Hillshade": layerMapSurferHillOvl,
            "Open Railway Map": layerORailw,
            "Open Sea Map": layerOpenSeaMap,
            "Open Snow Map": layerOpenSnowMap,
            "Open Flight Map": layerOpFlightMap,
            "Way Market Trails Hiking": layerWayMarketTrails,
            "Way Market Trails Cycling": layerWayMarketTrailsCycling,
            "Way Market Trails MTB": layerWayMarketTrailsMtb,
            "Way Market Trails Skating": layerWayMarketTrailsSkating,
            "Way Market Trails Slopes": layerWayMarketTrailsSlopes,
            "Wien, Baustellen":layerWienBaust,
            "Gradnetz": grid,
            //"UTM 32 & 33 Grid":layerUtm3233Grid,
        }
    }

]
var options = {
        //container_width 	: "220px",
        group_maxHeight     : "400px",
        container_maxHeight : "650px", 
        exclusive       	: true
};

//Map with controls
map = new L.Map('map',{minZoom: 1});
map.attributionControl.setPrefix(false);
map.dragging.enable();
map.touchZoom.enable();
map.doubleClickZoom.enable();
map.scrollWheelZoom.enable();
map.addControl( new L.Control.Search({
    url: 'https://nominatim.openstreetmap.org/search?format=json&accept-language=de-DE&q={s}',
    jsonpParam: 'json_callback', propertyName: 'display_name', propertyLoc: ['lat','lon'],
    markerLocation: true, autoType: true, autoCollapse: true, minLength: 2,zoom: 13,
    text: 'Suchen...', textCancel: 'Abbrechen', textErr: 'Kein Ergebnis gefunden!'}) );
L.control.locate({
    follow: true,
    title: "Position bestimmen",
    popupText: ["Sie befinden sich innerhalb "," von diesem Punkt"]
}).addTo(map);


if(window.location.hash) {
    document.cookie="permahash="+window.location.hash.substr(1);
    permahash=true;
}
set_view();

map.addControl(new L.Control.Scale({width: 250, position: 'bottomleft', imperial: false}));
L.control.marker().addTo(map);
map.addControl(L.control.measure());
L.control.coordinates({
    position:"bottomleft",
    decimals:4,
    decimalSeperator:",",
    labelTemplateLat:"Breite: {y} ",
    labelTemplateLng:"Länge: {x} ",
    useDMS:false,
//			useLatLngOrder:true
}).addTo(map);
mCoordCtr = L.control.mouseCoordinate({gps:false, utm:true,utmref:true, position: 'bottomleft'});
//mCoordCtr.addTo(map);

var layersControl = L.Control.styledLayerControl(baseMaps, overlayMaps, options);
map.addControl(layersControl);

var miniMapLayer = new L.TileLayer(layerAdrOSMStd, {minZoom: 0, maxZoom: 14, //subdomains: '1234', 
attribution: 'Kartendaten: © <a href=akt_protocol+"//korona.geog.uni-heidelberg.de/">Mapsurfer</a>' });
var miniMap = new L.Control.MiniMap(miniMapLayer, { toggleDisplay: true, zoomLevelOffset: -7 }).addTo(map);
var style = {color:'blue', opacity: 1.0, fillOpacity: 1.0, weight: 3, clickable: false};
L.Control.FileLayerLoad.LABEL = '<i class="fa fa-folder-open" style="line-height: 1.5"></i>';
L.Control.fileLayerLoad({
    fitBounds: true,
    layerOptions: {style: style,
                    pointToLayer: function (data, latlng) {
                        return L.circleMarker(latlng, {style: style});
                    }},
}).addTo(map);

w3wCtrl = new L.Control.w3w();
// w3wCtrl.addTo(map);
// map.on('click', function(e) {
// 	console.log(e);
// 	w3wCtrl.setCoordinates(e);
// });

map.on('moveend', function(e) {
    lock=true;
    set_hash();
});

map.on('baselayerchange', function(e) {
    if((e.name=="National Geographic Countries") && (map.getZoom()>maxzoom_natgeo)){
        map.setZoom(maxzoom_natgeo);
    }
    else if((e.name=="Mapbox Political") && (map.getZoom()>maxzoom_mapboxctry)){
        map.setZoom(maxzoom_mapboxctry);
    }
    else if((e.name=="Mapbox Pirate Map") && (map.getZoom()>maxzoom_6)){
        map.setZoom(maxzoom_6);
    }
    else if((e.name=="Mapbox Bluemarbel 8 bit") && (map.getZoom()>maxzoom_5)){
        map.setZoom(maxzoom_5);
    }
    else if((e.name=="Mapbox Populationfire") && (map.getZoom()>maxzoom_6)){
        map.setZoom(maxzoom_6);
    }
    else if(((e.name=="OpenTopoMap")||(e.name=="Google Terrain"))&&(map.getZoom()>maxzoom_topo)) {
        map.setZoom(maxzoom_topo);
    }
    else if(e.name=="AustriaMap (Bergfex)"){
        if (map.getZoom()>maxzoom_amap+1) {
            map.setZoom(maxzoom_amap);
        }
        else if(map.getZoom()<minzoom_amap) {
            map.setZoom(minzoom_amap);
        }
    }
    else if(!((e.name=="Google Satellit")||(e.name=="Google Hybrid")||(e.name=="Google Hybrid (alternativ)")||(e.name=="Google Satellit (alternativ)"))&&(map.getZoom()>maxzoom_std)){
        map.setZoom(maxzoom_std);
    }
    //console.log(e.maxZoom);
    //console.log(e.name);

    aktLayer= e.name;
    set_hash();
    fixFavIcon();
});
