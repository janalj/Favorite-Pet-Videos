// when this page is opened, get the most recently added video and show it.
// function is defined in video.js
let divElmt = document.getElementById("tiktokDiv");

let reloadButton = document.getElementById("reload");
// set up button to reload video in "tiktokDiv"
reloadButton.addEventListener("click",function () {
  reloadVideo(tiktokDiv);
});


// always shows the same hard-coded video.  You'll need to get the server to 
// compute the winner, by sending a 
// GET request to /getWinner,
// and send the result back in the HTTP response.

// once winner.html page gets loaded, send the '/getWinner' get request

let winnerNickname = document.getElementById("WinnerNickname");

sendGetRequest("/getWinner")
  .then(
    // on sucess, show the returned winner video
  function(response){
    // add video nickname
    winnerNickname.textContent = response.nickname;
    console.log(response.nickname);
    // pass the url to load the winner video 
    addVideo(response.url, divElmt);
    loadTheVideos();    
  })
   .catch(function(err) {
    console.log("SendGetRequest /getWinner error ", err);
  });