class World {
    constructor() {
        this.mesh = new THREE.Group();
        this.createGround();
        this.createSky();
    }

    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x3a7d44,
            side: THREE.DoubleSide
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.mesh.add(ground);

        // Add grid helper
        const gridHelper = new THREE.GridHelper(100, 100);
        this.mesh.add(gridHelper);
    }

    createSky() {
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87CEEB,
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.mesh.add(sky);
    }
} 