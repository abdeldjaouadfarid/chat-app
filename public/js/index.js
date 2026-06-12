const joinForm = document.getElementById('joinForm');
const usernameInput = document.getElementById('username');

// Pre-fill the username from the last visit so returning
// users don't have to type it again
const savedUsername = localStorage.getItem('chat-username');
if (savedUsername) {
    usernameInput.value = savedUsername;
}

// Handle the join form: read the username and room,
// then redirect to the chat page with them in the URL
joinForm.addEventListener('submit', (e) => {
    e.preventDefault(); // stay on the page instead of a normal form submit

    const username = usernameInput.value.trim();
    const room = document.getElementById('room').value;

    // Only continue when both fields are filled in
    if (username && room) {
        // Remember the username for the next visit
        localStorage.setItem('chat-username', username);

        // encodeURIComponent keeps special characters (spaces, &, ?, ...) safe in the URL
        window.location.href = `chat.html?username=${encodeURIComponent(username)}&room=${encodeURIComponent(room)}`;
    }
});
