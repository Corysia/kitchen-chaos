# Kitchen Chaos - Documentation

- [Kitchen Chaos - Documentation](#kitchen-chaos---documentation)
  - [Overview](#overview)
  - [Architecture](#architecture)
  - [Class Documentation](#class-documentation)
    - [Core Framework Classes](#core-framework-classes)
      - [`Main`](#main)
      - [`Logger`](#logger)
      - [`SceneManager`](#scenemanager)
      - [`GameObject`](#gameobject)
    - [Component System](#component-system)
      - [`Component`](#component)
      - [`VisualComponent`](#visualcomponent)
      - [`CharacterMovementComponent`](#charactermovementcomponent)
      - [`InputAction`](#inputaction)
    - [Input System](#input-system)
      - [`InputSystem`](#inputsystem)
    - [Interfaces](#interfaces)
      - [`Lifecycle`](#lifecycle)
  - [Mermaid UML Diagrams](#mermaid-uml-diagrams)
    - [Class Diagram](#class-diagram)
    - [Sequence Diagram - Application Startup](#sequence-diagram---application-startup)
    - [Sequence Diagram - GameObject Lifecycle](#sequence-diagram---gameobject-lifecycle)
    - [Sequence Diagram - Input Processing](#sequence-diagram---input-processing)
  - [Project Structure](#project-structure)
  - [Key Design Patterns](#key-design-patterns)
    - [Singleton Pattern](#singleton-pattern)
    - [GameObject-Component System](#gameobject-component-system)
    - [Observer Pattern](#observer-pattern)
    - [Hierarchical Transform Pattern](#hierarchical-transform-pattern)
  - [Dependencies](#dependencies)
  - [Development Notes](#development-notes)
  - [Getting Started](#getting-started)
  - [Future Enhancements](#future-enhancements)

## Overview

Kitchen Chaos is a BabylonJS-based 3D game built with TypeScript. This project is a port of the Unity tutorial "Kitchen Chaos" by Code Monkey, adapted to use BabylonJS instead of Unity. The original Unity course can be found at: [https://unitycodemonkey.com/kitchenchaoscourse.php](https://unitycodemonkey.com/kitchenchaoscourse.php)

The project follows a modular architecture with a custom framework that provides GameObject-component system capabilities, scene management, and utilities for game development.

## Architecture

The project is structured around several key components:

- **Framework Layer**: Core systems for GameObject management, scene management, logging, and utilities
- **Component System**: Modular functionality through components attached to GameObjects
- **Input System**: Action-based input handling with configurable key bindings
- **Main Entry Point**: Application initialization and lifecycle management

## Class Documentation

### Core Framework Classes

#### `Main`

**Location**: `src/main.ts`

The main application class that initializes and starts the game.

**Methods**:

- `initialize()`: Initializes logging, creates canvas and engine, sets up SceneManager
- `private onSceneCreated(scene)`: Sets up event listeners and starts render loop
- `private setupEventListeners()`: Adds keyboard shortcuts for fullscreen and debug layer

**Key Features**:

- Configures logging levels and timestamp formats
- Handles keyboard shortcuts (Shift+Ctrl+Alt+F for fullscreen, Shift+Ctrl+Alt+I for inspector)
- Creates HTML canvas and BabylonJS engine
- Initializes SceneManager and creates the game scene

---

#### `Logger`

**Location**: `src/framework/Logger.ts`

A static utility class for logging with configurable levels and timestamp formats.

**Enums**:

- `LogLevel`: NONE=0, ERROR=1, WARN=2, INFO=3, DEBUG=4, TRACE=5
- `LogTimestampFormat`: OFF=0, LOCAL=1, ISO=3

**Static Methods**:

- `info(message?, ...optionalParams)`: Logs info messages
- `debug(message?, ...optionalParams)`: Logs debug messages
- `error(message?, ...optionalParams)`: Logs error messages
- `warn(message?, ...optionalParams)`: Logs warning messages
- `trace(message?, ...optionalParams)`: Logs trace messages
- `clear()`: Clears the console
- `time(label)`: Starts a timer
- `timeEnd(label)`: Ends a timer
- `group(label)`: Starts a console group
- `groupEnd()`: Ends a console group
- `groupCollapsed(label)`: Starts a collapsed console group
- `dir(message?, ...optionalParams)`: Displays object in directory format
- `dirxml(value)`: Displays XML representation
- `table(tabularData, properties?)`: Displays data in table format

**Static Properties**:

- `logLevel`: Gets/sets the current log level
- `timestampFormat`: Gets/sets the timestamp format

---

#### `SceneManager`

**Location**: `src/framework/SceneManager.ts`

A singleton class that manages BabylonJS engine, scene, GameObjects, and the main game loop.

**Static Properties**:

- `instance`: Gets the singleton instance

**Instance Properties**:

- `engine`: The BabylonJS engine
- `scene`: The main game scene
- `gameObjects`: Array of all active GameObjects
- `started`: Flag indicating if the game has started
- `inputSystem`: Global input system for handling user input

**Static Methods**:

- `get instance()`: Gets the singleton instance
- `initialize(engine)`: Initializes the singleton SceneManager

**Instance Methods**:

- `createScene()`: Creates and initializes the main game scene
- `createPlayer()`: Creates and configures the player GameObject

**Key Features**:

- Manages GameObject lifecycle (awake, start, update)
- Coordinates the main game loop with proper timing
- Sets up input system and basic scene (camera, light, ground)
- Creates player GameObject with visual and movement components

---

#### `GameObject`

**Location**: `src/framework/GameObject.ts`

A class representing game objects in the scene hierarchy with component-based architecture.

**Properties**:

- `name`: The name/identifier for this GameObject
- `transform`: Babylon.js TransformNode for position, rotation, and scale
- `components`: Array of components attached to this GameObject
- `children`: Array of child GameObjects in the hierarchy
- `parent`: Reference to the parent GameObject, if this is a child

**Methods**:

- `constructor(name, scene)`: Creates a new GameObject with a TransformNode
- `addComponent(comp)`: Adds a component to this GameObject
- `addChild(child)`: Adds a child GameObject to the hierarchy
- `removeChild(child)`: Removes a child GameObject from the hierarchy
- `awake()`: Dispatches awake call to all components and children
- `start()`: Dispatches start call to all components and children
- `earlyUpdate(dt)`: Dispatches earlyUpdate to all components and children
- `update(dt)`: Dispatches update to all components and children
- `lateUpdate(dt)`: Dispatches lateUpdate to all components and children
- `destroy()`: Dispatches destroy call to all components and children

**Key Features**:

- Component-based architecture for modular functionality
- Hierarchical parent-child relationships with transform inheritance
- Automatic lifecycle propagation to components and children
- Scene integration through Babylon.js TransformNode

---

### Component System

#### `Component`

**Location**: `src/framework/components/Component.ts`

Abstract base class for all components that implements the Lifecycle interface.

**Properties**:

- `gameObject`: The GameObject this component is attached to

**Methods**:

- `awake?()`: Optional initialization method
- `start?()`: Optional start method
- `earlyUpdate?(dt)`: Optional early update method
- `update?(dt)`: Optional update method
- `lateUpdate?(dt)`: Optional late update method
- `destroy?()`: Optional cleanup method

**Key Constraints**:

- All components MUST be attached to a GameObject to function
- Components CANNOT have children components (use GameObject composition instead)
- Components implement the Lifecycle interface for game loop participation

---

#### `VisualComponent`

**Location**: `src/framework/components/VisualComponent.ts`

Component for handling visual representation of GameObjects through Babylon.js meshes.

**Methods**:

- `constructor(meshFactory)`: Creates a visual component with a mesh factory function

**Key Features**:

- Creates and manages Babylon.js meshes
- Uses factory pattern for flexible mesh creation
- Automatically handles mesh disposal

---

#### `CharacterMovementComponent`

**Location**: `src/framework/components/CharacterMovement.ts`

Component for character movement control using the input system.

**Methods**:

- `awake()`: Sets up input system listeners
- `update(dt)`: Processes input and updates GameObject position

**Key Features**:

- Responds to MoveForward, MoveBackward, MoveLeft, MoveRight actions
- Uses InputSystem for action-based input handling
- Updates GameObject transform based on input

---

#### `InputAction`

**Location**: `src/framework/input/InputAction.ts`

Enum defining available input actions in the game.

**Values**:

- MoveForward
- MoveBackward
- MoveLeft
- MoveRight
- Jump

**Type Definition**:

- `KeyBindingMap`: Type mapping InputActions to keyboard key codes

---

### Input System

#### `InputSystem`

**Location**: `src/framework/input/InputSystem.ts`

Class for action-based input handling with configurable key bindings.

**Properties**:

- `scene`: The Babylon.js scene for input events
- `bindings`: Map of InputActions to key codes
- `keyState`: Set of currently pressed keys
- `listeners`: Map of actions to callback functions

**Methods**:

- `constructor(scene, bindings)`: Initializes input system with optional custom bindings
- `on(action, callback)`: Registers a callback for an input action
- `off(action, callback)`: Removes a callback for an input action
- `setBindings(newBindings)`: Updates key bindings
- `isActive(action)`: Returns true if the action is currently active

**Default Bindings**:

- MoveForward: "KeyW"
- MoveBackward: "KeyS"
- MoveLeft: "KeyA"
- MoveRight: "KeyD"
- Jump: "Space"

**Key Features**:

- Action-based input abstraction
- Configurable key bindings
- Event-driven and polling-based input access
- Multiple listeners per action

---

### Interfaces

#### `Lifecycle`

**Location**: `src/framework/interfaces/Lifecycle.ts`

Interface defining the standard lifecycle methods for game objects and components.

**Methods**:

- `awake()`: Initialization when object becomes active
- `start()`: Called once before first update
- `earlyUpdate(dt)`: Called every frame before main update
- `update(dt)`: Called every frame for main game logic
- `lateUpdate(dt)`: Called every frame after all updates

**Note**: All methods are optional and can be implemented as needed.

---

## Mermaid UML Diagrams

### Class Diagram

```mermaid
classDiagram
    %% Main Application
    class Main {
        -engine: Engine
        -canvas: HTMLCanvasElement
        -sceneManager: SceneManager
        +initialize() void
        -onSceneCreated(scene) void
        -setupEventListeners() void
    }
    
    %% Framework Core
    class SceneManager {
        -static _instance: SceneManager
        -engine: Engine
        -scene: Scene
        -gameObjects: Array~GameObject~
        -started: boolean
        -inputSystem: InputSystem
        +static instance: SceneManager
        +static initialize(engine) SceneManager
        +createScene() Scene
        +createPlayer() GameObject
    }
    
    class Logger {
        -static _instance: Logger
        -static _logLevel: LogLevel
        -static _timestampFormat: LogTimestampFormat
        +static info(message?, ...params)
        +static debug(message?, ...params)
        +static error(message?, ...params)
        +static warn(message?, ...params)
        +static trace(message?, ...params)
        +static clear()
        +static time(label: string)
        +static timeEnd(label: string)
        +static group(label: string)
        +static groupEnd()
        +static logLevel: LogLevel
        +static timestampFormat: LogTimestampFormat
    }
    
    %% GameObject System
    class GameObject {
        -name: string
        -transform: TransformNode
        -components: Array~Component~
        -children: Array~GameObject~
        -parent: GameObject
        +constructor(name, scene)
        +addComponent(comp) Component
        +addChild(child) void
        +removeChild(child) void
        +awake() void
        +start() void
        +earlyUpdate(dt) void
        +update(dt) void
        +lateUpdate(dt) void
        +destroy() void
    }
    
    %% Component System
    class Component {
        <<abstract>>
        +gameObject: GameObject
        +awake?() void
        +start?() void
        +earlyUpdate?(dt) void
        +update?(dt) void
        +lateUpdate?(dt) void
        +destroy?() void
    }
    
    class VisualComponent {
        -meshFactory: Function
        -mesh: Mesh
        +constructor(meshFactory)
    }
    
    class CharacterMovementComponent {
        +awake() void
        +update(dt) void
    }
    
    %% Input System
    class InputSystem {
        -scene: Scene
        -bindings: KeyBindingMap
        -keyState: Set~string~
        -listeners: Map~InputAction, Set~Function~~
        +constructor(scene, bindings)
        +on(action, callback) void
        +off(action, callback) void
        +setBindings(newBindings) void
        +isActive(action) boolean
    }
    
    class InputAction {
        <<enumeration>>
        MoveForward
        MoveBackward
        MoveLeft
        MoveRight
        Jump
    }
    
    %% Interfaces
    class Lifecycle {
        <<interface>>
        +awake() void
        +start() void
        +earlyUpdate(dt) void
        +update(dt) void
        +lateUpdate(dt) void
    }
    
    %% Enums
    class LogLevel {
        <<enumeration>>
        NONE
        ERROR
        WARN
        INFO
        DEBUG
        TRACE
    }
    
    class LogTimestampFormat {
        <<enumeration>>
        OFF
        LOCAL
        ISO
    }
    
    %% Relationships
    Main --> SceneManager : creates
    Main --> Logger : configures
    SceneManager --> GameObject : manages
    SceneManager --> InputSystem : creates
    GameObject --> Component : has
    GameObject --> GameObject : parent-child
    VisualComponent --|> Component : extends
    CharacterMovementComponent --|> Component : extends
    Component ..|> Lifecycle : implements
    InputSystem --> InputAction : uses
    Logger --> LogLevel : uses
    Logger --> LogTimestampFormat : uses
    CharacterMovementComponent --> InputSystem : uses
```

### Sequence Diagram - Application Startup

```mermaid
sequenceDiagram
    participant Main
    participant Logger
    participant SceneManager
    participant Engine
    participant Scene
    participant InputSystem
    participant GameObject
    
    Main->>Logger: Set log level and timestamp format
    Main->>Main: createCanvas()
    Main->>Engine: new Engine(canvas)
    Main->>SceneManager: initialize(engine)
    
    SceneManager->>SceneManager: createScene()
    SceneManager->>Scene: new Scene(engine)
    SceneManager->>InputSystem: new InputSystem(scene)
    
    SceneManager->>Scene: create camera
    SceneManager->>Scene: create light
    SceneManager->>Scene: create ground
    
    SceneManager->>SceneManager: createPlayer()
    SceneManager->>GameObject: new GameObject("Player", scene)
    GameObject->>GameObject: addComponent(VisualComponent)
    GameObject->>GameObject: addComponent(CharacterMovementComponent)
    SceneManager->>SceneManager: gameObjects.push(player)
    
    SceneManager->>GameObject: awake()
    GameObject->>Component: awake()
    
    Note over SceneManager,Scene: Setup render observers
    SceneManager->>Scene: onBeforeRenderObservable.add(awake/start)
    SceneManager->>Scene: onBeforeRenderObservable.add(update loop)
    
    Main->>Engine: runRenderLoop()
    Engine->>Engine: render() every frame
```

### Sequence Diagram - GameObject Lifecycle

```mermaid
sequenceDiagram
    participant SceneManager
    participant GameObject
    participant Component
    participant Scene
    
    Note over SceneManager,Scene: GameObject Creation
    SceneManager->>GameObject: new GameObject(name, scene)
    GameObject->>Scene: new TransformNode(name, scene)
    GameObject->>GameObject: addComponent(component)
    Component->>Component: gameObject = this GameObject
    
    Note over SceneManager,Scene: Initialization Phase
    SceneManager->>GameObject: awake()
    GameObject->>Component: awake()
    GameObject->>GameObject: children.forEach(awake)
    
    Note over SceneManager,Scene: Start Phase (first frame)
    Scene->>SceneManager: onBeforeRender (first time)
    SceneManager->>GameObject: start()
    GameObject->>Component: start()
    GameObject->>GameObject: children.forEach(start)
    
    Note over SceneManager,Scene: Game Loop (Every Frame)
    loop Each Frame
        Scene->>SceneManager: onBeforeRender
        SceneManager->>GameObject: earlyUpdate(dt)
        GameObject->>Component: earlyUpdate(dt)
        GameObject->>GameObject: children.forEach(earlyUpdate)
        
        SceneManager->>GameObject: update(dt)
        GameObject->>Component: update(dt)
        GameObject->>GameObject: children.forEach(update)
        
        SceneManager->>GameObject: lateUpdate(dt)
        GameObject->>Component: lateUpdate(dt)
        GameObject->>GameObject: children.forEach(lateUpdate)
        
        Note over Scene: Rendering
        Scene->>Scene: render()
    end
    
    Note over SceneManager,Scene: GameObject Destruction
    GameObject->>Component: destroy()
    GameObject->>GameObject: children.forEach(destroy)
    GameObject->>GameObject: transform.dispose()
```

### Sequence Diagram - Input Processing

```mermaid
sequenceDiagram
    participant Browser
    participant InputSystem
    participant CharacterMovementComponent
    participant GameObject
    
    Note over Browser,GameObject: Initialization
    GameObject->>CharacterMovementComponent: awake()
    CharacterMovementComponent->>InputSystem: on(MoveForward, callback)
    CharacterMovementComponent->>InputSystem: on(MoveBackward, callback)
    CharacterMovementComponent->>InputSystem: on(MoveLeft, callback)
    CharacterMovementComponent->>InputSystem: on(MoveRight, callback)
    
    Note over Browser,GameObject: Input Processing Loop
    loop Each Frame
        Browser->>InputSystem: keydown event (KeyW)
        InputSystem->>InputSystem: keyState.add(key)
        InputSystem->>InputSystem: dispatch(key, true)
        InputSystem->>CharacterMovementComponent: callback(true)
        
        CharacterMovementComponent->>InputSystem: isActive(MoveForward)
        InputSystem->>CharacterMovementComponent: return true
        
        Note over CharacterMovementComponent: Process movement
        CharacterMovementComponent->>GameObject: update transform
        
        Browser->>InputSystem: keyup event (KeyW)
        InputSystem->>InputSystem: keyState.delete(key)
        InputSystem->>InputSystem: dispatch(key, false)
        InputSystem->>CharacterMovementComponent: callback(false)
    end
```

## Project Structure

```
src/
├── main.ts                     # Application entry point
├── vite-env.d.ts              # Vite environment types
└── framework/                 # Core framework
    ├── GameObject.ts          # Base GameObject class
    ├── SceneManager.ts       # Singleton scene manager
    ├── components/           # Component system
    │   ├── Component.ts      # Base component class
    │   ├── VisualComponent.ts # Visual/mesh component
    │   └── CharacterMovement.ts # Movement component
    ├── input/                # Input system
    │   ├── InputAction.ts    # Input action enum
    │   └── InputSystem.ts    # Input handling system
    ├── interfaces/           # Framework interfaces
    │   └── Lifecycle.ts      # Lifecycle interface
    └── logger/               # Logging utility
        └── Logger.ts         # Logging system
```

## Key Design Patterns

### Singleton Pattern

- `SceneManager` and `Logger` use singleton pattern for global access
- Ensures single instance and provides global point of access

### GameObject-Component System

- `GameObject` class provides component management and hierarchical relationships
- `Component` base class for modular functionality
- Components are attached to GameObjects for specific behaviors
- Parent-child relationships with transform inheritance

### Observer Pattern

- BabylonJS scene observers used for GameObject lifecycle management
- Input system uses event listeners for keyboard handling
- Components can register callbacks with input system

### Hierarchical Transform Pattern

- GameObjects have parent-child relationships
- Transform inheritance through Babylon.js TransformNode hierarchy
- Automatic propagation of lifecycle events to children

## Dependencies

- **@babylonjs/core**: 3D rendering engine
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Build tool and development server

## Development Notes

1. **Logging**: Configure log levels in `Main.initialize()` for debugging
2. **Scene Management**: Use `SceneManager` for all scene and GameObject operations
3. **GameObject System**: Extend `GameObject` for game objects, use composition with components
4. **Components**: Create components by extending `Component` class, attach to GameObjects
5. **Input**: Use `InputSystem` for action-based input handling with configurable bindings
6. **Lifecycle**: Follow the awake -> start -> earlyUpdate -> update -> lateUpdate pattern
7. **Hierarchy**: Use parent-child relationships for organized scene structure

## Getting Started

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Open browser to view the game
4. Use Shift+Ctrl+Alt+I to toggle BabylonJS inspector
5. Use Shift+Ctrl+Alt+F to toggle fullscreen mode
6. Use WASD keys to move the player character

## Future Enhancements

- Implement jump functionality in `CharacterMovementComponent`
- Add more component types (physics, audio, animation)
- Implement save/load system
- Add multiplayer support
- Create UI system
- Add particle effects and visual feedback
- Implement kitchen chaos game mechanics (counters, ingredients, orders)
- Add 3D model loading for kitchen assets
