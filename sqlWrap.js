/* Wraps sqlite commands get,use, and all, so that they use Promises, and can be used with async-await */

/* Also creates the database; you will need to configure it here */

'use strict'

const sql = require('sqlite3');
const util = require('util');


// old-fashioned database creation code 

// creates a new database object, not a 
// new database. 
const db = new sql.Database("videos.db");

// wrap all database commands in promises
db.run = util.promisify(db.run);
db.get = util.promisify(db.get);
db.all = util.promisify(db.all);


// check if database exists
let cmd = " SELECT name FROM sqlite_master WHERE type='table' AND name='VideoTable' ";

db.get(cmd, function (err, val) {
  if (val == undefined) {
        console.log("No database file - creating one");
        createVideoTable();
  } else {
        console.log("Database file found");
  }
});


// initialize database tables if necessary
initTables()
  .catch(function(err) {
    console.log("database table creation error", err);
  });

async function initTables () {
  
  let result1 =  await checkIfThere("VideoTable");
  if (!result1) {
    console.log("Creating video table");
    await createVideoTable();
  }

  let result2 = await checkIfThere("PrefTable");
  if (!result2) {
    console.log("Creating preferences table");
    await createPrefTable();
  } else {
    // clean out any old data
    // initialize table deletes everything on the Prefs Table
    await deleteEverythingPrefs();
  }
}


async function checkIfThere(table) {
console.log("checking for",table);
// make the SQL command
let cmd = " SELECT name FROM sqlite_master WHERE type='table' AND name = ? ";
let result = await db.get(cmd,[table]);
if (result == undefined) { return false;} 
else { return true; }
}





// called to create table if needed
function createVideoTable() {
  // explicitly declaring the rowIdNum protects rowids from changing if the 
  // table is compacted; not an issue here, but good practice
  const cmd = 'CREATE TABLE VideoTable (rowIdNum INTEGER PRIMARY KEY, url TEXT, nickname TEXT, userid TEXT, flag INTEGER)';
  db.run(cmd, function(err, val) {
    if (err) {
      console.log("Database creation failure",err.message);
    } else {
      console.log("Created database");
    }
  });
}


async function createPrefTable() {
  // explicitly declaring the rowIdNum protects rowids from changing if the 
  // table is compacted; not an issue here, but good practice
const cmd = 'CREATE TABLE PrefTable (rowIdNum INTEGER PRIMARY KEY, better INTEGER, worse INTEGER)';
  
await db.run(cmd);
console.log("made PrefTable");
// error will be caught in initTables
}

// empty all data from PrefTable
async function deleteEverythingPrefs () {
  await db.run("delete from PrefTable");
  // vacuum is an SQL command, kind of garbage collection
  await db.run("vacuum");
}






// allow code in other server .js files to use the db object
module.exports = db;





// empty all data from db
db.deleteEverything = async function() {
  await db.run("delete from VideoTable");
  // vacuum is an SQL command
  await db.run("vacuum");
}




// function call to delete everything
//db.deleteEverything();