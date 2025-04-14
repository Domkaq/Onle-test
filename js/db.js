const { Pool } = require('pg');
require('dotenv').config();

// Adatbázis konfiguráció
const isProduction = process.env.NODE_ENV === 'production';
const connectionString = isProduction
    ? process.env.DATABASE_URL // Render.com környezeti változó
    : 'postgresql://onleprogess_user:z2ExG41pVO0lQPiqB94icWf8c8XpLJKV@dpg-cvu4qvruibrs73eikhm0-a.frankfurt-postgres.render.com/onleprogess'; // Fejlesztői környezet

// Pool konfiguráció SSL beállításokkal
const pool = new Pool({
    connectionString,
    ssl: isProduction ? {
        rejectUnauthorized: false // Render.com-hoz szükséges
    } : false
});

// Kapcsolat tesztelése
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
    } else {
        console.log('Successfully connected to database');
        release();
    }
});

// Adatbázis inicializálása
async function initDatabase() {
    try {
        // Először töröljük a régi táblát
        await pool.query(`DROP TABLE IF EXISTS player_progress;`);
        
        // Játékos progresszió tábla létrehozása - most a player_name a primary key
        await pool.query(`
            CREATE TABLE player_progress (
                player_name VARCHAR(255) PRIMARY KEY,
                clicks INTEGER DEFAULT 0,
                gold INTEGER DEFAULT 0,
                xp FLOAT DEFAULT 0,
                level INTEGER DEFAULT 1,
                crit_chance FLOAT DEFAULT 0.02,
                crit_multiplier FLOAT DEFAULT 1.5,
                click_value FLOAT DEFAULT 1,
                upgrades JSONB DEFAULT '{"comboTime": {"level": 1}, "comboThreshold": {"level": 1}, "comboMultiplier": {"level": 1}}'::jsonb,
                last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Database initialized successfully - table recreated with new structure');
    } catch (err) {
        console.error('Error initializing database:', err);
        throw err; // Dobjuk tovább a hibát, hogy a szerver ne induljon el hibás adatbázissal
    }
}

// Játékos progresszió mentése
async function savePlayerProgress(playerName, playerData) {
    try {
        console.log('Saving progress for player:', playerName);
        console.log('Data being saved:', {
            clicks: playerData.clicks,
            gold: playerData.gold,
            xp: playerData.xp,
            level: playerData.level,
            critChance: playerData.critChance,
            critMultiplier: playerData.critMultiplier,
            clickValue: playerData.clickValue,
            upgrades: playerData.upgrades
        });

        const query = `
            INSERT INTO player_progress (
                player_name, clicks, gold, xp, level, 
                crit_chance, crit_multiplier, click_value, upgrades, last_login
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
            ON CONFLICT (player_name) 
            DO UPDATE SET 
                clicks = $2,
                gold = $3,
                xp = $4,
                level = $5,
                crit_chance = $6,
                crit_multiplier = $7,
                click_value = $8,
                upgrades = $9,
                last_login = CURRENT_TIMESTAMP
            RETURNING *;
        `;

        const result = await pool.query(query, [
            playerName,
            Math.floor(playerData.clicks),
            Math.floor(playerData.gold),
            playerData.xp,
            playerData.level,
            playerData.critChance,
            playerData.critMultiplier,
            playerData.clickValue,
            playerData.upgrades
        ]);

        console.log('Saved data in database:', result.rows[0]);
        return true;
    } catch (err) {
        console.error('Error saving player progress:', err);
        return false;
    }
}

// Játékos progresszió betöltése
async function loadPlayerProgress(playerName) {
    try {
        console.log('Attempting to load progress for player:', playerName);
        
        const result = await pool.query(
            'SELECT * FROM player_progress WHERE player_name = $1',
            [playerName]
        );

        if (result.rows.length > 0) {
            const data = result.rows[0];
            console.log('Found saved data:', data);
            
            const progressData = {
                name: data.player_name,
                clicks: parseInt(data.clicks),
                gold: parseInt(data.gold),
                xp: parseFloat(data.xp),
                level: parseInt(data.level),
                critChance: parseFloat(data.crit_chance),
                critMultiplier: parseFloat(data.crit_multiplier),
                clickValue: parseFloat(data.click_value),
                upgrades: data.upgrades,
                lastLogin: data.last_login
            };
            
            console.log('Processed data for loading:', progressData);
            return progressData;
        }
        console.log('No saved progress found for player:', playerName);
        return null;
    } catch (err) {
        console.error('Error loading player progress:', err);
        return null;
    }
}

// Automatikus mentés időzítő beállítása (most 1 percenként a teszteléshez)
const AUTOSAVE_INTERVAL = 60 * 1000; // 1 perc

function startAutoSave(playerClickerData) {
    setInterval(async () => {
        console.log('Starting auto-save process...');
        for (const [socketId, playerData] of playerClickerData.entries()) {
            console.log(`Auto-saving for player ${playerData.name}...`);
            await savePlayerProgress(playerData.name, playerData);
        }
        console.log('Auto-save completed');
    }, AUTOSAVE_INTERVAL);
}

module.exports = {
    initDatabase,
    savePlayerProgress,
    loadPlayerProgress,
    startAutoSave
}; 