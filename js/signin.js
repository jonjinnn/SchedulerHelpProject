function addUserToDatabase(uid,name,email){
    // after signing up it will add the user to the user database
    var db = firebase.database().ref('users');

    console.log(uid);

    var data = {
        'email':email,
        'name':name
    }

    db.child(uid).set(data)    
}

function eventHandlers(){

    $("#register").submit(function(e) {
        // prevents the form from disappearing after submitting
        e.preventDefault();
    });

    $("#signin").submit(function(e) {
        // prevents the form from disappearing after submitting
        e.preventDefault();
    });

    // Register action 
    $('#submitBtn').click(function(){
        // Registers the user with the values inputted
        console.log("clicked register");
        var name = $('#name').val();
        var email = $('#email').val();
        var pw = $('#password').val();

        firebase.auth().createUserWithEmailAndPassword(email, pw).then(()=>{
            console.log("REGISTER")
            // registers the user successfully!
            $('#result').text("Registered!");
        }).then(()=>{
            // adds the user the database as well in order to register their applications later on
            var uid = firebase.auth().currentUser['uid'];
            addUserToDatabase(uid, name, email);
            $('#register').hide();
        }).catch(function(error){
            // if there is an error with signing up, an error message will show on screen
            console.log(error);
            $('#result').text(error['message']);
        });
    })

    // Sign In Action
    $('#signinBtn').click(function(){
        // signs in the user, error when signing in will show a message on the page.
        // if succesful will sign in the and save the user as current app user
        console.log("clicked sign in");
        var email = $('#returnEmail').val();
        console.log(email);
        var pw = $('#returnPassword').val();
        console.log(pw);

        firebase.auth().signInWithEmailAndPassword(email, pw).then(()=>window.location.href="user.html").catch(function(error){
            console.log(error);
            $('#errorMsg').text(error['message']);
        });

    });

 
}

// Wait for DOM to load
$(document).ready(function(){
    eventHandlers();
});