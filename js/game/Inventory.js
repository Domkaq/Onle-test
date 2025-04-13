class Inventory {
    constructor() {
        this.items = new Map();
        this.equippedItems = new Map();
        this.maxSlots = 20;
    }

    addItem(item) {
        if (this.items.size >= this.maxSlots) {
            return false;
        }
        this.items.set(item.id, item);
        return true;
    }

    removeItem(itemId) {
        // First unequip if equipped
        if (this.isItemEquipped(itemId)) {
            this.unequipItem(itemId);
        }
        return this.items.delete(itemId);
    }

    equipItem(itemId) {
        const item = this.items.get(itemId);
        if (!item || !item.isEquippable) {
            return false;
        }

        // Unequip any item in the same slot
        const currentEquipped = this.getEquippedItemInSlot(item.slot);
        if (currentEquipped) {
            this.unequipItem(currentEquipped.id);
        }

        this.equippedItems.set(item.slot, item);
        return true;
    }

    unequipItem(itemId) {
        const item = this.items.get(itemId);
        if (!item) {
            return false;
        }

        return this.equippedItems.delete(item.slot);
    }

    isItemEquipped(itemId) {
        const item = this.items.get(itemId);
        return item && this.equippedItems.get(item.slot)?.id === itemId;
    }

    getEquippedItemInSlot(slot) {
        return this.equippedItems.get(slot);
    }

    getEquippedItems() {
        return Array.from(this.equippedItems.values());
    }

    getItems() {
        return Array.from(this.items.values());
    }
}

// Make Inventory class globally available
window.Inventory = Inventory; 