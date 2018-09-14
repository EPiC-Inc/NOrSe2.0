var socket = io();

var msgSender = document.getElementById('msgSender');
var username = '';

function sendMsg(msg) {
  if (msgSender.value.trim() !== '') {
    socket.emit('message', '['+username+'] '+msgSender.value);
    msgSender.value = '';
  }
}

if (getCookie("username")) {
  username = getCookie("username");
  document.getElementById('username').innerHTML = username;
  password = getCookie("key");
  socket.emit('join', [username, password]);
} else {
  window.location.replace("/login.html");
}

socket.on('message', function(data){
  $("#msgs").append("<div class='msg'>"+data+"</div>");
  window.scrollTo(0,document.body.scrollHeight);
});
