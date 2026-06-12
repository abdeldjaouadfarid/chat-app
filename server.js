
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const server = http.createServer(app);
const _socketio = new Server(server);

// __dirname is not available in ES modules
// so we need to use fileURLToPath to get the current file path and then derive the directory name from it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Socket.io
_socketio.on('connection', socket => {
    
    socket.on('join', ({username, room}) => {
        socket.username = username
        socket.room = room;

        socket.join(room);
        socket.emit('message', `Welcome to ${room}, ${socket.username}!`);
        socket.broadcast.emit('message', `${socket.username} has joined the chat`)
    })
    

    socket.on('disconnect', () => {
        if (socket.username) {
            _socketio.emit('message', `${socket.username} has left the chat`);
        }
    });

    socket.on('chatMessage',(message)=>{
        _socketio.emit('message', message)

    })
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
