class UI {
    constructor() {
        this.mainMenu = document.getElementById('main-menu');
        this.gameContainer = document.getElementById('game-container');
    }

    initialize() {
        // Show main menu by default
        this.showMainMenu();
    }

    hideMainMenu() {
        this.mainMenu.style.display = 'none';
        this.gameContainer.style.display = 'block';
    }

    showMainMenu() {
        this.mainMenu.style.display = 'flex';
        this.gameContainer.style.display = 'none';
    }

    showMessage(message) {
        // Create message element if it doesn't exist
        let messageElement = document.getElementById('message');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'message';
            messageElement.style.position = 'fixed';
            messageElement.style.top = '20px';
            messageElement.style.left = '50%';
            messageElement.style.transform = 'translateX(-50%)';
            messageElement.style.padding = '10px 20px';
            messageElement.style.background = 'rgba(0, 0, 0, 0.7)';
            messageElement.style.color = 'white';
            messageElement.style.borderRadius = '5px';
            messageElement.style.zIndex = '1000';
            document.body.appendChild(messageElement);
        }

        messageElement.textContent = message;
        messageElement.style.display = 'block';

        // Hide message after 3 seconds
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 3000);
    }
}

// Make UI class globally available
window.UI = UI; 