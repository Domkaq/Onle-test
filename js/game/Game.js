class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.otherPlayers = new Map();
        this.input = new Input();
        
        // Camera properties
        this.cameraDistance = 8;
        this.cameraHeight = 3;
        this.cameraTarget = new THREE.Vector3();
        this.cameraSmoothness = 0.08;
        
        this.initialize();
    }

    initialize() {
        // Create scene with improved fog
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);  // Sky blue
        this.scene.fog = new THREE.FogExp2(0x87ceeb, 0.012);  // Lighter fog
        
        // Create camera with better initial position
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, this.cameraHeight, this.cameraDistance);
        
        // Create renderer with improved settings
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('game-canvas'),
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
        // Setup improved lighting
        this.setupLighting();
        
        // Create enhanced ground
        this.createGround();
        
        // Create richer environment
        this.createEnvironment();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Setup pointer lock on canvas click
        this.renderer.domElement.addEventListener('click', () => {
            if (document.pointerLockElement !== this.renderer.domElement) {
                this.renderer.domElement.requestPointerLock();
            }
        });
        
        // Make game instance globally available
        window.game = this;
        
        // Start animation loop
        this.animate();
    }

    setupLighting() {
        // Ambient light with warmer color
        const ambientLight = new THREE.AmbientLight(0xfff2e6, 0.8);
        this.scene.add(ambientLight);
        
        // Main directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        
        // Improve shadow quality
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        directionalLight.shadow.bias = -0.0001;
        
        this.scene.add(directionalLight);
        
        // Add hemisphere light for better ambient lighting
        const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xfff2e6, 0.7);
        this.scene.add(hemisphereLight);
    }

    createGround() {
        // Create ground plane with larger size
        const groundGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2e8b57,  // Sea green - természetesebb zöld
            roughness: 0.9,
            metalness: 0.0
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        
        // Add grid helper for better depth perception
        const gridHelper = new THREE.GridHelper(200, 50, 0x006400, 0x006400);  // Dark green grid
        gridHelper.material.opacity = 0.15;  // Subtle grid
        gridHelper.material.transparent = true;
        this.scene.add(gridHelper);
        
        this.scene.add(ground);
    }

    createEnvironment() {
        // Create some trees
        for (let i = 0; i < 20; i++) {
            const tree = this.createTree();
            tree.position.x = (Math.random() - 0.5) * 80;
            tree.position.z = (Math.random() - 0.5) * 80;
            this.scene.add(tree);
        }
        
        // Create some flowers
        for (let i = 0; i < 50; i++) {
            const flower = this.createFlower();
            flower.position.x = (Math.random() - 0.5) * 80;
            flower.position.z = (Math.random() - 0.5) * 80;
            this.scene.add(flower);
        }
    }

    createTree() {
        const tree = new THREE.Group();
        
        // Trunk - natural brown color
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.8, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,  // Saddle brown
            roughness: 0.9,
            metalness: 0.1,
            emissive: 0x3d2817,
            emissiveIntensity: 0.1
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 0.9;
        trunk.castShadow = true;
        tree.add(trunk);
        
        // Leaves - natural green
        const leavesGeometry = new THREE.ConeGeometry(1.2, 2.5, 8);
        const leavesMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x228B22,  // Forest green
            roughness: 0.8,
            metalness: 0.1,
            emissive: 0x006400,  // Dark green
            emissiveIntensity: 0.2
        });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 2.8;
        leaves.castShadow = true;
        tree.add(leaves);
        
        return tree;
    }

    createFlower() {
        const flower = new THREE.Group();
        
        // Stem - natural green
        const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
        const stemMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x228B22,  // Forest green
            roughness: 0.7,
            metalness: 0.1,
            emissive: 0x006400,
            emissiveIntensity: 0.1
        });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.15;
        flower.add(stem);
        
        // Flower head - cute pink
        const headGeometry = new THREE.SphereGeometry(0.12, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFF69B4,  // Hot pink
            roughness: 0.4,
            metalness: 0.2,
            emissive: 0xFF1493,
            emissiveIntensity: 0.3
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 0.3;
        head.scale.set(1, 0.7, 1);  // Squished for cuteness
        flower.add(head);
        
        return flower;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update player and camera
        if (this.player) {
            // Update player
            const moved = this.player.update(this.input.keys, this.input.mouseX);
            
            // Update camera position
            this.updateCamera();

            // Send position update to server if player moved or rotated
            if ((moved || this.input.mouseX !== 0) && window.main && window.main.network) {
                window.main.network.updatePosition({
                    x: this.player.mesh.position.x,
                    y: this.player.mesh.position.y,
                    z: this.player.mesh.position.z,
                    rotation: this.player.mesh.rotation.y
                });
            }
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    addOtherPlayer(playerId, playerName, skinColor) {
        const otherPlayer = new Player(playerName, skinColor);
        this.otherPlayers.set(playerId, otherPlayer);
        this.scene.add(otherPlayer.mesh);

        // Ha Sinka csatlakozik, azonnal legyen rajta a szalmakalap
        if (playerName === 'Sinka') {
            const strawHat = Equipment.createItem('helmet', 'Straw Hat', Equipment.SLOTS.HEAD);
            if (strawHat) {
                otherPlayer.equipItem(strawHat);
            }
        }
    }

    removeOtherPlayer(playerId) {
        const otherPlayer = this.otherPlayers.get(playerId);
        if (otherPlayer) {
            this.scene.remove(otherPlayer.mesh);
            this.otherPlayers.delete(playerId);
        }
    }

    updateOtherPlayer(playerId, data) {
        const otherPlayer = this.otherPlayers.get(playerId);
        if (otherPlayer) {
            // Update position
            otherPlayer.mesh.position.x = data.x;
            otherPlayer.mesh.position.y = data.y;
            otherPlayer.mesh.position.z = data.z;
            
            // Update rotation
            if (data.rotation !== undefined) {
                otherPlayer.mesh.rotation.y = data.rotation;
            }
        }
    }

    updateCamera() {
        if (this.player) {
            const playerPos = this.player.mesh.position;
            
            // Calculate camera offset with corrected angles
            const cameraOffset = new THREE.Vector3(
                Math.sin(this.input.mouseX) * this.cameraDistance,
                this.cameraHeight,
                Math.cos(this.input.mouseX) * this.cameraDistance
            );
            
            // Smoothly move camera with dynamic smoothness
            const targetCameraPos = playerPos.clone().add(cameraOffset);
            targetCameraPos.y += Math.sin(this.input.mouseY) * 3; // Apply vertical offset to camera position
            this.camera.position.lerp(targetCameraPos, this.cameraSmoothness);
            
            // Update camera target to look at player
            this.cameraTarget.lerp(playerPos, this.cameraSmoothness);
            this.cameraTarget.y = playerPos.y + 1.5; // Look at player's head level
            
            // Look at target
            this.camera.lookAt(this.cameraTarget);
        }
    }

    requestPointerLock() {
        this.renderer.domElement.requestPointerLock();
    }
}

// Make Game class globally available
window.Game = Game; 