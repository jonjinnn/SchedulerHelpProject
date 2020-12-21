var database = firebase.database();
var getInterviewDetails = 0; // 0 - False, 1- True
var getOfferDetails = 0; // 0 - False, 1- True

function addToDatabase(company,position,location,dateApplied,status,interviewDate,interviewType,offerDeadline){
    // adds to database in the 'applications' section at the current user id
    var uid = firebase.auth().currentUser['uid'];
    var db = database.ref('applications');
    var data = {
        'company':company,
        'position_name':position,
        'location':location,
        'date_applied':dateApplied,
        'interview_date':interviewDate,
        'offer_deadline':offerDeadline,
        'status':status,
        'type_interview':interviewType
    }

    db.child(uid).push().set(data);
}

function eventHandlers(){
    $("#app").submit(function(e) {
        e.preventDefault();
    });

    // hide details currently, only when interview or offer details is chosen we will show this.
    $('#interview-details').hide();
    $('#offer-details').hide();
    

    console.log($('#date-applied').val())

    $('#logout').click(function(){
        // go to home screen
        firebase.auth().signOut();
        window.location.href="index.html";
    });

    $('#status').change(function(){
        // if status is chosen then the other options will be shown
        var status = $('#status').val();
        
        if (status == 'interview_scheduled'){
            // if interview scheduled then require details from user, hide offer details
            $('#interview-details').show();
            $('#interview-date').attr("required", true);
            $('#interview-type').attr("required", true);

            $('#offer-details').hide();
            $('#offer-deadline').attr("required", false);

            getInterviewDetails = 1;
            getOfferDetails = 0;
        } else if (status == 'just_applied'){
            // no details needed since they just applied
            $('#offer-details').hide();
            $('#offer-deadline').attr("required", false);

            $('#interview-details').hide();
            $('#interview-date').attr("required", false);
            $('#interview-type').attr("required", false);


            getInterviewDetails = 0;
            getOfferDetails = 0;
        } else if (status == 'job_extended'){
            // if job extended then require details from user, hide interview details
            $('#offer-details').show();
            $('#offer-deadline').attr("required", true);

            $('#interview-details').hide();
            $('#interview-date').attr("required", false);
            $('#interview-type').attr("required", false);

            getInterviewDetails = 0;
            getOfferDetails = 1;
        } else{
            // if job accepted (which then in that case why add it LOL), no details needed
            $('#interview-details').hide();
            $('#interview-date').attr("required", false);
            $('#interview-type').attr("required", false);

            $('#offer-details').hide();
            $('#offer-deadline').attr("required", false);
            

            getInterviewDetails = 0;
            getOfferDetails = 0;
        }


        $('#addBtn').click(function(){
            // Clicking the add button will pull the values inputted from the form and add it to database
            // will switch back to user screen afterwards
            //console.log("click");
            $("#addBtn").prop("disabled",true);
            var company = $('#company-name').val();
            var position = $('#position-name').val();
            var location = $('#location').val();
            var dateApplied = $('#date-applied').val();
            var status = $('#status').val();
            var interviewDate = '';
            var interviewType = '';
            var offerDeadline = '';

            if (getInterviewDetails == 1){
                interviewDate = $('#interview-date').val();
                interviewType = $('#interview-type').val();
            } else if (getOfferDetails == 1){
                offerDeadline = $('#offer-deadline').val();
            }
            addToDatabase(company,position,location,dateApplied,status,interviewDate,interviewType,offerDeadline);
            window.location.href="user.html";
        });
    });
}

// Wait for DOM to load
$(document).ready(function(){
    eventHandlers();
});