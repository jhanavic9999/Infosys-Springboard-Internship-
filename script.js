(() => {
  const loginScreen = document.getElementById('login-screen');
  const chatScreen = document.getElementById('chat-screen');
  const joinBtn = document.getElementById('join-btn');
  const usernameInput = document.getElementById('username');
  const roomSelect = document.getElementById('room-select');
  const roomName = document.getElementById('room-name');
  const roomSwitch = document.getElementById('room-switch');

  const messagesEl = document.getElementById('messages');
  const typingIndicator = document.getElementById('typing-indicator');
  const messageInput = document.getElementById('message-input');
  const sendBtn = document.getElementById('send-btn');

  let username = '';
  let room = 'general';
  let ws = null;
  let typingTimeout = null;
  let lastTyping = 0;

  function fmtTime(ts){
    const d = new Date(ts || Date.now());
    return d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  }

  function scrollToBottom(){ messagesEl.scrollTop = messagesEl.scrollHeight; }
  function clearMessages(){ messagesEl.innerHTML = ''; }

  function addSystem(text){
    const el = document.createElement('div');
    el.className = 'system';
    el.textContent = text;
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  function addMessage(msg, isOwn){
    // msg: {username, message, timestamp}
    if(!msg || msg.type === 'system'){ addSystem(msg && msg.message); return; }

    const row = document.createElement('div');
    row.className = 'message-row ' + (isOwn ? 'right' : 'left');

    const bubble = document.createElement('div');
    bubble.className = 'bubble ' + (isOwn ? 'me' : 'other');

    if(!isOwn){
      const name = document.createElement('div');
      name.className = 'username';
      name.textContent = msg.username;
      bubble.appendChild(name);
    }

    const text = document.createElement('div');
    text.textContent = msg.message;
    bubble.appendChild(text);

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = fmtTime(msg.timestamp);
    bubble.appendChild(meta);

    row.appendChild(bubble);
    messagesEl.appendChild(row);
    scrollToBottom();
  }

  function connectWS(){
    if(ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
    const scheme = location.protocol === 'https:' ? 'wss' : 'ws';
    ws = new WebSocket(`${scheme}://${location.host}/ws`);

    ws.addEventListener('open', ()=>{
      ws.send(JSON.stringify({type:'join', username, room}));
    });

    ws.addEventListener('message', (ev)=>{
      try{
        const p = JSON.parse(ev.data);
        if(p.type === 'system') return addSystem(p.message);
        if(p.type === 'typing'){
          if(p.username && p.username !== username){
            typingIndicator.textContent = `${p.username} is typing...`;
            typingIndicator.classList.remove('hidden');
            if(typingTimeout) clearTimeout(typingTimeout);
            typingTimeout = setTimeout(()=> typingIndicator.classList.add('hidden'), 1500);
          }
          return;
        }
        if(p.type === 'message'){
          const own = p.username === username;
          addMessage(p, own);
        }
      }catch(e){ console.warn('ws parse', e); }
    });

    ws.addEventListener('close', ()=>{ addSystem('Disconnected from server'); });
    ws.addEventListener('error', ()=>{ addSystem('WebSocket error'); });
  }

  // UI actions
  joinBtn.addEventListener('click', ()=>{
    const name = usernameInput.value.trim();
    const sel = roomSelect.value;
    if(!name) { usernameInput.focus(); return; }
    username = name; room = sel;
    sessionStorage.setItem('chatter_username', username);
    sessionStorage.setItem('chatter_room', room);
    roomSwitch.value = room; roomName.textContent = room;
    loginScreen.classList.add('hidden'); chatScreen.classList.remove('hidden');
    clearMessages(); addSystem('Welcome 👋'); connectWS();
  });

  function sendMessage(){
    const text = messageInput.value.trim();
    if(!text) return;
    const payload = {type:'message', username, message: text, room, timestamp: Date.now()};
    addMessage(payload, true);
    messageInput.value = '';
    if(ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
  }

  sendBtn.addEventListener('click', sendMessage);
  messageInput.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(); return; }
    // typing
    if(Date.now() - lastTyping > 800){
      lastTyping = Date.now();
      if(ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({type:'typing', username, room}));
    }
    typingIndicator.classList.remove('hidden');
    if(typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(()=> typingIndicator.classList.add('hidden'), 1500);
  });

  roomSwitch.addEventListener('change', (e)=>{
    const newRoom = e.target.value;
    if(ws && ws.readyState === WebSocket.OPEN){
      ws.send(JSON.stringify({type:'leave', username, room}));
      ws.send(JSON.stringify({type:'join', username, room:newRoom}));
    }
    room = newRoom; roomName.textContent = room; sessionStorage.setItem('chatter_room', room);
    clearMessages(); addSystem(`${username} switched to ${room}`);
  });

  // restore
  window.addEventListener('load', ()=>{
    const sname = sessionStorage.getItem('chatter_username');
    const sroom = sessionStorage.getItem('chatter_room');
    if(sname) usernameInput.value = sname;
    if(sroom) { roomSelect.value = sroom; roomSwitch.value = sroom; }
  });

})();
const WS_URL = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws';

      function sendTyping(){
        const now = Date.now();
        // throttle typing messages to at most 1 every 800ms
        if(now - lastTypingSent < 800) return;
        lastTypingSent = now;
        if(ws && ws.readyState === WebSocket.OPEN){
          ws.send(JSON.stringify({type:'typing', username, room}));
        }
      }
let ws = null;
let currentRoom = 'general';
let username = '';
        const newRoom = e.target.value;
        if(ws && ws.readyState === WebSocket.OPEN){
          // leave current
          ws.send(JSON.stringify({type:'leave', username, room}));
          // join new
          ws.send(JSON.stringify({type:'join', username, room:newRoom}));
        }
        room = newRoom;
        roomName.textContent = room;
        sessionStorage.setItem('chatter_room', room);
        clearMessages();
        addSystem(`${username} switched to ${room}`);

const $ = id => document.getElementById(id);

let ws = null;
let username = '';
let currentRoom = 'general';
const TYPING_TIMEOUT = 1500;
let typingTimer = null;

function nowTimestamp(){
  const d = new Date();
  return d.toLocaleString();
}

function createSystem(text){
  return {type:'system', username:'SYSTEM', message:text, room:currentRoom, timestamp: nowTimestamp()};
}

function renderMessage(msg){
  const container = $('messages');
  if (msg.type === 'system'){
    const el = document.createElement('div');
    el.className = 'system';
    el.textContent = msg.message;
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
    return;
  }

  // message bubble
  const el = document.createElement('div');
  el.className = 'message';
  const content = document.createElement('div');
  content.className = 'content';

  if (msg.username === username){
    el.classList.add('me');
    const text = document.createElement('div');
    text.textContent = msg.message;
    const ts = document.createElement('div');
    ts.className = 'timestamp';
    ts.textContent = msg.timestamp;
    content.appendChild(text);
    content.appendChild(ts);
    el.appendChild(content);
  } else {
    // left aligned, show username
    const avatar = document.createElement('div'); avatar.className='avatar'; avatar.textContent = initials(msg.username);
    const meta = document.createElement('div'); meta.className='meta';
    const uname = document.createElement('span'); uname.className='username'; uname.textContent = msg.username;
    const ts = document.createElement('span'); ts.className='timestamp'; ts.textContent = msg.timestamp;
    meta.appendChild(uname); meta.appendChild(ts);
    const text = document.createElement('div'); text.textContent = msg.message;
    content.appendChild(meta); content.appendChild(text);
    el.appendChild(avatar);
    el.appendChild(content);
  }

  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
}

function initials(name){
  if(!name) return '';
  return name.split(' ').map(s=>s[0].toUpperCase()).slice(0,2).join('');
}

function connect(){
  ws = new WebSocket(WS_URL);
  ws.addEventListener('open', ()=>{
    send({type:'join', username, room: currentRoom});
  });

  ws.addEventListener('message', ev=>{
    try{
      const payload = JSON.parse(ev.data);
      // ignore room mismatches for non-system
      if (payload.room && payload.room !== currentRoom && payload.type !== 'system') return;
      if (payload.type === 'typing'){
        if (payload.username !== username) showTyping(payload.username);
        return;
      }
      renderMessage(payload);
    }catch(e){
      console.error('invalid payload', e);
    }
  });

  ws.addEventListener('close', ()=>{
    // do nothing; user can refresh
  });
}

function send(obj){
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify(obj));
}

function showTyping(user){
  const el = $('typing-indicator');
  el.textContent = `${user} is typing...`;
  el.classList.add('visible');
  clearTimeout(typingTimer);
  typingTimer = setTimeout(()=>{ el.classList.remove('visible'); el.textContent = ''; }, TYPING_TIMEOUT);
}

document.addEventListener('DOMContentLoaded', ()=>{
  const login = $('login-screen');
  const chat = $('chat-screen');

  $('enter-btn').addEventListener('click', ()=>{
    const name = $('username').value.trim();
    if (!name) return alert('Please enter a username');
    username = name;
    currentRoom = $('room-select').value;
    sessionStorage.setItem('cb_username', username);
    sessionStorage.setItem('cb_room', currentRoom);
    $('room-name').textContent = currentRoom;
    login.classList.add('hidden');
    chat.classList.remove('hidden');
    connect();
  });

  $('send-btn').addEventListener('click', ()=>{
    const input = $('message-input');
    const text = input.value.trim();
    if (!text) return;
    const msg = {type:'message', username, message:text, room: currentRoom, timestamp: nowTimestamp()};
    renderMessage(msg); // local echo
    send(msg);
    input.value = '';
  });

  $('message-input').addEventListener('input', ()=>{
    send({type:'typing', username, room: currentRoom});
  });

  $('message-input').addEventListener('keydown', (e)=>{
    if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); $('send-btn').click(); }
  });

  $('room-switch').addEventListener('change', (e)=>{
    const newRoom = e.target.value;
    // clear messages and update room name
    $('messages').innerHTML = '';
    currentRoom = newRoom;
    $('room-name').textContent = currentRoom;
    // inform server
    send({type:'leave', username, room: sessionStorage.getItem('cb_room') || currentRoom});
    send({type:'join', username, room: currentRoom});
    sessionStorage.setItem('cb_room', currentRoom);
  });

  // restore previous session
  const savedU = sessionStorage.getItem('cb_username');
  const savedR = sessionStorage.getItem('cb_room');
  if (savedU){ $('username').value = savedU; }
  if (savedR){ $('room-select').value = savedR; $('room-switch').value = savedR; }
});

  const observer = new MutationObserver((mutations)=>{
    for(const m of mutations){
      for(const node of m.addedNodes){
        if (node.nodeType!==1) continue;
        const id = node.getAttribute && node.getAttribute('data-id');
        if (id && node.classList.contains('me')===false){
          // notify server that we've read this message
          sendEvent({type:'read', username, room: currentRoom, id});
        }
      }
    }
  });
  observer.observe($('messages'), {childList:true});
});
