class Input {
    constructor() {
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false
        };

        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;
        this.mouseSensitivity = 0.003;
        this.isMouseDown = false;
        this.isMouseLocked = false;

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (event) => this.onKeyDown(event));
        document.addEventListener('keyup', (event) => this.onKeyUp(event));
        document.addEventListener('mousemove', (event) => this.onMouseMove(event));
        document.addEventListener('mousedown', (event) => this.onMouseDown(event));
        document.addEventListener('mouseup', (event) => this.onMouseUp(event));
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
        document.addEventListener('pointerlockerror', () => this.onPointerLockError());
    }

    onKeyDown(event) {
        if (!event || !event.key) return;

        switch (event.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.keys.forward = true;
                break;
            case 's':
            case 'arrowdown':
                this.keys.backward = true;
                break;
            case 'a':
            case 'arrowleft':
                this.keys.left = true;
                break;
            case 'd':
            case 'arrowright':
                this.keys.right = true;
                break;
            case ' ':
                this.keys.jump = true;
                break;
            case 'escape':
                if (this.isMouseLocked) {
                    document.exitPointerLock();
                }
                break;
        }
    }

    onKeyUp(event) {
        if (!event || !event.key) return;

        switch (event.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.keys.forward = false;
                break;
            case 's':
            case 'arrowdown':
                this.keys.backward = false;
                break;
            case 'a':
            case 'arrowleft':
                this.keys.left = false;
                break;
            case 'd':
            case 'arrowright':
                this.keys.right = false;
                break;
            case ' ':
                this.keys.jump = false;
                break;
        }
    }

    onMouseDown(event) {
        // Bal egérgomb (0)
        if (event.button === 0) {
            // Ne blokkoljuk a UI elemekre való kattintást
            if (event.target.closest('.inventory') || 
                event.target.closest('.menu') || 
                event.target.closest('.merchant-dialog')) {
                return;
            }
            
            this.isMouseDown = true;
        }
    }

    onMouseUp(event) {
        // Bal egérgomb (0)
        if (event.button === 0) {
            this.isMouseDown = false;
        }
    }

    onMouseMove(event) {
        // Csak akkor forgassuk a kamerát, ha le van nyomva az egérgomb
        if (this.isMouseDown) {
            // Update rotation based on mouse movement
            this.targetMouseX += event.movementX * this.mouseSensitivity;
            this.targetMouseY += event.movementY * this.mouseSensitivity; // Removed inversion
            
            // Smoothly interpolate current rotation
            this.mouseX += (this.targetMouseX - this.mouseX) * 0.1;
            this.mouseY += (this.targetMouseY - this.mouseY) * 0.1;
            
            // Limit vertical rotation to reasonable angles
            this.mouseY = Math.max(-0.5, Math.min(0.5, this.mouseY));
        }
    }

    onPointerLockChange() {
        this.isMouseLocked = document.pointerLockElement !== null;
        
        if (this.isMouseLocked) {
            // Reset mouse position when pointer is locked
            this.mouseX = 0;
            this.mouseY = 0;
            this.targetMouseX = 0;
            this.targetMouseY = 0;
        }
        
        // Update UI elements
        const controlsInfo = document.querySelector('.controls-info');
        if (controlsInfo) {
            controlsInfo.style.display = this.isMouseLocked ? 'none' : 'block';
        }
    }

    onPointerLockError() {
        console.warn('Pointer lock error');
        
        // Show error message to user
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = 'Egér zárolási hiba történt. Kattints újra a játékterületre.';
        document.body.appendChild(errorMessage);
        
        setTimeout(() => {
            errorMessage.remove();
        }, 3000);
    }
}

// Make Input class globally available
window.Input = Input; 