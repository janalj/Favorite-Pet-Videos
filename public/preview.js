let reloadButton = document.getElementById("replayButton");
let videoDiv = document.getElementById("video");
let continueButton = document.getElementById("continue");

continueButton.addEventListener("click", function(){
  window.location = "myVideos.html"; 
});

//reload video when reload button is clicked
reloadButton.addEventListener("click",reloadVideo);

// send GET request
async function sendGetRequest(url) {
  params = {
    method: 'GET', 
    headers: {'Content-Type': 'application/json'}};
  console.log("about to send get request");
  
  let response = await fetch(url,params);
  if (response.ok) {
    let data = await response.text();
    return data;
  } else {
    throw Error(response.status);
  }
}


let videoCaption = document.getElementById("videoName");
//send Get request to get most recent video for preview
let url; //most recent url
sendGetRequest("/getMostRecent")
  .then(function(response){
    let videoName = JSON.parse(response).nickname;
    url = JSON.parse(response).url;
    console.log("URL recieved: ", url);

    // set video nickname as caption
    videoCaption.textContent = videoName; 
    // add the blockquote element that TikTok wants to load the video into
    addVideo(url,videoDiv);
    // on start-up, load the videos
    loadTheVideos();
  })
  .catch(function(err){
    console.log("GET request error:", err);
  });

////////////////////////// Video Preview Stuff ///////////////////////////

// Add the blockquote element that tiktok will load the video into
async function addVideo(tiktokurl,divElmt) {

  let videoNumber = tiktokurl.split("video/")[1];

  let block = document.createElement('blockquote');
  block.className = "tiktok-embed";
  block.cite = tiktokurl;
  // have to be formal for attribute with dashes
  block.setAttribute("data-video-id",videoNumber);
  block.style = "width: 325px; height: 563px;"

  let section = document.createElement('section');
  block.appendChild(section);
  
  divElmt.appendChild(block);
}

// Ye olde JSONP trick; to run the script, attach it to the body
function loadTheVideos() {
  body = document.body;
  script = newTikTokScript();
  body.appendChild(script);
}

// makes a script node which loads the TikTok embed script
function newTikTokScript() {
  let script = document.createElement("script");
  script.src = "https://www.tiktok.com/embed.js"
  script.id = "tiktokScript"
  return script;
}

// the reload button; takes out the blockquote and the scripts, and puts it all back in again.
// the browser thinks it's a new video and reloads it
function reloadVideo () {
  
  // get the two blockquotes
  let blockquotes = document.getElementsByClassName("tiktok-embed");

  // and remove the indicated one
    block = blockquotes[0];
    console.log("block",block);
    let parent = block.parentNode;
    parent.removeChild(block);

  // remove both the script we put in and the
  // one tiktok adds in
  let script1 = document.getElementById("tiktokScript");
  let script2 = script.nextElementSibling;

  let body = document.body; 
  body.removeChild(script1);
  body.removeChild(script2);

  addVideo(url,videoDiv);
  loadTheVideos();
}
      