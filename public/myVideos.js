
let addNewButton = document.getElementById("addNew");
let playGameButton = document.getElementById("playGame");

addNewButton.addEventListener("click", function(){
  window.location = "tiktokpets.html"; 
});

// send GET request
async function sendGetRequest(url) {
  params = {
    method: 'GET', 
    headers: {'Content-Type': 'application/json'}};
    console.log("about to send get request");
  
  let response = await fetch(url,params);
  if (response.ok) {
    let data = await response.json(); 
    return data;
  } else {
    throw Error(response.status);
  }
}

async function sendPostDeleteRequest(url,data) {
  params = {
    method: 'POST', 
    headers: {'Content-Type': 'text/plain'},
    body: data };
    console.log("about to send post delete request");
  
  let response = await fetch(url,params);
  if (response.ok) {
    let data = await response.text();
    return data;
  } else {
    throw Error(response.status);
  }
}

let names = document.getElementsByClassName("videoName");
let boxes = document.getElementsByClassName("videoNameBox"); //change border from dashed to solid
let deleteButtons = document.getElementsByClassName("delete");

async function setNames(){
  let nameList = await sendGetRequest("/getList");

  //disable playGameButton if < 8 elements, if =8 elements disable addNewButton
  if (nameList.length < 8){
    playGameButton.disabled = true;
    addNewButton.disabled = false;
    console.log("playGameButton.disabled = ",playGameButton.disabled);
  }
  else if (nameList.length == 8){
    addNewButton.disabled = true;
    playGameButton.disabled = false;
    console.log("addNewButton.disabled = ",addNewButton.disabled);
  }
  
  // for loop passing the nickname from the object to textboxes
  for (let i = 0; i < 8; i++){
    if(i < nameList.length){  // filled slots
      names[i].textContent = nameList[i].nickname;
      boxes[i].style.border = "2px solid lightgray"; //change border to solid
      deleteButtons[i].disabled = false;
    }
    else{ //empty slots
      names[i].textContent = "";
      boxes[i].style.border = "2px dashed lightgray"; 
      deleteButtons[i].disabled = true;
    }
  }
}

// get the entire table from the server, then pass them to the text boxes
setNames();

// set event listeners for delete buttons
for (let i = 0; i < 8; i++){
  deleteButtons[i].addEventListener("click", function(){ deletePress(i); });
}

// action for delte button pressed
async function deletePress(index){
  let dataList = await sendGetRequest("/getList");

  //deletes ROW using the corresponding unique rowIdNum instead of videoName so if two videos have the same nickname, it doesn't delete both entries
  sendPostDeleteRequest('/deleteVideo',dataList[index].rowIdNum)
    .then(function(){
      setNames();
      console.log("Video Deleted");
    })
    .catch(function(err){
      console.log("Delete Request Failed ",err);
    });
}
