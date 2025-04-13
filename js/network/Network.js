class Network {
    constructor() {
        this.socket = null;
        this.players = new Map();
    }

    initialize() {
        // Connect to the server using the current hostname
        const serverUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000' 
            : window.location.origin;
            
        this.socket = io(serverUrl);

        // Handle connection events
        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        // Handle initial player list
        this.socket.on('player-list', (players) => {
            players.forEach(player => {
                if (player.id !== this.socket.id) {
                    window.game.addOtherPlayer(player.id, player.name, player.skinColor);
                    if (player.position) {
                        window.game.updateOtherPlayer(player.id, player.position);
                    }
                }
            });
            // Update player count
            this.updatePlayerCount(players.length);
        });

        // Handle new player joining
        this.socket.on('player-joined', (player) => {
            window.game.addOtherPlayer(player.id, player.name, player.skinColor);
            if (player.position) {
                window.game.updateOtherPlayer(player.id, player.position);
            }
            // Update player count
            this.updatePlayerCount(this.getPlayerCount() + 1);
        });

        // Handle player leaving
        this.socket.on('player-left', (playerId) => {
            window.game.removeOtherPlayer(playerId);
            // Update player count
            this.updatePlayerCount(this.getPlayerCount() - 1);
        });

        // Handle player movement and rotation
        this.socket.on('player-moved', (data) => {
            window.game.updateOtherPlayer(data.id, {
                x: data.position.x,
                y: data.position.y,
                z: data.position.z,
                rotation: data.position.rotation
            });
        });
    }

    connect(playerName, skinColor) {
        const initialPosition = {
            x: window.game.player.mesh.position.x,
            y: window.game.player.mesh.position.y,
            z: window.game.player.mesh.position.z,
            rotation: window.game.player.mesh.rotation.y
        };

        this.socket.emit('player-join', {
            name: playerName,
            skinColor: skinColor,
            position: initialPosition
        });
    }

    updatePosition(position) {
        if (this.socket) {
            this.socket.emit('player-move', {
                position: {
                    x: position.x,
                    y: position.y,
                    z: position.z,
                    rotation: position.rotation
                }
            });
        }
    }

    getPlayerCount() {
        // Count all players (including local player)
        return window.game.otherPlayers.size + 1;
    }

    updatePlayerCount(count) {
        const playerCountElement = document.getElementById('player-count');
        if (playerCountElement) {
            playerCountElement.textContent = count;
        }
    }
}

// Make Network class globally available
window.Network = Network; 