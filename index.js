// index.js
// This is our main server file
// A static server using Node and Express
const express = require("express");
// gets data out of HTTP request body 
// and attaches it to the request object
const app = express();
const bodyParser = require('body-parser');
// create object to interface with express
/////////////////////////////////////
// CALLING sqlWRAP and create the db
const fetch = require("cross-fetch");
// get Promise-based interface to sqlite3
const db = require('./sqlWrap');
// this also sets up the database
/////////////////////////////////////
// print info about incoming HTTP request 
// for debugging


/* might be a useful function when picking random videos */
function getRandomInt(max) {
  let n = Math.floor(Math.random() * max);
  // console.log(n);
  return n;
}


app.use(function(req, res, next) {
  console.log(req.method,req.url);
  next();
});

app.use(express.text());
// make all the files in 'public' available 
app.use(express.static("public"));

app.use(bodyParser.json());
// Code in this section sets up an express pipeline

app.use(function(req, res, next) {
  console.log("body contains",req.body);
  next();
});


// if no file specified, return the main page
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/public/myVideos.html");
  // send back a list of names, then display them on my videos page
});

// "getTwoVideos picks two videos randomly from the database"
app.get("/getTwoVideos", async function(req, res) {
  console.log("getting two videos");
  try {
    // WRITE HERE  
    // 1. call getRandomInt to get two unique random integer 
    let element1 = getRandomInt(8);
    let element2 = getRandomInt(8);
    while (element1 == element2) {
      element2 = getRandomInt(8);
    }

    // 2. call the database to get the two entries
    let item1 = await getVideo(element1);
    let item2 = await getVideo(element2);
    let videoArray = [item1, item2];

    // 3. send it back to browser
    res.json(videoArray);

  } catch (err) {
    res.status(500).send(err);
  }
});



app.get("/getWinner", async function(req, res) {
  console.log("getting winner");
  try {
    // change parameter to "true" to get it to computer real winner based on PrefTable 
    // with parameter="false", it uses fake preferences data and gets a random result.
    // winner should contain the rowId of the winning video.
    let winner = await win.computeWinner(8, false);
    let winnerObject = await getUrlByRowID(winner);
    // send back the computed winner video object
    res.json(winnerObject);
  } catch (err) {
    res.status(500).send(err);
  }
});



app.post("/insertPref", async function(req, res) {
  console.log("got the /insertPref post\n");
  try {
    // parse the JSON body to Javascript Object type
    let info = req.body;
    // create a new object copied from request
    let vidObj = {
      "better": info.better,
      "worse": info.worse
    }
    // show user's choice
    console.log("User's choice: ",vidObj);
    
    // check the current PrefTable size and show it
    let checkTable = await allPrefTable();
    let tableSize = checkTable.length;
    console.log("There are ", tableSize, " entries in PrefTable");

    // if there's already 15 entries, send back "pick winner"
    if (tableSize == 15) {
      console.log("Can't Insert! PrefTable is full!");
      res.send("pick winner");
    } else { // otherwise insert the new entry and send back "continue"
      await insertVideo(vidObj);
      res.send("conitune");
    }
  } catch (err) {
    res.send(err);
  }
});



// Handles post requests form the browser to store videoData to the database
app.post("/videoData", async function(req, res){
  console.log("sending Response");
  // parse the JSON body to Javascript Object type
  let info = req.body;
  // create a new object to pass into insertVideo function
  let vidObj = {
    "url": info.TikTokURL ,
    "nickname": info.VideoNickname,
    "userid": info.Username,
    "flag": 1
  }
  
  let result = await dumpTable();
  if(result.length < 8){
    await updateFlag();
    await insertVideo(vidObj);
    res.send("Got Video");
  }
  else{
    res.send("database full");
    console.log("Database is full");
  }
})


// 11. Post request receives a nickname, then delete the row with that nickname on the database 

app.post("/deleteVideo", async function(req, res){
  console.log("Receied Delete request to delete rowIdNum = ", req.body);
  let receivedrowIdNum = req.body;
  await deleteRow(receivedrowIdNum);
  res.send("Row Deleted");
})

// "/getList Get request"
app.get("/getList", (request, response) => {
  // get the video with flag value of 1
    dumpTable()
    //getNameList()
    .then(function(result){ 
        console.log(result);     
        // send back response in JSON
        response.json(result);
    })
    .catch(function(err){
      console.log("dumpTable not responding ",err);
    });  
});

//6. get Request gets the most recently added video from database
//NEED TO TEST THIS 
app.get("/getMostRecent", (request, response) => {
  // get the video with flag value of 1
  getMostRecentVideo(1)
    .then(function(result){ 
        // send back response in JSON
        response.json(result);
    })
    .catch(function(err){
      console.log("No video with flag value 1", err)});  
});

// Need to add response if page not found!
app.use(function(req, res){
  res.status(404); res.type('txt'); 
  res.send('404 - File '+req.url+' not found'); 
});

// end of pipeline specification

// Now listen for HTTP requests
// it's an event listener on the server!
const listener = app.listen(3000, function () {
  console.log("The static server is listening on port " + listener.address().port);
});


// ******************************************** //
// Define async functions to perform the database 
// operations we need

// An async function to insert a video into the database
async function insertVideo(v) {
  try{
    const sql = "insert into VideoTable (url,nickname,userid,flag) values (?,?,?,TRUE)";

    await db.run(sql,[v.url, v.nickname, v.userid]);
  }
  catch(err){
    console.log(err);
  }
}

// an async function to get a video's database row by its nickname
async function getVideo(nickname) {
  try{
    // warning! You can only use ? to replace table data, not table name or column name.
    const sql = 'select * from VideoTable where nickname = ?';
  
    let result = await db.get(sql, [nickname]);
    return result;
  }
  catch(err){
    console.log(err);
  }
}

// an async function to get the whole contents of the database 
async function dumpTable() {
  try{ 
    const sql = "select * from VideoTable";
    
    let result = await db.all(sql);
    return result;
  }
  catch(err){
    console.log(err);
  }
}

// an async function to get a video if the flag is 1
async function getMostRecentVideo(flag) {
  try{
    // warning! You can only use ? to replace table data, not table name or column name.
    const sql = 'select * from VideoTable where flag = ?';
    let result = await db.get(sql, [flag]);
    
    return result;
  }
  catch(err){
    console.log(err);
  }
}

// An async function to change the flag to False
async function updateFlag() {
  try{  
    const sql = "update VideoTable set flag = 0 where flag = 1";
  
    await db.run(sql);
  }
  catch(err){
    console.log(err);
  }
}


// an async function to list of the nicknames from database
async function getNameList() {
  try{
    // warning! You can only use ? to replace table data, not table name or column name.
    const sql = 'select nickname from VideoTable ';
    let result = await db.all(sql);
    
    return result;
  }
  catch(err){
    console.log(err);
  }
}


// async delete function to delete an row on the database based on the name
async function deleteRow(rowId) {
  try{
    const sql = 'delete from VideoTable where rowIdNum = ?';
    await db.run(sql, [rowId]);
    await db.run("vacuum"); // cleanup videos.db
    console.log("Deleted row: ", rowId);
  }
  catch(err){
    console.log(err);
  }
}

/////////////////////////////////////////////////////////////////
//SQL functions 
// getting video from VideoTable by the order number, NOT rowIDNUm
async function getVideo(eleNum) {
  try {
    const sql = 'select * from VideoTable';
    let result = await db.all(sql);
    return result[eleNum];
  }
  catch (err) {
    console.log(err);
  }
}

// insert an entry to PrefTable
async function insertVideo(v) {
  try {
    const sql = "insert into PrefTable (better,worse) values (?,?)";
    await db.run(sql, [v.better, v.worse]);
    console.log("Inserting to the Database Now");
  }
  catch (err) {
    console.log(err);
  }
}

// // print PrefTable
//allPrefTable();

// allPrefTable returns the entire table on sucess
async function allPrefTable() {
  try {
    // make the SQL command
    let cmd = " SELECT * FROM PrefTable";
    let result = await db.all(cmd);
    //console.log("Print PrefTable: \n", result);
    return result;
  }
  catch (err) {
    console.log(err);
  }
}

// getting video by RowID number
async function getUrlByRowID(num) {
  try {
    const sql = 'select * from VideoTable where rowIdNum = ?';
    let result = await db.get(sql, [num]);
    return result;
  }
  catch (err) {
    console.log(err);
  }
}

























