/**
 * User: vikashdat
 * Date: 7/17/13
 * Time: 10:20 PM
 */

/*
  Handle Sign Up, Login, Logout
 */
 $(".membership").click(function(ev) {
        ev.preventDefault(); // prevent navigation
        var url = $(this).data("form"); // get the contact form url
        $("#signUpModal").load(url, function() { // load the url into the modal
            $(this).modal('show').css({
                  width: '900px',
                  'margin-left': function () {
            return -($(this).width() / 2);
        }
    }); // display the modal on url load
        });
        return false; // prevent the click propagation
 });

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
    var teamName = $(this).closest("div").find("#team_name").val();
    if(!teamName){
        teamName = "Team";
    }
    //get student count for team
    var student_count = $(this).closest(".team").find(".student").length + 1;
    //create input strings
    var studentFirstNameInput = '<input class="sign_up_medium student" type="text" placeholder="Student First Name" name="teams[' +
        teamName+'][' + student_count +'][name]">';
    var studentPassword = '<input class="sign_up_medium" type="text" placeholder="Password" name="teams[' +
        teamName+'][' + student_count +'][password]">';
    //apply input strings
    $(this).parent().parent().parent().prepend('<tr><td class="sign_up_row_buffer">' + studentFirstNameInput + '</td><td>' + studentPassword +'</td></tr>');
});

/*
 * This function defines how to handle adding a new team group to the screen
 */
$('#signUpModal').on("click", ".add_team", function (ev) {
    ev.preventDefault(); // prevent navigation
    $('#workflow_2 .row-fluid').append('<div class="team">' +
              '<div class="input-append">' +
                '<input class="sign_up_large" type="text" placeholder="Team" id="team_name" name="team_name[]">' +
                '<span class="add-on"><span class="caret"></span></span>' +
              '</div>'+
              '<table>'+
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
 * This function defines how to handle a workflow submission
 */
$('#signUpModal').on("click", ".submit", function (ev) {
    ev.preventDefault(); // prevent navigation
    //get request url
    var request_url = $('#sign_up_form').attr('action');
    // get all the inputs into an array.
    var values = {};
    $.each($('#sign_up_form').serializeArray(), function(i, field) {
    values[field.name] = field.value;
});
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