/**
 * User: vikashdat
 * Date: 7/17/13
 * Time: 10:20 PM
 */

/*
  On DOM load handlers
 */
var map_popups = [];
var map_popups_currently_active = [];
var map_count = 0;
var last_map_popup_loaded = null;
var open_tooltips = [];
var map_popups_currently_active_features = [];
var reshow_previous_layer = null;
var mainLayer = null;
var WINNINGS_LAYER = null;
var SPENDINGS_LAYER = null;
var MY_MAP = null;
var PLAYER_LAYER = null;
var RETAILER_LAYER = null;
var MARKER_LAYER = null;
var SCREEN_HEIGHT = null;
var CURRENT_LAYER = null;
var VIEW_ALL_SCHOOLS_IS_OPEN = false;
var MY_SELECTED_BOROUGHS = [];
RELATIVE_URL = '';  //for development leave this blank. For production it should be '/citydigits'

/*
  This function is called when the page DOM has loaded. It enables 'back' button, sets up the map
  and map popups.
 */
$().ready(new function(){

    // add a hash to the URL when the user clicks on a tab
  $('a[data-toggle="tab"]').on('click', function(e) {
    history.pushState(null, null, $(this).attr('href'));
  });
  // navigate to a tab when the history changes
  window.addEventListener("popstate", function(e) {
    var activeTab = $('[href=' + location.hash + ']');
    if (activeTab.length) {
      activeTab.tab('show');
    } else {
      $('.nav-tabs a:first').tab('show');
    }
  });

    //get screen measurements
    SCREEN_HEIGHT =  $(window).height();
    var myMap = new CityDigitsMap();
    myMap.resizeMap();
    myMap.loadLayers();
    console.log("STARTING LOAD OF MARKERS: " + Date.now());
    myMap.loadMarkers();
    console.log("ENDING LOAD OF MARKERS: " + Date.now());
    mainLayer = myMap.neighborhoodLayer;
    MY_MAP = myMap;

    //mav nav
    map_popups.push($("#map-popup-1"));
    map_popups.push($("#map-popup-2"));

    $(".tab-content").height=$(window).height();
//    loadInterviews();
});

/*
  This function shows the map popups. It uses a counter to determine which popup to load (there are 2).
  It does a check to determine if a neighborhood is already displayed to verify the same neighborhood is not displayed
  twice. It then loads the respective popup for the currently active layer and binds the needed
  events to the respective popups.
 */
function showMapPopUp(ev,feature){
    var idx= null;
    //get which layer is active
    var activeLayer = $(".map-ui li.active").attr("id");

    var map_id = activeLayer+"-"+feature.properties.N_Name;

    //check if already displayed
    if($.inArray(map_id, map_popups_currently_active)>=0){
        return 0;
    }else{
        //pass properties to webservice to construct popup
        //determine which popup is currently shown
        if (map_count % 2 == 0){
            idx = 0;
        }else{
            idx=1;
        }
        map_count = map_count + 1;
        //load into [0]
        url = getPopupUrlFrom(activeLayer,feature);
        console.log("ulr: " + url);
        map_popups_currently_active.push(map_id);
        map_popups_currently_active_features[idx]= feature;

        //determine which graph to load based on active layer
        switch(activeLayer){
            case "PERCENT_INCOME":
                map_popups[idx].load(url, function(){
                drawPercentIncomeGraph(idx +1,feature.properties.PERINC10,feature.properties.Daily_Inco);
            });
                break;
            case "MEDIAN_INCOME":
                map_popups[idx].load(url, function(){
                drawPercentIncomeGraph(idx +1,feature.properties.PERINC10,feature.properties.Daily_Inco);
            });
                break;
            case "AVG_WIN":
                map_popups[idx].load(url, function(){
                drawNetGainLossGraph(idx +1,feature.properties.Daily_Win,feature.properties.Daily_Sale, feature.properties.Net_Win);
            });
                break;
            case "AVG_SPEND":
                map_popups[idx].load(url, function(){
                drawNetGainLossGraph(idx +1,feature.properties.Daily_Win,feature.properties.Daily_Sale, feature.properties.Net_Win);
            });
                break;
            case "NET_GAIN_LOSS":
                map_popups[idx].load(url, function(){
                drawNetGainLossGraph(idx +1,feature.properties.Daily_Win,feature.properties.Daily_Sale, feature.properties.Net_Win);
            });
                break;
            }

        //show popup
        map_popups[idx].show();
        //unbind previous click events
        map_popups[idx].unbind("click");

        //bind click event for close icon
        map_popups[idx].on("click","button.div-close",function(event){
            console.log("got click event");
            var myName = map_popups[idx].find("#map-popup-header p").text();
            map_popups[idx].innerHTML="";
            map_popups[idx].hide();
            map_popups_currently_active.shift();
            console.log(map_popups_currently_active_features);
            map_popups_currently_active_features[idx] = null;

            //get index of current feature
            console.log(MY_SELECTED_BOROUGHS);
            var bLen = MY_SELECTED_BOROUGHS.length;
            var bIdx = 0;
            for(var i=0; i < bLen; i++){
                console.log(myName + " = " + MY_SELECTED_BOROUGHS[i].N_NAME);
                if(myName==MY_SELECTED_BOROUGHS[i].N_NAME){
                    console.log("found!");
                    bIdx = i;
                }
            }
            console.log(MY_SELECTED_BOROUGHS);
            console.log(bIdx);
             var event1 = MY_SELECTED_BOROUGHS[bIdx];
            var resetLayer = event1.originalLayer;
            resetLayer.resetStyle(event1);
            MY_SELECTED_BOROUGHS.splice(bIdx,1);
            if(idx==0){
                MY_MAP.map.removeLayer(MY_MAP.popup2);
            }else{
                MY_MAP.map.removeLayer(MY_MAP.popup3);
                map_count = map_count - 1;
            }
        });

        //unbind click event for explaination button
       map_popups[idx].off("click","#math_explain");

        //bind click event for explaination button
       map_popups[idx].on("click", "#math_explain", function (ev) {
            console.log("click for math explain");
        ev.preventDefault(); // prevent navigation

        var url = RELATIVE_URL + $(this).data("form"); //get the form url
        $("#mapPopupModal").load(url,function() { // load the url into the modal
                $(this).modal('show').css({
                     width: '90%',
                     'max-width':'90%',
                      height:'100%',
                        'max-height':'85%',
                        'top':'30px',
                     'background-color':'#00c9c8',
                      'margin-left': function () {
                return window.pageXOffset-($(this).width() / 2);
            }
        }); // display the modal on url load
       });

           //bind shown event
        $("#mapPopupModal").on("shown",function(){
            drawPercentIncomeGraphForExplain($("#median_income_value").val());
            $("#mapPopupModal").unbind("shown");
        });
        $("#mapPopupModal").on("hidden",function(){
            $("#mapPopupModal").empty();
            $("#mapPopupModal").unbind("shown");
            $("#mapPopupModal").unbind("hidden");

        });
        return false;
    });

    //add click event for explaination
    map_popups[idx].on("click", "#not_all_equal", function (ev) {
        ev.preventDefault(); // prevent navigation

        var url = RELATIVE_URL + $(this).data("form"); //get the form url
        $("#mapPopupModal").load(url,function() { // load the url into the modal
                $(this).modal('show').css({
                     width: '90%',
                     'max-width':'90%',
                      height:'100%',
                        'max-height':'85%',
                        'top':'30px',
                      'margin-left': function () {
                return window.pageXOffset-($(this).width() / 2);
            },
                    'background-color':'#9518ed'
        }); // display the modal on url load
       });


        $("#mapPopupModal").on("shown",function(){
            $(".not-equal-rollover").on("mouseover",function(e){
        var content = "<div id='img-tooltip'><img src='/static/img/dollar.png'> = $100<br><img src='/static/img/smiley.png'> = 100 people</div>";
       $(this).tooltip({html:true,title:content,background:'#ffffff'});
    });
        });
        $("#mapPopupModal").on("hidden",function(){
            $("#mapPopupModal").empty();
            $("#mapPopupModal").unbind("shown");
            $("#mapPopupModal").unbind("hidden");

        });
        return false;
    });

    }
}

/*
  This function is called when a popup is currently active. It updates the popup based on the new layer.
 */
function reShowMapPopUp(ev,feature,idx){
    //get which layer is active
    var activeLayer = $(".map-ui li.active").attr("id");

    var map_id = activeLayer+"-"+feature.properties.N_Name;

    url = getPopupUrlFrom(activeLayer,feature);
    console.log("ulr: " + url);
//    map_popups_currently_active.push(map_id);
    map_popups_currently_active_features[idx]=feature;

    //determine which graph to load based on active layer
    switch(activeLayer){
        case "PERCENT_INCOME":
            map_popups[idx].load(url, function(){
            drawPercentIncomeGraph(idx +1,feature.properties.PERINC10,feature.properties.Daily_Inco);
        });
            break;
        case "MEDIAN_INCOME":
            map_popups[idx].load(url, function(){
            drawPercentIncomeGraph(idx +1,feature.properties.PERINC10,feature.properties.Daily_Inco);
        });
            break;
        case "AVG_WIN":
            map_popups[idx].load(url, function(){
            drawNetGainLossGraph(idx +1,feature.properties.Daily_Win,feature.properties.Daily_Sale, feature.properties.Net_Win);
        });
            break;
        case "AVG_SPEND":
            map_popups[idx].load(url, function(){
            drawNetGainLossGraph(idx +1,feature.properties.Daily_Win,feature.properties.Daily_Sale, feature.properties.Net_Win);
        });
            break;
        case "NET_GAIN_LOSS":
            map_popups[idx].load(url, function(){
            drawNetGainLossGraph(idx +1,feature.properties.Daily_Win,feature.properties.Daily_Sale, feature.properties.Net_Win);
        });
            break;
        }

    map_popups[idx].show();
    map_popups[idx].on("click",".div-close",function(event){
    map_popups[idx].innerHTML="";
    map_popups[idx].hide();
    map_popups_currently_active.shift();
    map_popups_currently_active_features[idx]=null;
    });

}

/*
  This function draws the % Income graph for the map popup as an SVG.
 */
function drawPercentIncomeGraph(popupId,percentIncome,medianIncome){
    var data = [500,medianIncome,percentIncome];
    //draw top tooltip
    $("#map-popup-" + popupId + " #map-popup-graphic #median_income_graph_text").append("<b>$" + (Math.round(data[1]/10)*10) + "</b> <a href='#' id='median_household_rollover'>median household</a> income per day.");

    //draw graph
     var chart = d3.select("#map-popup-" + popupId + " #map-popup-graphic-holder").append("svg")
     .attr("class", "chart")
     .attr("width", 190)
     .attr("height", 30);


    var x = d3.scale.linear()
     .domain([0, 500])
     .range([4, 190]);

    chart.selectAll("rect")
     .data(data)
   .enter().append("rect")
     .attr("width", x)
        .attr("y",4)
     .attr("height", 20);

    var ticks = [0,50,60,100];

    chart.selectAll("line")
     .data(x.ticks(10))
   .enter().append("line")
     .attr("x1", x)
     .attr("x2", x)
     .attr("y1", 4)
     .attr("y2", 24)
     .style("stroke", "#ffffff");


    chart.selectAll(".rule")
     .data(x.ticks(10))
   .enter().append("text")
     .attr("class", "rule")
     .attr("x", x)
        .attr("dx",-10)
     .attr("y", 27)
     .attr("dy", 7)
        .attr("text-anchor", "start")
     .text(function(d,i){ if(i%2==0 && i!=0){return "$"+d;}});

    //draw bottom tooltip
    $("#map-popup-" + popupId + " #map-popup-graphic #percent_income_graph_text").append("<b class='blue'>" + roundToHalf(data[2]) + "%</b> of income spent on lottery");

    $(".map-popup").on("click", "#median_household_rollover",function(e){
        var titleTxt = "<div id='percent-income-rollover'> <b>Household</b> means all people age 15 or older who live in the same housing unit " +
        "whether or not they are related. To come up with the <b>daily household income</b>, the income each" +
        " person in the household earns per day is added together.<br><br/> " +
        "A neighborhood's <b>median household income</b> means that half of the households in that neighborhood earn more and half of the households earn less.</div>";
    $(this).popover({html:true,content:titleTxt,placement:'left',trigger: 'click'}).popover('show');


    });


}

/*
  This function draws the Net Gain/Loss for the map popup as an SVG.
 */
function drawNetGainLossGraph(popupId,winnings,spendings, net){
    data = [8000,4000,1000,spendings,winnings];
        //draw top tooltip

    //draw graph
     var chart = d3.select("#map-popup-" + popupId + " #map-popup-graphic-holder").append("svg")
     .attr("class", "chart")
     .attr("width", 120)
     .attr("height", 120);


    var x = d3.scale.linear()
     .domain([0, 8000])
     .range([3, 60]);

    chart.selectAll("circle")
     .data(data)
   .enter().append("circle")
  .attr("cx", 60)
   .attr("cy", 60)
  .attr("r", x)
    .style("opacity", function(d,i){if(i<3){return .5;}})
   .style("fill", function(d,i){ if (i==4){return "#9518ed"}else if(i==3){return "#00ec66"}else{return "#b0b6bd"}});

    // Labels for each circle
     chart.selectAll("text")
     .data([8000,4000,1000])
   .enter().append("text")
         .attr("class","rule")
      .attr("text-anchor", "center")
         .attr("dx",45)
      .attr("dy", function (d,i){if(i==0){return 4;} if(i==1){return 29;}if(i==2){return 53;}})
      .style("fill", "#000000")
      .text(function(d,i) { return "$"+d;});

    //draw bottom tooltip
    $("#map-popup-" + popupId + " #map-popup-graphic #net_winnings_graph_text").append("<b>$" + data[4].toFixed(0) + "</b> winnings.");
    $("#map-popup-" + popupId + " #map-popup-graphic #net_spenings_graph_text").append("<b>$" + data[3].toFixed(0) + "</b> spending.");

    //append descrption
    $("#map-popup-" + popupId + " #map-popup-description-netgain").append("<p><b class='winnings' style='margin-left:6px; margin-right:6px;'>$" + winnings.toFixed(0) + "</b>" +
    "     -      <b class='spendings' style='margin-left:6px; margin-right:6px;'>$" +  spendings.toFixed(0) +"</b>= <b class='net' style='margin-left:6px; margin-right:6px;'>" + net.toFixed(0) + "</b></p>");



}

/*
  This function draws the % Income graph for the math explaination as an SVG.
 */
function drawPercentIncomeGraphForExplain(medianIncome){
    console.log("drawing graph");
    var data = [500,medianIncome];

    //draw top tooltip
    $("#mapPopupModal #explain-chart #explain-chart-text").append("<b class='blue-2'>$" + (Math.round(data[1]/10)*10) + "</b> median household income per day.");

    //draw graph
     var chart = d3.select("#mapPopupModal #explain-chart #explain-chart-chart").append("svg")
     .attr("class", "chart-percent-explain")
     .attr("width", 595)
     .attr("height", 60);


    var x = d3.scale.linear()
     .domain([0, 500])
     .range([0, 580]);

    chart.selectAll("rect")
     .data(data)
   .enter().append("rect")
     .attr("width", x)
        .attr("y",4)
     .attr("height", 20);


    chart.selectAll("line")
     .data(x.ticks(10))
   .enter().append("line")
     .attr("x1", x)
     .attr("x2", x)
     .attr("y1", 4)
     .attr("y2", 24)
     .style("stroke", "#ffffff");


    chart.selectAll(".rule")
     .data(x.ticks(10))
   .enter().append("text")
     .attr("class", "rule")
     .attr("x", x)
        .attr("dx",-10)
     .attr("y", 27)
     .attr("dy", 13)
        .attr("text-anchor", "start")
     .text(function(d,i){ if(i%2==0 && i!=0){return "$"+d;}});

    //determine amount of big braces
    fullBraceCount = Math.floor(medianIncome/100);
    smallBraceWidth = (medianIncome/100) % 1;
    xCoord = 116;
    yCoord =30;

}


//returns path string d for <path d="This string">
		//a curly brace between x1,y1 and x2,y2, w pixels wide
		//and q factor, .5 is normal, higher q = more expressive bracket
		function makeCurlyBrace(x1,y1,x2,y2,w,q)
		{
			//Calculate unit vector
			var dx = x1-x2;
			var dy = y1-y2;
			var len = Math.sqrt(dx*dx + dy*dy);
			dx = dx / len;
			dy = dy / len;

			//Calculate Control Points of path,
			var qx1 = x1 + q*w*dy;
			var qy1 = y1 - q*w*dx;
			var qx2 = (x1 - .25*len*dx) + (1-q)*w*dy;
			var qy2 = (y1 - .25*len*dy) - (1-q)*w*dx;
			var tx1 = (x1 -  .5*len*dx) + w*dy;
			var ty1 = (y1 -  .5*len*dy) - w*dx;
			var qx3 = x2 + q*w*dy;
			var qy3 = y2 - q*w*dx;
			var qx4 = (x1 - .75*len*dx) + (1-q)*w*dy;
			var qy4 = (y1 - .75*len*dy) - (1-q)*w*dx;

    	return ( "M " +  x1 + " " +  y1 +
         		" Q " + qx1 + " " + qy1 + " " + qx2 + " " + qy2 +
          		" T " + tx1 + " " + ty1 +
          		" M " +  x2 + " " +  y2 +
          		" Q " + qx3 + " " + qy3 + " " + qx4 + " " + qy4 +
          		" T " + tx1 + " " + ty1 );
		}


function getPopupUrlFrom(activeLayer,feature){
        name = feature.properties.N_Name.toString().split(' ').join('_');
        return RELATIVE_URL + "/popup/"+activeLayer+"/"+name+"/"+feature.properties.PERINC10+"/"+feature.properties.EV_DOL+"/" +
            feature.properties.Daily_Sale+"/"+feature.properties.Daily_Win+"/"+feature.properties.Daily_Inco+"/"+feature.properties.Net_Win +"/" + feature.id +"/";
}

/*
  This function handles switching between layers.
 */
$(".map-ui").on("click","a", function (e) {
    e.preventDefault();
    //turn off any unwanted layers
    if(WINNINGS_LAYER !=null){
        MY_MAP.map.removeLayer(WINNINGS_LAYER);
        WINNINGS_LAYER = null;
    }
    if(SPENDINGS_LAYER !=null){
        MY_MAP.map.removeLayer(SPENDINGS_LAYER);
        SPENDINGS_LAYER = null;
    }

    $(".map-ui li.active #map-ui-subnav-content").hide();
    $(".map-ui li.active").removeClass("active");
     $(this).closest("li").addClass("active");
    $(".map-ui li.active #map-ui-subnav-content").show();

    //check zoom
    if( MY_MAP.map.getZoom() > 13){
         //MY_MAP.map.setZoom(13);
//        updateMapUIBackToCityLevel();
    }
    //update map
    var layerId = $(".map-ui li.active").attr("id");
    CityDigitsMap.loadLayerFor(layerId);
    return false;
});




/*
  Handle Sign Up, Login, Logout
 */
 $(".membership").click(function(ev) {
        ev.preventDefault(); // prevent navigation
        var url = RELATIVE_URL + $(this).data("form"); // get the  form url
        $("#signUpModal").load(url, function() { // load the url into the modal
            $(this).modal('show').css({
                  width: '95%',
                  'max-width': '95%',
                  height:'95%',
                    'top':'30px',
                  'margin-left': function () {
                        return window.pageXOffset-($(this).width() / 2);
                    },
                'max-height':'670px'
    }); // display the modal on url load
        });
        return false; // prevent the click propagation
 });

 $(".membership-login").click(function(ev) {
        ev.preventDefault(); // prevent navigation
        var url = RELATIVE_URL + $(this).data("form"); // get the  form url
        $("#loginModal").load(url, function() { // load the url into the modal
            $(this).modal('show').css({
                 width: '100%',
                 'max-width':'400px',
                  height:'100%',
                    'max-height':'320px',
                    'top':'30px',
                  'margin-left': function () {
            return window.pageXOffset-($(this).width() / 2);
        }
    }); // display the modal on url load
        });
        return false; // prevent the click propagation
 });

 $(".membership-logout").click(function(ev) {
        ev.preventDefault(); // prevent navigation
        var url = RELATIVE_URL + $(this).data("form"); // get the form url
        $.ajax({
        type: 'GET',
        url: url,
        success: function(data){
            console.log("logout successful");
            location.reload(true);
        }
        });
        return false; // prevent the click propagation
 });

/*
   Add an Interview
 */

$("#add-interview").click(function(ev){
   ev.preventDefault();  //prevent navigation
   var url = RELATIVE_URL + $(this).data("form"); //get the form url
   $("#addInterviewModal").load(url, function() { // load the url into the modal
       $(this).modal({backdrop:'static'});
            $(this).modal('show').css({
                 width: '100%',
                 'max-width':'400px',
                  height:'100%',
                    'max-height':'304px',
                    'top':'1%',
                  'margin-left': function () {

                        return window.pageXOffset-($(this).width() / 2);
                      }

    }); // display the modal on url load
   }); //display modal
    return false; //prevent click propagation
});


/*
  Add a Tour
 */

$("#add-tour").click(function(ev){
   ev.preventDefault();  //prevent navigation
   var url = RELATIVE_URL + $(this).data("form"); //get the form url
   $("#addTour").load(url, function() { // load the url into the modal
   }); //display modal
    $("#addTour").show();
    $("#tour-grid").hide();
    return false; //prevent click propagation
});


/*
  Add a player interview
 */


$("#addInterviewModal").on("click", "#add-player-interview", function (ev) {
    ev.preventDefault(); // prevent navigation
    var url = RELATIVE_URL + $(this).data("form"); //get the form url
    $("#addInterviewModal").load(url,function() { // load the url into the modal
        $(this).modal({backdrop:'static'});
            $(this).modal('show').css({
                 width: '90%',
                 'max-width':'90%',
                  height: '90%',
                    'max-height':'90%',
                    'top':'1%',
                  'margin-left': function () {
            return window.pageXOffset-($(this).width() / 2);
        }
    }); // display the modal on url load
        //geo located
        geoLocationMe("player");
   });
    return false;
});

$("#addInterviewModal").on("click", "#add-retailer-interview", function (ev) {
    ev.preventDefault(); // prevent navigation
    var url = RELATIVE_URL + $(this).data("form"); //get the form url
    $("#addInterviewModal").load(url,function() { // load the url into the modal
        $(this).modal({backdrop:'static'});
            $(this).modal('show').css({
                 width: '90%',
                 'max-width':'90%',
                  height:'90%',
                    'max-height':'90%',
                    'top':'1%',
                  'margin-left': function () {
            return window.pageXOffset-($(this).width() / 2);
        }
    }); // display the modal on url load
        //geo located
        geoLocationMe("retailer");
   });
    return false;
});




function error(msg) {
  console.log(msg);
}

/*
  This function loads the map thumbnail
 */
function loadMapThumb(){

    var interview_thumb_map = L.mapbox.map('map-thumb', 'sw2279.NYCLotto');
    var markerLayer = L.mapbox.markerLayer();

    //get lat/long from hidden divs
    var lat = $("#lat").html();
    var long = $("#long").html();
    var team = $("#team-name").html();

    //determine type
    var markerType = $("#interview-type-marker").html();

    var geoJson = [{
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [long, lat]
                },
                "properties": {
                    "title": "Interview",
                    "icon": {
                        "iconUrl": "/static/img/"+ markerType + "marker_" + team.toLowerCase() +".png",
                        "iconSize": [50, 50], // size of the icon
                        "iconAnchor": [25, 25], // point of the icon which will correspond to marker's location
                        "popupAnchor": [0, -25]  // point from which the popup should open relative to the iconAnchor
                     }
                }}
            ];


                         // Set a custom icon on each marker based on feature properties
     markerLayer.on('layeradd', function(e) {
                var marker = e.layer,
                    feature = marker.feature;
                marker.setIcon(L.icon(feature.properties.icon));
            });
            markerLayer.setGeoJSON(geoJson);
            interview_thumb_map.addLayer(markerLayer);


}

/*
  This function initiates an HTML 5 geo location request.
 */
function geoLocationMe(interviewType){
    if (navigator.geolocation) {
        var interview_thumb_map = L.mapbox.map('interview-map-thumb', 'sw2279.NYCLotto');
         interview_thumb_map.locate();
        //get student's team
        var team = $("#addInterviewModal #team").val();
        var slug = "";
        if (interviewType == "player"){
            slug = "playermarker_";
        }
        if(interviewType == "retailer"){
            slug = "retailermarker_";
        }
        // Once we've got a position, zoom and center the map
        // on it, and add a single marker.
        interview_thumb_map.on('locationfound', function(e) {

            var geoJson = [{
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [e.latlng.lng, e.latlng.lat]
                },
                "properties": {
                    "title": "Interview",
                    "icon": {
                        "iconUrl": "/static/img/" + slug + team.toLowerCase() +".png",
                        "iconSize": [50, 50], // size of the icon
                        "iconAnchor": [25, 25], // point of the icon which will correspond to marker's location
                        "popupAnchor": [0, -25]  // point from which the popup should open relative to the iconAnchor
                     }
                }}
            ];

            // Set a custom icon on each marker based on feature properties
            interview_thumb_map.markerLayer.on('layeradd', function(e) {
                var marker = e.layer,
                    feature = marker.feature;

                marker.setIcon(L.icon(feature.properties.icon));
                marker.dragging.enable();

                marker.on('dragend', function(e){
                  //update coordinates
                    $("#addInterviewModal #id_latitude").val(e.target._latlng.lat);
                    $("#addInterviewModal #id_longitude").val(e.target._latlng.lng);
                 console.log(e.target._latlng);
                });
            });




            interview_thumb_map.fitBounds(e.bounds);

            interview_thumb_map.markerLayer.setGeoJSON(geoJson);

            //update lat/long for form submission
            $("#addInterviewModal #id_latitude").val(e.latlng.lat);
            $("#addInterviewModal #id_longitude").val(e.latlng.lng);


        });
    } else {
        console.log('not supported');
    }
}

$("#addInterviewModal").on("change", "input[name=buyLotteryTickets]:radio", function(ev){
    if ($("input[name=buyLotteryTickets]:radio")[0].checked) {
            //YES
            $('#wonLottery').show();
            $("#averageSpentOnLotteryPerWeek").show();
            $("#wonJackpotQuestion").show();
        }
        else if($("input[name=buyLotteryTickets]:radio")[1].checked){
            //NO
            $("#wonLottery").hide();
            $("#averageSpentOnLotteryPerWeek").hide();
            $("#wonJackpotQuestion").hide();

        }
    }
);

$("#addInterviewModal").on("change", "input[name=wonLottery]:radio", function(ev){
    if ($("input[name=wonLottery]:radio")[0].checked) {
            //YES
            $('#mostWonAmount').show();
        }
        else if($("input[name=wonLottery]:radio")[1].checked){
            //NO
            $("#mostWonAmount").hide();

        }
    }
);

$("#addInterviewModal").on("change", "input[name=sellLotteryTickets]:radio", function(ev){
    if ($("input[name=sellLotteryTickets]:radio")[0].checked) {
            //YES
            $('#customersPerDay').show();
            $("#percentageCustomers").show();
            $("#amountPerVisit").show();
        }
        else if($("input[name=sellLotteryTickets]:radio")[1].checked){
            //NO
            $("#customersPerDay").hide();
            $("#percentageCustomers").hide();
            $("#amountPerVisit").hide();
        }
    }
);

$("#addInterviewModal").on("change", "input[name=whyOrWhyNot]:file", function(ev){
     //update the no file chosen field
     $(this).parent().parent().find(".no-file-chosen").html($(this).val());
    }
);

$("#addInterviewModal").on("change", "input[name=wonJackpotQuestion]:file", function(ev){
     //update the no file chosen field
     $(this).parent().parent().find(".no-file-chosen").html($(this).val());
    }
);

$("#addInterviewModal").on("change", "input[name=photo]:file", function(ev){
     //update the no file chosen field
     $(this).parent().parent().find(".no-file-chosen").html($(this).val());
    }
);

$("#addInterviewModal").on("change", "input[name=goodForNeighborhoodQuestion]:file", function(ev){
     //update the no file chosen field
     $(this).parent().parent().find(".no-file-chosen").html($(this).val());
    }
);

/*
 * Sign Up workflow logic
 */
$("#signUpModal").on("click", ".workflow_1_click", function (ev) {
    ev.preventDefault(); // prevent navigation
    //hide sign up workflow part 1
    $("#signUpModal #workflow_1").hide();
    $("#signUpModal .workflow_1_click").hide();
    //show workflow 2
/*    $("#signUpModal #workflow_2").show();
    $("#signUpModal .workflow_2_add_team").show();*/
});

$("#signUpModal").on("click", ".back", function (ev) {
    ev.preventDefault(); // prevent navigation
    //show sign up workflow part 1
    $("#signUpModal #workflow_1").show();
    $("#signUpModal .workflow_1_click").show();
    //hide workflow 2
    $("#signUpModal #workflow_2").hide();
    $("#signUpModal .workflow_2_add_team").hide();
});

$('#signUpModal').on("click", ".add_student", function (ev) {
    ev.preventDefault(); // prevent navigation

    //get team count to add student too
    var originIdx = $(this).closest(".team").find(".student").last().attr('name').indexOf("[");
    var destIdx = $(this).closest(".team").find(".student").last().attr('name').indexOf("]");
    var teamCount = $(this).closest(".team").find(".student").last().attr('name').substring(originIdx+1,destIdx);

    //get student count for team
    var student_count = $(this).closest(".team").find(".student").length + 1;
    //create input strings
    var studentFirstNameInput = '<input class="sign_up_medium student" type="text" placeholder="Student First Name" name="student_name[' +
        teamCount+'][]">';
    var studentPassword = '<input class="sign_up_medium" type="text" placeholder="Password" name="student_password[' +
        teamCount+'][]">';
    //apply input strings
    $(this).parent().parent().parent().find('tr:last').prev().before('<tr><td class="sign_up_row_buffer">' + studentFirstNameInput + '</td><td>' + studentPassword +'</td><td><a href="#" class="remove_student">X</a></td></tr>');
});

/*
 * This function defines how to handle adding a new team group to the screen
 */
$('#signUpModal').on("click", ".add_team", function (ev) {
    ev.preventDefault(); // prevent navigation
    //get team count
    var teamCount = 0;
    for(var i=0; i < $("#workflow_2").find(".team").length; i++ ){
        //get max count from div id
        if(parseInt($("#workflow_2").find(".team")[i].id.split("_")[1]) > teamCount){
            teamCount = parseInt($("#workflow_2").find(".team")[i].id.split("_")[1]);
        }
    }
    teamCount = teamCount + 1;

    $('#workflow_2 .row-fluid').append('<div class="team" id="team_' + teamCount + '">' +
              '<div class="styled-select input-append">' +
                '<select class="sign_up_large" id="team_name" name="team_name[]" style="width:340px"><option value="base_'+ teamCount +'">Team</option><option value="BLUE_'+ teamCount +'">Blue</option><option value="AQUA_'+ teamCount +'">Aqua</option><option value="PINK_'+ teamCount+'">Pink</option>'+
                '<option value="PURPLE_'+ teamCount+'">Purple</option><option value="GREEN_'+teamCount +'">Green</option><option value="ORANGE_'+ teamCount +'">Orange</option><option value="YELLOW_'+ teamCount +'">Yellow</option><option value="RED_'+ teamCount+'">Red</option></select><img class="dropdown-caret-login" src="/static/img/select_arrow.png">' +
              '</div>'+
              '<table>'+
                  '<tr>' +
                          '<td class="sign_up_row_buffer"><input class="sign_up_medium student" type="text" placeholder="Student First Name" name="student_name['+teamCount +'][]"></td>' +
                          '<td><input class="sign_up_medium" type="text" placeholder="Password" name="student_password[' + teamCount +'][]"></td>' +
                          '<td><a href="#" class="remove_student">X</a></td></tr>' +
                      '<tr>' +
                          '<td class="sign_up_row_buffer"><input class="sign_up_medium student" type="text" placeholder="Student First Name" name="student_name['+ teamCount+'][]"></td>' +
                          '<td><input class="sign_up_medium" type="text" placeholder="Password" name="student_password['+ teamCount +'][]"></td>' +
                          '<td><a href="#" class="remove_student">X</a></td>' +
                      '</tr>' +
                  '<tr>' +
                      '<td colspan="3">' +
                          '<label class="add_student">+ Add a student to this team</label>' +
                      '</td>' +
                  '</tr>' +
                  '<tr><td colspan="3"><label class="delete_team">- Delete team</label></td></tr>'+
              '</table>' +
          '</div><!-- team -->')
    //prevent click propagation
    return false;
});


$('#signUpModal').on("click", ".remove_student", function (ev) {
    $(this).closest('tr').remove();
});

$('#signUpModal').on("click", ".delete_team", function (ev) {
    $(this).closest('div').remove();
});

/*
 * This function defines how to handle a sign up  workflow submission
 */
$('#signUpModal').on("click", ".submit", function (ev) {
    ev.preventDefault(); // prevent navigation
    //get request url
    var request_url = RELATIVE_URL + $('#sign_up_form').attr('action');
    // get all the inputs into an array.
    var values = {};
    values = $('#sign_up_form').serializeArray();
   values = $('#sign_up_form').serializeArray();
        console.log("SIGN UP FORM POST VALUES: " );
        console.log($('#id_email').val());



    //do post
    $.ajax({
     url: 'accounts_pending.php', //request_url,
     type:'POST',
     dataType: "json",
//     data: values,
                    data: {email:$('#id_email').val()},
     success: function(data){
       console.log("SUCCESS POST");
       //show success page
       $("#signUpModal #workflow_1").hide();
//       $("#signUpModal #workflow_2").hide();
 //      $("#signUpModal .workflow_2_add_team").hide();
       $("#signUpModal #workflow_3").show();
     },
     error: function(data){
         console.log(data.responseText);
         $("#signUpModal").html(data.responseText);
     }
  });
    //prevent click propagation
    return false;
});

/*
 * This function defines how to handle a login workflow submission
 */
$('#loginModal').on("click", ".submit", function (ev) {
    ev.preventDefault(); // prevent navigation
    //get request url
    var request_url = RELATIVE_URL + $('#login_form').attr('action');
    // get all the inputs into an array.
    var values = {};
    values = $('#login_form').serializeArray();


    //do post
    $.ajax({
     url: request_url,
     type:'POST',
     dataType: "json",
     data: values,
     success: function(data){
         //update view
         $("#loginModal").hide();
         window.location.reload();
     },
     error: function(data){
         console.log(data.responseText);
          $("#loginModal").html(data.responseText);
     }
  });
    //prevent click propagation
    return false;
});

/*
 * This function defines how to handle a interview workflow submission
 */
$('#addInterviewModal').on("click", "#interviewSubmit", function(event) {
    event.preventDefault();
//    get request url
    var request_url = RELATIVE_URL + $('#add_interview_form').attr('action');

    $("#add_interview_form").ajaxSubmit({
        url:request_url, // the file to call
        success: function(response) {
            if(response.toString().indexOf("errorlist") >=0){
                //there were errors in the forms
                $("#addInterviewModal").html(response);
                geoLocationMe($("#interview_type").val());
            }else{
            //update view
         $("#addInterviewModal #workflow").hide();
         $("#addInterviewModal").find(".interview-header").hide();
         $("#addInterviewModal #success-message").show();}
        },
        error: function(data){
          $("#addInterviewModal").html(data.responseText);
     }
    });

    return false;

});



$(".map-popup").on("click", "#not_all_equal", function (ev) {
    ev.preventDefault(); // prevent navigation

    var url = $(this).data("form"); //get the form url
    $("#mapPopupModal").load(url,function() { // load the url into the modal
            $(this).modal('show').css({
                 width: '90%',
                 'max-width':'90%',
                  height:'100%',
                    'max-height':'85%',
                    'top':'30px',
                  'margin-left': function () {
            return window.pageXOffset-($(this).width() / 2);
        },
                'background-color':'#9518ed'
    }); // display the modal on url load
   });


    $("#mapPopupModal").on("shown",function(){
        $(".not-equal-rollover").on("mouseover",function(e){
    var content = "<div id='img-tooltip'><img src='/static/img/dollar.png'> = $100<br><img src='/static/img/smiley.png'> = 100 people</div>";
   $(this).tooltip({html:true,title:content,background:'#ffffff'});
});
    });
    $("#mapPopupModal").on("hidden",function(){
        $("#mapPopupModal").empty();
        $("#mapPopupModal").unbind("shown");
        $("#mapPopupModal").unbind("hidden");

    });
    return false;
});



$("#map-ui-popup-1").on("click","button",function(event){
    console.log("CLOSEE1");
});

$("#interviews").click(function(e){
    //start interview load
    loadInterviewsWithPagination(1,true,true,"ALL","ALL");
    //show add interview button
    $("#add-interview").parent().attr({'class':''});
    $("#add-tour").parent().attr({'class':'hidden'});
    $("#main-container").css('background-color','#b0b6bd');
    $("body").css('background-color','#b0b6bd');

    //show footer
    $("#city_digits_footer").show();


});

$("#about").click(function(e){
    //hidden interview button
    $("#add-interview").parent().attr({'class':'hidden'});
    $("#add-tour").parent().attr({'class':'hidden'});

    //show footer
    $("#city_digits_footer").show();

    //load in content
    $.ajax({
        type: 'GET',
        url: RELATIVE_URL + '/about/',
        success: function(data){
            $("#about-tab").html(data);
            $("#main-container").css('background-color','#025ff1');
            $("body").css('background-color','#025ff1');
            $("#about-main-page").on("click","#about-read-more-link",function(e){
                $("#about-main-page").attr("class","hidden");
                $("#about-read-more").attr("class","");
            });
            $("#about-read-more").on("click","#back-to-about",function(e){
                $("#about-main-page").attr("class","");
                $("#about-read-more").attr("class","hidden");
            });
        }
    });

});

$("#tours").click(function(e){
    //load tours
    loadToursWithPagination(1,'','');
    //hidden interview button
    $("#add-interview").parent().attr({'class':'hidden'});
    $("#add-tour").parent().attr({'class':''});
    $("#addTour").hide();
    $("#tour-grid").show();
    $("#main-container").css('background-color','#b0b6bd');
    $("body").css('background-color','#b0b6bd')
    //show footer
    $("#city_digits_footer").show();
});


$("#main-map").click(function(e){
    //hidden interview button
    $("#add-interview").parent().attr({'class':''});
    $("#add-tour").parent().attr({'class':'hidden'});
    $("#main-container").css('background-color','#b0b6bd');
    $("body").css('background-color','#b0b6bd');
    //hide footer
    $("#city_digits_footer").hide();
    //force map redraw
    MY_MAP.resizeMap();
});

$("#interviews-tab").on("click",".interview-stub",function(event){
   var url = RELATIVE_URL + "/interview/" + $(this).attr("id") + "/"; //interview id from div#id
    $("#interviewDetails").load(url,function() { // load the url into the modal
            $(this).modal('show').css({
                 width: '95%',
                 'max-width':'95%',
                  height:'95%',
                    'max-height':'95%',
                    'top':'30px',
                  'margin-left': function () {
            return window.pageXOffset-($(this).width() / 2);
        }
    }); // display the modal on url load

   });
    $("#interviewDetails").on("shown",function(){
            loadMapThumb();
        //get the audio element
        var audioWhyNotElem = $('#why-why-not-audio');
        var audioJackpotElem = $('#jackpot-audio');

        //why not audio
        //determine if browser supports default audio format
        if (audioWhyNotElem[0].canPlayType('audio/amr;') == ""){
          //browser does not support amr
          audioWhyNotElem[0].src=audioWhyNotElem[0].src.replace(".amr",".amr.mp3");
        }

        //jackpot audio
        //determine if browser supports default audio format
        if (audioJackpotElem[0].canPlayType('audio/amr;') == ""){
          //browser does not support amr
          audioJackpotElem[0].src=audioJackpotElem[0].src.replace(".amr",".amr.mp3");
        }

        });
});

$("#interviews-tab").on("change",".interview-toolbar", function(e){
    //get search values
    var values = {'player_interview':$("#interview_type_player").is(":checked"),
                  'retailer_interview':$("#interview_type_retailer").is(":checked"),
                  'team':$("#interviews-tab #team").val(),
                  'class':$("#class").val()};
    var offset = 1;
    //reload interviews
    loadInterviewsWithPagination(offset,values['player_interview'],values['retailer_interview'],values['team'],values['class']);
});


$("#interviews-tab").on("click","#pagination-prev-page", function(e){
    e.preventDefault();
    //get search values
    var values = {'player_interview':$("#interview_type_player").is(":checked"),
                  'retailer_interview':$("#interview_type_retailer").is(":checked"),
                  'team':$("#team").val(),
                  'class':$("#class").val()};
    var offset = $(this).data("form");
    console.log(offset);
    //reload interviews
    loadInterviewsWithPagination(offset,values['player_interview'],values['retailer_interview'],values['team'],values['class']);
    return false;
});

$("#interviews-tab").on("click","#pagination-next-page", function(e){
    e.preventDefault();
    //get search values
    var values = {'player_interview':$("#interview_type_player").is(":checked"),
                  'retailer_interview':$("#interview_type_retailer").is(":checked"),
                  'team':$("#team").val(),
                  'class':$("#class").val()};
    var offset = $(this).data("form");
    //reload interviews
    loadInterviewsWithPagination(offset,values['player_interview'],values['retailer_interview'],values['team'],values['class']);
    return false;
});

$("#interviews-tab").on("click",".pagination-page", function(e){
    e.preventDefault();
    //get search values
    var values = {'player_interview':$("#interview_type_player").is(":checked"),
                  'retailer_interview':$("#interview_type_retailer").is(":checked"),
                  'team':$("#team").val(),
                  'class':$("#class").val()};
    var offset = $(this).data("form");
    //reload interviews
    loadInterviewsWithPagination(offset,values['player_interview'],values['retailer_interview'],values['team'],values['class']);
    return false;
});



$("#map-nav").on("change",".map-ui-interviews", function(e){
    //get checkbox values
    player = $("#turn_on_player_interviews").is(":checked");
    retailer = $("#turn_on_retailer_interviews").is(":checked");

    //toggle player interviews on the map
    //remove previous layer
    if(MARKER_LAYER!=null){
        MY_MAP.map.removeLayer(MARKER_LAYER);
    }
    if(player && retailer){
        loadInterviews(null);
    }else if(player && !retailer){
        loadInterviews("PLAYER");
    }else if(!player && retailer){
        loadInterviews("RETAILER");
    }else{
        console.log("no interviews selected");
    }
});

$("#map-nav").on("click",".turn_on_class_interviews", function(e){
    var className = $(this).data("form");

    //toggle interviews on the map
    //remove previous layer
    if(MARKER_LAYER!=null){
        MY_MAP.map.removeLayer(MARKER_LAYER);
    }
    loadInterviews(className);
});


$('#interviewDetails').on("click", "#comment-submit", function(event) {
    event.preventDefault();
//    get request url
    var request_url = RELATIVE_URL + $(this).data("form");

    // get all the inputs into an array.
    var values = {'name':$('#comment-name').val(),
                    'comment':$('#comment-message').val()};
    console.log(values);

//do post
    $.ajax({
     url: request_url,
     type:'POST',
     dataType: "json",
     data: values,
     success: function(data){
       console.log("SUCCESS POST");
       //show success page
      console.log("comment created");
     },
     error: function(data){
                 $("#interviewDetails #comments-list").html(data.responseText);
            $('#comment-name').value = "";
            $('#comment-message').value = "";
    }
  });

    return false;

});

function loadInterviews(interviewType){
    var geoJson = null;
    var url = RELATIVE_URL + '/interview/geoJson/';
    if (interviewType != null){
        url = RELATIVE_URL + '/interview/geoJson/?type=' + interviewType;
    }
    $.ajax({
        type:'GET',
        url: url,
        success: function(data){
            geoJson = data;
            var markers = new L.MarkerClusterGroup();
            var markerLayer = L.mapbox.markerLayer();
            MARKER_LAYER = markers;
                         // Set a custom icon on each marker based on feature properties
            markerLayer.on('layeradd', function(e) {
                var marker = e.layer,
                    feature = marker.feature;
                marker.setIcon(L.icon(feature.properties.icon));
            });
            markerLayer.on('click',function(e){
                  var marker = e.layer,
                    feature = marker.feature;
                   var url = RELATIVE_URL + "/interview/" + feature.properties.interview_id + "/"; //interview id from div#id
                    $("#interviewDetails").load(url,function() { // load the url into the modal
                            $(this).modal('show').css({
                                 width: '95%',
                                 'max-width':'95%',
                                  height:'95%',
                                    'max-height':'95%',
                                    'top':'1%',
                                  'margin-left': function () {
                            return window.pageXOffset-($(this).width() / 2);
                        }
                    }); // display the modal on url load

                   });
                $("#interviewDetails").on("shown",function(){
                        loadMapThumb();
                        //get the audio element
                        var audioWhyNotElem = $('#why-why-not-audio');
                        var audioJackpotElem = $('#jackpot-audio');

                        //why not audio
                        //determine if browser supports default audio format
                        if (audioWhyNotElem[0].canPlayType('audio/amr;') == ""){
                          //browser does not support amr
                          audioWhyNotElem[0].src=audioWhyNotElem[0].src.replace(".amr",".amr.mp3");
                        }

                        //jackpot audio
                        //determine if browser supports default audio format
                        if (audioJackpotElem[0].canPlayType('audio/amr;') == ""){
                          //browser does not support amr
                          audioJackpotElem[0].src=audioJackpotElem[0].src.replace(".amr",".amr.mp3");
                        }
                    });
            });
            markerLayer.on('mouseover',function(e){
               var marker = e.layer;
                feature = marker.feature;
                MY_MAP.popup.setLatLng(e.latlng);
                var popupContent = '<div class="interview-tooltip row-fluid"><div class="span4">' + '<img src="/media/' + feature.properties.photo + '"/></div>' +
                    '<div class="span8">'+ '<p class="interview-rollover-name">'+ feature.properties.name +'</p>' +
                    '<p class="interview-rollover-about"><b>By: </b>'+ feature.properties.team  + ' Team, ' + feature.properties.class  + '</p>'
                    + '</div></div>';
                MY_MAP.popup.setContent(popupContent);
                //display popup
                if (!MY_MAP.popup._isOpen){
                    MY_MAP.popup.openOn(MY_MAP.map);
                $(".leaflet-popup-content").css('line-height','normal');
                $(".leaflet-popup-content").css('margin','0px');
                }

            });

            markerLayer.on('mouseout',function(e){
                //reset any styling and close popup
                 $(".leaflet-popup-content-wrapper").css('border','');
                 if (MY_MAP.popup._isOpen) MY_MAP.map.closePopup(MY_MAP.popup);
                $(".leaflet-popup-content").css('line-height','');
                $(".leaflet-popup-content").css('margin','');
            });


            markerLayer.setGeoJSON(geoJson);
            markers.addLayer(markerLayer);
            MY_MAP.map.addLayer(markers);
        }
    });
}

function updateMapUIBackToCityLevel(){
    //AVG WIN
    //set active thumb
    $("#map-city-level-view-winnings").attr("class","span6 active");
    $("#map-street-level-view-winnings").attr("class","span6");
    //update legends
    $("#AVG_WIN #map-legend-street").attr('class','hide');
    $("#AVG_WIN #map-legend").attr('class','');

    //AVG SPEND
    //set active thumb
    $("#map-city-level-view-spendings").attr("class","span6 active");
    $("#map-street-level-view-spendings").attr("class","span6");
    //update legends
    $("#AVG_SPEND #map-legend-street").attr('class','hide');
    $("#AVG_SPEND #map-legend").attr('class','');

    //NET GAIN/LOSS
    //set active thumb
    $("#map-city-level-view-netgainloss").attr("class","span6 active");
    $("#map-street-level-view-netgainloss").attr("class","span6");
    //update legends
    $("#NET_GAIN_LOSS #map-legend-street").attr('class','hide');
    $("#NET_GAIN_LOSS #map-legend").attr('class','');
}

$("#map-nav").on("click","#map-city-level-view-winnings",function(e){
   //reset zoom to city level
    //MY_MAP.map.setZoom(13);
    //clear winnings markers if any
    if(WINNINGS_LAYER!=null){
        MY_MAP.map.removeLayer(WINNINGS_LAYER);
        WINNINGS_LAYER = null;
    }
    if(mainLayer==null){
        mainLayer= MY_MAP.AVERAGE_WINNINGS_LAYER.addTo(MY_MAP.map);
    }
    //set div to active
    $(this).attr("class","span6 active");
    $("#map-street-level-view-winnings").attr("class","span6");

    //switch graphs
    $("#AVG_WIN #map-legend-street").attr('class','hide');
    $("#AVG_WIN #map-legend").attr('class','');
});

$("#map-nav").on("click","#map-street-level-view-winnings",function(e){
    e.preventDefault();
    //show winnings markers if not already shown
    if(WINNINGS_LAYER==null){
        loadAvgWinningsMarkers();
    }
    //turn off city layer
    if(mainLayer!=null){
        MY_MAP.map.removeLayer(mainLayer);
        mainLayer = null;
    }
    //reset zoom to city level
    //MY_MAP.map.setZoom(16);
    //set to active
     $(this).attr("class","span6 active");
    $("#map-city-level-view-winnings").attr("class","span6");

    //switch graphs
    $("#AVG_WIN #map-legend-street").attr('class','');
    $("#AVG_WIN #map-legend").attr('class','hide');
});


$("#map-nav").on("click","#map-city-level-view-spendings",function(e){
   //reset zoom to city level
//    MY_MAP.map.setZoom(13);
    //clear winnings markers if any
    if(SPENDINGS_LAYER!=null){
        MY_MAP.map.removeLayer(SPENDINGS_LAYER);
        SPENDINGS_LAYER = null;
    }

    if(mainLayer==null){
        mainLayer= MY_MAP.AVERAGE_SPENDINGS_LAYER.addTo(MY_MAP.map);
    }
    //set div to active
    $(this).attr("class","span6 active");
    $("#map-street-level-view-spendings").attr("class","span6");

    //switch graphs
    $("#AVG_SPEND #map-legend-street").attr('class','hide');
    $("#AVG_SPEND #map-legend").attr('class','');
});

$("#map-nav").on("click","#map-street-level-view-spendings",function(e){
    e.preventDefault();
   //reset zoom to city level
//    MY_MAP.map.setZoom(16);
    //show winnings markers if not already shown
    if(SPENDINGS_LAYER==null){
        loadAvgSpendingsMarkers();
    }

    //turn off city layer
    if(mainLayer!=null){
        MY_MAP.map.removeLayer(mainLayer);
        mainLayer = null;
    }
    //set to active
     $(this).attr("class","span6 active");
    $("#map-city-level-view-spendings").attr("class","span6");

    //switch graphs
    $("#AVG_SPEND #map-legend-street").attr('class','');
    $("#AVG_SPEND #map-legend").attr('class','hide');
});

$("#map-nav").on("click","#map-city-level-view-netgainloss",function(e){
   //reset zoom to city level
//    MY_MAP.map.setZoom(13);
    //clear winnings markers if any
    if(SPENDINGS_LAYER!=null && WINNINGS_LAYER!=null){
        MY_MAP.map.removeLayer(SPENDINGS_LAYER);
        SPENDINGS_LAYER = null;
        MY_MAP.map.removeLayer(WINNINGS_LAYER);
        WINNINGS_LAYER = null;
    }

    if(mainLayer==null){
        mainLayer= MY_MAP.NET_GAIN_LOSS_LAYER.addTo(MY_MAP.map);
    }

    //set div to active
    $(this).attr("class","span6 active");
    $("#map-street-level-view-netgainloss").attr("class","span6");

    //switch graphs
    $("#NET_GAIN_LOSS #map-legend-street").attr('class','hide');
    $("#NET_GAIN_LOSS #map-legend").attr('class','');
});

$("#map-nav").on("click","#map-street-level-view-netgainloss",function(e){
    e.preventDefault();
   //reset zoom to city level
//    MY_MAP.map.setZoom(16);
    //show winnings markers if not already shown
    if(SPENDINGS_LAYER==null && WINNINGS_LAYER==null){
        loadNetGainLossMarkers();
    }

    //turn off city layer
    if(mainLayer!=null){
        MY_MAP.map.removeLayer(mainLayer);
        mainLayer = null;
    }
    //set to active
     $(this).attr("class","span6 active");
    $("#map-city-level-view-netgainloss").attr("class","span6");

    //switch graphs
    $("#NET_GAIN_LOSS #map-legend-street").attr('class','');
    $("#NET_GAIN_LOSS #map-legend").attr('class','hide');
});


function loadNetGainLossMarkers(){


    //NET GAIN/LOSS
    //set active thumb
    $("#map-city-level-view-netgainloss").attr("class","span6");
    $("#map-street-level-view-netgainloss").attr("class","span6 active");
    //update legends
    $("#NET_GAIN_LOSS #map-legend-street").attr('class','');
    $("#NET_GAIN_LOSS #map-legend").attr('class','hide');

    if(MY_MAP.AVERAGE_SPENDINGS_MARKER_LAYER!=null){
        MY_MAP.map.addLayer(MY_MAP.AVERAGE_SPENDINGS_MARKER_LAYER);
        SPENDINGS_LAYER = MY_MAP.AVERAGE_SPENDINGS_MARKER_LAYER;
    }

    if(MY_MAP.AVERAGE_WINNINGS_MARKER_LAYER!=null){
        MY_MAP.map.addLayer(MY_MAP.AVERAGE_WINNINGS_MARKER_LAYER);
        WINNINGS_LAYER = MY_MAP.AVERAGE_WINNINGS_MARKER_LAYER;
    }

}

function loadAvgWinningsMarkers(){
    if(MY_MAP.AVERAGE_WINNINGS_MARKER_LAYER!=null){
        //update map ui to street view
        //AVG WIN
        //set active thumb
        $("#map-city-level-view-winnings").attr("class","span6");
        $("#map-street-level-view-winnings").attr("class","span6 active");
        //update legends
        $("#AVG_WIN #map-legend-street").attr('class','');
        $("#AVG_WIN #map-legend").attr('class','hide');

        MY_MAP.map.addLayer(MY_MAP.AVERAGE_WINNINGS_MARKER_LAYER);
        WINNINGS_LAYER = MY_MAP.AVERAGE_WINNINGS_MARKER_LAYER;
    }
}

$("#map").on("click",".popup-close",function(e){
    MY_MAP.map.closePopup();
});

function loadAvgSpendingsMarkers(){
    if(MY_MAP.AVERAGE_SPENDINGS_MARKER_LAYER!=null){

         //AVG SPEND
        //set active thumb
        $("#map-city-level-view-spendings").attr("class","span6");
        $("#map-street-level-view-spendings").attr("class","span6 active");
        //update legends
        $("#AVG_SPEND #map-legend-street").attr('class','');
        $("#AVG_SPEND #map-legend").attr('class','hide');

        MY_MAP.map.addLayer(MY_MAP.AVERAGE_SPENDINGS_MARKER_LAYER);
        SPENDINGS_LAYER = MY_MAP.AVERAGE_SPENDINGS_MARKER_LAYER;
    }
}



function loadInterviewsWithPagination(offset,playerInterview,retailerInterview,team,klass){
    $.ajax({
        type: 'GET',
        url:  RELATIVE_URL + '/interview/list/'+offset+'/?player=' + playerInterview + "&retailer=" + retailerInterview + "&team=" + team + "&class="+klass,
        success: function(data){
            $("#interviews-tab").html(data);

        }
    });
}

function loadToursWithPagination(offset,date,klass){
    $.ajax({
        type: 'GET',
        url: RELATIVE_URL + '/tour/list/'+offset+'/?sort-date=' + date + "&sort-class="+klass,
        success: function(data){
            $("#tours-tab #tour-grid").html(data);

        }
    });
}

$("#addTour").on("click",".add_tour_author",function(e){
   console.log("asdfjoaisfdj");
    $("#author_select").clone().insertBefore(this);

});


$("#addTour").on("click","#new-tour-slide",function(event){
     event.preventDefault();
    //get slide count
    var count = $("#add_tour_form #workflow-slides .slide").length;
    //get even or odd for last slide
    var currentSlideDecoration = $("#add_tour_form #workflow-slides .slide")[count-1].attributes["class"].value.indexOf("even") >= 0 ? "odd": "even";
    //construct html
    var html = '<div id="slide_' + (count+1) +'" class="' + currentSlideDecoration + ' slide">' +
        '<p class="slide-header">Slide ' + (count +1)+ '</p>' +
        '<p><label for="id_form-' + (count) + '-image">Add an Image:</label> <input id="id_form-' + (count) + '-image" name="form-' + (count) + '-image" type="file"></p>'+
        '<p><input id="id_form-' + (count) +'-isCoverPhoto" name="form-' + (count) + '-isCoverPhoto" type="checkbox"><label style="display: inline-block; margin-left: 5px;">Use as cover photo</label></p>'+
        '<p><label for="id_form-' + (count) + '-text">Add Text:</label> <textarea cols="40" rows="10" style="width: 50%;height : 250px;" id="id_form-' + (count) + '-text" name="form-' + (count) + '-text" ></textarea></p>' +
        '<p><label for="id_form-' + (count) + '-link">Link (optional):</label> <input id="id_form-' + (count) + '-link" name="form-' + (count) + '-link" type="text" style="width:50%"></p>' +
        '<p><label for="id_form-' + (count) + '-audio">Audio:</label> <input id="id_form-' + (count) + '-audio" name="form-' + (count) + '-audio" type="file"></p>' +
        '<p class="add_tour_photo">Select an interview audio clip</p>' +
        '</div>';
    $(html).insertBefore($(this).closest("div"));
    //update django management form
    $("#id_form-TOTAL_FORMS").val(count+1);

});


$("#addTour").on("click","#save_tour_button",function(event){
   event.preventDefault();
     //get request url
    var request_url = RELATIVE_URL + $('#add_tour_form').attr('action');
    // get all the inputs into an array.
    var values = {};
    values = $('#add_tour_form').serializeArray();

    $("#add_tour_form").ajaxSubmit({
        url:request_url, // the file to call
        success: function(response) {
            if(response.toString().indexOf("errorlist") >=0){
                //there were errors in the forms
                $("#addTour").html(response);
            }else{
                //no errors, show success
                $("#create-tour-success").attr('class','');;
                $("#add_tour_form").hide();
            }

        },
        error: function(data){
            console.log(data.responseText);
     }
    });
    //prevent click propagation
    return false;
});


$("#addTour").on("click","#save_preview_button",function(ev){
   ev.preventDefault();
    //get form values
    var title = $("#id_title").val();
    var values = $('#add_tour_form').serializeArray();
    var teamPhoto = $("#id_teamPhoto")[0].files[0];
    var slides = [];
    var coverPhoto;

    //load authors


    for(var i= 0; i<$("#add_tour_form .slide").length; i++){
        if ($("#add_tour_form .slide").find("#id_form-" + i + "-isCoverPhoto").is(":checked")){
            coverPhoto = $("#add_tour_form .slide").find("#id_form-" + i + "-image")[0].files[0];
        }
        var slide = {'image' : $("#add_tour_form .slide").find("#id_form-" + i + "-image")[0].files[0],
                    'text': $("#add_tour_form .slide").find("#id_form-" + i + "-text").val(),
                    'link': $("#add_tour_form .slide").find("#id_form-" + i + "-link").val(),
                    'audio':$("#add_tour_form .slide").find("#id_form-" + i + "-audio")[0].files[0]
        };
        slides.push(slide);
    }

    var url = RELATIVE_URL + $(this).data("form"); //get the form url
    url = url + "?slides=" + $("#add_tour_form .slide").length;
    $("#tourPreview").load(url,function() { // load the url into the modal
            $(this).modal('show').css({
                 width: '100%',
                 'max-width':'800px',
                    'max-height':'630px',
                    'top':'2%',
                  'margin-left': function () {
             return window.pageXOffset-($(this).width() / 2);
                }
    }); // display the modal on url load

   });

            $("#tourPreview").on("shown",function(){
        console.log("im shown");

         //title
         $("#tour-preview-team-info p.tour-paragraph-detail").html(title);

        //cover photo
        var coverPhotoReader = new FileReader();
        coverPhotoReader.onloadend = function (e) {
            console.log("laodeddd");
            $('#tour-preview-cover-photo img.cover-photo').attr('src', e.target.result);
        };
        coverPhotoReader.readAsDataURL(coverPhoto);

        //team photo
        var teamPhotoReader = new FileReader();
        teamPhotoReader.onloadend = function(e){
            $('#tour-preview-team-info img.team-photo').attr('src', e.target.result);
        };
        teamPhotoReader.readAsDataURL(teamPhoto);

        //load slides
//        tour-preview-slide-
        for(var i=0;i<slides.length;i++){
            console.log("building slides");
            //team photo
            var slideTeamPhoto = new FileReader();
            slideTeamPhoto['index'] = i;
            slideTeamPhoto.onloadend = function(e){
                console.log("loading slide team photo ");
                console.log(e);
                $("#tour-preview-slide-"+ e.target.index+ " #student-blurb img.team-photo").attr('src', e.target.result);
            };
            slideTeamPhoto.readAsDataURL(teamPhoto);
            //text
            $("#tour-preview-slide-"+i+ " #student-blurb .bubble-tour-preview-text p.blurb").html(slides[i]['text']);
            //audio
            var slideAudio = new FileReader();
            slideAudio['index'] = i;
            slideAudio.onloadend = function(e){
                $("#tour-preview-slide-"+ e.target.index+ " #student-blurb .bubble-tour-preview-text #slide-audio").attr('src', e.target.result);
            };
            slideAudio.readAsDataURL(slides[i]['audio']);

            //link
            $("#tour-preview-slide-"+i+ " #student-blurb .bubble-tour-preview-text p.link").html(slides[i]['link']);

            //audio
            var slidePhoto = new FileReader();
            slidePhoto['index'] = i;
            slidePhoto.onloadend = function(e){
                $("#tour-preview-slide-"+ e.target.index+ " #tour-preview-image img.tour-preview-img").attr('src', e.target.result);
            };
            slidePhoto.readAsDataURL(slides[i]['image']);

        }


    });


return false;
});


$("#tour-grid").on("change",".tour-toolbar", function(e){
   console.log("CHANGE DETECED");
    //get search values
    var values = {'sort-date':$("#date-sort").val(),
                  'sort-class':$("#class-sort").val()};
    var offset = 1;
    console.log(values);
    //reload interviews
    loadToursWithPagination(offset,values['sort-date'],values['sort-class']);
});

$("#tour-grid").on("click","#pagination-prev-page", function(e){
    e.preventDefault();
   console.log("prev DETECED");
    //get search values
    var values = {'sort-date':$("#date-sort").val(),
                  'sort-class':$("#class-sort").val()};
    var offset = $(this).data("form");
    console.log(offset);
    //reload interviews
    loadToursWithPagination(offset,values['sort-date'],values['sort-class']);
    return false;
});

$("#tour-grid").on("click","#pagination-next-page", function(e){
    e.preventDefault();
   console.log("next DETECED");
    //get search values
    var values = {'sort-date':$("#date-sort").val(),
                  'sort-class':$("#class-sort").val()};
    var offset = $(this).data("form");
    console.log(offset);
    //reload interviews
    loadToursWithPagination(offset,values['sort-date'],values['sort-class']);
    return false;
});

$("#tour-grid").on("click",".pagination-page", function(e){
    e.preventDefault();
   console.log("page DETECED");
    //get search values
    var values = {'sort-date':$("#date-sort").val(),
                  'sort-class':$("#class-sort").val()};
    var offset = $(this).data("form");
    console.log(offset);
    //reload interviews
    loadToursWithPagination(offset,values['sort-date'],values['sort-class']);
    return false;
});

$("#tours-tab").on("click",".tour-stub",function(event){
   var url = RELATIVE_URL + "/tour/" + $(this).attr("id") + "/"; //interview id from div#id
    $("#tourPreview").load(url,function() { // load the url into the modal
            $(this).modal('show').css({
                 width: '100%',
                 'max-width':'800px',
                    'max-height':'630px',
                    'top':'2%',
                  'margin-left': function () {
             return window.pageXOffset-($(this).width() / 2);
        }
    }); // display the modal on url load

        });

    $("#tourPreview").on('shown',function(){
        //get the audio element
        var audioSlideElem = $('#slide-audio');

        //why not audio
        //determine if browser supports default audio format
        if (audioSlideElem[0].canPlayType('audio/amr;') == ""){
          //browser does not support amr
          audioSlideElem[0].src=audioSlideElem[0].src.replace(".amr",".amr.mp3");
        }
    });

    $('#tourPreview').on('slid', '#myCarousel', function() {
      var $this = $(this);

      $this.children('.carousel-control').show();

      if($('.carousel-inner .item:first').hasClass('active')) {
        $this.children('.left.carousel-control').hide();
      } else if($('.carousel-inner .item:last').hasClass('active')) {
        $this.children('.right.carousel-control').hide();
      }

    });
});

function resizeSignUpModal(){
    var margin = 0;
    var height = 0;
    if ($(window).width() < 934){
        margin =  -380;
    }
    else{
      margin =  window.pageXOffset-($("#signUpModal").width() / 2);
    }
    $("#signUpModal").css("margin-left",margin + "px");
    //height
    $("#signUpModal").css("height","95%");
}


function resizeMapPopupModal(){
    var margin = 0;
    var height = 0;
    if ($(window).width() < 934){
        margin =  -380;
    }
    else{
      margin =  window.pageXOffset-($("#mapPopupModal").width() / 2);
    }
    $("#mapPopupModal").css("margin-left",margin + "px");

   //height
    $("#mapPopupModal").css("height","95%");
}

function resizeToursPreview(){
    var margin = 0;
     //margin
    if ($(window).width() < 934){
        margin =  -400;
    }
    else{
      margin =  window.pageXOffset-($("#tourPreview").width() / 2);
    }
    $("#tourPreview").css("margin-left",margin + "px");
    //height
//    $("#tourPreview").css("height","95%");
}

function resizeInterviewDetails(){
    var margin = 0;
    var height = 0;
    //margin
    if ($(window).width() < 934){
        margin =  -380;
    }
    else{
      margin =  window.pageXOffset-($("#interviewDetails").width() / 2);
    }
    $("#interviewDetails").css("margin-left",margin + "px");

   //height
    $("#interviewDetails").css("height","95%");

}

function resizeInterviewModal(){
    var margin = 0;
    var height = 0;
    //margin
   if ($(window).width() < 934){
        margin =  -380;
    }
    else{
      margin =  window.pageXOffset-($("#addInterviewModal").width() / 2);
    }
    $("#addInterviewModal").css("margin-left",margin + "px");

   //height
    $("#addInterviewModal").css("height","90%");
}

$(window).on("resize",function(e){
   MY_MAP.resizeMap();
    //test if modal is visible
    if($("#addInterviewModal").is(':visible') && $("#addInterviewModal").html().indexOf("Add an Interview") < 0){
        resizeInterviewModal();
    }
    if($("#interviewDetails").is(':visible')){
        resizeInterviewDetails();
    }
    if($("#tourPreview").is(':visible')){
        resizeToursPreview();
    }
    if($("#mapPopupModal").is(':visible')){
        resizeMapPopupModal();
    }
    if($("#signUpModal").is(':visible')){
        resizeSignUpModal();
    }
});

//home page bindings

//square 1 - map

$("#homepage-map-square").on("mouseenter","img",function(e){
    $(this).hide();
    $(this).parent().find(".home-page-rollover").show();
});

$("#homepage-map-square").on("mouseleave",".home-page-rollover",function(e){
    $(this).hide();
    $(this).parent().find("img").show();
});

$("#homepage-map-square").on("click","img",function(e){
    $(this).hide();
    $(this).parent().find(".home-page-rollover").show();
});

$("#homepage-map-square").on("click",".home-page-rollover",function(e){
    $("#main-map").click();
});

//square 2 - interview
$("#homepage-interviews-square").on("mouseenter","img",function(e){
    $(this).hide();
    $(this).parent().find(".home-page-rollover").show();
});

$("#homepage-interviews-square").on("mouseleave",".home-page-rollover",function(e){
    $(this).hide();
    $(this).parent().find("img").show();
});

$("#homepage-interviews-square").on("click","img",function(e){
    $(this).hide();
    $(this).parent().find(".home-page-rollover").show();
});

$("#homepage-interviews-square").on("click",".home-page-rollover",function(e){
    $("#interviews").click();
});


//square 3 - tours
$("#homepage-tours-square").on("mouseenter","img",function(e){
    $(this).hide();
    $(this).parent().find(".home-page-rollover").show();
});

$("#homepage-tours-square").on("mouseleave",".home-page-rollover",function(e){
    $(this).hide();
    $(this).parent().find("img").show();
});

$("#homepage-tours-square").on("click","img",function(e){
    $(this).hide();
    $(this).parent().find(".home-page-rollover").show();
});

$("#homepage-tours-square").on("click",".home-page-rollover",function(e){
    $("#tours").click();
});

$("#city-digits-logo").on("click",function(e){
   $("#main-map").click();
});

/*
   This funciton rounds to the nearest .5
 */
function roundToHalf(value) {
   var converted = parseFloat(value);
   var decimal = (converted - parseInt(converted, 10));
   decimal = Math.round(decimal * 10);
   if (decimal == 5) { return (parseInt(converted, 10)+0.5); }
   if ( (decimal < 3) || (decimal > 7) ) {
      return Math.round(converted);
   } else {
      return (parseInt(converted, 10)+0.5);
   }
}
