class Merchant {
    constructor(game) {
        this.game = game;
        this.mesh = this.createMerchantMesh();
        this.interactionDistance = 3;
        this.isDialogOpen = false;
        
        this.setupDialog();
        this.setupEventListeners();
    }

    createMerchantMesh() {
        const group = new THREE.Group();

        // Test
        const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.3, 1.2, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            roughness: 0.7,
            metalness: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6;
        group.add(body);

        // Fej
        const headGeometry = new THREE.SphereGeometry(0.3, 32, 32);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xd4a373,
            roughness: 0.6,
            metalness: 0.2
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.4;
        group.add(head);

        // Kalap
        const hatGeometry = new THREE.ConeGeometry(0.4, 0.4, 32);
        const hatMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d3436,
            roughness: 0.8,
            metalness: 0.1
        });
        const hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.y = 1.8;
        group.add(hat);

        // Szemek
        const eyeGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const eyeMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 0.1,
            metalness: 0.8
        });

        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.1, 1.45, 0.25);
        group.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.1, 1.45, 0.25);
        group.add(rightEye);

        // Interaction indicator
        const indicatorGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const indicatorMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.7
        });
        const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
        indicator.position.y = 2.2;
        indicator.name = 'interaction-indicator';
        indicator.visible = false;
        group.add(indicator);

        // Pozicionálás
        group.position.set(5, 0, 5);
        return group;
    }

    setupDialog() {
        this.dialog = document.createElement('div');
        this.dialog.className = 'merchant-dialog';
        this.dialog.style.display = 'none';
        this.dialog.innerHTML = `
            <div class="merchant-dialog-content">
                <h2>Merchant</h2>
                <div class="merchant-upgrades"></div>
            </div>
        `;
        document.body.appendChild(this.dialog);
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            // Ellenőrizzük, hogy az e.key létezik-e
            if (!e || !e.key) return;
            
            if (e.key.toLowerCase() === 'e') {
                const distance = this.getDistanceToPlayer();
                if (distance <= this.interactionDistance) {
                    this.toggleDialog();
                }
            } else if (e.key === 'Escape' && this.isDialogOpen) {
                this.closeDialog();
            }
        });
    }

    update() {
        if (!this.game.player) return;

        const distance = this.getDistanceToPlayer();
        const indicator = this.mesh.getObjectByName('interaction-indicator');
        
        if (distance <= this.interactionDistance) {
            if (!indicator.visible) {
                indicator.visible = true;
                this.showInteractionPrompt();
            }
        } else {
            if (indicator.visible) {
                indicator.visible = false;
                this.hideInteractionPrompt();
            }
            if (this.isDialogOpen) {
                this.closeDialog();
            }
        }

        // Rotate towards player
        if (distance < 10) {
            const playerPos = this.game.player.mesh.position;
            const angle = Math.atan2(
                playerPos.x - this.mesh.position.x,
                playerPos.z - this.mesh.position.z
            );
            this.mesh.rotation.y = angle;
        }
    }

    getDistanceToPlayer() {
        if (!this.game.player) return Infinity;

        const playerPos = this.game.player.mesh.position;
        const merchantPos = this.mesh.position;
        
        return Math.sqrt(
            Math.pow(playerPos.x - merchantPos.x, 2) +
            Math.pow(playerPos.z - merchantPos.z, 2)
        );
    }

    showInteractionPrompt() {
        if (!this.prompt) {
            this.prompt = document.createElement('div');
            this.prompt.className = 'interaction-prompt';
            this.prompt.textContent = 'Press E to interact';
            document.body.appendChild(this.prompt);
        }
        this.prompt.style.display = 'block';
    }

    hideInteractionPrompt() {
        if (this.prompt) {
            this.prompt.style.display = 'none';
        }
    }

    toggleDialog() {
        if (this.isDialogOpen) {
            this.closeDialog();
        } else {
            this.openDialog();
        }
    }

    openDialog() {
        if (!this.game.clickerGame) return;

        this.isDialogOpen = true;
        this.dialog.style.display = 'block';
        this.hideInteractionPrompt();
        
        // Frissítjük a fejlesztések listáját
        const upgradesContainer = this.dialog.querySelector('.merchant-upgrades');
        upgradesContainer.innerHTML = '';

        Object.entries(this.game.clickerGame.upgrades).forEach(([type, upgrade]) => {
            const upgradeElement = document.createElement('div');
            upgradeElement.className = 'merchant-upgrade';
            upgradeElement.innerHTML = `
                <div class="upgrade-info">
                    <h3>${type}</h3>
                    <p>${upgrade.description}</p>
                    <p>Level: ${upgrade.level}</p>
                    <p>Cost: ${this.game.clickerGame.formatNumber(upgrade.cost)} clicks</p>
                </div>
                <button class="upgrade-button" ${this.game.clickerGame.clicks < upgrade.cost ? 'disabled' : ''}>
                    Upgrade
                </button>
            `;

            upgradeElement.querySelector('button').addEventListener('click', () => {
                if (this.game.clickerGame.purchaseUpgrade(type)) {
                    this.openDialog(); // Frissítjük a dialogot
                }
            });

            upgradesContainer.appendChild(upgradeElement);
        });
    }

    closeDialog() {
        this.isDialogOpen = false;
        this.dialog.style.display = 'none';
        if (this.getDistanceToPlayer() <= this.interactionDistance) {
            this.showInteractionPrompt();
        }
    }
}

// Make Merchant class globally available
window.Merchant = Merchant; 