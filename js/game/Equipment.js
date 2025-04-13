class Equipment {
    static SLOTS = {
        HEAD: 'head',
        BODY: 'body',
        HANDS: 'hands',
        FEET: 'feet'
    };

    static createHelmet() {
        const helmet = new THREE.Group();
        
        // Create helmet base
        const helmetGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const helmetMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2d3436,
            roughness: 0.7,
            metalness: 0.3
        });
        const helmetBase = new THREE.Mesh(helmetGeometry, helmetMaterial);
        helmetBase.scale.set(1, 0.8, 1);
        helmet.add(helmetBase);

        // Add visor
        const visorGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16);
        const visorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1a1c20,
            roughness: 0.2,
            metalness: 0.8,
            transparent: true,
            opacity: 0.7
        });
        const visor = new THREE.Mesh(visorGeometry, visorMaterial);
        visor.rotation.x = Math.PI / 2;
        visor.position.y = 0.1;
        helmet.add(visor);

        // Add crest
        const crestGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.05);
        const crestMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x00b894,
            roughness: 0.5,
            metalness: 0.5
        });
        const crest = new THREE.Mesh(crestGeometry, crestMaterial);
        crest.position.y = 0.3;
        helmet.add(crest);

        return helmet;
    }

    static createItem(id, name, slot, type) {
        return {
            id,
            name,
            slot,
            type,
            isEquippable: true,
            model: Equipment[`create${type.charAt(0).toUpperCase() + type.slice(1)}`]()
        };
    }

    static createHelmetItem() {
        return Equipment.createItem(
            'helmet-1',
            'Test Helmet',
            Equipment.SLOTS.HEAD,
            'helmet'
        );
    }

    // Helper method to prepare item for network transmission
    static serializeForNetwork(item) {
        // Create a copy without the model property
        const { model, ...networkItem } = item;
        return networkItem;
    }
}

// Make Equipment class globally available
window.Equipment = Equipment; 