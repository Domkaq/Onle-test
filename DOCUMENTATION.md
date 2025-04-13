# 3D Multiplayer Game Documentation

## Projekt Áttekintés
Ez egy 3D multiplayer játék, ami Three.js-t használ a rendereléshez és Socket.IO-t a valós idejű hálózati kommunikációhoz. A játék lehetővé teszi, hogy több játékos együtt legyen jelen egy 3D környezetben, ahol láthatják és követhetik egymás mozgását.

## Fő Komponensek

### 1. Game (js/game/Game.js)
- A játék fő vezérlője
- Kezeli a 3D scene-t, kamerát és renderelést
- Környezeti elemek (fák, virágok) kezelése
- Játékosok kezelése és szinkronizálása
- Kamera követés és mozgás

Főbb funkciók:
- `initialize()`: Játék inicializálása
- `updateCamera()`: Kamera követés
- `createEnvironment()`: Környezeti elemek létrehozása
- `updateOtherPlayer()`: Más játékosok pozíciójának frissítése

### 2. Player (js/game/Player.js)
- Játékos karakter kezelése
- Mozgás és animáció
- Név megjelenítése a karakter felett
- Ütközés detektálás

Tulajdonságok:
- Egyedi név és szín
- Pozíció és forgatás
- Mozgási sebesség és gravitáció

### 3. Input (js/game/Input.js)
- Felhasználói bevitel kezelése
- Billentyűzet események
- Egér mozgás és kamera forgatás
- Pointer lock kezelése

Kezelt inputok:
- WASD / Nyilak - Mozgás
- Egér - Kamera forgatás
- Space - Ugrás
- Escape - Pointer lock feloldása

### 4. Network (js/network/Network.js)
- Socket.IO kapcsolat kezelése
- Játékosok csatlakozása/lecsatlakozása
- Pozíció szinkronizáció
- Játékos lista kezelése

Események:
- `player-join`: Új játékos csatlakozása
- `player-left`: Játékos lecsatlakozása
- `player-moved`: Pozíció frissítés
- `player-list`: Kezdeti játékos lista

### 5. UI (js/ui/UI.js)
- Felhasználói felület kezelése
- Főmenü
- Játékos számláló
- Irányítási útmutató

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

### Szerver -> Kliens
1. `player-list`: Kezdeti játékos lista
2. `player-joined`: Új játékos csatlakozása
3. `player-left`: Játékos lecsatlakozása
4. `player-moved`: Pozíció frissítés

## Jelenlegi Funkciók
1. ✅ 3D karakter mozgás
2. ✅ Valós idejű multiplayer
3. ✅ Karakter név megjelenítés
4. ✅ Környezeti elemek (fák, virágok)
5. ✅ Kamera követés
6. ✅ Játékos szinkronizáció
7. ✅ Karakter forgás

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
│   │   └── Input.js
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

## Következő Fejlesztési Lépések
1. [ ] Játékos animációk
2. [ ] Chat rendszer
3. [ ] Játék állapot szinkronizáció
4. [ ] Több karakter típus
5. [ ] Játék mechanikák (pontok, célok)

## Ismert Problémák
1. Nagy latency esetén ugrálhat a karakter
2. Néha akadozhat a kamera mozgás
3. Ritkán előfordulhat szinkronizációs hiba

## Fejlesztői Megjegyzések
- A kód moduláris és könnyen bővíthető
- A hálózati kommunikáció optimalizált
- A játék támogatja a különböző képernyőméreteket
- A kamera rendszer finomhangolt a jobb játékélményért 