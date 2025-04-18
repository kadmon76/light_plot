/**
 * Draggable Behavior Module
 * 
 * Adds dragging functionality to elements.
 * Implements mouse event handling for drag operations.
 */

import BaseBehavior from './behavior.js';
import { getCanvasPoint } from '../../../core.js';

/**
 * DraggableBehavior class
 * Makes elements draggable with mouse interactions
 */
export class DraggableBehavior extends BaseBehavior {
    /**
     * Create a new DraggableBehavior
     * @param {Object} options - Configuration options
     * @param {Boolean} [options.constrainToParent=false] - Whether to constrain dragging to parent boundaries
     * @param {Boolean} [options.snapToGrid=true] - Whether to snap to grid when dragging
     * @param {Number} [options.gridSize=10] - Grid size for snapping
     */
    constructor(options = {}) {
        super({
            constrainToParent: false,
            snapToGrid: true,
            gridSize: 10,
            ...options
        });
        
        // Drag state
        this._isDragging = false;
        this._dragStart = { x: 0, y: 0 };
        this._elementStart = { x: 0, y: 0 };
        
        // Bound event handlers for proper "this" context
        this._onMouseDown = this._handleMouseDown.bind(this);
        this._onMouseMove = this._handleMouseMove.bind(this);
        this._onMouseUp = this._handleMouseUp.bind(this);
    }
    
    /**
     * Initialize behavior
     * @protected
     */
    _initialize() {
        if (!this._element || this._initialized) return;
        
        // Get SVG element
        const svgElement = this._element.svgElement();
        if (!svgElement) return;
        
        // Add event listeners
        svgElement.on('mousedown', this._onMouseDown);
        
        super._initialize();
    }
    
    /**
     * Clean up behavior
     * @protected
     */
    _cleanup() {
        if (!this._element) return;
        
        // Get SVG element
        const svgElement = this._element.svgElement();
        if (!svgElement) return;
        
        // Remove event listeners
        svgElement.off('mousedown', this._onMouseDown);
        
        // Clean up any ongoing drag operation
        this._endDrag();
        
        super._cleanup();
    }
    
    /**
     * Handle mouse down event to start dragging
     * @param {Event} event - Mouse event
     * @private
     */
    _handleMouseDown(event) {
        // Skip if element is locked or behavior is disabled
        if (
            !this._enabled || 
            !this._element || 
            this._isDragging || 
            (this._element.isLocked && this._element.isLocked())
        ) {
            return;
        }
        
        // Only start drag on left mouse button
        if (event.button !== 0) return;
        
        // Get starting positions
        const point = getCanvasPoint(event);
        this._dragStart = { x: point.x, y: point.y };
        
        const elementPos = this._element.position();
        this._elementStart = { x: elementPos.x, y: elementPos.y };
        
        // Start tracking drag
        this._isDragging = true;
        
        // Add global event listeners
        window.addEventListener('mousemove', this._onMouseMove);
        window.addEventListener('mouseup', this._onMouseUp);
        
        // Prevent default to avoid text selection, etc.
        event.preventDefault();
        event.stopPropagation();
        
        // Emit drag start event
        this.emit('dragStart', {
            behavior: this,
            element: this._element,
            position: { ...this._elementStart },
            originalEvent: event
        });
    }
    
    /**
     * Handle mouse move event for dragging
     * @param {Event} event - Mouse event
     * @private
     */
    _handleMouseMove(event) {
        if (!this._isDragging) return;
        
        // Calculate new position
        const point = getCanvasPoint(event);
        let deltaX = point.x - this._dragStart.x;
        let deltaY = point.y - this._dragStart.y;
        
        let newX = this._elementStart.x + deltaX;
        let newY = this._elementStart.y + deltaY;
        
        // Apply grid snapping if enabled
        if (this._options.snapToGrid) {
            const gridSize = this._options.gridSize;
            newX = Math.round(newX / gridSize) * gridSize;
            newY = Math.round(newY / gridSize) * gridSize;
        }
        
        // Apply parent constraints if enabled
        if (this._options.constrainToParent && this._element.parent) {
            const parent = this._element.parent();
            if (parent) {
                const parentBBox = parent.getBBox();
                const elementBBox = this._element.getBBox();
                
                // Keep element within parent boundaries
                newX = Math.max(parentBBox.x, Math.min(newX, parentBBox.x + parentBBox.width - elementBBox.width));
                newY = Math.max(parentBBox.y, Math.min(newY, parentBBox.y + parentBBox.height - elementBBox.height));
            }
        }
        
        // Move the element
        this._element.move(newX, newY);
        
        // Emit drag event
        this.emit('drag', {
            behavior: this,
            element: this._element,
            position: { x: newX, y: newY },
            delta: { x: deltaX, y: deltaY },
            originalEvent: event
        });
        
        event.preventDefault();
        event.stopPropagation();
    }
    
    /**
     * Handle mouse up event to end dragging
     * @param {Event} event - Mouse event
     * @private
     */
    /**
 * Improve the _handleMouseUp method to ensure proper cleanup
 */
    _handleMouseUp(event) {
        if (!this._isDragging) return;
        
        // Get final position
        const finalPosition = this._element.position();
        
        // Remove dragging class
        const svgElement = this._element.svgElement();
        if (svgElement) {
            svgElement.removeClass('dragging');
        }
        
        // End drag tracking
        this._endDrag();
        
        // Emit drag end event
        this.emit('dragEnd', {
            behavior: this,
            element: this._element,
            position: finalPosition,
            startPosition: { ...this._elementStart },
            originalEvent: event
        });
        
        event.preventDefault();
        event.stopPropagation();
    }
    
    /**
     * End the current drag operation
     * @private
     */
    _endDrag() {
        this._isDragging = false;
        this._dragStart = { x: 0, y: 0 };
        this._elementStart = { x: 0, y: 0 };
        
        // Remove global event listeners
        window.removeEventListener('mousemove', this._onMouseMove);
        window.removeEventListener('mouseup', this._onMouseUp);
    }
    
    /**
     * Check if element is currently being dragged
     * @return {Boolean} Whether element is being dragged
     */
    isDragging() {
        return this._isDragging;
    }
}

// Export the behavior
export default DraggableBehavior;