/// Vars
var socket = io();
var user = document.getElementById('user');
var passwd = document.getElementById('pass');
var errors = document.getElementById('errors');
var alreadyLoggedIn = false

/// Functions
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

var rmCookie = function(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

function newAccount() {
  if (user.value.includes(" ")) {
    errors.innerHTML = "Error: No spaces allowed in username!"
  }
  else if (passwd.value === document.getElementById('passVerify').value) {
    socket.emit('new user', [user.value,
    hashCode(passwd.value),
    document.getElementById('joincode').value])
  }
}

function login() {
socket.emit('auth', [user.value, hashCode(passwd.value)]);
}

function logout() {
  rmCookie('username');
  rmCookie('key');
  window.location.replace("/index.html");
}


if (getCookie("username")) {
  username = getCookie("username");
  password = getCookie("key");
  alreadyLoggedIn = true;
  socket.emit('auth', [username, password]);
}


socket.on('a-ok', function(data){
  console.log('a-ok received');
  errors.innerHTML = '';
  if (!alreadyLoggedIn) {
    document.cookie='username='+data;
    document.cookie='key='+hashCode(passwd.value);
    alreadyLoggedIn = false;
  }
  window.location.replace("/coms.html");
});

socket.on('err', function(data){
  errors.innerHTML = data;
});
