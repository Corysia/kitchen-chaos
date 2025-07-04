# Kitchen Chaos

- [Kitchen Chaos](#kitchen-chaos)
  - [Play for Free](#play-for-free)
  - [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Development](#development)
  - [Debugging in Babylon.js with Visual Studio Code](#debugging-in-babylonjs-with-visual-studio-code)

[![GitHub](https://img.shields.io/github/stars/corysia/kitchen-chaos?style=social)](https://github.com/corysia/kitchen-chaos)

A game based on [Code Monkey](https://unitycodemonkey.com/)'s [Kitchen Chaos](https://unitycodemonkey.com/kitchenchaoscourse.php) tutorial for Unity.  All assets are from his tutorial.  Hugo kindly granted permission to use them.

The game is built with [Babylon.js](https://www.babylonjs.com/) and [TypeScript](https://www.typescriptlang.org/).

## Play for Free

This game is still in the _**very early**_ stages of development, so don't expect to see much yet.  But if you want to try it out, click here to [play the game](https://corysia.github.io/kitchen-chaos/).

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

This will start a local server.

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
