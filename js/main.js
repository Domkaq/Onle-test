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
                alert('Kérlek add meg a neved!');
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
    }
}

// Start the game when the page is loaded
window.addEventListener('load', () => {
    window.main = new Main();
}); 