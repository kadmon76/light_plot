/**
 * Behavior Manager Module
 * 
 * Manages the application of behaviors to elements.
 * Implements the Behavior pattern to enable composable functionality.
 * Core to the DRY architecture by allowing elements to share behaviors.
 */

import { EventEmitter } from '../utils/event-emitter.js';

// Import behaviors
import { DraggableBehavior } from './behaviors/draggable.js';
import { SelectableBehavior } from './behaviors/selectable.js';
import { LockableBehavior } from './behaviors/lockable.js';
import { ResizableBehavior } from './behaviors/resizable.js';
import { RotatableBehavior } from './behaviors/rotatable.js';

/**
 * BehaviorManager class
 * Manages the creation and application of behaviors to elements
 */
export class BehaviorManager extends EventEmitter {
    constructor() {
        super();
        
        // Map of behavior factories
        this._behaviorFactories = new Map();
        
        // Register built-in behaviors
        this.registerBehavior('draggable', (options) => new DraggableBehavior(options));
        this.registerBehavior('selectable', (options) => new SelectableBehavior(options));
        this.registerBehavior('lockable', (options) => new LockableBehavior(options));
        this.registerBehavior('resizable', (options) => new ResizableBehavior(options));
        this.registerBehavior('rotatable', (options) => new RotatableBehavior(options));
    }
    
    /**
     * Register a behavior type with a factory function
     * @param {String} type - Behavior type name
     * @param {Function} factory - Factory function that creates behavior instances
     * @return {BehaviorManager} this
     */
    registerBehavior(type, factory) {
        if (!type || typeof factory !== 'function') return this;
        
        this._behaviorFactories.set(type, factory);
        this.emit('behavior:registered', { type });
        
        return this;
    }
    
    /**
     * Check if a behavior type is registered
     * @param {String} type - Behavior type name
     * @return {Boolean} Whether the behavior is registered
     */
    hasBehavior(type) {
        return this._behaviorFactories.has(type);
    }
    
    /**
     * Create a behavior instance
     * @param {String} type - Behavior type name
     * @param {Object} options - Options for the behavior
     * @return {Object|null} Behavior instance or null if type not found
     */
    createBehavior(type, options = {}) {
        const factory = this._behaviorFactories.get(type);
        if (!factory) return null;
        
        return factory(options);
    }
    
    /**
     * Apply a behavior to an element
     * @param {BaseElement} element - Element to apply behavior to
     * @param {String} type - Behavior type name
     * @param {Object} options - Options for the behavior
     * @return {Object|null} Behavior instance or null if application failed
     */
    applyBehavior(element, type, options = {}) {
        if (!element || !type) return null;
        
        // If element already has this behavior, return it
        if (element.hasBehavior(type)) {
            return element.getBehavior(type);
        }
        
        // Create and apply behavior
        const behavior = this.createBehavior(type, options);
        if (!behavior) return null;
        
        element.addBehavior(type, behavior);
        this.emit('behavior:applied', { element, type, behavior });
        
        return behavior;
    }
    
    /**
     * Remove a behavior from an element
     * @param {BaseElement} element - Element to remove behavior from
     * @param {String} type - Behavior type name
     * @return {BehaviorManager} this
     */
    removeBehavior(element, type) {
        if (!element || !type || !element.hasBehavior(type)) return this;
        
        element.removeBehavior(type);
        this.emit('behavior:removed', { element, type });
        
        return this;
    }
    
    /**
     * Apply multiple behaviors to an element
     * @param {BaseElement} element - Element to apply behaviors to
     * @param {Array<Object>} behaviors - Array of behavior configs
     * @return {BehaviorManager} this
     */
    applyBehaviors(element, behaviors = []) {
        if (!element || !Array.isArray(behaviors)) return this;
        
        behaviors.forEach(config => {
            if (typeof config === 'string') {
                // Just the behavior name
                this.applyBehavior(element, config);
            } else if (config && typeof config === 'object') {
                // Config object with type and options
                const { type, options = {} } = config;
                if (type) {
                    this.applyBehavior(element, type, options);
                }
            }
        });
        
        return this;
    }
    
    /**
     * Enable or disable a behavior on an element
     * @param {BaseElement} element - Element to modify behavior on
     * @param {String} type - Behavior type name
     * @param {Boolean} enabled - Whether to enable or disable the behavior
     * @return {BehaviorManager} this
     */
    setBehaviorEnabled(element, type, enabled = true) {
        if (!element || !type || !element.hasBehavior(type)) return this;
        
        const behavior = element.getBehavior(type);
        if (behavior && typeof behavior.setEnabled === 'function') {
            behavior.setEnabled(enabled);
            this.emit('behavior:enabledChanged', { element, type, enabled });
        }
        
        return this;
    }
    
    /**
     * Get singleton instance
     * @return {BehaviorManager} Singleton instance
     */
    static getInstance() {
        if (!BehaviorManager._instance) {
            BehaviorManager._instance = new BehaviorManager();
        }
        return BehaviorManager._instance;
    }
}

// Create and export singleton instance
const behaviorManager = BehaviorManager.getInstance();
export default behaviorManager;