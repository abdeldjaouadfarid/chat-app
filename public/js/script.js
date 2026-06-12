const socket = io();

// Read the username and room from the URL (put there by the join form on index.html)
const urlParams = new URLSearchParams(window.location.search);
const currentUsername = urlParams.get('username');
const currentRoom = urlParams.get('room');

const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');

// Usernames that are typing right now (kept in sync by the "typing" socket event)
const typingUsers = new Set();

// If the page was opened without a username/room, send the user back to the join page
if (!currentUsername || !currentRoom) {
    window.location.href = 'index.html';
} else {
    // Tell the server who we are and which room we want to join
    socket.emit('join', { username: currentUsername, room: currentRoom });

    // Show the room name in the browser tab and the page header
    document.title = `${currentRoom} — Live Chat`;
    const roomNameElement = document.getElementById('roomName');
    if (roomNameElement) {
        roomNameElement.innerHTML = '<i class="fas fa-comments"></i> ';
        // append() adds the room name as plain text, so HTML typed
        // into the room field cannot be injected into the page
        roomNameElement.append(currentRoom);
    }
}

// A new message arrived from the server: show it in the chat
socket.on('message', (message) => {
    // Whoever just sent a message is clearly done typing
    typingUsers.delete(message.username);
    showTyping();

    showMessage(message);
});

// The list of online users in this room changed: re-render the sidebar
socket.on('roomUsers', ({ users }) => {
    showUsers(users);

    // Drop "typing" entries of users who already left the room
    for (const name of [...typingUsers]) {
        if (!users.includes(name)) typingUsers.delete(name);
    }
    showTyping();
});

// Someone in the room started or stopped typing: update the indicator
socket.on('typing', ({ username, isTyping }) => {
    if (isTyping) {
        typingUsers.add(username);
    } else {
        typingUsers.delete(username);
    }
    showTyping();
});

// Timer that turns our own "typing" signal off after a pause (see stopTyping)
let typingTimer = null;

/**
 * Tells the server we stopped typing and cancels the pending timer.
 * Called after 1.5s without a keystroke and right after sending a message.
 */
function stopTyping() {
    clearTimeout(typingTimer);
    typingTimer = null;
    socket.emit('typing', false);
}

if (messageForm) {
    // Send the typed message to the server when the form is submitted
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault(); // stay on the page instead of a normal form submit

        const text = messageInput.value.trim();
        if (text) {
            socket.emit('chatMessage', text);
            stopTyping();

            // Clear the input and keep the cursor in it for the next message
            messageInput.value = '';
            messageInput.focus();
        }
    });

    // While the user types, tell the room — and stop 1.5s after the last keystroke
    messageInput.addEventListener('input', () => {
        socket.emit('typing', true);
        clearTimeout(typingTimer);
        typingTimer = setTimeout(stopTyping, 1500);
    });
}

/**
 * Adds one message to the chat window and scrolls to the bottom.
 * - our own messages get the "own" class (aligned right, accent color)
 * - "System" messages (welcome / joined / left) become a small centered notice
 * The elements are built with createElement/textContent (not innerHTML),
 * so user-typed text can never inject HTML or scripts into the page.
 *
 * @param {{ username: string, text: string, time: string }} message
 */
function showMessage({ username, text, time }) {
    const messageList = document.getElementById('messageList');
    const messagesArea = document.getElementById('messages');

    if (!messageList) return;

    const wrapper = document.createElement('div');

    if (username === 'System') {
        // Server notice: just the text, no username or timestamp
        wrapper.className = 'message system';
        wrapper.textContent = text;
    } else {
        const isOwn = username === currentUsername;
        wrapper.className = isOwn ? 'message own' : 'message';

        const header = document.createElement('p');
        header.className = 'message-header';

        const name = document.createElement('span');
        name.className = 'username';
        name.textContent = isOwn ? 'You' : username;

        const timestamp = document.createElement('span');
        timestamp.className = 'timestamp';
        timestamp.textContent = new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        header.append(name, timestamp);

        const body = document.createElement('p');
        body.className = 'message-text';
        body.textContent = text;

        wrapper.append(header, body);
    }

    messageList.appendChild(wrapper);

    // Keep the newest message visible
    if (messagesArea) {
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }
}

/**
 * Re-renders the "Online Users" sidebar and its counter badge.
 * Our own entry is highlighted and marked with "(you)".
 *
 * @param {string[]} users - usernames of everyone in the room
 */
function showUsers(users) {
    const userListItems = document.getElementById('userListItems');
    const userCount = document.getElementById('userCount');

    if (userCount) {
        userCount.textContent = users.length;
    }

    if (!userListItems) return;

    userListItems.innerHTML = '';
    for (const name of users) {
        const li = document.createElement('li');
        if (name === currentUsername) {
            li.textContent = `${name} (you)`;
            li.classList.add('you');
        } else {
            li.textContent = name;
        }
        userListItems.appendChild(li);
    }
}

/**
 * Updates the "... is typing" line under the messages area
 * based on who is currently in the typingUsers set.
 */
function showTyping() {
    const indicator = document.getElementById('typingIndicator');
    if (!indicator) return;

    const names = [...typingUsers];
    if (names.length === 0) {
        indicator.textContent = '';
    } else if (names.length === 1) {
        indicator.textContent = `${names[0]} is typing…`;
    } else if (names.length === 2) {
        indicator.textContent = `${names[0]} and ${names[1]} are typing…`;
    } else {
        indicator.textContent = 'Several people are typing…';
    }
}
