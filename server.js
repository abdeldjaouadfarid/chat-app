
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
_socketio.on('connection', (socket) => {
    console.log('User connected:', socket.id);
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
