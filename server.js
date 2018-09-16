// Refactored version of server.js

/// Dependencies - don't need to worry too much about these
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var url = require('url');
var fs = require('fs');
var stdin = process.openStdin();
/// End dependencies

/// Variables
var commands = require('./commands.js');
var authList = require('./users.json');
var rooms = require('./rooms.json');
var configs = require('./configs.json');

var users = {};
/// End vars

/// Functions
// Save a json object to a file
function saveJSON(filename, data, successCallback=function(){}, failCallback=function(){console.log('error writing to file')}) {
  var content = JSON.stringify(data);
  fs.writeFile(filename, content, 'utf8', function (err) {
    if (err) {
      failCallback();
    } else {
      successCallback();
    }
  });
}

// Save a message to a room
function saveMessage(msg, room='lobby') {
  if (rooms[room]) {
    roomMsgs = rooms[room]['messages'];
    if (roomMsgs.length > 20) {
      roomMsgs.push(msg);
    } else {
      roomMsgs.splice(0, 1);
      roomMsgs.push(msg);
    }
    saveJSON('rooms.json', rooms);
  }
}

// Create a Date object to the computer's time
var toLocalTime = function() {
  var d = new Date();
  var offset = (new Date().getTimezoneOffset() / 60) * -1;
  var n = new Date(d.getTime() + offset);
  return n;
};
/// End functions

/// Upon server startup
// Set the port (node server.js [port])
// process.argv : 0:program 1:file 2:(in this case)port
if (process.argv[2] == undefined) {
  var port = 8080;
} else {
  var port = process.argv[2]; // Use node server.js [port]
}

// Msg sender thru console
/*
stdin.addListener("data", function(d) {
  datetimestring = toLocalTime().toLocaleString() ///datetime
  packet = "<span style='background:cyan;'><span class='alert'>SERVER ALERT</span> > "+d.toString().trim()+"</span>";
  msg = Buffer.from(packet).toString('base64');
  io.emit("message", [datetimestring, msg]);
  saveMessage([datetimestring, msg]);
});
*/
/// End startup stuff

/// Routing
app.use('/', express.static(__dirname + '/html'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/html/index.html');
});

app.get('/googleb7532997be74f84b.html', function(req, res){
  res.sendFile(__dirname + '/googleb7532997be74f84b.html');
});

app.use(function(req, res) {
  res.sendFile(__dirname + '/html/404.html', 404);
});
/// End routing

/// Socketio events
io.on('connection', function(socket){
  /// Anything done upon establishing a connection
  //console.log('conn');
  /// End connection startup scripts
  socket.on('disconnect', function(){
    
  });

  socket.on('auth', function(data){
    /*console.log(data);
    console.log(authList);*/
    user = data[0];
    pass = data[1];
    for (stored_user in authList) {
      //console.log(stored_user, user);
      if (stored_user.toLowerCase() == user.toLowerCase()) {
        user = stored_user;
      }
    }
    if (authList[user] && authList[user]['password'] == pass) {
      io.to(socket.id).emit('a-ok', user);
    } else if (authList[data[0]]) {
      io.to(socket.id).emit('err', 'Incorrect password');
    } else {
      io.to(socket.id).emit('err', "Username not found");
    }
  });

  socket.on('new user', function(data){
    user = data[0];
    pass = data[1];
    joincode_attempt = data[2];
    joincode = configs['joincode'];
    //console.log(joincode_attempt);
    //console.log(configs);

    if (!(user && pass)) {
      io.to(socket.id).emit('err', "Username / Password can\'t be blank!");
    }
    else if (authList[user]) {
      io.to(socket.id).emit('err', "Error: Username already in use!");
    }

    else if (joincode_attempt === joincode) {
      /// SUCCESS..?
      is_taken = false
      for (stored_user in authList) {
        //console.log(stored_user, user);
        if (stored_user.toLowerCase() == data[0].toLowerCase()) {
          io.to(socket.id).emit('err', "Error: Username already in use!");
          is_taken = true
        }
      }

      if (!is_taken) {
        authList[user] = {
          'password':pass,
          'nameStyle':'',
          'rooms':[]
        }
        saveJSON('users.json', authList);
        io.to(socket.id).emit('a-ok', user)
      }
    } else {
      io.to(socket.id).emit('err', '>.>');
    }
  });

  socket.on('message', function(data){
    io.emit('message', data)
  });
});
/// End socketio

/// Start the server
/*
http.listen(port, function(){
  console.log('Listening on port:'+port);
});*/
/// And that's it.