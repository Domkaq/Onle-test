class Equipment {
    static SLOTS = {
        HEAD: 'head',
        CHEST: 'chest',
        HANDS: 'hands',
        LEGS: 'legs',
        FEET: 'feet'
    };

    static createHelmet() {
        const helmetGroup = new THREE.Group();

        // Alap sisak forma - most hosszabb és oválisabb
        const baseGeometry = new THREE.SphereGeometry(0.3, 32, 32);
        const helmetMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d3436,
            metalness: 0.7,
            roughness: 0.3,
            envMapIntensity: 1.0
        });
        const base = new THREE.Mesh(baseGeometry, helmetMaterial);
        base.scale.set(1, 0.8, 1.2); // Nyújtottabb forma
        helmetGroup.add(base);

        // Sisak hátsó része (nyakvédő)
        const neckGuardGeometry = new THREE.CylinderGeometry(0.31, 0.28, 0.2, 32, 1, true, -Math.PI/2, Math.PI);
        const neckGuard = new THREE.Mesh(neckGuardGeometry, helmetMaterial);
        neckGuard.position.set(0, -0.2, -0.05);
        neckGuard.rotation.x = Math.PI / 6;
        helmetGroup.add(neckGuard);

        // Sisak elülső része (szemvédő)
        const visorGeometry = new THREE.BoxGeometry(0.6, 0.15, 0.05);
        const visorMaterial = new THREE.MeshStandardMaterial({
            color: 0x00cec9,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.6,
            envMapIntensity: 1.2
        });
        const visor = new THREE.Mesh(visorGeometry, visorMaterial);
        visor.position.set(0, -0.05, 0.2);
        visor.rotation.x = Math.PI / 8;
        helmetGroup.add(visor);

        // Sisak pereme
        const rimGeometry = new THREE.TorusGeometry(0.3, 0.02, 16, 32, Math.PI);
        const rimMaterial = new THREE.MeshStandardMaterial({
            color: 0x00b894,
            metalness: 0.8,
            roughness: 0.2,
            envMapIntensity: 1.0
        });
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        rim.position.set(0, -0.25, 0);
        rim.rotation.x = Math.PI;
        helmetGroup.add(rim);

        // Páncél lemezek a tetején
        const plateGeometry = new THREE.BoxGeometry(0.4, 0.02, 0.5);
        const plateMaterial = new THREE.MeshStandardMaterial({
            color: 0x00b894,
            metalness: 0.8,
            roughness: 0.3,
            envMapIntensity: 1.0
        });
        
        // Felső páncél
        const topPlate = new THREE.Mesh(plateGeometry, plateMaterial);
        topPlate.position.set(0, 0.15, 0);
        topPlate.rotation.x = Math.PI / 6;
        helmetGroup.add(topPlate);

        // Oldalsó páncél lemezek
        const sidePlateGeometry = new THREE.BoxGeometry(0.02, 0.2, 0.4);
        
        const leftPlate = new THREE.Mesh(sidePlateGeometry, plateMaterial);
        leftPlate.position.set(-0.3, 0, 0);
        leftPlate.rotation.z = Math.PI / 12;
        helmetGroup.add(leftPlate);

        const rightPlate = new THREE.Mesh(sidePlateGeometry, plateMaterial);
        rightPlate.position.set(0.3, 0, 0);
        rightPlate.rotation.z = -Math.PI / 12;
        helmetGroup.add(rightPlate);

        // Antenna a jobb oldalon
        const antennaGeometry = new THREE.CylinderGeometry(0.01, 0.005, 0.2, 8);
        const antennaMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d3436,
            metalness: 0.9,
            roughness: 0.1
        });
        const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
        antenna.position.set(0.25, 0.2, -0.1);
        antenna.rotation.z = -Math.PI / 6;
        helmetGroup.add(antenna);

        // Antenna vége
        const antennaTipGeometry = new THREE.SphereGeometry(0.01, 8, 8);
        const antennaTip = new THREE.Mesh(antennaTipGeometry, rimMaterial);
        antennaTip.position.set(0.31, 0.3, -0.1);
        helmetGroup.add(antennaTip);

        // Légzőnyílások az oldalon
        const ventGeometry = new THREE.BoxGeometry(0.05, 0.02, 0.02);
        const ventMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d3436,
            metalness: 0.6,
            roughness: 0.4
        });

        // Szellőzők mindkét oldalon
        for (let side of [-1, 1]) {
            for (let i = 0; i < 3; i++) {
                const vent = new THREE.Mesh(ventGeometry, ventMaterial);
                vent.position.set(side * 0.25, -0.1, -0.1 + i * 0.1);
                helmetGroup.add(vent);
            }
        }

        // Fényes részek hozzáadása
        const highlightGeometry = new THREE.SphereGeometry(0.29, 32, 32);
        const highlightMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 1.0,
            roughness: 0.1,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
        highlight.scale.set(1, 0.8, 1.2);
        helmetGroup.add(highlight);

        // Méretezés és pozicionálás
        helmetGroup.scale.set(0.8, 0.8, 0.8);
        helmetGroup.position.y = 0.1;

        return helmetGroup;
    }

    static createChest() {
        const chestGroup = new THREE.Group();

        // Alap páncél test - most jobban követi a karakter formáját
        const bodyGeometry = new THREE.CylinderGeometry(0.25, 0.2, 0.4, 8);
        const armorMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d3436,
            metalness: 0.7,
            roughness: 0.3,
            envMapIntensity: 1.0
        });
        const body = new THREE.Mesh(bodyGeometry, armorMaterial);
        body.scale.set(1.1, 1, 0.8); // Szélesebb, de laposabb
        chestGroup.add(body);

        // Váll védők
        const shoulderGeometry = new THREE.SphereGeometry(0.12, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const shoulderMaterial = new THREE.MeshStandardMaterial({
            color: 0x00b894,
            metalness: 0.8,
            roughness: 0.2,
            envMapIntensity: 1.0
        });

        // Bal váll
        const leftShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
        leftShoulder.position.set(-0.28, 0.1, 0);
        leftShoulder.rotation.z = -Math.PI / 6;
        chestGroup.add(leftShoulder);

        // Jobb váll
        const rightShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
        rightShoulder.position.set(0.28, 0.1, 0);
        rightShoulder.rotation.z = Math.PI / 6;
        chestGroup.add(rightShoulder);

        // Mellkas páncél lemezek
        const plateGeometry = new THREE.BoxGeometry(0.25, 0.25, 0.05);
        const plateMaterial = new THREE.MeshStandardMaterial({
            color: 0x00b894,
            metalness: 0.8,
            roughness: 0.2,
            envMapIntensity: 1.0
        });

        // Első páncél
        const frontPlate = new THREE.Mesh(plateGeometry, plateMaterial);
        frontPlate.position.set(0, 0, 0.15);
        chestGroup.add(frontPlate);

        // Hátsó páncél
        const backPlate = new THREE.Mesh(plateGeometry, plateMaterial);
        backPlate.position.set(0, 0, -0.15);
        chestGroup.add(backPlate);

        // Energia mag a mellkason
        const coreGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const coreMaterial = new THREE.MeshStandardMaterial({
            color: 0x00cec9,
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0x00cec9,
            emissiveIntensity: 0.5
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        core.position.set(0, 0, 0.18);
        chestGroup.add(core);

        // Pozicionálás a karakterhez
        chestGroup.position.y = -0.2;

        return chestGroup;
    }

    static createHands() {
        const handsGroup = new THREE.Group();

        // Alap kesztyű forma
        const gloveGeometry = new THREE.BoxGeometry(0.08, 0.15, 0.08);
        const gloveMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d3436,
            metalness: 0.7,
            roughness: 0.3,
            envMapIntensity: 1.0
        });

        // Kesztyű párok
        for (let side of [-1, 1]) {
            const glove = new THREE.Mesh(gloveGeometry, gloveMaterial);
            glove.position.set(side * 0.35, 0, 0);
            handsGroup.add(glove);

            // Páncél lemezek a kesztyűn
            const plateGeometry = new THREE.BoxGeometry(0.09, 0.1, 0.02);
            const plateMaterial = new THREE.MeshStandardMaterial({
                color: 0x00b894,
                metalness: 0.8,
                roughness: 0.2,
                envMapIntensity: 1.0
            });
            const plate = new THREE.Mesh(plateGeometry, plateMaterial);
            plate.position.set(0, 0, 0.05);
            glove.add(plate);

            // Energia vonalak
            const lineGeometry = new THREE.BoxGeometry(0.01, 0.12, 0.01);
            const lineMaterial = new THREE.MeshStandardMaterial({
                color: 0x00cec9,
                metalness: 0.9,
                roughness: 0.1,
                emissive: 0x00cec9,
                emissiveIntensity: 0.5
            });
            
            for (let i = -1; i <= 1; i += 2) {
                const line = new THREE.Mesh(lineGeometry, lineMaterial);
                line.position.set(i * 0.02, 0, 0.06);
                glove.add(line);
            }
        }

        // Pozicionálás a karakterhez
        handsGroup.position.y = -0.3;

        return handsGroup;
    }

    static createLegs() {
        const legsGroup = new THREE.Group();

        // Alap láb páncél
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.08, 0.3, 8);
        const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d3436,
            metalness: 0.7,
            roughness: 0.3,
            envMapIntensity: 1.0
        });

        // Két láb
        for (let side of [-1, 1]) {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(side * 0.12, 0, 0);
            legsGroup.add(leg);

            // Térd védő
            const kneeGeometry = new THREE.BoxGeometry(0.12, 0.12, 0.1);
            const kneeMaterial = new THREE.MeshStandardMaterial({
                color: 0x00b894,
                metalness: 0.8,
                roughness: 0.2,
                envMapIntensity: 1.0
            });
            const knee = new THREE.Mesh(kneeGeometry, kneeMaterial);
            knee.position.set(0, 0.05, 0.08);
            leg.add(knee);

            // Energia csíkok
            const stripeMaterial = new THREE.MeshStandardMaterial({
                color: 0x00cec9,
                metalness: 0.9,
                roughness: 0.1,
                emissive: 0x00cec9,
                emissiveIntensity: 0.5
            });

            // Oldalsó csíkok
            const stripeGeometry = new THREE.BoxGeometry(0.02, 0.2, 0.02);
            for (let i = -1; i <= 1; i += 2) {
                const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
                stripe.position.set(i * 0.04, 0, 0);
                leg.add(stripe);
            }
        }

        // Pozicionálás a karakterhez
        legsGroup.position.y = -0.5;

        return legsGroup;
    }

    static createFeet() {
        const feetGroup = new THREE.Group();

        // Alap csizma forma
        const bootGeometry = new THREE.BoxGeometry(0.12, 0.1, 0.2);
        const bootMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d3436,
            metalness: 0.7,
            roughness: 0.3,
            envMapIntensity: 1.0
        });

        // Két csizma
        for (let side of [-1, 1]) {
            const boot = new THREE.Mesh(bootGeometry, bootMaterial);
            boot.position.set(side * 0.12, 0, 0);
            feetGroup.add(boot);

            // Páncél borítás
            const armorGeometry = new THREE.BoxGeometry(0.13, 0.08, 0.15);
            const armorMaterial = new THREE.MeshStandardMaterial({
                color: 0x00b894,
                metalness: 0.8,
                roughness: 0.2,
                envMapIntensity: 1.0
            });
            const armor = new THREE.Mesh(armorGeometry, armorMaterial);
            armor.position.set(0, 0.04, 0);
            boot.add(armor);

            // Talp
            const soleGeometry = new THREE.BoxGeometry(0.14, 0.04, 0.25);
            const soleMaterial = new THREE.MeshStandardMaterial({
                color: 0x00b894,
                metalness: 0.6,
                roughness: 0.4,
                envMapIntensity: 0.8
            });
            const sole = new THREE.Mesh(soleGeometry, soleMaterial);
            sole.position.set(0, -0.05, 0);
            boot.add(sole);

            // Energia csík
            const stripGeometry = new THREE.BoxGeometry(0.1, 0.02, 0.02);
            const stripeMaterial = new THREE.MeshStandardMaterial({
                color: 0x00cec9,
                metalness: 0.9,
                roughness: 0.1,
                emissive: 0x00cec9,
                emissiveIntensity: 0.5
            });
            const stripe = new THREE.Mesh(stripGeometry, stripeMaterial);
            stripe.position.set(0, 0, 0.1);
            boot.add(stripe);
        }

        // Pozicionálás a karakterhez
        feetGroup.position.y = -0.7;

        return feetGroup;
    }

    static createItem(id, name, slot, type) {
        const item = {
            id,
            name,
            slot,
            type,
            isEquippable: true
        };

        // Create the 3D model based on type
        switch(type) {
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

        return item;
    }

    static createHelmetItem() {
        return Equipment.createItem(
            'helmet-1',
            'Test Helmet',
            Equipment.SLOTS.HEAD,
            'helmet'
        );
    }

    static createChestItem() {
        return Equipment.createItem(
            'chest-1',
            'Test Chest Armor',
            Equipment.SLOTS.CHEST,
            'chest'
        );
    }

    static createHandsItem() {
        return Equipment.createItem(
            'hands-1',
            'Test Gauntlets',
            Equipment.SLOTS.HANDS,
            'hands'
        );
    }

    static createLegsItem() {
        return Equipment.createItem(
            'legs-1',
            'Test Leg Armor',
            Equipment.SLOTS.LEGS,
            'legs'
        );
    }

    static createFeetItem() {
        return Equipment.createItem(
            'feet-1',
            'Test Boots',
            Equipment.SLOTS.FEET,
            'feet'
        );
    }

    // Helper method to prepare item for network transmission
    static serializeForNetwork(item) {
        const { model, ...networkItem } = item;
        return networkItem;
    }
}

// Make Equipment class globally available
window.Equipment = Equipment; 