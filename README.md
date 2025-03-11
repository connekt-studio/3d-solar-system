# 3D Solar System

A 3D visualization of our solar system built with Three.js.

## Features

- Realistic 3D model of the Sun, all eight planets, and Earth's moon
- Realistic textures for all celestial bodies
- Planet rotation and orbital movement
- Saturn's rings
- Earth's moon
- Interactive camera controls (zoom, pan, rotate)
- Starry background
- Planet hover labels
- Click on planets to focus camera
- UI controls for animation speed and orbit path visibility

## How to Run

### Using the included Node.js server

1. Make sure you have Node.js installed
2. Clone this repository
3. Run the server:

```
npm start
```

4. Open your browser and navigate to `http://localhost:8000`

### Alternative methods

You can also use one of these methods to serve the files:

#### Using Python (Python 3)

```
python -m http.server
```

#### Using a global http-server package

First, install the `http-server` package:

```
npm install -g http-server
```

Then run:

```
http-server
```

## Controls

- **Left-click + drag**: Rotate the view
- **Right-click + drag**: Pan the view
- **Scroll**: Zoom in/out
- **Click on a planet**: Focus the camera on that planet
- **Hover over a planet**: See the planet's name
- **UI Controls**: Adjust animation speed, toggle orbit paths, reset camera

## Credits

- Planet textures: Solar System Scope (<https://www.solarsystemscope.com/textures/>)
- Three.js: <https://threejs.org/>
