class Main {
    constructor() {
        this.game = new Game();
        this.ui = new UI();
        this.network = new Network();

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

            if (playerName.trim() === '') {
                alert('Kérlek add meg a neved!');
                return;
            }

            // Hide menu and show game
            this.ui.hideMainMenu();

            // Create player with custom name and skin color
            this.game.player = new Player(playerName, skinColor);
            this.game.scene.add(this.game.player.mesh);

            // Connect to server
            this.network.connect(playerName, skinColor);
        });
    }
}

// Start the game when the page is loaded
window.addEventListener('load', () => {
    window.main = new Main();
}); 