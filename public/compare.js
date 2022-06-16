let videoElmts = document.getElementsByClassName("tiktokDiv");

let reloadButtons = document.getElementsByClassName("reload");
let heartButtons = document.querySelectorAll("div.heart");
for (let i = 0; i < 2; i++) {
  let reload = reloadButtons[i];
  reload.addEventListener("click", function() { reloadVideo(videoElmts[i]) });
  heartButtons[i].classList.add("unloved");
} // for loop

// filed heart fas 
// holo heart far

let PrefData = {
  "better": "",
  "worse": ""
};

// Disable the next button by default
let nextButtonID = document.getElementById("nextButton");
nextButtonID.disabled = true;

let iconClass = document.getElementsByClassName("icon");

let nickNameClass = document.getElementsByClassName("nickname");

for (let i = 0; i < 2; i++) {
  resetHearts(); heartButtons[i].addEventListener("click", function() {
    resetHearts();
    // change heart to solic megenta 
    heartButtons[i].classList.remove("unloved");
    iconClass[i].classList.remove("far");
    iconClass[i].classList.add("fas");
//
  
    // set better video
    PrefData.better = returnedTwoVideoes[i].rowIdNum;
    
    // enble the next button 
    nextButtonID.removeAttribute("disabled");
    nextButtonID.classList.remove("disabledButton");
    nextButtonID.classList.add("enabledButton");
    // set worse video
    if (i == 1) {
      PrefData.worse = returnedTwoVideoes[0].rowIdNum;
    } else {
      PrefData.worse = returnedTwoVideoes[1].rowIdNum;
    }

  });
}

function resetHearts() {
  for (let i = 0; i < 2; i++) {
    heartButtons[i].classList.add("unloved");
    iconClass[i].classList.add("far");
  }
}

let returnedTwoVideoes = [];

// This get request returns two json objects from the database, then pass their urls to the video tag 
sendGetRequest("/getTwoVideos")
  .then(function(response) {
    // on success, if response is pick winner, go to winner page
    if (response == 'pick winner') {
      window.location = "winner.html";
    }
    // else reload compare page and show the two videos from response 
    returnedTwoVideoes = response;
    for (let i = 0; i < 2; i++) {
      addVideo(response[i].url, videoElmts[i]);
      nickNameClass[i].textContent = returnedTwoVideoes[i].nickname;
    }
    // load the videos after the names are pasted in! 
    loadTheVideos();

  })
  .catch(function(err) {
    console.log("Receive /getTwoVideos response failed ", err);
  });


// Next button 

// sends the prefData to PrefTable by /inserPref post request
let nextButton = document.getElementById("nextButton");
nextButton.addEventListener("click", function() {
  try {
    sendPostRequest("/insertPref", PrefData)
      .then(function(response) {
        // on sucess , redirect to winner page if receive "pick winner"
        if (response == "pick winner") {
          window.location = "winner.html";
        } else { // otherwise reload the page to get two new videos
          window.location.reload();
        }
      })
      .catch(function(err) {
        console.log("Receive response failed ", err);
      });
  }
  catch (error) {
    console.log("Next error ", error)
  }

});