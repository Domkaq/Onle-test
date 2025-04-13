class Player {
    constructor(name = 'Player', skinColor = '#ffd700') {
        this.name = name;
        this.skinColor = skinColor;
        this.mesh = this.createMesh();
        this.speed = 0.15;
        this.rotationSpeed = 0.1;
        this.jumpForce = 0.2;
        this.gravity = 0.01;
        this.verticalVelocity = 0;
        this.isJumping = false;
        
        // Add inventory and equipment
        this.inventory = new Inventory();
        this.equipment = new Map();
        this.equipmentMeshes = new Map(); // Store equipment meshes separately

        // Add test equipment
        this.inventory.addItem({
            id: 'helmet-1',
            name: 'Reinforced Scout Helmet',
            type: 'helmet',
            slot: 'head',
            rarity: 'common',
            defense: 5,
            speed: 1,
            description: 'A lightweight but sturdy helmet favored by scouts. Provides good visibility while maintaining decent protection.',
            isEquippable: true
        });

        this.inventory.addItem({
            id: 'chest-1',
            name: 'Powered Combat Vest',
            type: 'chest',
            slot: 'chest',
            rarity: 'common',
            defense: 8,
            speed: -1,
            description: 'Standard-issue combat armor with an integrated power core for enhanced protection.',
            isEquippable: true
        });

        this.inventory.addItem({
            id: 'hands-1',
            name: 'Tactical Combat Gloves',
            type: 'hands',
            slot: 'hands',
            rarity: 'common',
            defense: 3,
            attack: 2,
            description: 'Reinforced combat gloves with power-assisted grip enhancement.',
            isEquippable: true
        });

        this.inventory.addItem({
            id: 'legs-1',
            name: 'Assault Leg Guards',
            type: 'legs',
            slot: 'legs',
            rarity: 'common',
            defense: 6,
            speed: 2,
            description: 'Lightweight leg armor with integrated movement assist systems.',
            isEquippable: true
        });

        this.inventory.addItem({
            id: 'feet-1',
            name: 'Tactical Combat Boots',
            type: 'feet',
            slot: 'feet',
            rarity: 'common',
            defense: 4,
            speed: 3,
            description: 'Advanced combat boots with shock absorption and enhanced mobility.',
            isEquippable: true
        });
    }

    createMesh() {
        const group = new THREE.Group();

        // Create body (inverted cone with rounded bottom)
        const bodyGeometry = new THREE.ConeGeometry(0.35, 1.0, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: this.skinColor,
            roughness: 0.3,
            metalness: 0.4,
            emissive: this.skinColor,
            emissiveIntensity: 0.2
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;  // Body sits on the ground
        body.rotation.x = Math.PI;
        body.castShadow = true;
        group.add(body);

        // Create head (smaller and cuter)
        const headGeometry = new THREE.SphereGeometry(0.25, 32, 32);
        const headMaterial = new THREE.MeshStandardMaterial({ 
            color: this.skinColor,
            roughness: 0.3,
            metalness: 0.4,
            emissive: this.skinColor,
            emissiveIntensity: 0.2
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.3;  // Head floats above body
        head.scale.set(1, 0.9, 1); // Slightly squish for cuteness
        head.castShadow = true;
        group.add(head);

        // Create equipment container
        const equipmentContainer = new THREE.Group();
        equipmentContainer.name = 'equipmentContainer';
        group.add(equipmentContainer);

        // Create eyes (more expressive)
        const eyeGeometry = new THREE.SphereGeometry(0.05, 32, 32);
        const eyeMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x000000,
            roughness: 0.1,
            metalness: 0.8
        });
        
        // Left eye
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.08, 1.35, 0.2);
        group.add(leftEye);
        
        // Right eye
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.08, 1.35, 0.2);
        group.add(rightEye);

        // Add eye shine
        const shineGeometry = new THREE.SphereGeometry(0.015, 16, 16);
        const shineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        
        const leftShine = new THREE.Mesh(shineGeometry, shineMaterial);
        leftShine.position.set(-0.06, 1.37, 0.23);
        group.add(leftShine);
        
        const rightShine = new THREE.Mesh(shineGeometry, shineMaterial);
        rightShine.position.set(0.1, 1.37, 0.23);
        group.add(rightShine);

        // Create modern name tag with CSS-inspired design
        const nameTagGroup = new THREE.Group();
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;
        
        // Create semi-transparent dark background with better contrast
        context.fillStyle = 'rgba(0, 0, 0, 0.75)';  // Increased opacity for better visibility
        
        // Draw modern rounded rectangle
        const radius = 10;
        context.beginPath();
        context.moveTo(radius, 0);
        context.lineTo(canvas.width - radius, 0);
        context.arcTo(canvas.width, 0, canvas.width, radius, radius);
        context.lineTo(canvas.width, canvas.height - radius);
        context.arcTo(canvas.width, canvas.height, canvas.width - radius, canvas.height, radius);
        context.lineTo(radius, canvas.height);
        context.arcTo(0, canvas.height, 0, canvas.height - radius, radius);
        context.lineTo(0, radius);
        context.arcTo(0, 0, radius, 0, radius);
        context.closePath();
        context.fill();

        // Set text style with larger font
        const fontSize = 64;  // Increased font size
        context.font = `bold ${fontSize}px Arial, sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Add padding
        const paddingY = 20;
        const paddingX = 27;

        // Draw white text with better visibility
        context.fillStyle = '#FFFFFF';
        // Add text shadow for better contrast
        context.shadowColor = 'rgba(0, 0, 0, 0.5)';
        context.shadowBlur = 4;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 2;
        context.fillText(this.name, centerX, centerY);

        const nameTexture = new THREE.CanvasTexture(canvas);
        nameTexture.minFilter = THREE.LinearFilter;
        nameTexture.magFilter = THREE.LinearFilter;
        
        const nameMaterial = new THREE.SpriteMaterial({
            map: nameTexture,
            sizeAttenuation: true,
            depthTest: false,
            transparent: true
        });
        
        const nameTag = new THREE.Sprite(nameMaterial);
        nameTag.scale.set(1.2, 0.3, 1);  // Increased base scale
        nameTag.center.set(0.5, 1.0);
        
        nameTagGroup.add(nameTag);
        nameTagGroup.position.y = 1.9;  // Slightly lower position to be closer to head
        
        group.add(nameTagGroup);
        
        // Add particle system for movement effect
        const particleSystem = this.createParticleSystem();
        group.add(particleSystem);

        return group;
    }

    createParticleSystem() {
        const particleCount = 20;
        const particles = new THREE.Group();
        
        const geometry = new THREE.SphereGeometry(0.03, 4, 4);
        const material = new THREE.MeshBasicMaterial({
            color: this.skinColor,
            transparent: true,
            opacity: 0.6
        });

        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(geometry, material);
            particle.visible = false;
            particle.velocity = new THREE.Vector3();
            particles.add(particle);
        }

        particles.name = 'particles';
        return particles;
    }

    emitParticles() {
        const particles = this.mesh.getObjectByName('particles').children;
        for (const particle of particles) {
            if (!particle.visible) {
                particle.position.set(
                    (Math.random() - 0.5) * 0.5,
                    0,
                    (Math.random() - 0.5) * 0.5
                );
                particle.velocity.set(
                    (Math.random() - 0.5) * 0.05,
                    Math.random() * 0.1,
                    (Math.random() - 0.5) * 0.05
                );
                particle.visible = true;
                break;
            }
        }
    }

    updateParticles() {
        const particles = this.mesh.getObjectByName('particles').children;
        for (const particle of particles) {
            if (particle.visible) {
                particle.position.add(particle.velocity);
                particle.velocity.y -= 0.003;
                particle.material.opacity -= 0.02;

                if (particle.material.opacity <= 0) {
                    particle.visible = false;
                    particle.material.opacity = 0.6;
                }
            }
        }
    }

    update(keys, cameraAngle) {
        // Handle movement based on input and camera angle
        let moved = false;
        let moveX = 0;
        let moveZ = 0;
        
        // Calculate movement direction relative to camera
        if (keys.forward) {
            moveZ -= Math.cos(cameraAngle);
            moveX -= Math.sin(cameraAngle);
            moved = true;
        }
        if (keys.backward) {
            moveZ += Math.cos(cameraAngle);
            moveX += Math.sin(cameraAngle);
            moved = true;
        }
        if (keys.left) {
            moveX -= Math.cos(cameraAngle);
            moveZ += Math.sin(cameraAngle);
            moved = true;
        }
        if (keys.right) {
            moveX += Math.cos(cameraAngle);
            moveZ -= Math.sin(cameraAngle);
            moved = true;
        }

        // Handle jumping
        if (keys.jump && !this.isJumping) {
            this.verticalVelocity = this.jumpForce;
            this.isJumping = true;
        }

        // Apply gravity
        this.verticalVelocity -= this.gravity;
        this.mesh.position.y += this.verticalVelocity;

        // Ground collision
        if (this.mesh.position.y <= 1) {
            this.mesh.position.y = 1;
            this.verticalVelocity = 0;
            this.isJumping = false;
        }

        // Normalize diagonal movement
        if (moveX !== 0 && moveZ !== 0) {
            const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
            moveX /= length;
            moveZ /= length;
        }

        // Apply movement
        if (moved) {
            this.mesh.position.x += moveX * this.speed;
            this.mesh.position.z += moveZ * this.speed;
            
            // Rotate player to face movement direction
            const angle = Math.atan2(moveX, moveZ);
            const targetRotation = angle;
            
            // Smooth rotation
            let rotationDiff = targetRotation - this.mesh.rotation.y;
            
            // Normalize rotation difference to [-PI, PI]
            if (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
            if (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;
            
            this.mesh.rotation.y += rotationDiff * this.rotationSpeed;

            // Emit particles when moving
            if (Math.random() < 0.3) {
                this.emitParticles();
            }
        }

        // Update particles
        this.updateParticles();

        // Update name tag with enhanced visibility
        const nameTagGroup = this.mesh.children[this.mesh.children.length - 2];
        const nameTag = nameTagGroup.children[0];
        
        if (window.game && window.game.camera) {
            const camera = window.game.camera;
            
            // Enhanced scaling for better visibility at all distances
            const distance = camera.position.distanceTo(this.mesh.position);
            const baseScale = Math.max(1.0, Math.min(1.8, distance * 0.12));  // Increased minimum and maximum scale
            
            // Subtle floating animation
            const time = Date.now() * 0.001;
            const floatOffset = Math.sin(time * 1.2) * 0.02;
            nameTagGroup.position.y = 1.9 + floatOffset;  // Adjusted base height
            
            // Smooth scale transition with larger base size
            const scaleFactor = 0.05;
            nameTag.scale.x += (baseScale * 1.2 - nameTag.scale.x) * scaleFactor;
            nameTag.scale.y += (baseScale * 0.3 - nameTag.scale.y) * scaleFactor;
            
            // Always face camera
            nameTag.quaternion.copy(camera.quaternion);
        }

        return moved;
    }

    equipItem(item) {
        // If the item comes from network and doesn't have a model, create it
        if (!item.model) {
            switch(item.type) {
                case 'helmet':
                    item.model = Equipment.createHelmet();
                    break;
                case 'chest':
                    item.model = Equipment.createChest();
                    break;
                case 'hands':
                    item.model = Equipment.createHands();
                    break;
                case 'legs':
                    item.model = Equipment.createLegs();
                    break;
                case 'feet':
                    item.model = Equipment.createFeet();
                    break;
            }
        }

        if (this.inventory.equipItem(item.id)) {
            // Remove existing equipment in the same slot
            if (this.equipment.has(item.slot)) {
                const oldEquipment = this.equipment.get(item.slot);
                const oldMesh = this.equipmentMeshes.get(item.slot);
                if (oldMesh) {
                    const equipmentContainer = this.mesh.getObjectByName('equipmentContainer');
                    if (equipmentContainer) {
                        equipmentContainer.remove(oldMesh);
                    }
                }
                this.equipment.delete(item.slot);
                this.equipmentMeshes.delete(item.slot);
            }
            
            // Add new equipment
            const equipmentModel = item.model.clone();
            this.equipment.set(item.slot, item);

            // Create a new group for the equipment
            const equipmentGroup = new THREE.Group();
            equipmentGroup.name = `equipment_${item.slot}`;
            
            // Reset model position within its group
            equipmentModel.position.set(0, 0, 0);
            equipmentGroup.add(equipmentModel);

            // Base positions for equipment relative to character body
            const positions = {
                [Equipment.SLOTS.HEAD]: { y: 1.3 },    // Align with head
                [Equipment.SLOTS.CHEST]: { y: 0.7 },   // Upper body
                [Equipment.SLOTS.HANDS]: { y: 0.6 },   // Just below chest
                [Equipment.SLOTS.LEGS]: { y: 0.4 },    // Lower body
                [Equipment.SLOTS.FEET]: { y: 0.15 }    // Near ground
            };

            // Set the group's position
            const pos = positions[item.slot];
            if (pos) {
                equipmentGroup.position.y = pos.y;
            }

            // Store the group
            this.equipmentMeshes.set(item.slot, equipmentGroup);

            // Add to equipment container
            const equipmentContainer = this.mesh.getObjectByName('equipmentContainer');
            if (equipmentContainer) {
                equipmentContainer.add(equipmentGroup);
            }

            return true;
        }
        return false;
    }

    unequipItem(itemId) {
        const item = this.inventory.items.get(itemId);
        if (item && this.equipment.has(item.slot)) {
            const equipmentGroup = this.equipmentMeshes.get(item.slot);
            if (equipmentGroup) {
                // Remove from equipment container
                const equipmentContainer = this.mesh.getObjectByName('equipmentContainer');
                if (equipmentContainer) {
                    equipmentContainer.remove(equipmentGroup);
                }
                
                // Clean up maps
                this.equipment.delete(item.slot);
                this.equipmentMeshes.delete(item.slot);
                this.inventory.unequipItem(itemId);
                return true;
            }
        }
        return false;
    }

    getEquippedItems() {
        return Array.from(this.equipment.values());
    }
}

// Make Player class globally available
window.Player = Player; 