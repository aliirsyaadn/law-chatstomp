const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL
const { username } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// Replace with your hostname
var ws = new WebSocket('ws://127.0.0.1:15674/ws');
var client = Stomp.over(ws);

// RabbitMQ SockJS does not support heartbeats so disable them
client.heartbeat.outgoing = 0;
client.heartbeat.incoming = 0;

// Make sure the user has limited access rights
client.connect('guest', 'guest', onConnect, onError);

function onConnect() {
  client.subscribe('/exchange/message', onReceive);
  client.send(
    '/exchange/message',
    { 'content-type': 'application/json' },
    JSON.stringify({
      text: `${username} has join the chat`,
      user: 'Admin',
      time: Date.now(),
    })
  );
}

function onDisconnect() {
  client.send(
    '/exchange/message',
    { 'content-type': 'application/json' },
    JSON.stringify({
      text: `${username} has left the chat`,
      user: 'Admin',
      time: Date.now(),
    })
  );
  client.unsubcribe();
  client.disconnect();
}

function onReceive(payload) {
  var data = JSON.parse(payload.body);
  if (data.user == 'Admin') {
    outputInfo(data);
  } else {
    outputMessage(data);
  }
  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage(message) {
  console.log(message);
  client.send(
    '/exchange/message',
    { 'content-type': 'application/json' },
    JSON.stringify({
      text: message,
      user: username,
      time: Date.now(),
    })
  );
}

function onError(e) {
  console.log('STOMP ERROR', e);
}

function onDebug(m) {
  console.log('STOMP DEBUG', m);
}

// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  sendMessage(msg);
  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputInfo(data) {
  const div = document.createElement('div');
  div.classList.add('message');
  const para = document.createElement('p');
  para.classList.add('text');
  var date = new Date(data.time);
  para.innerText = `${date.toLocaleDateString()}, ${date.toLocaleTimeString()} : ${
    data.text
  }`;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Output message to DOM
function outputMessage(data) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = data.user;
  var date = new Date(data.time);
  p.innerHTML += ` <span>  ${date.toLocaleDateString()}, ${date.toLocaleTimeString()}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = data.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});
