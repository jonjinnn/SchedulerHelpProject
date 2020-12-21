var database = firebase.database();

function addOptions(select){
    // adds application Options on the Select element
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
        }
    });
}

function eventHandlers(){
    $('#delete-form').submit(function(e) {
        e.preventDefault();
    });

    // gets the select element to add options to
    var select = document.getElementById('application-delete');
    console.log(select);
    addOptions(select);

    $('#deleteBtn').click(function(){
        // delete the applications from the user's application and go back to user screen
        $("#deleteBtn").prop("disabled",true);
        var appDelete = $('#application-delete').val();
        var uid = firebase.auth().currentUser['uid'];
        var appsRef = database.ref().child('applications/'+uid+"/"+appDelete);

        appsRef.remove();
        window.location.href= "user.html";
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