var socket = io();

var msgSender = document.getElementById('msgSender');
var username = '';

var roomButton1 = '<button onclick=\'socket.emit("join", [' // + username
var roomButton2 = ', "' // + room ID
var roomButton3 = '"]);\'>' // + room name
var roomButton4 = '</button>'

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

function sendMsg(msg) {
  if (msgSender.value.trim() !== '') {
    socket.emit('message', '['+username+'] '+msgSender.value);
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

socket.on('user rooms', function(data){
  for (i in data) {
    room = data[i];
    buttonPacket = roomButton1 + username + roomButton2 + room[0] + roomButton3 + room[1] + roomButton4 + "<br>";
    $("#rooms").append(buttonPacket);
    console.log(buttonPacket);
  }
});

socket.on('message', function(data){
  $("#msgs").append("<div class='msg'>"+data+"</div>");
  window.scrollTo(0,document.body.scrollHeight);
});
