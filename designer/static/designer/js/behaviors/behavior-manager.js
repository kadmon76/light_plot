// File: designer/static/designer/js/behaviors/behavior-manager.js

/**
 * Behavior Manager Module
 * 
 * Manages the registration and application of behaviors to elements.
 * Core to the DRY architecture by allowing elements to share behaviors.
 */

 import { EventEmitter } from '../utils/event-emitter.js';

 /**
  * BehaviorManager class
  * Manages the creation and application of behaviors to elements
  */
 class BehaviorManager extends EventEmitter {
     constructor() {
         super();
         
         // Map of behavior factories
         this._behaviorFactories = new Map();
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
      * Apply multiple behaviors to an element
      * @param {BaseElement} element - Element to apply behaviors to
      * @param {Array<String|Object>} behaviors - Behaviors to apply
      * @return {BehaviorManager} this
      */
     applyBehaviors(element, behaviors = []) {
         if (!element || !Array.isArray(behaviors)) return this;
         
         behaviors.forEach(behavior => {
             if (typeof behavior === 'string') {
                 // Just the behavior name
                 this.applyBehavior(element, behavior);
             } else if (behavior && typeof behavior === 'object') {
                 // Config object with type and options
                 const { type, options = {} } = behavior;
                 if (type) {
                     this.applyBehavior(element, type, options);
                 }
             }
         });
         
         return this;
     }
 }
 
 // Create singleton instance
 const behaviorManager = new BehaviorManager();
 export default behaviorManager;