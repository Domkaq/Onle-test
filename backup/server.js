const express = require('express');
const app = express();
const http = require('http').createServer(app);
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
    console.log('Player connected:', socket.id);

    // Send current player list to new player
    socket.emit('player-list', Array.from(players.values()));

    // Handle player join
    socket.on('player-join', (playerData) => {
        console.log('Player joined:', socket.id, playerData.name);
        
        const player = {
            id: socket.id,
            name: playerData.name,
            skinColor: playerData.skinColor,
            position: playerData.position
        };
        
        players.set(socket.id, player);

        // Notify other players about new player
        socket.broadcast.emit('player-joined', player);
    });

    // Handle player movement
    socket.on('player-move', (data) => {
        const player = players.get(socket.id);
        if (player) {
            player.position = data.position;
            // Broadcast player movement to all other players
            socket.broadcast.emit('player-moved', {
                id: socket.id,
                position: data.position
            });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        players.delete(socket.id);
        // Notify all players about the disconnection
        io.emit('player-left', socket.id);
    });
});

// Start server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 