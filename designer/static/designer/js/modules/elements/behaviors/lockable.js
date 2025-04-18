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
            svgElement.attr('data-locked', 'true');
        }
        
        // Apply specific visual indicator based on element type
        const elementType = this._element.type();
        
        // Find main shape element to apply stroke
        let mainShape = null;
        if (elementType === 'pipe') {
            mainShape = svgElement.findOne('rect');
        } else if (elementType === 'fixture') {
            mainShape = svgElement.findOne('circle');
        }
        
        if (mainShape) {
            // Store original styles before changing
            if (!svgElement._origLockedStyles) {
                svgElement._origLockedStyles = {
                    stroke: mainShape.attr('stroke'),
                    'stroke-width': mainShape.attr('stroke-width'),
                    'stroke-dasharray': mainShape.attr('stroke-dasharray')
                };
            }
            
            // Apply locked style
            mainShape.stroke({ 
                width: 2, 
                color: '#009900',
                dasharray: elementType === 'fixture' ? '4,3' : '' 
            });
        }
        
        // Disable dragging by using the behavior manager
        if (this._element.hasBehavior('draggable')) {
            const draggableBehavior = this._element.getBehavior('draggable');
            if (draggableBehavior) {
                draggableBehavior.setEnabled(false);
            }
        }
        
        // Hide any rotation handles
        if (this._element.hasBehavior('rotatable')) {
            const rotatableBehavior = this._element.getBehavior('rotatable');
            if (rotatableBehavior) {
                rotatableBehavior.setEnabled(false);
            }
        }
    }
    
    
    /**
     * Remove locked visual state
     * @private
     */
    /**
     * Enhance _removeLockedState method to properly restore visual state
     */
    _removeLockedState() {
        if (!this._element) return;
        
        const svgElement = this._element.svgElement();
        if (!svgElement) return;
        
        // Remove CSS class and data attribute
        if (this._options.lockedClass) {
            svgElement.removeClass(this._options.lockedClass);
            svgElement.attr('data-locked', 'false');
        }
        
        // Find main shape element to restore stroke
        const elementType = this._element.type();
        let mainShape = null;
        if (elementType === 'pipe') {
            mainShape = svgElement.findOne('rect');
        } else if (elementType === 'fixture') {
            mainShape = svgElement.findOne('circle');
        }
        
        if (mainShape && svgElement._origLockedStyles) {
            // Check if element is selected to determine proper stroke
            if (this._element.isSelected && this._element.isSelected()) {
                // Apply selection style
                if (elementType === 'pipe') {
                    mainShape.stroke({ width: 2, color: '#ff0000', dasharray: '5,5' });
                } else {
                    mainShape.stroke({ width: 2, color: '#ff0000' });
                }
            } else {
                // Restore original styles
                mainShape.stroke(svgElement._origLockedStyles);
            }
            
            // Clean up stored styles
            delete svgElement._origLockedStyles;
        }
        
        // Re-enable dragging
        if (this._element.hasBehavior('draggable')) {
            const draggableBehavior = this._element.getBehavior('draggable');
            if (draggableBehavior) {
                draggableBehavior.setEnabled(true);
            }
        }
        
        // Re-enable rotation if element is selected
        if (this._element.hasBehavior('rotatable') && this._element.isSelected()) {
            const rotatableBehavior = this._element.getBehavior('rotatable');
            if (rotatableBehavior) {
                rotatableBehavior.setEnabled(true);
            }
        }
    }
}

// Export the behavior
export default LockableBehavior;