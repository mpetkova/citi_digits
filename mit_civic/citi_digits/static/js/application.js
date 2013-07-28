/**
 * User: vikashdat
 * Date: 7/17/13
 * Time: 10:20 PM
 */

/*
  On DOM load handlers
 */
var map_popups = [];
var map_count = 0;
var mainLayer = null;
var MY_MAP = null;
$().ready(new function(){
    var myMap = new CityDigitsMap();
    myMap.resizeMap();
    myMap.loadLayers();
    mainLayer = myMap.neighborhoodLayer;
    MY_MAP = myMap;

    //mav nav
    map_popups.push($("#map-popup-1"));
    map_popups.push($("#map-popup-2"));

    $(".tab-content").height=$(window).height();
});

function showMapPopUp(ev){
    var idx= null;
    //get which layer is active
    var activeLayer = $(".map-ui li.active").attr("id");
    //get layer properties
    //get layer
    var layer = ev.layer;
    //pass properties to webservice to construct popup
    console.log("sfgsdgf " + map_popups[0].is(":visible") );
    //determine which popup is currently shown
    if (map_count % 2 == 0){
        idx = 0;
    }else{
        idx=1;
    }
    map_count = map_count + 1;
    //load into [0]
    map_popups[idx].load("/popup/"+activeLayer+"/"+layer.feature.properties.N_Name+"/");
    map_popups[idx].show();
    map_popups[idx].on("click",".div-close",function(event){
    map_popups[idx].innerHTML="";
    map_popups[idx].hide();});

}

$(".map-ui").on("click","li", function (e) {
    e.preventDefault();
    $(".map-ui li.active #map-ui-subnav-content").hide();
    $(".map-ui li.active").removeClass("active");
     $(this).closest("li").addClass("active");
    $(".map-ui li.active #map-ui-subnav-content").show();

    //update map
    var layerId = $(".map-ui li.active").attr("id");
    //set fillcolor based on id and properties
    if(layerId == "PERCENT_INCOME"){
        MY_MAP.map.removeLayer(mainLayer);
        MY_MAP.map.addLayer(L.geoJson(nyc_neighborhoods,{
            style :CityDigitsMap.getStyleColorForPercentIncome
        }));
    }
    if(layerId == "MEDIAN_INCOME"){
        MY_MAP.map.removeLayer(mainLayer);
        MY_MAP.map.addLayer(L.geoJson(nyc_neighborhoods,{
            style :CityDigitsMap.getStyleColorForMedianIncome
        }));
    }
    if(layerId == "AVG_WIN"){
        MY_MAP.map.removeLayer(mainLayer);
        MY_MAP.map.addLayer(L.geoJson(nyc_neighborhoods,{
            style :CityDigitsMap.getStyleColorForAverageWin
        }));
    }
    if(layerId == "AVG_SPEND"){
        MY_MAP.map.removeLayer(mainLayer);
        MY_MAP.map.addLayer(L.geoJson(nyc_neighborhoods,{
            style :CityDigitsMap.getStyleColorForAverageSpend
        }));
    }
    if(layerId == "NET_GAIN_LOSS"){
        MY_MAP.map.removeLayer(mainLayer);
        MY_MAP.map.addLayer(L.geoJson(nyc_neighborhoods,{
            style :CityDigitsMap.getStyleColorForNetWinLoss
        }));
    }

    return false;
});




/*
  Handle Sign Up, Login, Logout
 */
 $(".membership").click(function(ev) {
        ev.preventDefault(); // prevent navigation
        var url = $(this).data("form"); // get the  form url
        $("#signUpModal").load(url, function() { // load the url into the modal
            $(this).modal('show').css({
                  width: '100%',
                 'max-width': function () {
                     if ($(window).width() < 934){
                         return .90 * $(window).width();
                     }else{
                         return '934px';
                     }
                 },
                  height:'100%',
                    'top':'1%',
                  'margin-left': function () {
                      if ($(window).width() < 934){
                          return window.pageXOffset;
                      }else{
                        return window.pageXOffset-($(this).width() / 2);
                      }
                    },
                'max-height': function () {
                    if ($(window).height() < 670){
                        return .90 * $(window).height() ;
                    }else{
                        return '670px';
                    }
                }
    }); // display the modal on url load
        });
        return false; // prevent the click propagation
 });

 $(".membership-login").click(function(ev) {
        ev.preventDefault(); // prevent navigation
        var url = $(this).data("form"); // get the  form url
        $("#loginModal").load(url, function() { // load the url into the modal
            $(this).modal('show').css({
                 width: '100%',
                 'max-width':'400px',
                  height:'100%',
                    'max-height':'320px',
                    'top':'1%',
                  'margin-left': function () {
            return window.pageXOffset-($(this).width() / 2);
        }
    }); // display the modal on url load
        });
        return false; // prevent the click propagation
 });

 $(".membership-logout").click(function(ev) {
        ev.preventDefault(); // prevent navigation
        var url = $(this).data("form"); // get the form url
        $("#loginModal").load(url); // display the modal on url load
        return false; // prevent the click propagation
 });

/*
   Add an Interview
 */

$("#add-interview").click(function(ev){
   ev.preventDefault();  //prevent navigation
   var url = $(this).data("form"); //get the form url
    console.log("ADD INTERVIEW");
   $("#addInterviewModal").load(url, function() { // load the url into the modal
            $(this).modal('show').css({
                 width: '100%',
                 'max-width':'400px',
                  height:'100%',
                    'max-height':'320px',
                    'top':'1%',
                  'margin-left': function () {
                      if ($(window).width() < 934){
                          return window.pageXOffset;
                      }else{
                        return window.pageXOffset-($(this).width() / 2);
                      }
                    }
    }); // display the modal on url load
   }); //display modal
    return false; //prevent click propagation
});

/*
  Add a player interview
 */


$("#addInterviewModal").on("click", "#add-player-interview", function (ev) {
    ev.preventDefault(); // prevent navigation
    var url = $(this).data("form"); //get the form url
    $("#addInterviewModal").load(url,function() { // load the url into the modal
            $(this).modal('show').css({
                 width: '95%',
                 'max-width':'100%',
                  height:'100%',
                    'max-height':'100%',
                    'top':'1%',
                  'margin-left': function () {
            return window.pageXOffset-($(this).width() / 2);
        }
    }); // display the modal on url load
        //geo located
        geoLocationMe();
   });
    return false;
});

$("#addInterviewModal").on("click", "#add-retailer-interview", function (ev) {
    ev.preventDefault(); // prevent navigation
    var url = $(this).data("form"); //get the form url
    $("#addInterviewModal").load(url,function() { // load the url into the modal
            $(this).modal('show').css({
                 width: '95%',
                 'max-width':'100%',
                  height:'100%',
                    'max-height':'100%',
                    'top':'1%',
                  'margin-left': function () {
            return window.pageXOffset-($(this).width() / 2);
        }
    }); // display the modal on url load
        //geo located
        geoLocationMe();
   });
    return false;
});




function error(msg) {
  console.log(msg);
}

function geoLocationMe(){
    if (navigator.geolocation) {
        var interview_thumb_map = L.mapbox.map('interview-map-thumb', 'sw2279.NYCLotto');
         interview_thumb_map.locate();
        //get student's team
        var team = $("#addInterviewModal #team").val();
        console.log("team :" + "/static/img/playermarker_" + team.toLowerCase() + ".png");

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
                        "iconUrl": "/static/img/playermarker_" + team.toLowerCase() +".png",
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
        }
        else if($("input[name=buyLotteryTickets]:radio")[1].checked){
            //NO
            $("#wonLottery").hide();

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
            $("#amountPerVisit").show();
        }
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
    $("#signUpModal #workflow_2").show();
    $("#signUpModal .workflow_2_add_team").show();
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
    //get team name
    var teamCount = $(this).closest("div").find("#team_name").attr('name');

    //get student count for team
    var student_count = $(this).closest(".team").find(".student").length + 1;
    //create input strings
    var studentFirstNameInput = '<input class="sign_up_medium student" type="text" placeholder="Student First Name" name="student_name[' +
        teamCount+'][ ]">';
    var studentPassword = '<input class="sign_up_medium" type="text" placeholder="Password" name="student_password[' +
        teamCount+'][]">';
    //apply input strings
    $(this).parent().parent().parent().prepend('<tr><td class="sign_up_row_buffer">' + studentFirstNameInput + '</td><td>' + studentPassword +'</td></tr>');
});

/*
 * This function defines how to handle adding a new team group to the screen
 */
$('#signUpModal').on("click", ".add_team", function (ev) {
    ev.preventDefault(); // prevent navigation
    //get team count
    var teamCount = $("#workflow_2").find(".team").length;

    $('#workflow_2 .row-fluid').append('<div class="team">' +
              '<div class="styled-select">' +
                '<select class="sign_up_large" id="team_name" name="team_name[]"><option value="base">Team</option><option value="BLUE">Blue</option><option value="AQUA">Aqua</option><option value="PINK">Pink</option>'+
                '<option value="PURPLE">Purple</option><option value="GREEN">Green</option><option value="ORANGE">Orange</option><option value="YELLOW">Yellow</option><option value="RED">Red</option></select>' +
              '</div>'+
              '<table>'+
                  '<tr>' +
                          '<td class="sign_up_row_buffer"><input class="sign_up_medium student" type="text" placeholder="Student First Name" name="student_name['+teamCount +'][]"></td>' +
                          '<td><input class="sign_up_medium" type="text" placeholder="Password" name="student_password[' + teamCount +'][]"></td></tr>' +
                      '<tr>' +
                          '<td class="sign_up_row_buffer"><input class="sign_up_medium student" type="text" placeholder="Student First Name" name="student_name['+ teamCount+'][]"></td>' +
                          '<td><input class="sign_up_medium" type="text" placeholder="Password" name="student_password['+ teamCount +'][]"></td></tr><tr>' +
                      '</tr>' +
                  '<tr>' +
                      '<td colspan="2">' +
                          '<label class="add_student">+ Add a student to this team</label>' +
                      '</td>' +
                  '</tr>' +
              '</table>' +
          '</div><!-- team -->')
    //prevent click propagation
    return false;
});

/*
 * This function defines how to handle a sign up  workflow submission
 */
$('#signUpModal').on("click", ".submit", function (ev) {
    ev.preventDefault(); // prevent navigation
    //get request url
    var request_url = $('#sign_up_form').attr('action');
    // get all the inputs into an array.
    var values = {};
    values = $('#sign_up_form').serializeArray();


    console.log("VALUES!");
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
       $("#signUpModal #workflow_2").hide();
       $("#signUpModal .workflow_2_add_team").hide();
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
    var request_url = $('#login_form').attr('action');
    // get all the inputs into an array.
    var values = {};
    values = $('#login_form').serializeArray();


    console.log("VALUES!");
    console.log(values);

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
    var request_url = $('#add_interview_form').attr('action');

    $("#add_interview_form").ajaxSubmit({
        url:request_url, // the file to call
        success: function(response) {
            //update view
         $("#addInterviewModal #workflow").hide();
         $("#addInterviewModal #success-message").show();
        },
        error: function(data){
          $("#addInterviewModal").html(data.responseText);
     }
    });

    return false;

});


$("#map-ui-popup-1").on("click","button",function(event){
    console.log("CLOSEE1");
});
