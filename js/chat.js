var socket = io();

var msgSender = document.getElementById('msgSender');
var username = '';

var rmCookie = function(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

function sendMsg(msg) {
  if (msgSender.value.trim() !== '') {
    socket.emit('message', '['+username+'] '+msgSender.value);
    msgSender.value = '';
  }
}

function logout() {
  rmCookie('username');
  rmCookie('key');
  window.location.replace("/coms.html");
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
