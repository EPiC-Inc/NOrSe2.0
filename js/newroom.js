var socket = io();
var username = '';
var roomNameElement = document.getElementById('roomname');

function addRoom() {
  roomName = roomNameElement.value;
  socket.emit('new room', [username, roomName]);
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

if (getCookie("username")) {
  username = getCookie("username");
} else {
  window.location.replace("/login.html");
}

socket.on('a-ok', function(){
  window.location.replace("/coms.html");
});
