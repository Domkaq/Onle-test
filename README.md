# 3D Multiplayer Clicker Game

A modern, multiplayer clicker game with 3D graphics, progression system, and real-time synchronization.

## Features

- 🎮 3D multiplayer environment
- 💾 Persistent progress saving
- 📈 Level and XP system
- ⚔️ Critical hit mechanics
- 🔄 Combo system
- 🏆 Upgrades and progression
- 🌐 Real-time synchronization
- 💪 Auto-saving functionality

## Prerequisites

- Node.js (>=14.0.0)
- PostgreSQL database
- Modern web browser with WebGL support

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/3d-multiplayer-clicker.git
cd 3d-multiplayer-clicker
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file in the root directory:
```env
DATABASE_URL=your_postgres_database_url
NODE_ENV=production
```

4. Start the server:
```bash
node server.js
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## Game Mechanics

### Level System
- Gain XP from clicks (0.2 XP per click)
- Critical hits give bonus XP
- XP requirements increase with each level
- Each level provides stat improvements

### Critical Hits
- Base 2% critical hit chance
- Base 1.5x critical hit multiplier
- Both stats improve with levels

### Combo System
- Chain clicks to build combos
- Higher combos provide better rewards
- Combo duration can be upgraded

### Upgrades
- Combo Time: Increases combo duration
- Combo Threshold: Reduces clicks needed for combo
- Combo Multiplier: Increases combo bonus

## Database Structure

The game uses PostgreSQL for data persistence. Player progress is stored with:
- Click count and gold
- XP and level
- Critical hit stats
- Click value
- Upgrade levels
- Timestamps

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Three.js for 3D graphics
- Socket.io for real-time communication
- Express.js for server framework
- PostgreSQL for data persistence 