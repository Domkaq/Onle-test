class UI {
    constructor() {
        this.mainMenu = document.getElementById('main-menu');
        this.gameContainer = document.getElementById('game-container');
        this.inventoryContainer = null;
        this.isGameStarted = false;
        this.lastEquipTime = 0; // Add cooldown tracking
        this.equipCooldown = 500; // 500ms cooldown between equips
        this.tooltip = null;
        this.createInventoryUI();
        this.createTooltip();
    }

    initialize() {
        // Show main menu by default
        this.showMainMenu();
    }

    hideMainMenu() {
        this.mainMenu.style.display = 'none';
        this.gameContainer.style.display = 'block';
        this.isGameStarted = true;
    }

    showMainMenu() {
        this.mainMenu.style.display = 'flex';
        this.gameContainer.style.display = 'none';
        this.isGameStarted = false;
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

    createInventoryUI() {
        // Create inventory container
        this.inventoryContainer = document.createElement('div');
        this.inventoryContainer.className = 'inventory';
        this.inventoryContainer.style.display = 'none';
        
        // Create inventory header
        const header = document.createElement('div');
        header.className = 'inventory-header';
        header.innerHTML = `
            <h2>Inventory</h2>
            <div class="inventory-close">×</div>
        `;
        this.inventoryContainer.appendChild(header);

        // Create inventory content wrapper
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'inventory-content';

        // Create equipment section
        const equipmentSection = document.createElement('div');
        equipmentSection.className = 'equipment-section';
        
        // Create equipment slots
        const slots = [
            { name: 'Head', type: 'head' },
            { name: 'Chest', type: 'chest' },
            { name: 'Hands', type: 'hands' },
            { name: 'Legs', type: 'legs' },
            { name: 'Feet', type: 'feet' }
        ];

        const equipmentSlots = document.createElement('div');
        equipmentSlots.className = 'equipment-slots';

        slots.forEach(slot => {
            const slotElement = document.createElement('div');
            slotElement.className = 'equipment-slot';
            slotElement.dataset.slot = slot.type;
            slotElement.innerHTML = `
                <div class="slot-icon ${slot.type}-slot"></div>
                <span class="slot-name">${slot.name}</span>
            `;
            equipmentSlots.appendChild(slotElement);
        });

        equipmentSection.appendChild(equipmentSlots);
        
        // Create character preview
        const characterPreview = document.createElement('div');
        characterPreview.className = 'character-preview';
        characterPreview.innerHTML = '<div class="character-model"></div>';
        equipmentSection.appendChild(characterPreview);

        // Create inventory grid section
        const inventorySection = document.createElement('div');
        inventorySection.className = 'inventory-section';
        
        const inventoryGrid = document.createElement('div');
        inventoryGrid.className = 'inventory-grid';
        
        // Create 20 inventory slots
        for (let i = 0; i < 20; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.innerHTML = '<div class="slot-highlight"></div>';
            inventoryGrid.appendChild(slot);
        }
        
        inventorySection.appendChild(inventoryGrid);

        // Add sections to content wrapper
        contentWrapper.appendChild(equipmentSection);
        contentWrapper.appendChild(inventorySection);
        
        this.inventoryContainer.appendChild(contentWrapper);
        document.body.appendChild(this.inventoryContainer);

        // Add event listeners
        this.setupInventoryEvents();
        
        // Add close button event
        header.querySelector('.inventory-close').addEventListener('click', () => {
            this.toggleInventory();
        });
    }

    setupInventoryEvents() {
        // Toggle inventory with 'I' key only when game is started
        document.addEventListener('keydown', (event) => {
            if (event && event.key && event.key.toLowerCase() === 'i' && this.isGameStarted) {
                event.preventDefault(); // Prevent 'i' from being typed in input fields
                this.toggleInventory();
            }
        });
    }

    toggleInventory() {
        if (this.inventoryContainer.style.display === 'none') {
            this.inventoryContainer.style.display = 'block';
            this.updateInventory();
        } else {
            this.inventoryContainer.style.display = 'none';
        }
    }

    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tooltip';
        document.body.appendChild(this.tooltip);

        // Add mousemove event listener to update tooltip position
        document.addEventListener('mousemove', (e) => {
            if (this.tooltip.classList.contains('visible')) {
                const x = e.clientX + 15;
                const y = e.clientY + 15;
                
                // Keep tooltip within viewport
                const tooltipRect = this.tooltip.getBoundingClientRect();
                const maxX = window.innerWidth - tooltipRect.width - 10;
                const maxY = window.innerHeight - tooltipRect.height - 10;
                
                this.tooltip.style.left = `${Math.min(x, maxX)}px`;
                this.tooltip.style.top = `${Math.min(y, maxY)}px`;
            }
        });
    }

    showTooltip(item, event) {
        if (!item) return;
        
        this.tooltip.innerHTML = `
            <div class="tooltip-header">
                <div class="tooltip-name">${item.name}</div>
                <div class="tooltip-type">${item.type}</div>
            </div>
            <div class="tooltip-stats">
                ${this.getItemStats(item)}
            </div>
        `;
        
        this.tooltip.classList.add('visible');
        
        // Initial position
        const x = event.clientX + 15;
        const y = event.clientY + 15;
        this.tooltip.style.left = `${x}px`;
        this.tooltip.style.top = `${y}px`;
    }

    hideTooltip() {
        this.tooltip.classList.remove('visible');
    }

    getItemStats(item) {
        let stats = '';
        
        if (item.defense !== undefined) {
            stats += `<div class="tooltip-stat">
                <span>Defense</span>
                <span class="tooltip-stat-value">+${item.defense}</span>
            </div>`;
        }
        
        if (item.attack !== undefined) {
            stats += `<div class="tooltip-stat">
                <span>Attack</span>
                <span class="tooltip-stat-value">+${item.attack}</span>
            </div>`;
        }
        
        if (item.speed !== undefined) {
            stats += `<div class="tooltip-stat">
                <span>Speed</span>
                <span class="tooltip-stat-value">+${item.speed}</span>
            </div>`;
        }
        
        return stats || '<div class="tooltip-stat">No additional stats</div>';
    }

    updateInventory() {
        if (!window.game || !window.game.player) return;
        
        const player = window.game.player;
        const grid = this.inventoryContainer.querySelector('.inventory-grid');
        
        // Clear all slots
        const slots = grid.querySelectorAll('.inventory-slot');
        slots.forEach(slot => {
            slot.innerHTML = '<div class="slot-highlight"></div>';
            slot.classList.remove('has-item');
        });
        
        // Add items to grid
        player.inventory.getItems().forEach((item, index) => {
            if (index < slots.length) {
                const slot = slots[index];
                slot.classList.add('has-item');
                slot.innerHTML = `
                    <div class="slot-highlight"></div>
                    <div class="item ${item.type}-item" data-item-id="${item.id}">
                        <div class="item-icon"></div>
                        <div class="item-name">${item.name}</div>
                    </div>
                `;
                
                const itemElement = slot.querySelector('.item');
                
                // Add tooltip events
                itemElement.addEventListener('mouseenter', (e) => this.showTooltip(item, e));
                itemElement.addEventListener('mouseleave', () => this.hideTooltip());
                
                if (item.isEquippable) {
                    itemElement.addEventListener('click', () => {
                        const currentTime = Date.now();
                        if (currentTime - this.lastEquipTime < this.equipCooldown) {
                            return;
                        }
                        this.lastEquipTime = currentTime;
                        
                        if (player.equipItem(item)) {
                            if (window.main && window.main.network) {
                                window.main.network.updateEquipment('equip', item);
                            }
                            this.updateInventory();
                        }
                    });
                }
            }
        });
        
        // Update equipment slots
        const equipmentSlots = this.inventoryContainer.querySelectorAll('.equipment-slot');
        equipmentSlots.forEach(slot => {
            const slotType = slot.dataset.slot;
            const equippedItem = player.equipment.get(slotType);
            
            // Reset slot
            slot.classList.remove('equipped');
            const slotIcon = slot.querySelector('.slot-icon');
            slotIcon.innerHTML = '';
            
            // Remove old event listeners
            const oldItem = slotIcon.querySelector('.item');
            if (oldItem) {
                oldItem.replaceWith(oldItem.cloneNode(true));
            }
            
            if (equippedItem) {
                slot.classList.add('equipped');
                slotIcon.innerHTML = `
                    <div class="item ${equippedItem.type}-item" data-item-id="${equippedItem.id}">
                        <div class="item-icon"></div>
                        <div class="item-name">${equippedItem.name}</div>
                    </div>
                `;
                
                const itemElement = slotIcon.querySelector('.item');
                
                // Add tooltip events
                itemElement.addEventListener('mouseenter', (e) => this.showTooltip(equippedItem, e));
                itemElement.addEventListener('mouseleave', () => this.hideTooltip());
                
                itemElement.addEventListener('click', () => {
                    const currentTime = Date.now();
                    if (currentTime - this.lastEquipTime < this.equipCooldown) {
                        return;
                    }
                    this.lastEquipTime = currentTime;
                    
                    if (player.unequipItem(equippedItem.id)) {
                        if (window.main && window.main.network) {
                            window.main.network.updateEquipment('unequip', { id: equippedItem.id });
                        }
                        this.updateInventory();
                    }
                });
            }
        });
    }
}

// Make UI class globally available
window.UI = UI; 