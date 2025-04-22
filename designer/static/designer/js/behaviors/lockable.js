// File: designer/static/designer/js/behaviors/lockable.js

/**
 * Lockable Behavior Module
 * 
 * Adds locking functionality to elements.
 * Prevents elements from being moved or modified when locked.
 */

 import BaseBehavior from './behavior.js';

 /**
  * LockableBehavior class
  * Makes elements lockable with visual feedback
  */
 export class LockableBehavior extends BaseBehavior {
     /**
      * Create a new LockableBehavior
      * @param {Object} options - Configuration options
      * @param {String} [options.lockedClass='locked'] - CSS class for locked state
      * @param {Object} [options.lockedStyles] - SVG styles to apply when locked
      */
     constructor(options = {}) {
         super({
             lockedClass: 'locked',
             lockedStyles: {
                 stroke: '#009900',
                 'stroke-width': 2,
                 'stroke-dasharray': '4,3'
             },
             ...options
         });
         
         // Bound event handler
         this._onLockChange = this._handleLockChange.bind(this);
         
         console.log('LockableBehavior: Created new instance with options:', this._options);
     }
     
     /**
      * Initialize behavior
      * @protected
      */


    _initialize() {
        if (!this._element || this._initialized) return;
        
        console.log(`LockableBehavior: Initializing for element ${this._element.id()}`);
        
        // Add event listeners
        this._element.on('lock:change', this._onLockChange);
        
        // Apply initial state if already locked
        if (this._element.isLocked()) {
            console.log(`LockableBehavior: Element ${this._element.id()} is already locked, applying visual state`);
            this._applyLockedState();
        }
        
        console.log(`LockableBehavior: Initialized for element ${this._element.id()}`);
        super._initialize();
    }

    /**
     * Clean up behavior
     * @protected
     */
    _cleanup() {
        if (!this._element) return;
        
        console.log(`LockableBehavior: Cleaning up for element ${this._element.id()}`);
        
        // Remove event listeners
        this._element.off('lock:change', this._onLockChange);
        
        // Remove locked styling
        this._removeLockedState();
        
        console.log(`LockableBehavior: Cleanup complete for element ${this._element.id()}`);
        super._cleanup();
    }

    /**
     * Handle lock change event
     * @param {Object} event - Lock change event
     * @private
     */
    _handleLockChange(event) {
        if (!this._enabled || !this._element) return;
        
        console.log(`LockableBehavior: Lock changed for element ${this._element.id()}, locked: ${event.locked}`);
        
        if (event.locked) {
            this._applyLockedState();
        } else {
            this._removeLockedState();
        }
    }

    /**
     * Apply locked visual state
     * @private
     */
    _applyLockedState() {
        if (!this._element) return;
        
        console.log(`LockableBehavior: Applying locked state to element ${this._element.id()}`);
        
        const svgElement = this._element.svgElement();
        if (!svgElement) {
            console.error(`LockableBehavior: No SVG element found for ${this._element.id()}`);
            return;
        }
        
        // Apply CSS class if specified
        if (this._options.lockedClass) {
            svgElement.addClass(this._options.lockedClass);
            svgElement.attr('data-locked', 'true');
        }
        
        // Apply SVG styles if specified
        if (this._options.lockedStyles) {
            const styles = this._options.lockedStyles;
            
            // Store original styles
            svgElement._origLockedStyles = svgElement._origLockedStyles || {};
            
            // Apply new styles
            Object.entries(styles).forEach(([key, value]) => {
                // Store original value before changing if not already stored
                if (svgElement._origLockedStyles[key] === undefined) {
                    svgElement._origLockedStyles[key] = svgElement.attr(key);
                }
                
                // Apply new style
                svgElement.attr(key, value);
            });
        }
        
        console.log(`LockableBehavior: Locked state applied to element ${this._element.id()}`);
    }

    /**
     * Remove locked visual state
     * @private
     */
    _removeLockedState() {
        if (!this._element) return;
        
        console.log(`LockableBehavior: Removing locked state from element ${this._element.id()}`);
        
        const svgElement = this._element.svgElement();
        if (!svgElement) {
            console.error(`LockableBehavior: No SVG element found for ${this._element.id()}`);
            return;
        }
        
        // Remove CSS class if specified
        if (this._options.lockedClass) {
            svgElement.removeClass(this._options.lockedClass);
            svgElement.attr('data-locked', 'false');
        }
        
        // Restore original SVG styles
        if (svgElement._origLockedStyles) {
            Object.entries(svgElement._origLockedStyles).forEach(([key, value]) => {
                // Apply appropriate style based on selection state
                if (this._element.isSelected() && key === 'stroke') {
                    // Skip restoring stroke if element is selected (keep selection styling)
                    return;
                }
                
                svgElement.attr(key, value);
            });
            delete svgElement._origLockedStyles;
        }
        
        console.log(`LockableBehavior: Locked state removed from element ${this._element.id()}`);
    }

    /**
     * Toggle locked state
     * @return {LockableBehavior} this
     */
    toggleLock() {
        if (!this._element) return this;
        
        const isLocked = this._element.isLocked();
        this._element.lock(!isLocked);
        
        return this;
    }
    }

    // Export the behavior
    export default LockableBehavior;