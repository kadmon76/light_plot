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
     * @param {Function} [options.onLock] - Callback when element is locked
     * @param {Function} [options.onUnlock] - Callback when element is unlocked
     */
    constructor(options = {}) {
        super({
            lockedClass: 'locked',
            lockedStyles: {
                stroke: '#e91e63',
                'stroke-width': 1.5,
                'stroke-dasharray': '4,3'
            },
            onLock: null,
            onUnlock: null,
            ...options
        });
        
        // Bound event handler
        this._onLockChange = this._handleLockChange.bind(this);
    }
    
    /**
     * Initialize behavior
     * @protected
     */
    _initialize() {
        if (!this._element || this._initialized) return;
        
        // Add event listeners
        this._element.on('lock:change', this._onLockChange);
        
        // Apply initial state if already locked
        if (this._element.isLocked && this._element.isLocked()) {
            this._applyLockedState();
        }
        
        super._initialize();
    }
    
    /**
     * Clean up behavior
     * @protected
     */
    _cleanup() {
        if (!this._element) return;
        
        // Remove event listeners
        this._element.off('lock:change', this._onLockChange);
        
        // Remove locked styling
        this._removeLockedState();
        
        super._cleanup();
    }
    
    /**
     * Handle lock change event
     * @param {Object} event - Lock change event
     * @private
     */
    _handleLockChange(event) {
        if (!this._enabled || !this._element) return;
        
        if (event.locked) {
            this._applyLockedState();
            
            // Call lock callback
            if (typeof this._options.onLock === 'function') {
                this._options.onLock(this._element);
            }
        } else {
            this._removeLockedState();
            
            // Call unlock callback
            if (typeof this._options.onUnlock === 'function') {
                this._options.onUnlock(this._element);
            }
        }
    }
    
    /**
     * Toggle the locked state
     * @return {LockableBehavior} this
     */
    toggleLock() {
        if (!this._element || !this._element.lock) return this;
        
        const isLocked = this._element.isLocked();
        this._element.lock(!isLocked);
        
        return this;
    }
    
    /**
     * Apply locked visual state
     * @private
     */
    _applyLockedState() {
        if (!this._element) return;
        
        const svgElement = this._element.svgElement();
        if (!svgElement) return;
        
        // Apply CSS class if specified
        if (this._options.lockedClass) {
            svgElement.addClass(this._options.lockedClass);
        }
        
        // Apply SVG styles if specified
        if (this._options.lockedStyles) {
            const styles = this._options.lockedStyles;
            Object.entries(styles).forEach(([key, value]) => {
                // Store original value before changing
                const origValue = svgElement.attr(key);
                if (origValue !== undefined && !svgElement._origLockedStyles) {
                    svgElement._origLockedStyles = svgElement._origLockedStyles || {};
                    svgElement._origLockedStyles[key] = origValue;
                }
                
                // Apply new style
                svgElement.attr(key, value);
            });
        }
    }
    
    /**
     * Remove locked visual state
     * @private
     */
    _removeLockedState() {
        if (!this._element) return;
        
        const svgElement = this._element.svgElement();
        if (!svgElement) return;
        
        // Remove CSS class if specified
        if (this._options.lockedClass) {
            svgElement.removeClass(this._options.lockedClass);
        }
        
        // Restore original SVG styles
        if (this._options.lockedStyles && svgElement._origLockedStyles) {
            Object.entries(svgElement._origLockedStyles).forEach(([key, value]) => {
                svgElement.attr(key, value);
            });
            delete svgElement._origLockedStyles;
        }
    }
}

// Export the behavior
export default LockableBehavior;