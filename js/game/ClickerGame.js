class ClickerGame {
    constructor() {
        this.clicks = 0;
        this.gold = 0;
        this.combo = 0;
        this.comboMultiplier = 0;
        this.comboTimeout = null;
        this.comboResetTime = 2000; // 2 másodperc
        this.comboThreshold = 100; // Ennyi kattintás kell az első szorzóhoz
        this.comboIncrease = 0.01; // Minden combo threshold után ennyivel nő a szorzó
        this.mouseMovedDuringClick = false;
        this.clickStartPos = { x: 0, y: 0 };
        this.dragThreshold = 5; // Ennyi pixelt kell mozogni, hogy húzásnak számítson

        // XP és szint rendszer
        this.xp = 0;
        this.level = 1;
        this.critChance = 0.02; // 2% alap crit esély (csökkentve)
        this.critMultiplier = 1.5; // 1.5x alap crit szorzó (csökkentve)
        this.baseClickValue = 1; // Alap kattintás érték
        this.clickValue = 1; // Aktuális kattintás érték

        // XP szintek konfigurációja - Jelentősen megnehezítve
        this.xpConfig = {
            baseXP: 250, // Alap XP az első szinthez (növelve)
            xpMultiplier: 2.0, // Mennyivel nő szintenként az XP követelmény (növelve)
            xpPerClick: 0.2, // Kattintásonként kapott XP (csökkentve)
            getRequiredXP: (level) => Math.floor(this.xpConfig.baseXP * Math.pow(this.xpConfig.xpMultiplier, level - 1))
        };

        // Szint bónuszok konfigurációja - Lassabb fejlődés
        this.levelBonuses = {
            critChancePerLevel: 0.003, // +0.3% crit esély szintenként (csökkentve)
            critMultiplierPerLevel: 0.05, // +0.05x crit szorzó szintenként (csökkentve)
            clickValuePerLevel: 0.2, // +0.2 kattintás érték szintenként (csökkentve)
            getCritChance: (level) => this.critChance + (level - 1) * this.levelBonuses.critChancePerLevel,
            getCritMultiplier: (level) => this.critMultiplier + (level - 1) * this.levelBonuses.critMultiplierPerLevel,
            getClickValue: (level) => this.baseClickValue + (level - 1) * this.levelBonuses.clickValuePerLevel
        };

        // Fejlesztések
        this.upgrades = {
            comboTime: {
                level: 1,
                cost: 1000,
                baseCost: 1000,
                costMultiplier: 1.5,
                description: 'Növeli a combo időtartamát',
                getEffect: (level) => 2000 + (level - 1) * 500 // Minden szint +500ms
            },
            comboThreshold: {
                level: 1,
                cost: 2000,
                baseCost: 2000,
                costMultiplier: 2,
                description: 'Csökkenti a combo szorzó eléréséhez szükséges kattintások számát',
                getEffect: (level) => Math.max(20, 100 - (level - 1) * 10) // Minden szint -10 kattintás, minimum 20
            },
            comboMultiplier: {
                level: 1,
                cost: 5000,
                baseCost: 5000,
                costMultiplier: 3,
                description: 'Növeli a combo szorzó értékét',
                getEffect: (level) => 0.01 + (level - 1) * 0.005 // Minden szint +0.005 szorzó
            }
        };

        // Speciális szint mérföldkövek
        this.levelMilestones = {
            5: {
                critChanceBonus: 0.01, // +1% extra crit esély
                description: "Unlocked: Enhanced Critical Chance"
            },
            10: {
                critMultiplierBonus: 0.2, // +0.2x extra crit szorzó
                description: "Unlocked: Enhanced Critical Damage"
            },
            15: {
                clickValueBonus: 0.5, // +0.5 extra kattintás érték
                description: "Unlocked: Enhanced Click Value"
            },
            20: {
                allStatsBonus: 0.1, // +10% minden stathoz
                description: "Unlocked: All Stats Enhancement"
            },
            25: {
                ultraBonus: 0.2, // +20% minden stathoz
                description: "Unlocked: Ultra Enhancement"
            }
        };

        this.createHUD();
        this.setupEventListeners();
        this.setupNetworkEvents();
    }

    createHUD() {
        // HUD container
        const hud = document.createElement('div');
        hud.className = 'clicker-hud';
        document.body.appendChild(hud);

        // Level és XP display
        this.levelDisplay = document.createElement('div');
        this.levelDisplay.className = 'level-display';
        this.levelDisplay.innerHTML = `
            <div class="level-text">Level: <span class="level-value">1</span></div>
            <div class="xp-bar-container">
                <div class="xp-bar"></div>
                <div class="xp-text">XP: <span class="xp-value">0</span> / <span class="xp-required">100</span></div>
            </div>
        `;
        hud.appendChild(this.levelDisplay);

        // Stats display
        this.statsDisplay = document.createElement('div');
        this.statsDisplay.className = 'stats-display';
        this.statsDisplay.innerHTML = `
            <div class="click-value">Click Value: <span class="value">1.0</span></div>
            <div class="crit-chance">Crit Chance: <span class="value">5%</span></div>
            <div class="crit-multiplier">Crit Multiplier: <span class="value">2.0x</span></div>
        `;
        hud.appendChild(this.statsDisplay);

        // Clicks counter
        this.clicksDisplay = document.createElement('div');
        this.clicksDisplay.className = 'clicker-counter clicks';
        this.clicksDisplay.innerHTML = `<span>Clicks:</span> <span class="value">0</span>`;
        hud.appendChild(this.clicksDisplay);

        // Gold counter
        this.goldDisplay = document.createElement('div');
        this.goldDisplay.className = 'clicker-counter gold';
        this.goldDisplay.innerHTML = `<span>Gold:</span> <span class="value">0</span>`;
        hud.appendChild(this.goldDisplay);

        // Combo display
        this.comboDisplay = document.createElement('div');
        this.comboDisplay.className = 'combo-display';
        this.comboDisplay.innerHTML = `
            <div class="combo-text">Combo: <span class="combo-value">0</span></div>
            <div class="combo-multiplier">×<span class="multiplier-value">1.00</span></div>
            <div class="combo-progress">
                <div class="combo-bar"></div>
            </div>
        `;
        hud.appendChild(this.comboDisplay);

        // Click animation container
        this.clickAnimContainer = document.createElement('div');
        this.clickAnimContainer.className = 'click-animations';
        document.body.appendChild(this.clickAnimContainer);
    }

    setupEventListeners() {
        document.addEventListener('mousedown', (e) => {
            // Ne számoljon kattintást, ha UI elemen vagyunk
            if (e.target.closest('.inventory') || e.target.closest('.menu') || 
                e.target.closest('.merchant-dialog')) {
                return;
            }

            this.mouseMovedDuringClick = false;
            this.clickStartPos = { x: e.clientX, y: e.clientY };
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.mouseMovedDuringClick && 
                Math.hypot(e.clientX - this.clickStartPos.x, e.clientY - this.clickStartPos.y) > this.dragThreshold) {
                this.mouseMovedDuringClick = true;
            }
        });

        document.addEventListener('mouseup', (e) => {
            // Ne számoljon kattintást, ha UI elemen vagyunk vagy ha húzás volt
            if (e.target.closest('.inventory') || e.target.closest('.menu') || 
                e.target.closest('.merchant-dialog') || this.mouseMovedDuringClick) {
                return;
            }

            this.handleClick(e);
        });
    }

    setupNetworkEvents() {
        // Ha van socket, figyeljük a clicker-data eseményt
        if (window.main && window.main.network && window.main.network.socket) {
            const socket = window.main.network.socket;
            
            socket.on('clicker-data', (data) => {
                // Frissítjük a helyi adatokat a szerverről érkező adatokkal
                this.clicks = data.clicks;
                this.gold = data.gold;
                this.combo = data.combo;
                this.comboMultiplier = data.comboMultiplier;
                this.xp = data.xp;
                this.level = data.level;
                this.clickValue = data.clickValue;
                this.critChance = data.critChance;
                this.critMultiplier = data.critMultiplier;
                
                // Ha volt kritikus találat, animáljuk
                if (data.lastClickWasCrit && data.lastClickValue) {
                    // Használjuk az egér pozícióját az utolsó kattintásból
                    const lastClickPos = this.clickStartPos;
                    this.createCritAnimation(lastClickPos.x, lastClickPos.y, data.lastClickValue);
                }
                
                // Frissítjük a fejlesztések szintjeit
                if (data.upgrades) {
                    Object.entries(data.upgrades).forEach(([key, value]) => {
                        if (this.upgrades[key]) {
                            this.upgrades[key].level = value.level;
                            // Frissítjük a költséget a szint alapján
                            this.upgrades[key].cost = Math.floor(
                                this.upgrades[key].baseCost * 
                                Math.pow(this.upgrades[key].costMultiplier, value.level - 1)
                            );
                        }
                    });
                }
                
                // Frissítjük a HUD-ot
                this.updateHUD();
                
                // Frissítjük a combo időzítőt, ha van aktív combo
                if (this.combo > 0) {
                    this.resetComboTimer();
                }
            });
        }
    }

    handleClick(e) {
        // Csak akkor számoljuk a kattintást, ha van hálózati kapcsolat
        if (window.main && window.main.network && window.main.network.socket) {
            const socket = window.main.network.socket;
            
            // Kattintást küldünk a szervernek
            socket.emit('clicker-click');
            
            // Beállítjuk a combo időzítőt
            this.resetComboTimer();
            
            // Animáció mutatása (ez csak vizuális, nem befolyásolja az adatokat)
            this.createClickAnimation(e.clientX, e.clientY);
        }
    }

    resetComboTimer() {
        // Töröljük a meglévő időzítőt
        clearTimeout(this.comboTimeout);
        
        // Combo időtartam a jelenlegi fejlesztési szint alapján
        const comboTimeEffect = this.upgrades.comboTime.getEffect(this.upgrades.comboTime.level);
        
        // Új időzítő beállítása
        this.comboTimeout = setTimeout(() => {
            // Ha van hálózati kapcsolat, küldjünk egy combo reset eseményt a szervernek
            if (window.main && window.main.network && window.main.network.socket) {
                window.main.network.socket.emit('clicker-combo-reset');
            }
        }, comboTimeEffect);
    }

    createClickAnimation(x, y) {
        const anim = document.createElement('div');
        anim.className = 'click-animation';
        anim.style.left = x + 'px';
        anim.style.top = y + 'px';
        
        // Random szín és méret a változatosságért
        const hue = Math.random() * 360;
        const size = 30 + Math.random() * 20;
        anim.style.setProperty('--click-color', `hsl(${hue}, 80%, 60%)`);
        anim.style.setProperty('--click-size', `${size}px`);

        this.clickAnimContainer.appendChild(anim);
        
        // Animáció végén töröljük az elemet
        setTimeout(() => anim.remove(), 1000);
    }

    createCritAnimation(x, y, value) {
        const anim = document.createElement('div');
        anim.className = 'crit-animation';
        anim.style.left = x + 'px';
        anim.style.top = y + 'px';
        anim.textContent = `CRIT! ${Math.floor(value)}`;
        
        document.body.appendChild(anim);
        
        // Animáció végén töröljük az elemet
        setTimeout(() => anim.remove(), 1000);
    }

    updateHUD() {
        // Frissítjük a meglévő HUD elemeket
        this.clicksDisplay.querySelector('.value').textContent = this.formatNumber(this.clicks);
        this.goldDisplay.querySelector('.value').textContent = this.formatNumber(this.gold);
        
        // Combo frissítése
        const comboValue = this.comboDisplay.querySelector('.combo-value');
        const multiplierValue = this.comboDisplay.querySelector('.multiplier-value');
        const comboBar = this.comboDisplay.querySelector('.combo-bar');
        
        comboValue.textContent = this.combo;
        multiplierValue.textContent = (1 + this.comboMultiplier).toFixed(2);

        // Combo progress bar
        const threshold = this.upgrades.comboThreshold.getEffect(this.upgrades.comboThreshold.level);
        const progress = (this.combo % threshold) / threshold * 100;
        comboBar.style.width = `${progress}%`;

        // XP és Level frissítése
        const levelValue = this.levelDisplay.querySelector('.level-value');
        const xpValue = this.levelDisplay.querySelector('.xp-value');
        const xpRequired = this.levelDisplay.querySelector('.xp-required');
        const xpBar = this.levelDisplay.querySelector('.xp-bar');
        
        levelValue.textContent = this.level;
        xpValue.textContent = Math.floor(this.xp);
        const requiredXP = this.xpConfig.getRequiredXP(this.level);
        xpRequired.textContent = this.formatNumber(requiredXP);
        xpBar.style.width = `${(this.xp / requiredXP) * 100}%`;

        // Stats frissítése
        const clickValue = this.statsDisplay.querySelector('.click-value .value');
        const critChance = this.statsDisplay.querySelector('.crit-chance .value');
        const critMultiplier = this.statsDisplay.querySelector('.crit-multiplier .value');

        clickValue.textContent = this.clickValue.toFixed(1);
        critChance.textContent = `${(this.levelBonuses.getCritChance(this.level) * 100).toFixed(1)}%`;
        critMultiplier.textContent = `${this.levelBonuses.getCritMultiplier(this.level).toFixed(1)}x`;

        // Combo effektek
        this.comboDisplay.className = 'combo-display' + (this.combo > 0 ? ' active' : '');
        if (this.combo >= threshold) {
            this.comboDisplay.classList.add('super');
        } else {
            this.comboDisplay.classList.remove('super');
        }
    }

    formatNumber(num) {
        if (num < 1000) return num.toString();
        
        const suffixes = ['', 'K', 'M', 'B', 'T'];
        const exp = Math.floor(Math.log(num) / Math.log(1000));
        
        return (num / Math.pow(1000, exp)).toFixed(1) + suffixes[exp];
    }

    // Fejlesztés vásárlás
    purchaseUpgrade(type) {
        // Ellenőrizzük, hogy van-e elég klikk a helyi adatok alapján
        // (Ez csak a UI-t frissíti, a tényleges vásárlás a szerveren történik)
        const upgrade = this.upgrades[type];
        if (!upgrade || this.clicks < upgrade.cost) return false;

        // Ha van hálózati kapcsolat, küldünk egy vásárlási kérést a szervernek
        if (window.main && window.main.network && window.main.network.socket) {
            window.main.network.socket.emit('clicker-purchase', type);
            return true;
        }
        
        return false;
    }

    // XP és szint kezelő metódusok
    addXP(amount) {
        this.xp += amount;
        const requiredXP = this.xpConfig.getRequiredXP(this.level);
        
        // Szint lépés ellenőrzése
        while (this.xp >= requiredXP) {
            this.xp -= requiredXP;
            this.levelUp();
        }
        
        this.updateHUD();
    }

    levelUp() {
        this.level++;
        
        // Frissítjük a játékos statisztikáit
        this.clickValue = this.levelBonuses.getClickValue(this.level);
        
        // Létrehozunk egy level up animációt
        this.createLevelUpAnimation();
        
        // Frissítjük a HUD-ot
        this.updateHUD();
    }

    createLevelUpAnimation() {
        const anim = document.createElement('div');
        anim.className = 'level-up-animation';
        anim.textContent = `Level Up! ${this.level}`;
        document.body.appendChild(anim);
        
        // Animáció végén töröljük az elemet
        setTimeout(() => anim.remove(), 2000);
    }
}

// Make ClickerGame class globally available
window.ClickerGame = ClickerGame; 