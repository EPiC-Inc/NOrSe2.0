var socket = io();

var msgSender = document.getElementById('msgSender');
var username = '';
var roomname = '';
var online = true;
var alertWaiting = false;

var roomButton1 = '<button style=\'margin-top:8px;\' onclick=\'socket.emit("join", ["' // + username
var roomButton2 = '", "' // + room ID
var roomButton3 = '"]);\'>' // + room name
var roomButton4 = '</button>'

function openMenu() {
  document.getElementById("other_stuff").style.right = '0';
}
function openUsers() {
  socket.emit('get users');
  document.getElementById("usersNav").style.right = "0";
}
function openSettings() {
  socket.emit('room settings');
  document.getElementById("settingsNav").style.right = "0";
}
function openRooms() {
  socket.emit('get rooms', username);
  document.getElementById("roomsNav").style.right = "0";
}
function openJoin() {
  document.getElementById("join_room").style.right = "0";
}
function openCreate() {
  document.getElementById("createNav").style.right = "0";
}
function openUser(userToShow) {
  socket.emit('get profile', userToShow);
  document.getElementById("profileNav").style.right = "0";
}
function closeNav() {
  document.getElementById("other_stuff").style.right = '-255px';
  document.getElementById("usersNav").style.right = "-255px";
  document.getElementById("settingsNav").style.right = "-255px";
  document.getElementById("roomsNav").style.right = "-255px";
  document.getElementById("join_room").style.right = "-255px";
  document.getElementById("createNav").style.right = "-255px";
  document.getElementById("profileNav").style.right = "-255px";
  document.getElementById("msgSender").focus();
}

function createRoom() {
  roomName = document.getElementById('createRoomName').value;
  socket.emit('new room', [username, roomName]);
}

function formatMessage(packet) {
  msgIcon = '';
  if (packet.rank == 4) {
    msgIcon = '<img src="img/superuser.png">';
  } else if (packet.rank == 3) {
    msgIcon = '<img src="img/dev.png">';
  } else if (packet.rank == 2) {
    msgIcon = '<img src="img/admin.png">';
  } else if (packet.rank == 1) {
    msgIcon = '<img src="img/helper.png">'
  }
  msg = "["+msgIcon+"<a class='name' href='javascript:void(0);' onclick='openUser(\""+packet.sender+"\")'>"+packet.sender+'</a>] '+packet.content;
  if (!alertWaiting) {
    if (!vis()) {changeIco('msg.png');}
  }
  start = "<div class='msg'>";
  if (msg.includes('@'+username) || msg.includes('@everyone')) {
    if (!vis()) {changeIco('alert.png');}
    alertWaiting = true;
    start = '<div class="alert msg">';
  }
  msg = cUrl(msg);
  $("#msgs").append(start+msg+"</div>");
}

function cUrl(str) {
	var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	var text1=str.replace(exp, "<a href='$1' target='_blank'>$1</a>");
	var exp2 =/(^|[^\/])(www\.[\S]+(\b|$))/gim;
	return text1.replace(exp2, '$1<a target="_blank" href="http://$2">$2</a>');
}

function changeIco(ref) {
    var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = './img/'+ref;
    document.getElementsByTagName('head')[0].appendChild(link);
}
// See if the page is visible (for favicon changing)
var vis = (function(){
    var stateKey, eventKey, keys = {
        hidden: "visibilitychange",
        webkitHidden: "webkitvisibilitychange",
        mozHidden: "mozvisibilitychange",
        msHidden: "msvisibilitychange"
    };
    for (stateKey in keys) {
        if (stateKey in document) {
            eventKey = keys[stateKey];
            break;
        }
    }
    return function(c) {
        if (c) document.addEventListener(eventKey, c);
        return !document[stateKey];
    }
})();

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

var rmCookie = function(name) {
  document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function joinRoom() {
  roomkey = document.getElementById('roomkey').value;
  socket.emit('add room', roomkey);
}

function sendMsg(msg) {
  if (msgSender.value.trim() !== '') {
    socket.emit('message', msgSender.value.substring(0, 500));
    msgSender.value = '';
  }
}

function logout() {
  rmCookie('username');
  rmCookie('key');
  window.location.replace("/index.html");
}

if (getCookie("username")) {
  username = getCookie("username");
  document.getElementById('username').innerHTML = username;
  password = getCookie("key");
  socket.emit('subauth', [username, password]);
} else {
  window.location.replace("/login.html");
}

changeIco('disconnect.png');
socket.emit('join', [username, 'lobby']);

// Callbacks
vis(function(){
    if (vis()) {changeIco('favicon.png');
                alertWaiting = false;}
    //changeIco(vis() ? '/static/favicon.png' : '/static/alert.png');
});

socket.on('user rooms', function(data){
  document.getElementById('rooms').innerHTML = ''
  for (i in data) {
    room = data[i];
    buttonPacket = roomButton1 + username + roomButton2 + room[0] + roomButton3 + room[1] + roomButton4 + "<br>";
    document.getElementById('rooms').innerHTML += buttonPacket;
    console.log(buttonPacket);
  }
});

socket.on('connected', function(data){
  closeNav();
  roomname = data[0];
  roomid = data[1];
  pastmsgs = data[2];
  document.getElementById('msgs').innerHTML = '';
  for (i in pastmsgs) {
    formatMessage(pastmsgs[i]);
  }
  window.scrollTo(0,document.body.scrollHeight);
  console.log('connected to '+data);
  changeIco('favicon.png');
  document.getElementById('roomname').innerHTML = roomname;
  document.getElementById('roomid').innerHTML = roomid;
});

socket.on('err', function(data){
  document.getElementById('err').innerHTML = data;
});

socket.on('message', function(data){
  formatMessage(data);
  window.scrollTo(0,document.body.scrollHeight);
});

socket.on('return to whence you came', function(){
  window.location.replace("/login.html");
});

socket.on('users online', function(data){
  document.getElementById('users').innerHTML = '';
  for (i in data) {
    tempUser = data[i];
    $("#users").append("<a style='padding-top:4px;padding-bottom:4px;' href='javascript:void(0);' onclick='document.getElementById(\"msgSender\").value += \"@"+tempUser+"\";closeNav();'>"+tempUser+"</a><br>");
  }
});

socket.on('settings confirm', function(data){
  //console.log(data);
  document.getElementById("settings").innerHTML = ''
  if (data[0] == 1) {
    document.getElementById("settings").innerHTML += "<br><span>"+data[1]+"</span>";
  } else {
    // format settings, put them in settings
    dataPak = data[1];
    settingsPacket1 = "<br><span>Room:</span>"+roomname+"</span><br><br>";
    settingsPacket2 = "<span>Join Key:</span><br><br><span>"+dataPak+"</span><br><br><button onclick='socket.emit(\"reroll room key\");'>Reroll</button>";
    document.getElementById("settings").innerHTML += settingsPacket1 + settingsPacket2;
  }
});

socket.on('user profile', function(data){
  selfRole = data[0];
  data = data[1];
  profilePacket = "<span>Username:</span><br><span>"+data.uName+"</span><br><br>";
  
  if (selfRole == 2 || selfRole == 3 || selfRole == 4) { /* if you're admin or dev or superuser */
    profilePacket += "<span>Actions:</span><br>";
    profilePacket += "<a href='javascript:void(0);' onclick=''>Promote</a><br>";
    profilePacket += "<a href='javascript:void(0);' onclick=''>Kick from room</a><br>";
    profilePacket += "<a href='javascript:void(0);' onclick=''>Ban from room</a><br>";
    profilePacket += "<a href='javascript:void(0);' onclick=''>Send message</a><br>";
  }
  document.getElementById("profile").innerHTML = profilePacket;
});

socket.on("disconnect", function(reason){
  if (online) {
    online = false;
    $("#msgs").append("<div class='msg'>! Connection terminated. !</div>");
    window.scrollTo(0,document.body.scrollHeight);
  	changeIco('disconnect.png');
    document.getElementById('roomname').innerHTML = '-';
    document.getElementById('roomid').innerHTML = 'disconnected';
    console.log(reason);
  }
});
