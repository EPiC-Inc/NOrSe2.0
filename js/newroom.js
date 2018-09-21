var socket = io();
var roomNameElement = document.getElementById('roomname');

function addRoom() {
  roomName = roomNameElement.value;
  socket.emit('new room', roomName);
}
