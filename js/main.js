class Main {
    constructor() {
        this.game = new Game();
        this.ui = new UI();
        this.network = new Network();

        // Generate or load persistent player ID
        this.playerId = localStorage.getItem('playerId');
        if (!this.playerId) {
            this.playerId = 'player_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            localStorage.setItem('playerId', this.playerId);
        }

        // Initialize components
        this.ui.initialize();
        this.network.initialize();

        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('start-game').addEventListener('click', () => {
            const playerName = document.getElementById('player-name').value;
            const skinColor = document.getElementById('skin-color').value;

            // Save player name
            localStorage.setItem('playerName', playerName);

            if (playerName.trim() === '') {
                this.showError('Kérlek add meg a neved!');
                return;
            }

            // Hide menu and show game
            this.ui.hideMainMenu();

            // Create player with custom name and skin color
            const player = new Player(playerName, skinColor);
            
            // Inicializáljuk a játékost és a kapcsolódó rendszereket
            this.game.initializePlayer(player);

            // Add test helmet to inventory
            const helmet = Equipment.createHelmetItem();
            this.game.player.inventory.addItem(helmet);

            // Connect to server with persistent ID
            this.network.connect(playerName, skinColor, this.playerId);
        });

        // Try to auto-fill player name if saved
        const savedName = localStorage.getItem('playerName');
        if (savedName) {
            const playerNameInput = document.getElementById('player-name');
            if (playerNameInput) {
                playerNameInput.value = savedName;
            }
        }

        // Hálózati hibaüzenetek kezelése
        if (this.network) {
            this.network.socket.on('join-error', (data) => {
                // Ha a név foglalt, mutassuk meg újra a menüt és jelenítsük meg a hibaüzenetet
                if (data.error === 'name_taken') {
                    this.ui.showMainMenu();
                    this.showError(data.message);
                    
                    // Töröljük a mentett nevet
                    localStorage.removeItem('playerName');
                    
                    // Töröljük a játékos objektumot
                    if (this.game.player) {
                        this.game.scene.remove(this.game.player.mesh);
                        this.game.player = null;
                    }
                }
            });

            this.network.socket.on('join-success', (data) => {
                console.log('Successfully joined the game:', data.message);
                // Frissítjük a játékos adatait
                if (this.game.clickerGame) {
                    Object.assign(this.game.clickerGame, data.playerData);
                    this.game.clickerGame.updateHUD();
                }
            });
        }
    }

    showError(message) {
        // Hiba üzenet megjelenítése
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 0, 0, 0.8);
            color: white;
            padding: 1rem 2rem;
            border-radius: 5px;
            z-index: 1000;
            animation: fadeInOut 3s forwards;
        `;

        // CSS animáció hozzáadása
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -20px); }
                10% { opacity: 1; transform: translate(-50%, 0); }
                90% { opacity: 1; transform: translate(-50%, 0); }
                100% { opacity: 0; transform: translate(-50%, -20px); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(errorDiv);

        // Hibaüzenet eltávolítása 3 másodperc után
        setTimeout(() => {
            errorDiv.remove();
            style.remove();
        }, 3000);
    }
}

// Start the game when the page is loaded
window.addEventListener('load', () => {
    window.main = new Main();
}); 