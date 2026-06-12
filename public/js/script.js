const socket = io()

const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');
const room = urlParams.get('room');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');

// for safety
if (!username || !room) {
    window.location.href = 'index.html';
} else {
    socket.emit('join', { username, room });

    const roomNameElement = document.getElementById('roomName');
    if (roomNameElement) {
        roomNameElement.innerHTML = `<i class="fas fa-comments"></i> ${room}`;
    }
}

// get message system and users from server 
socket.on('message', (message) =>{
    showMessage(message)
})

// send message to the server
function joinChat(){

    const usernameInput = document.getElementById('username');
    const username = usernameInput.value.trim();

    if (username !== "") {
        socket.emit('join', username)
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('chat-container').style.display = 'block';
    }else{
        alert("Please enter a valid username!");
    }
}


if (messageForm) {
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = messageInput.value.trim();
        if (msg) {
            socket.emit('chatMessage', msg);
            messageInput.value = '';
            messageInput.focus();
        }
    });
}
// view message in the chat 
function showMessage(message){
    const messageList = document.getElementById('messageList')
    const messagesArea = document.getElementById('messages');
    const messageItem = `
    <div class="message">
                        <p class="username">
                            System
                            <span class="timestamp">${new Date().toLocaleTimeString()}</span>
                        </p>

                        <p class="message-text">
                            ${message}
                        </p>
                    </div>
    `;
    messageList.insertAdjacentHTML('beforeend', messageItem)

    
    if (messagesArea) {
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }
}

messageForm.addEventListener('submit', (event) => {
    event.preventDefault(); 
    const userMessage = event.target.elements.messageInput.value.trim();

    if (userMessage !== "") {
        socket.emit('chatMessage', userMessage);
        event.target.elements.messageInput.value = '';
        event.target.elements.messageInput.focus();
    }
});