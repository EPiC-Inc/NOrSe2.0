var socket = io();

var msgSender = document.getElementById('msgSender');
var username = '';
var roomname = '';
var online = true;

var roomButton1 = '<button style=\'margin-top:8px;\' onclick=\'socket.emit("join", ["' // + username
var roomButton2 = '", "' // + room ID
var roomButton3 = '"]);closeNav();\'>' // + room name
var roomButton4 = '</button>'

function openMenu() {
  document.getElementById("other_stuff").style.right = '0';
}
function openUsers() {
  document.getElementById("users").style.right = "0";
}
function openSettings() {
  socket.emit('room settings');
  document.getElementById("settings").style.right = "0";
}
function openRooms() {
  document.getElementById("rooms").style.right = "0";
}
function openJoin() {
  document.getElementById("join_room").style.right = "0";
}
function closeNav() {
  document.getElementById("other_stuff").style.right = '-255px';
  document.getElementById("users").style.right = "-255px";
  document.getElementById("settings").style.right = "-255px";
  document.getElementById("rooms").style.right = "-255px";
  document.getElementById("join_room").style.right = "-255px";
  document.getElementById("msgSender").focus();
}

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
    socket.emit('message', msgSender.value);
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
  //socket.emit('auth', [username, password]);
} else {
  window.location.replace("/login.html");
}

socket.emit('get rooms', username);

socket.emit('join', [username, 'lobby']);

socket.on('user rooms', function(data){
  for (i in data) {
    room = data[i];
    buttonPacket = roomButton1 + username + roomButton2 + room[0] + roomButton3 + room[1] + roomButton4 + "<br>";
    $("#rooms").append(buttonPacket);
    console.log(buttonPacket);
  }
});

socket.on('connected', function(data){
  roomname = data[0];
  roomid = data[1];
  document.getElementById('msgs').innerHTML = '';
  console.log('connected to '+data);
  document.getElementById('roomname').innerHTML = roomname;
  document.getElementById('roomid').innerHTML = roomid;
});

socket.on('err', function(data){
  document.getElementById('err').innerHTML = data;
});

socket.on('message', function(data){
  $("#msgs").append("<div class='msg'>"+data+"</div>");
  window.scrollTo(0,document.body.scrollHeight);
});

socket.on('settings confirm', function(data){
  console.log(data);
  document.getElementById("settings").innerHTML = '<a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a><br><span style="font-size:40px;">Settings:</span><br>'
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

socket.on("disconnect", function(reason){
  if (online) {
    online = false;
    $("#msgs").append("<div class='msg'>! Connection terminated. !</div>");
    window.scrollTo(0,document.body.scrollHeight);
  	//changeIco('/static/disconnect.png');
    document.getElementById('roomname').innerHTML = '-';
    document.getElementById('roomid').innerHTML = 'disconnected';
    console.log(reason);
  }
});
