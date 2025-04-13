const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const path = require('path');

// Serve static files
app.use(express.static(path.join(__dirname)));

// Store connected players
const players = new Map();

io.on('connection', (socket) => {
    console.log('A user connected');

    // Send current player list to new player
    socket.emit('player-list', Array.from(players.values()));

    // Handle player join
    socket.on('player-join', (data) => {
        console.log('Player joined:', data);
        players.set(socket.id, {
            id: socket.id,
            ...data
        });
        socket.broadcast.emit('player-joined', players.get(socket.id));
    });

    // Handle player movement
    socket.on('player-move', (data) => {
        if (players.has(socket.id)) {
            const player = players.get(socket.id);
            player.position = data.position;
            socket.broadcast.emit('player-moved', {
                id: socket.id,
                position: data.position
            });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');
        if (players.has(socket.id)) {
            players.delete(socket.id);
            io.emit('player-left', socket.id);
        }
    });
});

// Use environment variable for port or default to 3000
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 