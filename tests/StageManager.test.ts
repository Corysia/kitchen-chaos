import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Engine } from '@babylonjs/core';
import { StageManager } from '../src/framework/StageManager';

/**
 * Test suite for StageManager class
 * 
 * The StageManager is responsible for:
 * - Managing game stages as a singleton instance
 * - Handling stage lifecycle (initialize, awake, start, update, dispose)
 * - Coordinating between multiple active stages
 * - Providing access to the active scene
 * 
 * These tests verify the core singleton pattern, stage management,
 * and update loop functionality.
 */
describe('StageManager', () => {
    let engine: Engine;
    let stageManager: StageManager;

    beforeEach(() => {
        // Create a mock engine with required Babylon.js Engine methods
        // This avoids dependency on the actual Babylon.js engine for testing
        engine = {
            dispose: vi.fn(),
            resize: vi.fn(),
            runRenderLoop: vi.fn(),
            getDeltaTime: vi.fn().mockReturnValue(16.67),
            switchFullscreen: vi.fn()
        } as any;

        // Reset singleton to ensure clean test isolation
        // StageManager uses singleton pattern, so we must clear previous instance
        (StageManager as any)._instance = null;
        stageManager = StageManager.initialize(engine);
    });

    /**
     * Test: Singleton Pattern Implementation
     * 
     * Verifies that StageManager implements the singleton pattern correctly.
     * - Only one instance should exist
     * - StageManager.instance should return the same instance
     * - Multiple initialize calls should return the same instance
     */
    it('should create singleton instance', () => {
        expect(StageManager.instance).toBe(stageManager);
    });

    /**
     * Test: Singleton Pattern Protection
     * 
     * Verifies that the singleton pattern prevents multiple instances.
     * - Attempting to initialize a second instance should throw an error
     * - This ensures only one StageManager can exist per application
     */
    it('should throw error when trying to create second instance', () => {
        expect(() => StageManager.initialize(engine)).toThrow('StageManager instance already exists');
    });

    /**
     * Test: Stage Registration and Management
     * 
     * Verifies that stages can be properly added to the StageManager.
     * - Stages should be stored in the internal stages collection
     * - The stage should be accessible after being added
     * - Mock stage includes all required Stage interface properties
     */
    it('should add and manage stages', () => {
        const stage = {
            gameObjects: [],
            started: false,
            initialized: false,
            _awakeCalled: false,
            _startCalled: false,
            scene: { 
                dispose: vi.fn(),
                onBeforeRenderObservable: { add: vi.fn(), removeCallback: vi.fn() },
                getEngine: vi.fn().mockReturnValue({ getDeltaTime: vi.fn().mockReturnValue(16.67) })
            } as any,
            initialize: vi.fn(),
            awake: vi.fn(),
            start: vi.fn(),
            update: vi.fn(),
            earlyUpdate: vi.fn(),
            lateUpdate: vi.fn(),
            dispose: vi.fn(),
            addGameObject: vi.fn(),
            removeGameObject: vi.fn()
        };
        
        stageManager.addStage(stage);
        expect(stageManager.getStages()).toContain(stage);
    });

    /**
     * Test: Active Stage Management
     * 
     * Verifies that the StageManager can set and track the active stage.
     * - setActiveStage should properly set the active stage
     * - activeStage property should return the currently active stage
     * - This is crucial for determining which stage receives updates
     */
    it('should set active stage', async () => {
        const stage = {
            gameObjects: [],
            started: false,
            initialized: false,
            _awakeCalled: false,
            _startCalled: false,
            scene: { 
                dispose: vi.fn(),
                onBeforeRenderObservable: { add: vi.fn(), removeCallback: vi.fn() },
                getEngine: vi.fn().mockReturnValue({ getDeltaTime: vi.fn().mockReturnValue(16.67) })
            } as any,
            initialize: vi.fn(),
            awake: vi.fn(),
            start: vi.fn(),
            update: vi.fn(),
            earlyUpdate: vi.fn(),
            lateUpdate: vi.fn(),
            dispose: vi.fn(),
            addGameObject: vi.fn(),
            removeGameObject: vi.fn()
        };
        
        await stageManager.setActiveStage(stage);
        expect(stageManager.activeStage).toBe(stage);
    });

    /**
     * Test: Active Scene Access
     * 
     * Verifies that the StageManager provides access to the active stage's scene.
     * - getActiveScene should return the scene from the active stage
     * - This is essential for rendering and scene operations
     * - Should work with synchronous stage setting
     */
    it('should get active scene', () => {
        const stage = {
            gameObjects: [],
            started: false,
            initialized: false,
            _awakeCalled: false,
            _startCalled: false,
            scene: { 
                dispose: vi.fn(),
                onBeforeRenderObservable: { add: vi.fn(), removeCallback: vi.fn() },
                getEngine: vi.fn().mockReturnValue({ getDeltaTime: vi.fn().mockReturnValue(16.67) })
            } as any,
            initialize: vi.fn(),
            awake: vi.fn(),
            start: vi.fn(),
            update: vi.fn(),
            earlyUpdate: vi.fn(),
            lateUpdate: vi.fn(),
            dispose: vi.fn(),
            addGameObject: vi.fn(),
            removeGameObject: vi.fn()
        };
        
        stageManager.setActiveStage(stage);
        expect(stageManager.getActiveScene()).toBe(stage.scene);
    });

    /**
     * Test: Stage Update Loop
     * 
     * Verifies that the StageManager properly calls update methods on the active stage.
     * - update should call earlyUpdate, update, and lateUpdate on active stage
     * - Delta time should be passed correctly to stage update methods
     * - This ensures the game loop properly updates all stages
     */
    it('should update active stage', async () => {
        // Create a mock stage that simulates a started/initialized stage
        // This stage should be ready to receive update calls
        const stage = {
            gameObjects: [],
            started: true,
            initialized: true,
            _awakeCalled: false,
            _startCalled: false,
            scene: { 
                dispose: vi.fn(),
                onBeforeRenderObservable: { add: vi.fn(), removeCallback: vi.fn() },
                getEngine: vi.fn().mockReturnValue({ getDeltaTime: vi.fn().mockReturnValue(16.67) })
            } as any,
            initialize: vi.fn(),
            awake: vi.fn(),
            start: vi.fn(),
            update: vi.fn(),
            earlyUpdate: vi.fn(),
            lateUpdate: vi.fn(),
            dispose: vi.fn(),
            addGameObject: vi.fn(),
            removeGameObject: vi.fn()
        };
        
        await stageManager.setActiveStage(stage);
        await stageManager.update(0.016); // Simulate 60 FPS delta time
        
        // Verify all update methods were called with correct delta time
        expect(stage.earlyUpdate).toHaveBeenCalledWith(0.016);
        expect(stage.update).toHaveBeenCalledWith(0.016);
        expect(stage.lateUpdate).toHaveBeenCalledWith(0.016);
    });

    /**
     * Test: Update Without Active Stage
     * 
     * Verifies that StageManager handles update calls when no active stage is set.
     * - Should throw when setting null active stage (current implementation)
     * - Should throw when setting undefined active stage (current implementation)
     * - This test documents the current behavior and identifies needed robustness
     */
    it('should handle update without active stage gracefully', async () => {
        // Setting null active stage currently throws
        await expect(stageManager.setActiveStage(null as any)).rejects.toThrow();
        
        // Setting undefined active stage currently throws
        await expect(stageManager.setActiveStage(undefined as any)).rejects.toThrow();
        
        // But updating with no active stage should work
        await expect(stageManager.update(0.016)).resolves.not.toThrow();
    });

    /**
     * Test: Invalid Stage Addition
     * 
     * Verifies that StageManager handles invalid stage objects.
     * - Should throw when adding null stage (current implementation)
     * - Should throw when adding undefined stage (current implementation)
     * - Should throw when adding empty object (current implementation)
     * - This test documents the current behavior and identifies needed robustness
     */
    it('should handle invalid stage objects gracefully', () => {
        // Test adding null stage - currently throws
        expect(() => stageManager.addStage(null as any)).toThrow();
        
        // Test adding undefined stage - currently throws
        expect(() => stageManager.addStage(undefined as any)).toThrow();
        
        // Test adding empty object - currently throws
        expect(() => stageManager.addStage({} as any)).toThrow();
    });

    /**
     * Test: Invalid Engine Initialization
     * 
     * Verifies that StageManager handles invalid engine objects.
     * - Should handle null engine gracefully
     * - Should handle engine without required methods
     * - This ensures robustness during initialization
     */
    it('should handle invalid engine during initialization', () => {
        // Reset singleton to test new initialization
        (StageManager as any)._instance = null;
        
        // Test with null engine
        expect(() => StageManager.initialize(null as any)).not.toThrow();
        
        // Reset again for next test
        (StageManager as any)._instance = null;
        
        // Test with empty engine object
        expect(() => StageManager.initialize({} as any)).not.toThrow();
    });

    /**
     * Test: Negative Delta Time Handling
     * 
     * Verifies that StageManager handles negative delta time values.
     * - Should handle negative delta time gracefully
     * - Should still call update methods with negative values
     * - This ensures robustness with time calculation errors
     */
    it('should handle negative delta time gracefully', async () => {
        const stage = {
            gameObjects: [],
            started: true,
            initialized: true,
            _awakeCalled: false,
            _startCalled: false,
            scene: { 
                dispose: vi.fn(),
                onBeforeRenderObservable: { add: vi.fn(), removeCallback: vi.fn() },
                getEngine: vi.fn().mockReturnValue({ getDeltaTime: vi.fn().mockReturnValue(16.67) })
            } as any,
            initialize: vi.fn(),
            awake: vi.fn(),
            start: vi.fn(),
            update: vi.fn(),
            earlyUpdate: vi.fn(),
            lateUpdate: vi.fn(),
            dispose: vi.fn(),
            addGameObject: vi.fn(),
            removeGameObject: vi.fn()
        };
        
        await stageManager.setActiveStage(stage);
        
        // Should handle negative delta time without throwing
        await expect(stageManager.update(-0.016)).resolves.not.toThrow();
        
        // Verify update methods were still called with negative value
        expect(stage.earlyUpdate).toHaveBeenCalledWith(-0.016);
        expect(stage.update).toHaveBeenCalledWith(-0.016);
        expect(stage.lateUpdate).toHaveBeenCalledWith(-0.016);
    });

    /**
     * Test: Extreme Delta Time Values
     * 
     * Verifies that StageManager handles extreme delta time values.
     * - Should handle very large delta time values
     * - Should handle zero delta time values
     * - This ensures robustness with frame rate spikes or freezes
     */
    it('should handle extreme delta time values', async () => {
        const stage = {
            gameObjects: [],
            started: true,
            initialized: true,
            _awakeCalled: false,
            _startCalled: false,
            scene: { 
                dispose: vi.fn(),
                onBeforeRenderObservable: { add: vi.fn(), removeCallback: vi.fn() },
                getEngine: vi.fn().mockReturnValue({ getDeltaTime: vi.fn().mockReturnValue(16.67) })
            } as any,
            initialize: vi.fn(),
            awake: vi.fn(),
            start: vi.fn(),
            update: vi.fn(),
            earlyUpdate: vi.fn(),
            lateUpdate: vi.fn(),
            dispose: vi.fn(),
            addGameObject: vi.fn(),
            removeGameObject: vi.fn()
        };
        
        await stageManager.setActiveStage(stage);
        
        // Test with very large delta time (e.g., game freeze for 10 seconds)
        await expect(stageManager.update(10.0)).resolves.not.toThrow();
        expect(stage.update).toHaveBeenCalledWith(10.0);
        
        // Reset mocks
        vi.clearAllMocks();
        
        // Test with zero delta time
        await expect(stageManager.update(0)).resolves.not.toThrow();
        expect(stage.update).toHaveBeenCalledWith(0);
    });
});
