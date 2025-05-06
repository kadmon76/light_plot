/**
 * Droppable Behavior Module
 * 
 * Adds dropping functionality to elements.
 * Handles the placement of elements on the canvas with visual feedback.
 */

import BaseBehavior from './behavior.js';
import { getCanvasPoint } from '../utils/svg-utils.js';

/**
 * DroppableBehavior class
 * Makes elements droppable with visual feedback and placement handling
 */
export class DroppableBehavior extends BaseBehavior {
    /**
     * Create a new DroppableBehavior
     * @param {Object} options - Configuration options
     * @param {Boolean} [options.snapToGrid=true] - Whether to snap to grid when dropping
     * @param {Number} [options.gridSize=10] - Grid size for snapping
     * @param {String} [options.droppingClass='dropping'] - CSS class for dropping state
     * @param {Object} [options.droppingStyles] - SVG styles to apply while dropping
     */
    constructor(options = {}) {
        super({
            snapToGrid: true,
            gridSize: 10,
            droppingClass: 'dropping',
            droppingStyles: {
                opacity: 0.7,
                'stroke-dasharray': '4,4'
            },
            ...options
        });

        // Drop state
        this._isDropping = false;
        this._dropPosition = { x: 0, y: 0 };
        this._originalStyles = null;

        // Bound event handlers for proper "this" context
        this._onMouseMove = this._handleMouseMove.bind(this);
        this._onMouseUp = this._handleMouseUp.bind(this);
        this._onKeyDown = this._handleKeyDown.bind(this);
    }

    /**
     * Initialize behavior
     * @protected
     */
    _initialize() {
        if (!this._element || this._initialized) return;

        // Get SVG element
        const svgElement = this._element.svgElement();
        if (!svgElement) {
            console.error(`DroppableBehavior: No SVG element found for ${this._element.id()}`);
            return;
        }

        // Store original styles
        this._originalStyles = { ...svgElement.attr() };

        // Start dropping
        this._startDropping();

        super._initialize();
    }

    /**
     * Clean up behavior
     * @protected
     */
    _cleanup() {
        if (!this._initialized) return;

        this._endDropping();
        this._originalStyles = null;

        super._cleanup();
    }

    /**
     * Start dropping operation
     * @private
     */
    _startDropping() {
        if (this._isDropping) return;

        const svgElement = this._element.svgElement();
        if (!svgElement) {
            console.error(`DroppableBehavior: No SVG element found for ${this._element.id()}`);
            return;
        }

        this._isDropping = true;

        // Apply dropping styles
        svgElement.addClass(this._options.droppingClass);
        Object.entries(this._options.droppingStyles).forEach(([key, value]) => {
            svgElement.attr(key, value);
        });

        // Add global event listeners
        window.addEventListener('mousemove', this._onMouseMove);
        window.addEventListener('mouseup', this._onMouseUp);
        window.addEventListener('keydown', this._onKeyDown);

        // Emit drop start event
        this.emit('dropStart', {
            behavior: this,
            element: this._element,
            position: { ...this._dropPosition }
        });
    }

    /**
     * Handle mouse move during dropping
     * @param {Event} event - Mouse event
     * @private
     */
    _handleMouseMove(event) {
        if (!this._isDropping || !this._element) return;

        // Get current position
        const point = getCanvasPoint(event);
        let { x, y } = point;

        // Apply grid snapping if enabled
        if (this._options.snapToGrid) {
            const gridSize = this._options.gridSize;
            x = Math.round(x / gridSize) * gridSize;
            y = Math.round(y / gridSize) * gridSize;
        }

        // Update position
        this._dropPosition = { x, y };
        this._element.position(x, y);

        // Emit drop move event
        this.emit('dropMove', {
            behavior: this,
            element: this._element,
            position: { ...this._dropPosition }
        });
    }

    /**
     * Handle mouse up to complete drop
     * @param {Event} event - Mouse event
     * @private
     */
    _handleMouseUp(event) {
        if (!this._isDropping) return;

        // Complete the drop
        this._completeDrop();

        // Prevent default to avoid text selection, etc.
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * Handle key down events
     * @param {Event} event - Keyboard event
     * @private
     */
    _handleKeyDown(event) {
        if (!this._isDropping) return;

        // Cancel drop on Escape key
        if (event.key === 'Escape') {
            this._cancelDrop();
            event.preventDefault();
        }
    }

    /**
     * Complete the drop operation
     * @private
     */
    _completeDrop() {
        if (!this._isDropping) return;

        const svgElement = this._element.svgElement();
        if (svgElement) {
            // Restore original styles
            svgElement.removeClass(this._options.droppingClass);
            if (this._originalStyles) {
                Object.entries(this._originalStyles).forEach(([key, value]) => {
                    svgElement.attr(key, value);
                });
            }
        }

        this._endDropping();

        // Emit drop complete event
        this.emit('dropComplete', {
            behavior: this,
            element: this._element,
            position: { ...this._dropPosition }
        });
    }

    /**
     * Cancel the drop operation
     * @private
     */
    _cancelDrop() {
        if (!this._isDropping) return;

        const svgElement = this._element.svgElement();
        if (svgElement) {
            // Restore original styles
            svgElement.removeClass(this._options.droppingClass);
            if (this._originalStyles) {
                Object.entries(this._originalStyles).forEach(([key, value]) => {
                    svgElement.attr(key, value);
                });
            }
        }

        this._endDropping();

        // Emit drop cancel event
        this.emit('dropCancel', {
            behavior: this,
            element: this._element
        });
    }

    /**
     * End dropping operation
     * @private
     */
    _endDropping() {
        if (!this._isDropping) return;

        // Remove global event listeners
        window.removeEventListener('mousemove', this._onMouseMove);
        window.removeEventListener('mouseup', this._onMouseUp);
        window.removeEventListener('keydown', this._onKeyDown);

        this._isDropping = false;
    }

    /**
     * Check if element is currently being dropped
     * @return {Boolean} Whether element is being dropped
     */
    isDropping() {
        return this._isDropping;
    }
} 