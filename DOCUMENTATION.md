# 3D Multiplayer Game Documentation

## Projekt Áttekintés
Ez egy 3D multiplayer játék, ami Three.js-t használ a rendereléshez és Socket.IO-t a valós idejű hálózati kommunikációhoz. A játék lehetővé teszi, hogy több játékos együtt legyen jelen egy 3D környezetben, ahol láthatják és követhetik egymás mozgását, valamint felszereléseket gyűjthetnek és viselhetnek.

## Fő Komponensek

### 1. Game (js/game/Game.js)
- A játék fő vezérlője
- Kezeli a 3D scene-t, kamerát és renderelést
- Környezeti elemek (fák, virágok) kezelése
- Játékosok kezelése és szinkronizálása
- Kamera követés és mozgás
- Világítás és árnyékok kezelése

Főbb funkciók:
- `initialize()`: Játék inicializálása
- `updateCamera()`: Kamera követés
- `createEnvironment()`: Környezeti elemek létrehozása
- `updateOtherPlayer()`: Más játékosok pozíciójának frissítése
- `setupLighting()`: Világítás beállítása

### 2. Player (js/game/Player.js)
- Játékos karakter kezelése
- Mozgás és animáció
- Név megjelenítése a karakter felett
- Ütközés detektálás
- Felszerelések kezelése és megjelenítése

Tulajdonságok:
- Egyedi név és szín
- Pozíció és forgatás
- Mozgási sebesség és gravitáció
- Felszerelés slotok (sisak, páncél, kesztyű, nadrág, csizma)

Felszerelés funkciók:
- `equipItem(item)`: Felszerelés felvétele
- `unequipItem(slot)`: Felszerelés levétele
- `updateEquipment()`: Felszerelések frissítése és megjelenítése

### 3. Equipment (js/game/Equipment.js)
- Felszerelések kezelése és létrehozása
- 3D modellek generálása
- Statisztikák és tulajdonságok kezelése

Felszerelés típusok:
- Sisak (Head)
- Páncél (Chest)
- Kesztyű (Hands)
- Nadrág (Legs)
- Csizma (Feet)

Főbb funkciók:
- `createHelmet()`: Sisak modell létrehozása
- `createChest()`: Páncél modell létrehozása
- `createHands()`: Kesztyű modell létrehozása
- `createLegs()`: Nadrág modell létrehozása
- `createFeet()`: Csizma modell létrehozása

### 4. UI (js/ui/UI.js)
- Felhasználói felület kezelése
- Főmenü
- Játékos számláló
- Irányítási útmutató
- Inventory rendszer
- Karakter preview

Inventory funkciók:
- `createInventoryUI()`: Inventory felület létrehozása
- `updateInventory()`: Inventory tartalom frissítése
- `updatePreviewModel()`: Karakter preview frissítése
- `showTooltip()`: Tárgy információk megjelenítése

### 5. Input (js/game/Input.js)
- Felhasználói bevitel kezelése
- Billentyűzet események
- Egér mozgás és kamera forgatás
- Pointer lock kezelése
- Inventory kezelés

Kezelt inputok:
- WASD / Nyilak - Mozgás
- Egér - Kamera forgatás
- Space - Ugrás
- Escape - Pointer lock feloldása
- I - Inventory nyitás/zárás

### 6. Network (js/network/Network.js)
- Socket.IO kapcsolat kezelése
- Játékosok csatlakozása/lecsatlakozása
- Pozíció szinkronizáció
- Játékos lista kezelése
- Felszerelések szinkronizálása

Események:
- `player-join`: Új játékos csatlakozása
- `player-left`: Játékos lecsatlakozása
- `player-moved`: Pozíció frissítés
- `player-list`: Kezdeti játékos lista
- `equip`: Felszerelés felvétele/levétele

## Hálózati Protokoll

### Kliens -> Szerver
1. `player-join`:
```javascript
{
    name: string,
    skinColor: string,
    position: {
        x: number,
        y: number,
        z: number,
        rotation: number
    }
}
```

2. `player-move`:
```javascript
{
    position: {
        x: number,
        y: number,
        z: number,
        rotation: number
    }
}
```

3. `equip`:
```javascript
{
    id: string,
    slot: string,
    type: string,
    name: string
}
```

### Szerver -> Kliens
1. `player-list`: Kezdeti játékos lista és felszereléseik
2. `player-joined`: Új játékos csatlakozása
3. `player-left`: Játékos lecsatlakozása
4. `player-moved`: Pozíció frissítés
5. `equipment-update`: Felszerelés változás

## Jelenlegi Funkciók
1. ✅ 3D karakter mozgás
2. ✅ Valós idejű multiplayer
3. ✅ Karakter név megjelenítés
4. ✅ Környezeti elemek (fák, virágok)
5. ✅ Kamera követés
6. ✅ Játékos szinkronizáció
7. ✅ Karakter forgás
8. ✅ Inventory rendszer
9. ✅ Felszerelések
10. ✅ Karakter preview
11. ✅ Tárgy tooltipek
12. ✅ Felszerelés szinkronizáció

## Technikai Részletek

### Használt Technológiák
- Three.js: 3D renderelés
- Socket.IO: Valós idejű kommunikáció
- Express: Szerver
- Node.js: Backend

### Fájl Struktúra
```
├── js/
│   ├── game/
│   │   ├── Game.js
│   │   ├── Player.js
│   │   ├── Input.js
│   │   ├── Equipment.js
│   │   └── World.js
│   ├── network/
│   │   └── Network.js
│   └── ui/
│       └── UI.js
├── css/
│   └── style.css
├── server.js
└── index.html
```

### Teljesítmény Optimalizációk
1. Textúra optimalizálás
2. Shadow mapping beállítások
3. Pozíció frissítés csak változás esetén
4. Objektum pooling a részecske rendszerhez
5. Felszerelés modellek újrahasználása
6. Karakter preview optimalizálás

## Következő Fejlesztési Lépések
1. [ ] Játékos animációk
2. [ ] Chat rendszer
3. [ ] Játék állapot szinkronizáció
4. [ ] Több karakter típus
5. [ ] Játék mechanikák (pontok, célok)
6. [ ] Tárgy craftolás
7. [ ] PvP rendszer
8. [ ] Karakter fejlődési rendszer

## Ismert Problémák
1. Nagy latency esetén ugrálhat a karakter
2. Néha akadozhat a kamera mozgás
3. Ritkán előfordulhat szinkronizációs hiba
4. Felszerelések pozícionálása finomhangolást igényelhet

## Fejlesztői Megjegyzések
- A kód moduláris és könnyen bővíthető
- A hálózati kommunikáció optimalizált
- A játék támogatja a különböző képernyőméreteket
- A kamera rendszer finomhangolt a jobb játékélményért
- Az inventory rendszer rugalmasan bővíthető
- A felszerelés rendszer támogatja az egyedi statisztikákat 