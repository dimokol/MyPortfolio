# 3D Interactive Portfolio - Game Edition

An immersive, interactive 3D portfolio experience built with Three.js, React, and Cannon.js. Drive around in a stylized cyberpunk world and explore portfolio items as glowing interactive objects.

## Features

### Core Gameplay
- **Drivable Vehicle**: Arcade-style car physics using Cannon.js RaycastVehicle
- **3rd Person Camera**: Smooth following camera with dynamic positioning
- **Infinite Procedural World**: Never-ending flat plane with procedurally generated decorations
- **Interactive Objects**: Portfolio items represented as glowing 3D objects scattered throughout the world

### Visual Effects
- **Night Sky**: Beautiful starfield with twinkling stars, moon, and shooting stars
- **Vehicle Headlights**: Functional spotlights that illuminate the path ahead
- **Stylized Art**: Vibrant, low-poly aesthetic with neon colors and emissive materials
- **Atmospheric Fog**: Depth-based fog for enhanced atmosphere
- **Dynamic Shadows**: Real-time shadow rendering

### Technical Features
- **Chunk-based Terrain**: Efficient loading/unloading of terrain chunks
- **Physics Simulation**: Realistic-ish vehicle physics with suspension and steering
- **Responsive Controls**: Keyboard, touch, and mouse wheel support
- **Performance Optimized**: Efficient rendering with culling and LOD management

## Controls

### Keyboard
- `W` or `↑` - Accelerate
- `S` or `↓` - Reverse
- `A` or `←` - Steer Left
- `D` or `→` - Steer Right
- `Space` - Brake

### Mouse
- `Mouse Wheel` - Zoom camera in/out

### Touch (Mobile)
- Swipe up/down - Accelerate/Reverse
- Swipe left/right - Steer

## Project Structure

```
src/
├── Experience/
│   └── Experience.js          # Main game coordinator
├── Vehicle/
│   └── Vehicle.js             # Vehicle physics and visuals
├── Camera/
│   └── Camera.js              # 3rd person camera controller
├── Controls/
│   └── Controls.js            # Input handling
├── World/
│   ├── ProceduralTerrain.js   # Infinite terrain generation
│   └── InteractiveObjects.js  # Portfolio item objects
├── Environment/
│   └── NightSky.js            # Stars, moon, and sky effects
└── Utils/
    └── SimplexNoise.js        # Noise generation utility
```

## Technologies Used

- **Three.js** - 3D graphics rendering
- **Cannon.js** - Physics simulation
- **React** - UI framework
- **Vite** - Build tool and dev server
- **GLSL** - Custom shaders for visual effects

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development

### Adding New Portfolio Items

Edit `src/World/InteractiveObjects.js` and add new items to the `portfolioItems` array:

```javascript
{
  title: 'Your Project',
  position: new THREE.Vector3(x, y, z),
  color: 0xff00ff,
  type: 'cube' // or 'sphere', 'torus', 'octahedron', 'dodecahedron'
}
```

### Customizing Vehicle

Modify vehicle parameters in `src/Vehicle/Vehicle.js`:

```javascript
this.params = {
  chassisWidth: 2.4,
  chassisHeight: 1.0,
  chassisLength: 4.5,
  mass: 150,
  maxSteerVal: 0.5,
  maxForce: 1500,
  // ... more parameters
};
```

### Adjusting World Generation

Configure terrain in `src/World/ProceduralTerrain.js`:

```javascript
this.chunkSize = 50;        // Size of each chunk
this.renderDistance = 3;    // Chunks to render around player
```

## Inspiration

This project draws inspiration from:
- **folio-2019** - Vehicle mechanics and interactive portfolio concept
- **infinite-world** - Procedural terrain generation
- **small-world** - Stylized low-poly aesthetic

## Performance Tips

- The project uses chunk-based rendering to keep only nearby terrain loaded
- Physics bodies are optimized with appropriate collision shapes
- Shadows are limited to essential objects
- Post-processing is kept minimal for performance

## Browser Compatibility

Tested on:
- Chrome/Edge (recommended)
- Firefox
- Safari

Requires WebGL support.

## Future Enhancements

- [ ] Sound effects and background music
- [ ] Particle effects for vehicle exhaust
- [ ] More varied portfolio item types
- [ ] Mobile-optimized touch controls UI
- [ ] Loading screen with progress
- [ ] Portfolio detail panels with project info
- [ ] Multiple vehicle options
- [ ] Day/night cycle
- [ ] Weather effects
- [ ] Minimap

## License

MIT

## Author

dimokol

---

*Explore, drive, and discover in 3D!*
