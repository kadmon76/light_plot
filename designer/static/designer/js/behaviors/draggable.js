// File: designer/static/designer/js/behaviors/draggable.js

/**
 * Draggable Behavior Module
 * 
 * Adds dragging functionality to elements.
 * Implements mouse event handling for drag operations.
 */

 import BaseBehavior from './behavior.js';
 import { getCanvasPoint } from '../utils/svg-utils.js';
 
 /**
  * DraggableBehavior class
  * Makes elements draggable with mouse interactions
  */
 export class DraggableBehavior extends BaseBehavior {
     /**
      * Create a new DraggableBehavior
      * @param {Object} options - Configuration options
      * @param {Boolean} [options.snapToGrid=true] - Whether to snap to grid when dragging
      * @param {Number} [options.gridSize=10] - Grid size for snapping
      */
     constructor(options = {}) {
         super({
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
         
         console.log('DraggableBehavior: Created new instance with options:', this._options);
     }
     
     /**
      * Initialize behavior
      * @protected
      */
     _initialize() {
         if (!this._element || this._initialized) return;
         
         console.log(`DraggableBehavior: Initializing for element ${this._element.id()}`);
         
         // Get SVG element
         const svgElement = this._element.svgElement();
         if (!svgElement) {
             console.error(`DraggableBehavior: No SVG element found for ${this._element.id()}`);
             return;
         }
         
         // Add event listeners
         svgElement.on('mousedown', this._onMouseDown);
         
         console.log(`DraggableBehavior: Initialized for element ${this._element.id()}`);
         super._initialize();
     }
     
     /**
      * Clean up behavior
      * @protected
      */
     _cleanup() {
         if (!this._element) return;
         
         console.log(`DraggableBehavior: Cleaning up for element ${this._element.id()}`);
         
         // Get SVG element
         const svgElement = this._element.svgElement();
         if (!svgElement) {
             console.error(`DraggableBehavior: No SVG element found for cleanup ${this._element.id()}`);
             return;
         }
         
         // Remove event listeners
         svgElement.off('mousedown', this._onMouseDown);
         
         // Clean up any ongoing drag operation
         this._endDrag();
         
         console.log(`DraggableBehavior: Cleanup complete for element ${this._element.id()}`);
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
             this._element.isLocked()
         ) {
             return;
         }
         
         // Only start drag on left mouse button
         if (event.button !== 0) return;
         
         console.log(`DraggableBehavior: Mouse down on element ${this._element.id()}`);
         
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
         
         console.log(`DraggableBehavior: Started drag on element ${this._element.id()}`);
         
         // Add dragging class to element
         const svgElement = this._element.svgElement();
         if (svgElement) {
             svgElement.addClass('dragging');
         }
         
         // Emit drag start event
         this.emit('dragStart', {
             behavior: this,
             element: this._element,
             position: { ...this._elementStart },
             originalEvent: event
         });
         
         // Prevent default to avoid text selection, etc.
         event.preventDefault();
         event.stopPropagation();
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
         const deltaX = point.x - this._dragStart.x;
         const deltaY = point.y - this._dragStart.y;
         
         let newX = this._elementStart.x + deltaX;
         let newY = this._elementStart.y + deltaY;
         
         // Apply grid snapping if enabled
         if (this._options.snapToGrid) {
             const gridSize = this._options.gridSize;
             newX = Math.round(newX / gridSize) * gridSize;
             newY = Math.round(newY / gridSize) * gridSize;
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
     }
     
     /**
      * Handle mouse up event to end dragging
      * @param {Event} event - Mouse event
      * @private
      */
     _handleMouseUp(event) {
         if (!this._isDragging) return;
         
         console.log(`DraggableBehavior: Mouse up, ending drag for element ${this._element.id()}`);
         
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
         
         console.log(`DraggableBehavior: Drag ended for element ${this._element.id()}`);
         
         event.preventDefault();
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