var database = firebase.database();
var user = null;
var uid = null;

function hideTables(){
  $('#upcoming-div').hide();
  $('#offer-deadline-div').hide();
  $('#follow-up-div').hide();
}


function addRow(app, table){
  // adds a row to the job application tables, with all the current application
  // data

  var interviewType = {
    "final_round": "Final Round",
    "behavioral":"Behavorial",
    "technical":"Technical",
    "":"N/A"
  };

  var statusType = {
    "interview_scheduled":"Interview Scheduled",
    "just_applied":"Applied Recently",
    "job_extended":"Offer Extended",
  }

  var interviewDate = app.interview_date;
  if (interviewDate == "") interviewDate = "N/A";
  var offerDeadline = app.offer_deadline;
  if (offerDeadline == "") offerDeadline = "N/A";

  let row = table.insertRow();
  let company = row.insertCell(0);
  company.innerHTML = app.company;
  let position = row.insertCell(1);
  position.innerHTML = app.position_name;
  let location = row.insertCell(2);
  location.innerHTML = app.location;
  let dateInter = row.insertCell(3);
  dateInter.innerHTML = interviewDate;
  let typeInter = row.insertCell(4);
  typeInter.innerHTML = interviewType[app.type_interview];
  let offer = row.insertCell(5);
  offer.innerHTML = offerDeadline;
  let status = row.insertCell(6);
  status.innerHTML = statusType[app.status];
  let dateApplied = row.insertCell(7);
  dateApplied.innerHTML = app.date_applied;
}

function populateTables(){
  firebase.auth().onAuthStateChanged(function(user) {
    if (user){

      uid = user['uid'];
      var appsRef = database.ref().child('applications/'+uid);
      appsRef.on('value', snapshot=>{
        var interviews = [];
        var offerDeadlines = [];
        var followUp = [];
        var app = snapshot.val();
        //console.log(app);

        const interviewTable = document.getElementById('interview-body');
        const offerTable = document.getElementById('offers-body');
        const followUpTable = document.getElementById('follow-up-body');

        
        for (key in app){
          if (app[key].status == 'interview_scheduled'){
            $('#upcoming-div').show();
            addRow(app[key],interviewTable);
          } else if (app[key].status == 'job_extended'){
            $('#offer-deadline-div').show();
            addRow(app[key],offerTable);
          } else{
            $('#follow-up-div').show(); 
            // gets the current date and finds the difference in days between
            // the day applied and current date. 

            var fullDate = app[key].date_applied.split("-");
            var date1 = new Date(fullDate[1]+'/'+fullDate[2]+'/'+fullDate[0]);
            var currDate = new Date();
            var date2 = new Date((currDate.getMonth()+1)+'/'+currDate.getDate()+'/'+currDate.getUTCFullYear());
            //console.log(date1);
            //console.log(date2);
            const diffTime = Math.abs(date2 - date1);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            //console.log(diffDays + " days");

            if (diffDays > 14){
              //if more than 2 weeks, add to 
              // table
              addRow(app[key],followUpTable);
            }
          }
        }
      });
    } else{
      // No user is signed in.
      window.location.href="index.html";
    }

  });
}

function addJobRow(pos,loc,url,table){
  // adds a link to job searches to the job position tables
  // links to LinkedIn and Indeed

  let a = document.createElement("a");
  a.setAttribute('href',url);
  a.innerHTML = "Link";

  let row = table.insertRow();
  let position = row.insertCell(0);
  position.innerHTML = pos;

  let location = row.insertCell(1);
  location.innerHTML = loc;

  let link = row.insertCell(2);
  link.appendChild(a);

}

function addNewPositions(){
    firebase.auth().onAuthStateChanged(function(user) {
      if (user){
  
        uid = user['uid'];
        var appsRef = database.ref().child('applications/'+uid);
        appsRef.on('value', snapshot=>{
          var locations = {};
          var positions = {}
          var app = snapshot.val();
          console.log(app);

          // puts all the locations and positions in separate objects
          // removes duplicates
          for (key in app){
            locations[app[key].location] = 1;
            positions[app[key].position_name] = 1;

          }

          //console.log(locations);
          //console.log(positions);

          // this will give us all combinations of locations and positions, with no repeats
          var search = {}
          var indeedURL = "https://www.indeed.com/jobs?q=&l=&radius=50";
          var linkedURL = "https://www.linkedin.com/jobs/search/?distance=50&keywords=&location=";
          for (loc in locations){
            for (pos in positions){
              search[pos+"/"+loc]=1;
            }
          }
          console.log(search);

          // for every position create a new url to facilitate job search
          // within LinkedIn and Indeed
          for (val in search){
            var pos = val.split("/")[0];
            var loc = val.split("/")[1];

            var queryLI =pos.replace(/\s/g,"%20");
            var cityLI = loc.split(",")[0].replace(/\s/g,"%20")
            var stateLI = loc.split(",")[1].trim().replace(/\s/g,"%20");
            var newLinkedURL = linkedURL.replace("keywords=","keywords="+queryLI).replace("location=","location="+cityLI+"%2C%20"+stateLI);

            addJobRow(pos,loc,newLinkedURL, document.getElementById('linked-body'));

            var queryIn = pos.replace(/\s/g,"+");
            var cityIn = loc.split(",")[0].replace(/\s/g,"+");
            var stateIn = loc.split(",")[1].trim().replace(/\s/g,"+");
            var newIndeedURL = indeedURL.replace("q=","q="+queryIn).replace("l=","l="+cityIn+"%2C+"+stateIn);

            addJobRow(pos,loc,newLinkedURL, document.getElementById('indeed-body'));

          }

        });
      }
    });
}

function addVideos(){
  // adds videos dynamically to the div element for videos
  var counts = {};
  var totalVids = 0;
  firebase.auth().onAuthStateChanged(function(user) {
    // Using this function will return the current user logged into the app
    // user is a dataobject where we can check the uid associated with the account

      if (user) {
        
        uid = user['uid'];
        var appsRef = database.ref().child('applications/'+uid);

        // lines 20-35 gets the different types of interviews there are for the current user 
        // and puts them into a dictionary with their respective counts
        appsRef.on('value', snapshot=>{
          var apps = snapshot.val();
          for (key in apps){
            var typeInterview = apps[key].type_interview;
            if (typeInterview != ''){
              console.log(key,typeInterview);
              totalVids++;

              if (typeInterview in counts){
                counts[typeInterview]++;
              } else{
                counts[typeInterview]=1;
              }
            }
          }

          //console.log(totalVids,counts);

          // for every type of interview, create a query that matches the interview type 
          // to use for the youtube search
          for (type in counts){

            //console.log(type, (Math.round((counts[type]/totalVids) * 10)));
            var query =''

            if (type == 'final_round'){
              query = 'Final Round Interview tips';
            } else if (type == 'behavorial'){
              query = 'Behavorial Interview tips';
            } else{
              query = 'Technical Interview tips';
            }

            // create the call to Youtube's API, using the query we just created and 
            // maxResults is the percentage of the current category out of all videos
            // multiplied by 10 to get the number of videos out of 10. 
            $.ajax({
              type: 'GET',
              url: 'https://www.googleapis.com/youtube/v3/search',
              data: {
                  key: ytAPI,
                  q: query,
                  part: 'snippet',
                  maxResults: Math.round((counts[type]/totalVids) * 10),
                  type: 'video',
                  videoEmbeddable: true,
              },
              success: function(data){
                // the data is a list of maxResults number of videos
                // here we looped through those list and created an iframe element
                // with the path+video ID, and add it to the #video-responsive element
                console.log(data);
                var path = 'https://www.youtube.com/embed/';

                for (numVid in data.items){
                  var vidObject = data.items[numVid];
                  var newFrame = document.createElement('iframe');
                  newFrame.src = path+vidObject.id.videoId;
                  newFrame.width= "500";
                  newFrame.height="300";
                  $('.video-responsive').append(newFrame);
                }
              },
              error: function(response){
                  console.log("Request Failed");
              }
            });
          }
        });
        
      } else {
        // No user is signed in.
        window.location.href="index.html";

      }
    });

}

function eventHandlers(){
    firebase.auth().onAuthStateChanged(function(user) {
      // Using this function will return the current user logged into the app
      // user is a dataobject where we can check the uid associated with the account
        if (user) {
          // if there is a user logged in, display a hello message with the users name
          uid = user['uid'];
          var appsRef = database.ref().child('users/'+uid);
          // User is signed in.
          appsRef.on('value', snapshot=>{
            var app = snapshot.val();
            $('#sayHello').text("Hello " + app.name+"!");
            $('#userUpcomingInter').text(app.name + "'s" + " Upcoming Interviews");
            $('#user-offer-deadline').text(app.name + "'s" + " Upcoming Offer Deadlines");
          });
        } else {
          // No user is signed in.
        }
      });

    $('#logout').click(function(){
        // go to home screen
        firebase.auth().signOut();
        window.location.href="index.html";
    });

    // $('#go-home').click(function(){
    //   // add app page
    //   window.location.href="user.html";
    // });

    $('#add-app').click(function(){
      // add app page
      window.location.href="app.html";
    });
    $('#delete-app').click(function(){
      //delete app page
      window.location.href="deleteapp.html";
    });

    $('#edit-app').click(function(){
      //edit app page
      window.location.href="editapp.html";
    })

    
}

// Wait for DOM to load
$(document).ready(function(){
    hideTables();
    populateTables();
    addVideos();
    addNewPositions();
    eventHandlers();
});