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
 * 
 * Note on async behaviour: StageManager.addStage and StageManager.setActiveStage
 * are asynchronous because they drive the Stage lifecycle (awake, start, deactivate),
 * each of which is promise based. Tests must await these calls, otherwise they assert
 * against a StageManager that has only been partially mutated and will additionally
 * leak unhandled promise rejections.
 */
describe('StageManager', () => {
    let engine: Engine;
    let stageManager: StageManager;

    /**
     * Builds a mock Stage object sufficient for StageManager interaction.
     * 
     * A single factory is used instead of inline object literals so that every test
     * exercises exactly the same Stage surface. If StageManager grows a new dependency
     * on Stage, it is added once here rather than in every test.
     * 
     * The mock mirrors the public surface of the abstract Stage class:
     * - state flags (started, initialized, _awakeCalled, _startCalled)
     * - scene with an onBeforeRenderObservable and engine access
     * - lifecycle methods (initialize, awake, start, deactivate, dispose)
     * - per-frame methods (earlyUpdate, update, lateUpdate)
     * - GameObject membership helpers (addGameObject, removeGameObject)
     * - update callback registration (getUpdateCallback, setUpdateCallback), which
     *   StageManager relies on to detach the previous stage's render callback
     * 
     * @param overrides Optional partial stage used to customise individual tests
     * @returns A mock stage cast to the Stage type
     */
    const createMockStage = (overrides: Record<string, unknown> = {}): any => ({
        gameObjects: [],
        started: false,
        initialized: false,
        _awakeCalled: false,
        _startCalled: false,
        scene: {
            dispose: vi.fn(),
            onBeforeRenderObservable: { add: vi.fn(), removeCallback: vi.fn() },
            getEngine: vi.fn().mockReturnValue({ getDeltaTime: vi.fn().mockReturnValue(16.67) })
        },
        initialize: vi.fn(),
        awake: vi.fn(),
        start: vi.fn(),
        deactivate: vi.fn(),
        update: vi.fn(),
        earlyUpdate: vi.fn(),
        lateUpdate: vi.fn(),
        dispose: vi.fn(),
        addGameObject: vi.fn(),
        removeGameObject: vi.fn(),
        getUpdateCallback: vi.fn().mockReturnValue(null),
        setUpdateCallback: vi.fn(),
        ...overrides
    });

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
     * - Adding a stage must awake it before registering it, so the test awaits
     *   addStage to observe the fully settled manager state
     */
    it('should add and manage stages', async () => {
        const stage = createMockStage();

        await stageManager.addStage(stage);
        expect(stageManager.getStages()).toContain(stage);
    });

    /**
     * Test: Stage Awake Before Registration
     * 
     * Verifies the lifecycle ordering contract of addStage.
     * - addStage is asynchronous because it awaits Stage.awake
     * - The stage must be awake before it lands in the stages collection, otherwise
     *   the game loop could update a stage whose GameObjects were never initialised
     */
    it('should awake stage before registering it', async () => {
        const stage = createMockStage();

        const pending = stageManager.addStage(stage);
        // Nothing is registered until the awake promise settles
        expect(stageManager.getStages()).not.toContain(stage);

        await pending;

        expect(stage.awake).toHaveBeenCalledTimes(1);
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
        const stage = createMockStage();

        await stageManager.setActiveStage(stage);
        expect(stageManager.activeStage).toBe(stage);
    });

    /**
     * Test: Active Stage Render Callback Registration
     * 
     * Verifies that setActiveStage wires the active stage into the render loop.
     * - The update callback must be stored on the stage so it can be detached later
     * - The callback must be registered with the scene's onBeforeRenderObservable
     * - Without both, stage transitions would either double-update the new stage or
     *   leave the old stage's render observer attached
     */
    it('should register an update callback for the active stage', async () => {
        const stage = createMockStage();

        await stageManager.setActiveStage(stage);

        expect(stage.start).toHaveBeenCalledTimes(1);
        expect(stage.setUpdateCallback).toHaveBeenCalledTimes(1);

        const callback = stage.setUpdateCallback.mock.calls[0][0];
        expect(callback).toBeTypeOf('function');
        expect(stage.scene.onBeforeRenderObservable.add).toHaveBeenCalledWith(callback);
    });

    /**
     * Test: Active Scene Access
     * 
     * Verifies that the StageManager provides access to the active stage's scene.
     * - getActiveScene should return the scene from the active stage
     * - This is essential for rendering and scene operations
     * - setActiveStage is awaited so no in-flight lifecycle promise is left behind
     */
    it('should get active scene', async () => {
        const stage = createMockStage();

        await stageManager.setActiveStage(stage);
        expect(stageManager.getActiveScene()).toBe(stage.scene);
    });

    /**
     * Test: No Active Scene
     * 
     * Verifies the empty case for scene access.
     * - Before any stage is activated there is no scene to expose
     * - getActiveScene must return null rather than throwing
     */
    it('should return null active scene when no stage is active', () => {
        expect(stageManager.getActiveScene()).toBeNull();
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
        const stage = createMockStage({ started: true, initialized: true });

        await stageManager.setActiveStage(stage);
        await stageManager.update(0.016); // Simulate 60 FPS delta time

        // Verify all update methods were called with correct delta time
        expect(stage.earlyUpdate).toHaveBeenCalledWith(0.016);
        expect(stage.update).toHaveBeenCalledWith(0.016);
        expect(stage.lateUpdate).toHaveBeenCalledWith(0.016);
    });

    /**
     * Test: Update Ordering Within A Frame
     * 
     * Verifies the per-frame ordering contract.
     * - earlyUpdate must run before update, and lateUpdate after
     * - Stages rely on this to gather input before simulating and to render last
     */
    it('should run earlyUpdate, update, and lateUpdate in order', async () => {
        const order: string[] = [];
        const stage = createMockStage({
            started: true,
            initialized: true,
            earlyUpdate: vi.fn().mockImplementation(() => { order.push('early'); }),
            update: vi.fn().mockImplementation(() => { order.push('update'); }),
            lateUpdate: vi.fn().mockImplementation(() => { order.push('late'); })
        });

        await stageManager.setActiveStage(stage);
        await stageManager.update(0.016);

        expect(order).toEqual(['early', 'update', 'late']);
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
     * Test: Unstarted Stage Is Not Updated
     * 
     * Verifies that StageManager guards the update loop on the stage started flag.
     * - A stage that has not been started must not receive frame updates
     * - This prevents simulating a stage before its GameObjects have started
     */
    it('should not update a stage that has not started', async () => {
        const stage = createMockStage({ started: false, initialized: true });

        await stageManager.setActiveStage(stage);
        await stageManager.update(0.016);

        expect(stage.earlyUpdate).not.toHaveBeenCalled();
        expect(stage.update).not.toHaveBeenCalled();
        expect(stage.lateUpdate).not.toHaveBeenCalled();
    });

    /**
     * Test: Invalid Stage Addition
     * 
     * Verifies that StageManager handles invalid stage objects.
     * - addStage is async, so failures surface as promise rejections rather than
     *   synchronous throws; the assertions must use rejects.toThrow
     * - Should reject when adding null stage (current implementation)
     * - Should reject when adding undefined stage (current implementation)
     * - Should reject when adding empty object (current implementation)
     * - This test documents the current behavior and identifies needed robustness
     */
    it('should handle invalid stage objects gracefully', async () => {
        // Test adding null stage - currently rejects
        await expect(stageManager.addStage(null as any)).rejects.toThrow();

        // Test adding undefined stage - currently rejects
        await expect(stageManager.addStage(undefined as any)).rejects.toThrow();

        // Test adding empty object - currently rejects
        await expect(stageManager.addStage({} as any)).rejects.toThrow();

        // None of the invalid stages should have been registered
        expect(stageManager.getStages()).toHaveLength(0);
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
        const stage = createMockStage({ started: true, initialized: true });

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
        const stage = createMockStage({ started: true, initialized: true });

        await stageManager.setActiveStage(stage);

        // Test with very large delta time (e.g., game freeze for 10 seconds)
        await expect(stageManager.update(10)).resolves.not.toThrow();
        expect(stage.update).toHaveBeenCalledWith(10);

        // Reset mocks
        vi.clearAllMocks();

        // Test with zero delta time
        await expect(stageManager.update(0)).resolves.not.toThrow();
        expect(stage.update).toHaveBeenCalledWith(0);
    });

    /**
     * Test: Stage Removal
     * 
     * Verifies stage deregistration and disposal.
     * - removeStage should splice the stage out of the collection
     * - The stage's dispose should be invoked so its scene and GameObjects are released
     * - Removing an unregistered stage should be a no-op rather than an error
     */
    it('should remove a stage and dispose it', async () => {
        const stage = createMockStage();
        const stranger = createMockStage();

        await stageManager.addStage(stage);
        expect(stageManager.getStages()).toContain(stage);

        await stageManager.removeStage(stage);
        expect(stageManager.getStages()).not.toContain(stage);
        expect(stage.dispose).toHaveBeenCalledTimes(1);

        // Removing something that was never added should not throw
        await expect(stageManager.removeStage(stranger)).resolves.not.toThrow();
        expect(stranger.dispose).not.toHaveBeenCalled();
    });
});
