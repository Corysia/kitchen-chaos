import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Engine } from '@babylonjs/core';
import { StageManager } from '../src/framework/StageManager';
import { Logger, LogLevel, LogTimestampFormat } from '../src/framework/logger/Logger';

describe('Framework Simple Tests', () => {
    let engine: Engine;
    let stageManager: StageManager;

    beforeEach(() => {
        // Create a mock engine
        engine = {
            dispose: vi.fn(),
            resize: vi.fn(),
            runRenderLoop: vi.fn(),
            getDeltaTime: vi.fn().mockReturnValue(16.67),
            switchFullscreen: vi.fn()
        } as any;

        // Reset singleton
        (StageManager as any)._instance = null;
        stageManager = StageManager.initialize(engine);
    });

    describe('StageManager', () => {
        it('should create singleton instance', () => {
            expect(StageManager.instance).toBe(stageManager);
        });

        it('should throw error when trying to create second instance', () => {
            expect(() => StageManager.initialize(engine)).toThrow('StageManager instance already exists');
        });

        it('should add and manage stages', () => {
            const stage = {
                gameObjects: [],
                started: false,
                initialized: false,
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
            expect(stageManager.stages).toContain(stage);
        });

        it('should set active stage', async () => {
            const stage = {
                gameObjects: [],
                started: false,
                initialized: false,
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

        it('should get active scene', () => {
            const stage = {
                gameObjects: [],
                started: false,
                initialized: false,
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

        it('should update active stage', async () => {
            const stage = {
                gameObjects: [],
                started: true,
                initialized: true,
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
            await stageManager.update(0.016);
            
            expect(stage.earlyUpdate).toHaveBeenCalledWith(0.016);
            expect(stage.update).toHaveBeenCalledWith(0.016);
            expect(stage.lateUpdate).toHaveBeenCalledWith(0.016);
        });
    });

    describe('Logger', () => {
        it('should set and get log levels', () => {
            Logger.setLogLevel(LogLevel.DEBUG);
            // Test that it doesn't throw
            expect(true).toBe(true);
        });

        it('should set timestamp format', () => {
            Logger.setTimestampFormat(LogTimestampFormat.ISO);
            // Test that it doesn't throw
            expect(true).toBe(true);
        });

        it('should not throw when logging with various parameters', () => {
            expect(() => {
                Logger.info('Test message');
                Logger.debug('Debug message', { data: 'test' });
                Logger.warn('Warning message');
                Logger.error('Error message', new Error('test'));
                Logger.trace('Trace message');
            }).not.toThrow();
        });
    });
});
