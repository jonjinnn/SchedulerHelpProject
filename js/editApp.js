var database = firebase.database();
var getInterviewDetails = 0; // 0 - False, 1- True
var getOfferDetails = 0; // 0 - False, 1- True
var applicationId = '';
var applicationDetails ={};
var status ='';

function getApplicationDetails(appId){
    var uid = firebase.auth().currentUser['uid'];
    var appsRef = database.ref().child('applications/'+uid+"/"+appId);
    appsRef.on('value', snapshot=>{
        var app = snapshot.val();
        applicationDetails = app;
    });

}

function addToDatabase(status,interviewDate,interviewType,offerDeadline){
    //console.log(status);
    //console.log(interviewDate);
    //console.log(interviewType);
    //console.log(offerDeadline);

    applicationDetails['interview_date'] = interviewDate;
    applicationDetails['type_interview'] = interviewType;
    applicationDetails['offer_deadline'] = offerDeadline;
    applicationDetails['status'] = status;
    //console.log(applicationDetails);
    //console.log(applicationId);

    //console.log(firebase.auth().currentUser['uid']);
    var uid = firebase.auth().currentUser['uid'];
    var db = database.ref('applications');
    
    db.child(uid).child(applicationId).set(applicationDetails);
}

function addOptions(select){

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          uid = user['uid'];
          var appsRef = database.ref().child('applications/'+uid);
          appsRef.on('value', snapshot=>{
            var app = snapshot.val();
            for (key in app){
                console.log(key)
                select.add(new Option(app[key].company, key))
                console.log(app[key].company);
            }
          });
        } else {
          // No user is signed in.
          console.log("NONE")
          window.location.href="index.html";
        }
    });
}

function eventHandlers(){
    $("#choose-app").submit(function(e) {
        e.preventDefault();
    });
    $('#edit-form').submit(function(e) {
        e.preventDefault();
    });

    $('#interview-details').hide();
    $('#offer-details').hide();
    $('#addBtn').hide();

    var select = document.getElementById('application-change');
    addOptions(select);
    
    $('#application-change').change(()=>{
        applicationId = $('#application-change').val();
        getApplicationDetails(applicationId);
        console.log(applicationDetails);
    });

    $('#selection').change(()=>{
        var option = $('#selection').val();
        status = option;
        $('#addBtn').show();
        if (option == 'interview_scheduled'){
            $('#interview-details').show();
            $('#interview-date').attr("required", true);
            $('#interview-type').attr("required", true);

            $('#offer-details').hide();
            $('#offer-deadline').attr("required", false);

            getInterviewDetails = 1;
            getOfferDetails = 0;

        } else if (option == 'job_extended'){
            $('#offer-details').show();
            $('#offer-deadline').attr("required", true);

            $('#interview-details').hide();
            $('#interview-date').attr("required", false);
            $('#interview-type').attr("required", false);

            getInterviewDetails = 0;
            getOfferDetails = 1;
        } else{
            $('#offer-details').hide();
            $('#offer-deadline').attr("required", false);

            $('#interview-details').hide();
            $('#interview-date').attr("required", false);
            $('#interview-type').attr("required", false);
            getInterviewDetails = 0;
            getOfferDetails =2;
        }
    });

    
    $('#addBtn').click(function(){
        //console.log("click");
        $("#addBtn").prop("disabled",true);

        var interviewDate = '';
        var interviewType = '';
        var offerDeadline = '';

        if (getInterviewDetails == 1){
            interviewDate = $('#interview-date').val();
            interviewType = $('#interview-type').val();
        } else {
            offerDeadline = $('#offer-deadline').val();
        }
        addToDatabase(status, interviewDate,interviewType,offerDeadline);
        window.location.href="user.html";
    });

    $('#logout').click(function(){
        // go to home screen
        firebase.auth().signOut();
        window.location.href="index.html";
    });

}

// Wait for DOM to load
$(document).ready(function(){
    eventHandlers();
});