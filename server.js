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

// Store connected players with their equipment
const players = new Map();

io.on('connection', (socket) => {
    console.log('A user connected');

    // Send current player list to new player with equipment data
    const playerList = Array.from(players.values()).map(player => ({
        id: player.id,
        name: player.name,
        skinColor: player.skinColor,
        position: player.position,
        equipment: player.equipment || []
    }));
    socket.emit('player-list', playerList);

    // Handle player join
    socket.on('player-join', (data) => {
        console.log('Player joined:', data);
        const playerData = {
            id: socket.id,
            name: data.name,
            skinColor: data.skinColor,
            position: data.position,
            equipment: data.equipment || []
        };
        players.set(socket.id, playerData);
        
        // Broadcast to other players with full equipment data
        socket.broadcast.emit('player-joined', playerData);
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

    // Handle equipment changes
    socket.on('player-equipment', (data) => {
        if (players.has(socket.id)) {
            const player = players.get(socket.id);
            
            // Initialize equipment array if it doesn't exist
            if (!player.equipment) {
                player.equipment = [];
            }

            if (data.action === 'equip') {
                // Remove any existing item in the same slot
                player.equipment = player.equipment.filter(item => item.slot !== data.item.slot);
                // Add new item
                player.equipment.push(data.item);
            } else if (data.action === 'unequip') {
                // Remove item
                player.equipment = player.equipment.filter(item => item.id !== data.itemId);
            }

            // Broadcast equipment change to all other players
            socket.broadcast.emit('player-equipment', {
                id: socket.id,
                action: data.action,
                item: data.item,
                itemId: data.itemId
            });

            console.log(`Player ${player.name} ${data.action}ped item:`, data.action === 'equip' ? data.item : data.itemId);
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