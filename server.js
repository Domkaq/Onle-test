const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const path = require('path');
const { initDatabase, savePlayerProgress, loadPlayerProgress, startAutoSave } = require('./js/db');

// Initialize database
initDatabase().catch(console.error);

// Serve static files
app.use(express.static(path.join(__dirname)));

// Store connected players with their equipment
const players = new Map();

// Store clicker game data for each player
const playerClickerData = new Map();

// Start auto-save system
startAutoSave(playerClickerData);

// Maximum allowed clicks per second to prevent automated clicking
const MAX_CLICKS_PER_SECOND = 200;
const clickRateLimits = new Map();

// XP és szint rendszer konfigurációja
const xpConfig = {
    baseXP: 250,
    xpMultiplier: 2.0,
    xpPerClick: 0.2,
    getRequiredXP: (level) => Math.floor(xpConfig.baseXP * Math.pow(xpConfig.xpMultiplier, level - 1))
};

// Szint bónuszok konfigurációja
const levelBonuses = {
    critChancePerLevel: 0.003,
    critMultiplierPerLevel: 0.05,
    clickValuePerLevel: 0.2,
    baseCritChance: 0.02,
    baseCritMultiplier: 1.5,
    baseClickValue: 1,
    getCritChance: (level) => levelBonuses.baseCritChance + (level - 1) * levelBonuses.critChancePerLevel,
    getCritMultiplier: (level) => levelBonuses.baseCritMultiplier + (level - 1) * levelBonuses.critMultiplierPerLevel,
    getClickValue: (level) => levelBonuses.baseClickValue + (level - 1) * levelBonuses.clickValuePerLevel
};

// Speciális szint mérföldkövek
const levelMilestones = {
    5: {
        critChanceBonus: 0.01,
        description: "Unlocked: Enhanced Critical Chance"
    },
    10: {
        critMultiplierBonus: 0.2,
        description: "Unlocked: Enhanced Critical Damage"
    },
    15: {
        clickValueBonus: 0.5,
        description: "Unlocked: Enhanced Click Value"
    },
    20: {
        allStatsBonus: 0.1,
        description: "Unlocked: All Stats Enhancement"
    },
    25: {
        ultraBonus: 0.2,
        description: "Unlocked: Ultra Enhancement"
    }
};

// Mérföldkő bónuszok számítása
function calculateMilestoneBonuses(level) {
    let bonuses = {
        critChance: 0,
        critMultiplier: 0,
        clickValue: 0
    };

    Object.entries(levelMilestones).forEach(([milestoneLevel, milestone]) => {
        if (level >= parseInt(milestoneLevel)) {
            if (milestone.critChanceBonus) bonuses.critChance += milestone.critChanceBonus;
            if (milestone.critMultiplierBonus) bonuses.critMultiplier += milestone.critMultiplierBonus;
            if (milestone.clickValueBonus) bonuses.clickValue += milestone.clickValueBonus;
            if (milestone.allStatsBonus) {
                bonuses.critChance += levelBonuses.baseCritChance * milestone.allStatsBonus;
                bonuses.critMultiplier += levelBonuses.baseCritMultiplier * milestone.allStatsBonus;
                bonuses.clickValue += levelBonuses.baseClickValue * milestone.allStatsBonus;
            }
            if (milestone.ultraBonus) {
                bonuses.critChance += levelBonuses.baseCritChance * milestone.ultraBonus;
                bonuses.critMultiplier += levelBonuses.baseCritMultiplier * milestone.ultraBonus;
                bonuses.clickValue += levelBonuses.baseClickValue * milestone.ultraBonus;
            }
        }
    });

    return bonuses;
}

io.on('connection', (socket) => {
    console.log('A user connected');

    // Send current player list to new player with equipment data
    const playerList = Array.from(players.values()).map(player => ({
        id: player.id,
        name: player.name,
        skinColor: player.skinColor,
        position: player.position,
        equipment: player.equipment || []
    }));
    socket.emit('player-list', playerList);

    // Handle player join
    socket.on('player-join', async (data) => {
        console.log('Player joined:', data);
        const playerData = {
            id: socket.id,
            name: data.name,
            skinColor: data.skinColor,
            position: data.position,
            equipment: data.equipment || []
        };
        players.set(socket.id, playerData);
        
        // Try to load existing progress using player name
        const savedProgress = await loadPlayerProgress(data.name);
        
        // Initialize or load clicker game data for this player
        if (savedProgress) {
            console.log('Loading saved progress for player:', data.name);
            playerClickerData.set(socket.id, {
                ...savedProgress,
                combo: 0,
                comboMultiplier: 0,
                lastClick: Date.now()
            });
        } else {
            console.log('Creating new progress for player:', data.name);
            playerClickerData.set(socket.id, {
                name: data.name,
                clicks: 0,
                gold: 0,
                combo: 0,
                comboMultiplier: 0,
                xp: 0,
                level: 1,
                critChance: levelBonuses.baseCritChance,
                critMultiplier: levelBonuses.baseCritMultiplier,
                clickValue: levelBonuses.baseClickValue,
                upgrades: {
                    comboTime: { level: 1 },
                    comboThreshold: { level: 1 },
                    comboMultiplier: { level: 1 }
                },
                lastClick: Date.now()
            });
        }
        
        // Send initial clicker data to player
        socket.emit('clicker-data', playerClickerData.get(socket.id));
        
        // Broadcast to other players with full equipment data
        socket.broadcast.emit('player-joined', playerData);
        
        // Send all existing players' click counts to the new player
        players.forEach((player, playerId) => {
            if (playerClickerData.has(playerId)) {
                socket.emit('player-click-count', {
                    id: playerId,
                    clicks: playerClickerData.get(playerId).clicks,
                    level: playerClickerData.get(playerId).level
                });
            }
        });
    });

    // Handle player movement
    socket.on('player-move', (data) => {
        if (players.has(socket.id)) {
            const player = players.get(socket.id);
            player.position = data.position;
            socket.broadcast.emit('player-moved', {
                id: socket.id,
                position: data.position
            });
        }
    });

    // Handle clicker game clicks
    socket.on('clicker-click', () => {
        if (!playerClickerData.has(socket.id)) return;
        
        // Rate limiting to prevent automated clicking
        const now = Date.now();
        const playerData = playerClickerData.get(socket.id);
        
        // Calculate clicks per second
        if (!clickRateLimits.has(socket.id)) {
            clickRateLimits.set(socket.id, {
                clicks: 0,
                resetTime: now + 1000
            });
        }
        
        const rateLimit = clickRateLimits.get(socket.id);
        
        // Reset rate limit counter every second
        if (now > rateLimit.resetTime) {
            rateLimit.clicks = 0;
            rateLimit.resetTime = now + 1000;
        }
        
        // Increment and check rate limit
        rateLimit.clicks++;
        if (rateLimit.clicks > MAX_CLICKS_PER_SECOND) {
            console.log(`Rate limit exceeded for player ${players.get(socket.id)?.name || socket.id}`);
            return;
        }
        
        // Calculate click value and XP gain
        let clickValue = levelBonuses.getClickValue(playerData.level);
        let xpGain = xpConfig.xpPerClick; // Alap XP gain kattintásonként
        
        // Mérföldkő bónuszok hozzáadása
        const milestones = calculateMilestoneBonuses(playerData.level);
        clickValue += milestones.clickValue;
        
        // Crit rendszer
        const baseCritChance = levelBonuses.getCritChance(playerData.level) + milestones.critChance;
        const baseCritMultiplier = levelBonuses.getCritMultiplier(playerData.level) + milestones.critMultiplier;
        const isCrit = Math.random() < baseCritChance;
        
        if (isCrit) {
            clickValue *= baseCritMultiplier;
            xpGain *= baseCritMultiplier * 0.5; // Crit esetén csak 50%-os XP bónusz
        }
        
        // Combo rendszer
        if (playerData.combo > 0) {
            const comboThreshold = Math.max(20, 100 - (playerData.upgrades.comboThreshold.level - 1) * 10);
            const multiplierIncrease = 0.01 + (playerData.upgrades.comboMultiplier.level - 1) * 0.005;
            
            if (playerData.combo >= comboThreshold) {
                const comboLevels = Math.floor(playerData.combo / comboThreshold);
                playerData.comboMultiplier = comboLevels * multiplierIncrease;
                clickValue *= (1 + playerData.comboMultiplier);
                xpGain *= (1 + playerData.comboMultiplier * 0.3); // Combo esetén csak 30%-os XP bónusz
            }
        }
        
        // Update player data
        playerData.clicks += Math.floor(clickValue);
        playerData.combo++;
        playerData.lastClick = now;
        playerData.lastClickWasCrit = isCrit;
        playerData.lastClickValue = clickValue;
        
        // Add XP with diminishing returns based on level
        const levelPenalty = Math.pow(0.95, playerData.level - 1); // 5% csökkenés szintenként
        playerData.xp += xpGain * levelPenalty;
        
        // Check for level up
        const requiredXP = xpConfig.getRequiredXP(playerData.level);
        let leveledUp = false;
        while (playerData.xp >= requiredXP) {
            playerData.xp -= requiredXP;
            playerData.level++;
            leveledUp = true;
            
            // Update player stats on level up
            playerData.clickValue = levelBonuses.getClickValue(playerData.level);
            playerData.critChance = levelBonuses.getCritChance(playerData.level);
            playerData.critMultiplier = levelBonuses.getCritMultiplier(playerData.level);
            
            // Add milestone bonuses if applicable
            if (levelMilestones[playerData.level]) {
                socket.emit('milestone-reached', {
                    level: playerData.level,
                    description: levelMilestones[playerData.level].description
                });
            }
        }
        
        // Send updated data to player
        socket.emit('clicker-data', {
            ...playerData,
            lastClickWasCrit: isCrit,
            lastClickValue: clickValue,
            leveledUp: leveledUp
        });
        
        // Broadcast click count to all players
        if (players.has(socket.id)) {
            io.emit('player-click-count', {
                id: socket.id,
                clicks: playerData.clicks,
                level: playerData.level
            });
        }

        // Save progress after significant changes
        if (leveledUp || playerData.clicks % 50 === 0) { // Minden szintlépésnél vagy 50 kattintásonként
            savePlayerProgress(playerData.name, playerData);
        }
    });
    
    // Handle combo reset after timeout
    socket.on('clicker-combo-reset', () => {
        if (playerClickerData.has(socket.id)) {
            const playerData = playerClickerData.get(socket.id);
            playerData.combo = 0;
            playerData.comboMultiplier = 0;
            socket.emit('clicker-data', playerData);
        }
    });
    
    // Handle upgrade purchase
    socket.on('clicker-purchase', (upgrade) => {
        if (!playerClickerData.has(socket.id)) return;
        
        const playerData = playerClickerData.get(socket.id);
        
        // Validate upgrade type
        if (!['comboTime', 'comboThreshold', 'comboMultiplier'].includes(upgrade)) {
            return;
        }
        
        // Calculate cost based on current level
        const currentLevel = playerData.upgrades[upgrade].level;
        let baseCost, costMultiplier;
        
        switch(upgrade) {
            case 'comboTime':
                baseCost = 1000;
                costMultiplier = 1.5;
                break;
            case 'comboThreshold':
                baseCost = 2000;
                costMultiplier = 2;
                break;
            case 'comboMultiplier':
                baseCost = 5000;
                costMultiplier = 3;
                break;
        }
        
        const cost = Math.floor(baseCost * Math.pow(costMultiplier, currentLevel - 1));
        
        // Check if player has enough clicks
        if (playerData.clicks < cost) {
            return;
        }
        
        // Process purchase
        playerData.clicks -= cost;
        playerData.upgrades[upgrade].level++;
        
        // Send updated data to player
        socket.emit('clicker-data', playerData);
    });

    // Handle equipment changes
    socket.on('player-equipment', (data) => {
        if (players.has(socket.id)) {
            const player = players.get(socket.id);
            
            // Initialize equipment array if it doesn't exist
            if (!player.equipment) {
                player.equipment = [];
            }

            if (data.action === 'equip') {
                // Remove any existing item in the same slot
                player.equipment = player.equipment.filter(item => item.slot !== data.item.slot);
                // Add new item
                player.equipment.push(data.item);
            } else if (data.action === 'unequip') {
                // Remove item
                player.equipment = player.equipment.filter(item => item.id !== data.itemId);
            }

            // Broadcast equipment change to all other players
            socket.broadcast.emit('player-equipment', {
                id: socket.id,
                action: data.action,
                item: data.item,
                itemId: data.itemId
            });

            console.log(`Player ${player.name} ${data.action}ped item:`, data.action === 'equip' ? data.item : data.itemId);
        }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
        console.log('User disconnected');
        
        // Save progress before removing player
        if (playerClickerData.has(socket.id) && players.has(socket.id)) {
            const playerData = playerClickerData.get(socket.id);
            const player = players.get(socket.id);
            console.log('Saving final progress for disconnecting player:', {
                name: player.name,
                clicks: playerData.clicks,
                level: playerData.level,
                xp: playerData.xp
            });
            
            try {
                await savePlayerProgress(player.name, playerData);
                console.log('Final save successful for player:', player.name);
            } catch (error) {
                console.error('Error during final save:', error);
            }
            
            playerClickerData.delete(socket.id);
        }
        
        if (players.has(socket.id)) {
            players.delete(socket.id);
            io.emit('player-left', socket.id);
        }
        
        // Clean up rate limit data
        if (clickRateLimits.has(socket.id)) {
            clickRateLimits.delete(socket.id);
        }
    });
});

// Use environment variable for port or default to 3000
const PORT = process.env.PORT || 3000;

// Log startup information
console.log('Starting 3D Multiplayer Clicker Game server...');
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Database URL: ${process.env.DATABASE_URL ? '[CONFIGURED]' : '[NOT CONFIGURED]'}`);

http.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
}); 