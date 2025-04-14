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

        // Handle equipment updates
        this.socket.on('player-equipment', (data) => {
            console.log('Received equipment update:', data);
            const otherPlayer = window.game.otherPlayers.get(data.id);
            if (otherPlayer) {
                if (data.action === 'equip' && data.item) {
                    console.log('Equipping item for other player:', data.item);
                    otherPlayer.inventory.addItem(data.item);
                    otherPlayer.equipItem(data.item);
                } else if (data.action === 'unequip' && data.itemId) {
                    console.log('Unequipping item for other player:', data.itemId);
                    otherPlayer.unequipItem(data.itemId);
                }
            }
        });

        // Handle initial player list
        this.socket.on('player-list', (players) => {
            console.log('Received player list:', players);
            players.forEach(player => {
                if (player.id !== this.socket.id) {
                    window.game.addOtherPlayer(player.id, player.name, player.skinColor);
                    if (player.position) {
                        window.game.updateOtherPlayer(player.id, player.position);
                    }
                    // Add equipped items
                    if (player.equipment && player.equipment.length > 0) {
                        console.log('Adding equipment for player:', player.id, player.equipment);
                        const otherPlayer = window.game.otherPlayers.get(player.id);
                        player.equipment.forEach(item => {
                            otherPlayer.inventory.addItem(item);
                            otherPlayer.equipItem(item);
                        });
                    }
                }
            });
            this.updatePlayerCount(players.length);
        });

        // Handle new player joining
        this.socket.on('player-joined', (player) => {
            console.log('Player joined with data:', player);
            window.game.addOtherPlayer(player.id, player.name, player.skinColor);
            if (player.position) {
                window.game.updateOtherPlayer(player.id, player.position);
            }
            // Add equipped items
            if (player.equipment && player.equipment.length > 0) {
                console.log('Adding equipment for new player:', player.id, player.equipment);
                const otherPlayer = window.game.otherPlayers.get(player.id);
                player.equipment.forEach(item => {
                    otherPlayer.inventory.addItem(item);
                    otherPlayer.equipItem(item);
                });
            }
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

        // Handle player click count updates
        this.socket.on('player-click-count', (data) => {
            console.log('Received player click count:', data);
            // Frissítjük a játékos clickcount-ját
            if (data.id === this.socket.id) {
                // Ha a saját adatunk, nem kell külön frissíteni (a clicker-data már frissíti)
                return;
            }
            
            // Másik játékos esetén frissítjük a névtáblát
            const otherPlayer = window.game.otherPlayers.get(data.id);
            if (otherPlayer) {
                otherPlayer.updateClickCount(data.clicks);
            }
        });

        // Handle clicker game data updates
        this.socket.on('clicker-data', (data) => {
            console.log('Received clicker game data:', data);
            // Ha már létezik a ClickerGame példány, akkor frissítjük
            // (egyébként a ClickerGame inicializálásakor már fel lesz iratkozva az eseményre)
            if (window.game && window.game.clickerGame) {
                // Eseménykezelés a ClickerGame osztályban van implementálva
            }
        });
    }

    connect(playerName, skinColor, persistentId) {
        const initialPosition = {
            x: window.game.player.mesh.position.x,
            y: window.game.player.mesh.position.y,
            z: window.game.player.mesh.position.z,
            rotation: window.game.player.mesh.rotation.y
        };

        // Get equipped items and serialize them for network
        const equippedItems = Array.from(window.game.player.inventory.equippedItems.values())
            .map(item => Equipment.serializeForNetwork(item));
        console.log('Connecting with equipped items:', equippedItems);

        this.socket.emit('player-join', {
            name: playerName,
            skinColor: skinColor,
            position: initialPosition,
            equipment: equippedItems,
            persistentId: persistentId
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

    updateEquipment(action, item) {
        if (this.socket) {
            console.log('Sending equipment update:', action, item);
            this.socket.emit('player-equipment', {
                action,
                item: action === 'equip' ? Equipment.serializeForNetwork(item) : undefined,
                itemId: item.id
            });
        }
    }
}

// Make Network class globally available
window.Network = Network; 