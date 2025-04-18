/**
 * Rotatable Behavior Module
 * 
 * Adds rotation functionality to elements with a visual handle.
 * Allows elements to be rotated by dragging a handle.
 */

 import BaseBehavior from './behavior.js';
 import { getCanvasPoint } from '../../../core.js';
 
 /**
  * RotatableBehavior class
  * Makes elements rotatable with a handle
  */
 export class RotatableBehavior extends BaseBehavior {
     /**
      * Create a new RotatableBehavior
      * @param {Object} options - Configuration options
      * @param {Number} [options.handleDistance=30] - Distance of handle from element center
      * @param {Number} [options.handleSize=10] - Size of rotation handle
      * @param {String} [options.handleFill='#2196F3'] - Fill color of handle
      * @param {Number} [options.snapAngle=0] - Angle to snap to (0 for no snapping)
      */
     constructor(options = {}) {
         super({
             handleDistance: 30,
             handleSize: 10,
             handleFill: '#2196F3',
             handleStroke: '#0D47A1',
             snapAngle: 0,
             ...options
         });
         
         // Rotation state
         this._isRotating = false;
         this._rotationHandle = null;
         this._rotationLine = null;
         this._rotationStartAngle = 0;
         this._elementStartRotation = 0;
         this._rotationCenter = { x: 0, y: 0 };
         
         // Bound event handlers for proper "this" context
         this._onMouseDown = this._handleMouseDown.bind(this);
         this._onMouseMove = this._handleMouseMove.bind(this);
         this._onMouseUp = this._handleMouseUp.bind(this);
         this._onSelectionChange = this._handleSelectionChange.bind(this);
     }
     
     /**
      * Initialize behavior
      * @protected
      */
     _initialize() {
         if (!this._element || this._initialized) return;
         
         // Listen for selection changes to show/hide handle
         this._element.on('selection:change', this._onSelectionChange);
         
         super._initialize();
     }
     
     /**
      * Clean up behavior
      * @protected
      */
     _cleanup() {
         if (!this._element) return;
         
         // Remove handles
         this._removeRotationHandle();
         
         // Clean up any ongoing rotation
         this._endRotation();
         
         // Remove event listeners
         this._element.off('selection:change', this._onSelectionChange);
         
         super._cleanup();
     }
     
     /**
      * Handle selection change
      * @param {Object} event - Selection change event
      * @private
      */
     _handleSelectionChange(event) {
         if (!this._enabled || !this._element) return;
         
         if (event.selected) {
             this._createRotationHandle();
         } else {
             this._removeRotationHandle();
         }
     }
     
     /**
      * Create rotation handle
      * @private
      */
     _createRotationHandle() {
         // Remove existing handle if any
         this._removeRotationHandle();
         
         const svgElement = this._element.svgElement();
         if (!svgElement) return;
         
         // Get the SVG document
         const svg = svgElement.doc();
         if (!svg) return;
         
         // Calculate element center and handle position
         const bbox = this._element.getBBox();
         const centerX = bbox.x + bbox.width / 2;
         const centerY = bbox.y + bbox.height / 2;
         
         // Store rotation center for later use
         this._rotationCenter = { x: centerX, y: centerY };
         
         // Create rotation handle group
         this._rotationHandleGroup = svg.group().addClass('rotation-handle-group');
         
         // Calculate handle position (above the element)
         const handleDistance = this._options.handleDistance;
         const handleX = centerX;
         const handleY = centerY - handleDistance;
         
         // Create a line from center to handle
         this._rotationLine = this._rotationHandleGroup.line(centerX, centerY, handleX, handleY)
             .stroke({ width: 1, color: '#999', dasharray: '3,3' });
         
         // Create the handle
         this._rotationHandle = this._rotationHandleGroup.circle(this._options.handleSize)
             .fill(this._options.handleFill)
             .stroke({ width: 1, color: this._options.handleStroke })
             .center(handleX, handleY)
             .addClass('rotation-handle')
             .css({ cursor: 'grab' });
         
         // Add mouse events to handle
         this._rotationHandle.on('mousedown', this._onMouseDown);
     }
     
     /**
      * Remove rotation handle
      * @private
      */
     _removeRotationHandle() {
         if (this._rotationHandleGroup) {
             this._rotationHandleGroup.remove();
             this._rotationHandleGroup = null;
             this._rotationHandle = null;
             this._rotationLine = null;
         }
     }
     
     /**
      * Handle mouse down on rotation handle
      * @param {Event} event - Mouse event
      * @private
      */
     _handleMouseDown(event) {
         // Skip if element is locked or behavior is disabled
         if (
             !this._enabled || 
             !this._element || 
             this._isRotating || 
             (this._element.isLocked && this._element.isLocked())
         ) {
             return;
         }
         
         // Get starting mouse position
         const point = this._getMousePosition(event);
         if (!point) return;
         
         // Calculate starting angle
         const angle = this._getAngleFromCenter(point);
         
         // Get element's current rotation
         const currentRotation = this._element.prop('rotation') || 0;
         
         // Start rotation tracking
         this._isRotating = true;
         this._rotationStartAngle = angle;
         this._elementStartRotation = currentRotation;
         
         // Update handle cursor
         if (this._rotationHandle) {
             this._rotationHandle.css({ cursor: 'grabbing' });
         }
         
         // Add global event listeners
         window.addEventListener('mousemove', this._onMouseMove);
         window.addEventListener('mouseup', this._onMouseUp);
         
         // Emit rotation start event
         this.emit('rotateStart', {
             behavior: this,
             element: this._element,
             angle: currentRotation,
             originalEvent: event
         });
         
         // Prevent default to avoid text selection, etc.
         event.preventDefault();
         event.stopPropagation();
     }
     
     /**
      * Handle mouse move during rotation
      * @param {Event} event - Mouse event
      * @private
      */
     _handleMouseMove(event) {
         if (!this._isRotating) return;
         
         // Get current mouse position
         const point = this._getMousePosition(event);
         if (!point) return;
         
         // Calculate current angle
         const currentAngle = this._getAngleFromCenter(point);
         
         // Calculate angle change
         let angleDelta = currentAngle - this._rotationStartAngle;
         
         // Calculate new rotation angle
         let newRotation = this._elementStartRotation + angleDelta;
         
         // Apply angle snapping if enabled
         if (this._options.snapAngle > 0) {
             newRotation = Math.round(newRotation / this._options.snapAngle) * this._options.snapAngle;
         }
         
         // Apply rotation to element
         this._applyRotation(newRotation);
         
         // Emit rotation event
         this.emit('rotate', {
             behavior: this,
             element: this._element,
             angle: newRotation,
             originalEvent: event
         });
         
         event.preventDefault();
     }
     
     /**
      * Handle mouse up to end rotation
      * @param {Event} event - Mouse event
      * @private
      */
     _handleMouseUp(event) {
         if (!this._isRotating) return;
         
         // Get final rotation
         const finalRotation = this._element.prop('rotation') || 0;
         
         // End rotation
         this._endRotation();
         
         // Update handle cursor
         if (this._rotationHandle) {
             this._rotationHandle.css({ cursor: 'grab' });
         }
         
         // Emit rotation end event
         this.emit('rotateEnd', {
             behavior: this,
             element: this._element,
             angle: finalRotation,
             originalEvent: event
         });
         
         event.preventDefault();
     }
     
     /**
      * End rotation operation and clean up
      * @private
      */
     _endRotation() {
         this._isRotating = false;
         
         // Remove global event listeners
         window.removeEventListener('mousemove', this._onMouseMove);
         window.removeEventListener('mouseup', this._onMouseUp);
     }
     
     /**
      * Calculate angle from center to point
      * @param {Object} point - Point with x and y coordinates
      * @return {Number} Angle in degrees
      * @private
      */
     _getAngleFromCenter(point) {
         const dx = point.x - this._rotationCenter.x;
         const dy = point.y - this._rotationCenter.y;
         
         // Calculate angle in radians
         let angle = Math.atan2(dy, dx);
         
         // Convert to degrees
         angle = angle * (180 / Math.PI);
         
         // Normalize to 0-360
         angle = (angle + 360) % 360;
         
         return angle;
     }
     
     /**
      * Apply rotation to element
      * @param {Number} angle - Rotation angle in degrees
      * @private
      */
     _applyRotation(angle) {
         // Update element property
         this._element.prop('rotation', angle);
         
         // Apply rotation to SVG element
         const svgElement = this._element.svgElement();
         if (svgElement) {
             svgElement.rotate(angle, this._rotationCenter.x, this._rotationCenter.y);
         }
         
         // Update rotation handle position
         this._updateRotationHandlePosition();
     }
     
     /**
      * Update rotation handle position based on current rotation
      * @private
      */
     _updateRotationHandlePosition() {
         if (!this._rotationHandle || !this._rotationLine) return;
         
         const centerX = this._rotationCenter.x;
         const centerY = this._rotationCenter.y;
         const handleDistance = this._options.handleDistance;
         const angle = this._element.prop('rotation') || 0;
         
         // Convert angle to radians and adjust for handle position
         const radians = (angle - 90) * (Math.PI / 180);
         
         // Calculate new handle position
         const handleX = centerX + handleDistance * Math.cos(radians);
         const handleY = centerY + handleDistance * Math.sin(radians);
         
         // Update handle and line positions
         this._rotationHandle.center(handleX, handleY);
         this._rotationLine.plot(centerX, centerY, handleX, handleY);
     }
     
     /**
      * Get mouse position in SVG coordinates
      * @param {Event} event - Mouse event
      * @return {Object|null} Point with x and y coordinates or null
      * @private
      */
     _getMousePosition(event) {
         return getCanvasPoint(event);
     }
     
     /**
      * Set rotation angle directly
      * @param {Number} angle - Rotation angle in degrees
      * @return {RotatableBehavior} this
      */
     setRotation(angle) {
         if (!this._enabled || !this._element) return this;
         
         this._applyRotation(angle);
         return this;
     }
     
     /**
      * Get current rotation angle
      * @return {Number} Rotation angle in degrees
      */
     getRotation() {
         return this._element ? (this._element.prop('rotation') || 0) : 0;
     }
 }
 
 // Export the behavior
 export default RotatableBehavior;