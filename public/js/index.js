const joinForm = document.getElementById('joinForm');

joinForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

    const username = document.getElementById('username').value.trim();
    const room = document.getElementById('room').value;

    if (username && room) {
        window.location.href = `chat.html?username=${encodeURIComponent(username)}&room=${encodeURIComponent(room)}`;
    }
});