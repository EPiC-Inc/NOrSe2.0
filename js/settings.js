var socket = io();
var username = '';

var userNameChange = document.getElementById('new_username');
var passwordOld = document.getElementById('old_password');
var passwordChange = document.getElementById('new_password');
var passwordConfirm = document.getElementById('new_password_confirm');

function hashCode(s) {
  for(var i=0, h=1; i<s.length; i++)
    h=Math.imul(h+s.charCodeAt(i)|0, 2654435761);
  return (h^h>>>17)>>>0;
};

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

function changeUser() {
  socket.emit('username change', [username, userNameChange.value]);
}

function changePassword() {
  if (passwordChange.value === passwordConfirm.value) {
    socket.emit('password change', [username, hashCode(passwordOld.value), hashCode(passwordChange.value)]);
  } else {
    document.getElementById('err').innerHTML = 'Chosen passwords must match';
  }
}

var rmCookie = function(name) {
  document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

if (getCookie("username")) {
  username = getCookie("username");
  document.getElementById('username').innerHTML = username;
} else {
  window.location.replace("/login.html");
}

socket.on('err', function(data) {
  document.getElementById('err').innerHTML = data;
});

socket.on('a-ok', function(){
  rmCookie('username');
  rmCookie('key');
});
