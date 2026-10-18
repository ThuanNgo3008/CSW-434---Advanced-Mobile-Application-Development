const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (username) => {
        socket.data.username = username;
        console.log(`${username} joined the group`);
    });

    socket.on('sendMessage', (message) => {
        const newMessage = {
            id: `${socket.id}-${Date.now()}`,
            username: socket.data.username || 'Unknown',
            text: message,
            createdAt: new Date().toISOString(),
        };

        io.emit('receiveMessage', newMessage);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(3000, '0.0.0.0', () => {
    console.log('Socket.IO Server running on port 3000');
});
