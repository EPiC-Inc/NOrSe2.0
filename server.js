/// Dependencies - don't need to worry too much about these
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var url = require('url');
var fs = require('fs');
var stdin = process.openStdin();
//const { Client } = require('pg'); // for the database
/// End dependencies
/// Variables
var commands = require('./commands.js');
var authList = require('./users.json');
var rooms = require('./rooms.json');
var configs = require('./configs.json');
var roomKeys = require('./invite_codes.json');

// create a db connection client
/*
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});
*/

var users = {};
/// End vars

/// Functions
// Send a query to the database
/*
global.dbrep = '';
function queryDB(command) {
  client.connect();

  client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
    dbrep = 'error';
    if (err) {console.log("database error: "+err);res = {rows:[]};};
    for (let row of res.rows) {
      console.log(JSON.stringify(row));
    }
    dbrep = res.rows;
    client.end();
  });
  return dbrep;
}*/

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
    roomMsgs = rooms[room].messages;
    if (roomMsgs.length < 40) {
      roomMsgs.push(msg);
    } else {
      roomMsgs.splice(0, 1);
      roomMsgs.push(msg);
    }
    //saveJSON('rooms.json', rooms);
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
  var port = process.env.PORT || 80;
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
  users[socket.id] = {
    name: '',
    room: ''
  }
  /// End connection startup scripts
  socket.on('disconnect', function(){
    delete users[socket.id];
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
    } else if (authList[user]) {
      io.to(socket.id).emit('err', 'Incorrect password');
    } else if(user.toLowerCase() == configs.superuser.toLowerCase()) {
      if (pass == configs.superuserpassword) {
        io.to(socket.id).emit('a-ok', configs.superuser);
      } else {
        io.to(socket.id).emit('err', 'Incorrect password');
      }
    } else {
      io.to(socket.id).emit('err', "Username not found");
    }
  });

  socket.on('subauth', function(data){
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
    } else if (authList[user]) {
      io.to(socket.id).emit('return to whence you came');
    } else if(user.toLowerCase() == configs.superuser.toLowerCase()) {
      if (pass == configs.superuserpassword) {
        io.to(socket.id).emit('a-ok', configs.superuser);
      } else {
        io.to(socket.id).emit('return to whence you came');
      }
    } else {
      io.to(socket.id).emit('return to whence you came');
    }
  });

  socket.on('get rooms', function(data){
    if (authList[data]) {
      rep = [];
      for (i in authList[data]['rooms']) {
        room = authList[data]['rooms'][i];
        if (rooms[room]) {
          rep.push([room, rooms[room].name]);
        }
      }
      io.to(socket.id).emit('user rooms', rep);
    } else if (data == configs.superuser) {
      rep = [];
      for (room in rooms) {
        rep.push([room, rooms[room].name]);
      }
      io.to(socket.id).emit('user rooms', rep);
    }
  });

  socket.on('get users', function(){
    currentRoom = users[socket.id].room;
    rep = [];
    for (id in users){
      if (users[id].room == currentRoom) {
        rep.push(users[id].name);
      }
    }
    io.to(socket.id).emit('users online', rep);
  });

  socket.on('room settings', function(){
    if (users[socket.id] && users[socket.id].room && rooms[users[socket.id].room]) {
      userRoom = rooms[users[socket.id].room]
      if (userRoom.owner == users[socket.id].name) {
        // allow access
        rep = "{error}";
        for (key in roomKeys) {
          if (roomKeys[key] == users[socket.id].room) {
            rep = key;
            break
          }
        }
        io.to(socket.id).emit('settings confirm', [0, [rep]]);//todo
      } else {
        // disallow
        io.to(socket.id).emit('settings confirm', [1, "Sorry, you need to be the owner to change room settings."]);
      }
    } else {
      io.to(socket.id).emit('settings confirm', [1, "Sorry, You don't appear to be in a room!"]);
    }
  });

  socket.on('reroll room key', function(){
    if (users[socket.id] && users[socket.id].room && rooms[users[socket.id].room]) {
      userRoom = rooms[users[socket.id].room]
      if (userRoom.owner == users[socket.id].name) {
        // reroll key
        for (key in roomKeys) {
          if (roomKeys[key] == users[socket.id].room) {
            delete roomKeys[key];
            break
          }
        }
        roomKey = Math.random().toString(36).substring(2, 8);
        while (roomKeys[roomKey]) {
          roomKey = Math.random().toString(36).substring(2, 8);
        }
        roomKeys[roomKey] = users[socket.id].room;
        saveJSON('invite_codes.json', roomKeys);
        io.to(socket.id).emit('settings confirm', [0, [roomKey]]);//todo
      }
    }
  });

  socket.on('add room', function(data){
    {
    if (users[socket.id] && users[socket.id].name && ! (users[socket.id].name == configs.superuser)) {
      username = users[socket.id].name;
      roomUID = roomKeys[data];
      if (roomUID) {
        if (! authList[username].rooms.includes(roomUID)) {
          authList[username].rooms.push(roomUID);
          saveJSON('users.json', authList);
          io.to(socket.id).emit('err', "<span style='color:blue'>Success!</span>");
          if (users[socket.id].room) {
            socket.leave(users[socket.id].room);
          }
          users[socket.id].room = roomUID;
          socket.join(roomUID);
          io.to(socket.id).emit('connected', [rooms[roomUID].name, roomUID, rooms[roomUID].messages]);
        } else {
          io.to(socket.id).emit('err', "Already joined");
        }
      } else {
        io.to(socket.id).emit('err', "Invalid key");
      }
    } else {
      io.to(socket.id).emit('err', "{error}");
    }
    }
  });

  socket.on('new room', function(data){
    username = data[0];
    roomname = data[1];
    roomUID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    while (rooms[roomUID]) {
      roomUID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    roomKey = Math.random().toString(36).substring(2, 8);
    while (roomKeys[roomKey]) {
      roomKey = Math.random().toString(36).substring(2, 8);
    }
    rooms[roomUID] = {
      "admins":[],
      "blacklist":[],
      "messages":[],
      "name":roomname,
      "owner":username
    };

    roomKeys[roomKey] = roomUID;
    if (username !== configs.superuser) {
      authList[username].rooms.push(roomUID);
    }
    saveJSON('rooms.json', rooms);
    saveJSON('invite_codes.json', roomKeys);
    saveJSON('users.json', authList);
    if (users[socket.id].room) {
      socket.leave(users[socket.id].room);
    }
    users[socket.id].room = roomUID;
    socket.join(roomUID);
    io.to(socket.id).emit('connected', [rooms[roomUID].name, roomUID, rooms[roomUID].messages]);
  });

  socket.on('join', function(data){
    // Code for joining a room
    username = data[0];
    roomname = data[1];
    if (!(roomname && rooms[roomname])) {
      // haha error catching
    } else {
      if (users[socket.id].room) {
        socket.leave(users[socket.id].room);
      }
      users[socket.id].name = username;
      users[socket.id].room = roomname;
      socket.join(roomname);
      io.to(socket.id).emit('connected', [rooms[roomname].name, roomname, rooms[roomname].messages]);
    }
  });

  socket.on('new user', function(data){
    user = data[0];
    pass = data[1];
    joincode_attempt = data[2];
    joincode = configs['joincode'];
    //console.log(joincode_attempt);
    //console.log(configs);

    if (!(user) || pass == 1) {
      io.to(socket.id).emit('err', "Username / Password can\'t be blank!");
    }
    else if (authList[user] || user.toLowerCase() == configs.superuser.toLowerCase()) {
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
          'role':0, /* 0 = normal users, 1 = helper, 2 = admin, 3 = dev (note: 4 would be superuser but only one acct can have it) */
          'rooms':['lobby']
        }
        saveJSON('users.json', authList);
        io.to(socket.id).emit('a-ok', user)
      }
    } else {
      io.to(socket.id).emit('err', '>.>');
    }
  });

  socket.on('password change', function(data){
    user = data[0];
    oldPass = data[1];
    newPass = data[2];
    if (authList[user] && authList[user].password == oldPass) {
      authList[user].password = newPass;
      io.to(socket.id).emit('err', "<span style='color:blue;'>Password Changed!</span>");
      io.to(socket.id).emit('a-ok');
      saveJSON('users.json', authList);
    } else {
      io.to(socket.id).emit('err', 'Either you don\'t exist or your old password is incorrect.');
    }
  });

  socket.on('username change', function(data){
    oldUser = data[0];
    newUser = data[1];
    if (authList[oldUser] && !(authList[newUser])) {
      authList[newUser] = authList[oldUser];
      delete authList[oldUser];
      io.to(socket.id).emit('err', "<span style='color:blue;'>Username Changed!</span>");
      io.to(socket.id).emit('a-ok');
      saveJSON('users.json', authList);
    } else if (authList[newUser]) {
      io.to(socket.id).emit('err', "That username's already been taken.");
    } else {
      io.to(socket.id).emit('err', "an error occured");
    }
  });

  socket.on('get profile', function(data){
    rep = 'error';
    if (data == configs.superuser) {
      rep = {
        uName: configs.superuser,
        uRole: 4
      };
    } else if (authList[data]) {
      uData = authList[data];
      rep = {
        uName: data,
        uRole: uData.role
      };
    }
    if (users[socket.id].name == configs.superuser) {
      selfRole = 4;
    } else {
      selfRole = authList[users[socket.id].name].role;
    }
    socket.emit('user profile', [selfRole, rep]);
  });

  /// MESSAGES
  socket.on('message', function(data){
    if (users[socket.id] && users[socket.id].room) {
      // mebbe add encryption
      senderName = users[socket.id].name;
      senderName = senderName.split('>').join('&gt;').split('<').join('&lt;');
      if (senderName == configs.superuser) {
        senderRank = 4;
      } else if (rooms[users[socket.id].room].owner == senderName) {
        senderRank = 2;
      } else {
        senderRank = authList[senderName].role;
      }

      data = data.split('>').join('&gt;').split('<').join('&lt;'); // lol
      packet = {
        rank: senderRank,
        sender: senderName,
        content: data
      };
      io.to(users[socket.id].room).emit('message', packet);
      saveMessage(packet, users[socket.id].room);
    }
  });
});
/// End socketio

/// Start the server

http.listen(port, function(){
  console.log('Listening on port:'+port);
});

// test
//console.log(queryDB('select * from Users'));
/// And that's it.
