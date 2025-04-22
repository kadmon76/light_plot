// File: designer/static/designer/js/behaviors/behavior.js

/**
 * Base Behavior Module
 * 
 * Foundation for all behavior implementations.
 * Behaviors represent composable pieces of functionality that can be added to elements.
 * Core to the DRY architecture by allowing functionality to be shared across element types.
 */

 import { EventEmitter } from '../utils/event-emitter.js';

 /**
  * BaseBehavior class
  * Abstract base class for all behaviors
  */
 export class BaseBehavior extends EventEmitter {
     /**
      * Create a new BaseBehavior
      * @param {Object} options - Configuration options
      */
     constructor(options = {}) {
         super();
         
         this._options = { ...options };
         this._element = null;
         this._enabled = true;
         this._initialized = false;
     }
     
     /**
      * Attach behavior to an element
      * @param {BaseElement} element - Element to attach to
      * @return {BaseBehavior} this
      */
     attach(element) {
         if (!element || this._element === element) return this;
         
         // Detach from previous element if any
         if (this._element) {
             this.detach();
         }
         
         this._element = element;
         
         if (this._enabled) {
             this._initialize();
         }
         
         this.emit('attached', { behavior: this, element });
         return this;
     }
     
     /**
      * Detach behavior from current element
      * @return {BaseBehavior} this
      */
     detach() {
         if (!this._element) return this;
         
         if (this._initialized) {
             this._cleanup();
             this._initialized = false;
         }
         
         const element = this._element;
         this._element = null;
         
         this.emit('detached', { behavior: this, element });
         return this;
     }
     
     /**
      * Initialize behavior when attached to an element
      * Override in subclasses to perform behavior-specific initialization
      * @protected
      */
     _initialize() {
         // Abstract method to be implemented by subclasses
         this._initialized = true;
     }
     
     /**
      * Clean up behavior when detached from an element
      * Override in subclasses to perform behavior-specific cleanup
      * @protected
      */
     _cleanup() {
         // Abstract method to be implemented by subclasses
     }
     
     /**
      * Get attached element
      * @return {BaseElement|null} Attached element or null
      */
     element() {
         return this._element;
     }
     
     /**
      * Enable or disable behavior
      * @param {Boolean} enabled - Whether behavior is enabled
      * @return {BaseBehavior} this
      */
     setEnabled(enabled = true) {
         if (this._enabled === enabled) return this;
         
         this._enabled = enabled;
         
         // If we have an element, initialize or clean up based on enabled state
         if (this._element) {
             if (enabled && !this._initialized) {
                 this._initialize();
             } else if (!enabled && this._initialized) {
                 this._cleanup();
                 this._initialized = false;
             }
         }
         
         this.emit('enabledChanged', { behavior: this, enabled });
         return this;
     }
     
     /**
      * Check if behavior is enabled
      * @return {Boolean} Whether behavior is enabled
      */
     isEnabled() {
         return this._enabled;
     }
     
     /**
      * Get or set an option value
      * @param {String} key - Option name
      * @param {*} [value] - Option value to set (optional)
      * @return {*|BaseBehavior} Option value if getting, this if setting
      */
     option(key, value) {
         if (value === undefined) return this._options[key];
         
         this._options[key] = value;
         this.emit('optionChanged', { behavior: this, key, value });
         
         return this;
     }
 }
 
 export default BaseBehavior;