# Kitchen Chaos

- [Kitchen Chaos](#kitchen-chaos)
  - [Play for Free](#play-for-free)
    - [Controls](#controls)
      - [Debug Mode](#debug-mode)
      - [Future controls](#future-controls)
  - [Documentation](#documentation)
    - [Generating Documentation](#generating-documentation)
  - [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Development](#development)
    - [Debug Builds](#debug-builds)
  - [Debugging in Babylon.js with Visual Studio Code](#debugging-in-babylonjs-with-visual-studio-code)

[![GitHub](https://img.shields.io/github/stars/corysia/kitchen-chaos?style=social)](https://github.com/corysia/kitchen-chaos)

A game based on [Code Monkey](https://unitycodemonkey.com/)'s [Kitchen Chaos](https://unitycodemonkey.com/kitchenchaoscourse.php) tutorial for Unity.  All assets are from his tutorial.  Hugo kindly granted permission to use them.

The game is built with [Babylon.js](https://www.babylonjs.com/), [TypeScript](https://www.typescriptlang.org/) and [Vite](https://vite.dev/).

## Play for Free

This game is still in the _**very early**_ stages of development, so don't expect to see much yet.  But if you want to try it out, click here to [play the game](https://corysia.github.io/kitchen-chaos/).

### Controls

- Toggle Fullscreen - `shift-ctrl-alt-f`
- Debug inspector - `shift-ctrl-alt-i` (requires debug mode)

#### Debug Mode

The game supports debug mode that enables additional features:

- **Enable debug in production**: Add `?debug` or `?dev` to the URL
  - [Play with debug enabled](https://corysia.github.io/kitchen-chaos/?debug)
  - [Play with dev enabled](https://corysia.github.io/kitchen-chaos/?dev)

- **Debug features**:
  - Enhanced logging levels
  - Babylon.js Inspector access for scene debugging
  - Console output preservation in production builds

#### Future controls

- WASD to move
- E to interact (not yet implemented)

## Documentation

For detailed technical documentation, including class descriptions, method documentation, and UML diagrams, see the [DESIGN.md](./DESIGN.md) file. This comprehensive guide covers:

- Complete class and method documentation
- Mermaid UML diagrams (class diagrams and sequence diagrams)
- Project architecture and design patterns
- Development setup and guidelines

### Generating Documentation

To generate documentation locally:

```bash
# Generate HTML documentation
npm run docs

# Generate and serve documentation (with live reload)
npm run docs:serve
```

The documentation will be generated in the `docs/` directory and can be served at `http://localhost:8080`.

## Getting Started

This project was bootstrapped with my BabylonJS Vite tutorial, [vite-project](https://github.com/corysia/vite-project).  The only requirements are Node.js and NPM.

## Installation

```bash
git clone https://github.com/corysia/kitchen-chaos.git
cd kitchen-chaos
npm install
npm run dev
```

## Development

Run the following command to start the development server

```bash
npm run dev
```

This will start a local server and provide a URL to connect to.

### Debug Builds

To create production builds with debug features preserved:

```bash
# Build with debug mode enabled (preserves console logs and debug features)
VITE_DEBUG=true npm run build

# Or using DEBUG environment variable
DEBUG=true npm run build
```

Debug builds will:

- Preserve console.log, console.debug, and console.info statements
- Enable Babylon.js Inspector access
- Maintain enhanced logging levels

## Debugging in Babylon.js with Visual Studio Code

- Create a .vscode folder in the root of the project
- Create a launch.json file in the .vscode folder
- Add the following to the launch.json file

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Launch Chrome",
            "request": "launch",
            "type": "chrome",
            "url": "http://localhost:5173/kitchen-chaos/",
            "webRoot": "${workspaceFolder}"
        }
    ]
}
```

- Run the `npm run dev` command
- Debug in Visual Studio Code by pressing F5
