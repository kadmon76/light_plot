/**
 * Resizable Behavior Module
 * 
 * Adds resizing functionality to elements.
 * Allows elements to be resized by the user through handle interactions.
 */

import BaseBehavior from './behavior.js';

/**
 * ResizableBehavior class
 * Makes elements resizable with handles
 */
export class ResizableBehavior extends BaseBehavior {
    /**
     * Create a new ResizableBehavior
     * @param {Object} options - Configuration options
     * @param {Boolean} [options.aspectRatio=false] - Whether to maintain aspect ratio when resizing
     * @param {Number} [options.minWidth=20] - Minimum width in pixels
     * @param {Number} [options.minHeight=20] - Minimum height in pixels
     * @param {Number} [options.maxWidth=Infinity] - Maximum width in pixels
     * @param {Number} [options.maxHeight=Infinity] - Maximum height in pixels
     * @param {String} [options.handles='n,e,s,w,nw,ne,se,sw'] - Comma-separated list of handles to show
     */
    constructor(options = {}) {
        super({
            aspectRatio: false,
            minWidth: 20,
            minHeight: 20,
            maxWidth: Infinity,
            maxHeight: Infinity,
            handles: 'n,e,s,w,nw,ne,se,sw',
            handleSize: 8,
            handleFill: '#29b6f6',
            handleStroke: '#0277bd',
            ...options
        });
        
        // Resize state
        this._isResizing = false;
        this._resizeStart = { x: 0, y: 0, width: 0, height: 0 };
        this._resizeHandle = null;
        this._handles = [];
        
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
        
        // Create resize handles
        this._createHandles();
        
        // Update handle positions on element changes
        this._element.on('position:change', () => this._updateHandlePositions());
        
        super._initialize();
    }
    
    /**
     * Clean up behavior
     * @protected
     */
    _cleanup() {
        if (!this._element) return;
        
        // Remove handles
        this._removeHandles();
        
        // Clean up any ongoing resize operation
        this._endResize();
        
        // Remove event listeners
        this._element.off('position:change');
        
        super._cleanup();
    }
    
    /**
     * Create resize handles based on options
     * @private
     */
    _createHandles() {
        // Remove existing handles if any
        this._removeHandles();
        
        const element = this._element.svgElement();
        if (!element) return;
        
        // Get parent SVG document
        const svg = element.doc();
        if (!svg) return;
        
        // Handle positions
        const handlePositions = {
            n: { x: 0.5, y: 0, cursor: 'n-resize' },
            e: { x: 1, y: 0.5, cursor: 'e-resize' },
            s: { x: 0.5, y: 1, cursor: 's-resize' },
            w: { x: 0, y: 0.5, cursor: 'w-resize' },
            nw: { x: 0, y: 0, cursor: 'nw-resize' },
            ne: { x: 1, y: 0, cursor: 'ne-resize' },
            se: { x: 1, y: 1, cursor: 'se-resize' },
            sw: { x: 0, y: 1, cursor: 'sw-resize' }
        };
        
        // Create group for handles if it doesn't exist
        this._handlesGroup = svg.group().addClass('resize-handles');
        
        // Create handles based on specified options
        const handleTypes = this._options.handles.split(',').map(h => h.trim());
        
        handleTypes.forEach(type => {
            if (handlePositions[type]) {
                const pos = handlePositions[type];
                const handle = this._handlesGroup.circle(this._options.handleSize)
                    .fill(this._options.handleFill)
                    .stroke({ width: 1, color: this._options.handleStroke })
                    .attr('data-handle-type', type)
                    .css({ cursor: pos.cursor });
                
                // Set up mouse events
                handle.on('mousedown', (event) => {
                    this._startResize(event, type);
                    event.stopPropagation();
                });
                
                this._handles.push(handle);
            }
        });
        
        // Initial handle positioning
        this._updateHandlePositions();
        
        // Initially hide handles until element is selected
        this._hideHandles();
    }
    
    /**
     * Remove resize handles
     * @private
     */
    _removeHandles() {
        if (this._handlesGroup) {
            this._handlesGroup.remove();
            this._handlesGroup = null;
        }
        this._handles = [];
    }
    
    /**
     * Update handle positions based on element bounds
     * @private
     */
    _updateHandlePositions() {
        if (!this._element || !this._handlesGroup) return;
        
        const bbox = this._element.getBBox();
        
        // Handle positions
        const handlePositions = {
            n: { x: bbox.x + bbox.width / 2, y: bbox.y },
            e: { x: bbox.x + bbox.width, y: bbox.y + bbox.height / 2 },
            s: { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height },
            w: { x: bbox.x, y: bbox.y + bbox.height / 2 },
            nw: { x: bbox.x, y: bbox.y },
            ne: { x: bbox.x + bbox.width, y: bbox.y },
            se: { x: bbox.x + bbox.width, y: bbox.y + bbox.height },
            sw: { x: bbox.x, y: bbox.y + bbox.height }
        };
        
        // Update handle positions
        this._handles.forEach(handle => {
            const type = handle.attr('data-handle-type');
            const pos = handlePositions[type];
            if (pos) {
                handle.center(pos.x, pos.y);
            }
        });
    }
    
    /**
     * Show resize handles
     * @private
     */
    _showHandles() {
        if (this._handlesGroup) {
            this._handlesGroup.show();
        }
    }
    
    /**
     * Hide resize handles
     * @private
     */
    _hideHandles() {
        if (this._handlesGroup) {
            this._handlesGroup.hide();
        }
    }
    
    /**
     * Start resize operation
     * @param {Event} event - Mouse event
     * @param {String} handleType - Type of handle being dragged
     * @private
     */
    _startResize(event, handleType) {
        // Skip if element is locked or behavior is disabled
        if (
            !this._enabled || 
            !this._element || 
            this._isResizing || 
            (this._element.isLocked && this._element.isLocked())
        ) {
            return;
        }
        
        const point = this._getMousePosition(event);
        if (!point) return;
        
        // Store current mouse position and element dimensions
        this._isResizing = true;
        this._resizeStart = {
            x: point.x,
            y: point.y,
            ...this._element.getBBox()
        };
        this._resizeHandle = handleType;
        
        // Add global event listeners
        window.addEventListener('mousemove', this._onMouseMove);
        window.addEventListener('mouseup', this._onMouseUp);
        
        // Emit resize start event
        this.emit('resizeStart', {
            behavior: this,
            element: this._element,
            handle: handleType,
            bbox: { ...this._resizeStart },
            originalEvent: event
        });
        
        // Prevent default to avoid text selection, etc.
        event.preventDefault();
    }
    
    /**
     * Handle mouse move during resize
     * @param {Event} event - Mouse event
     * @private
     */
    _handleMouseMove(event) {
        if (!this._isResizing) return;
        
        const point = this._getMousePosition(event);
        if (!point) return;
        
        // Calculate deltas
        const deltaX = point.x - this._resizeStart.x;
        const deltaY = point.y - this._resizeStart.y;
        
        // Apply resize based on handle type
        const newSize = this._calculateNewSize(this._resizeHandle, deltaX, deltaY);
        
        // Apply constraints
        const constrainedSize = this._applyConstraints(newSize);
        
        // Apply resize to element
        this._applyResize(constrainedSize);
        
        // Emit resize event
        this.emit('resize', {
            behavior: this,
            element: this._element,
            handle: this._resizeHandle,
            size: constrainedSize,
            originalEvent: event
        });
        
        event.preventDefault();
    }
    
    /**
     * Handle mouse up to end resize
     * @param {Event} event - Mouse event
     * @private
     */
    _handleMouseUp(event) {
        if (!this._isResizing) return;
        
        // End the resize operation
        this._endResize();
        
        // Get final size
        const finalSize = this._element.getBBox();
        
        // Emit resize end event
        this.emit('resizeEnd', {
            behavior: this,
            element: this._element,
            handle: this._resizeHandle,
            size: finalSize,
            originalEvent: event
        });
        
        // Reset resize handle
        this._resizeHandle = null;
        
        event.preventDefault();
    }
    
    /**
     * End resize operation and clean up
     * @private
     */
    _endResize() {
        this._isResizing = false;
        
        // Remove global event listeners
        window.removeEventListener('mousemove', this._onMouseMove);
        window.removeEventListener('mouseup', this._onMouseUp);
    }
    
    /**
     * Calculate new size based on handle and mouse delta
     * @param {String} handle - Handle type
     * @param {Number} deltaX - Mouse X delta
     * @param {Number} deltaY - Mouse Y delta
     * @return {Object} New size and position
     * @private
     */
    _calculateNewSize(handle, deltaX, deltaY) {
        const start = this._resizeStart;
        let x = start.x;
        let y = start.y;
        let width = start.width;
        let height = start.height;
        
        // Adjust dimensions based on handle
        switch (handle) {
            case 'e':
                width = start.width + deltaX;
                break;
            case 'w':
                x = start.x + deltaX;
                width = start.width - deltaX;
                break;
            case 'n':
                y = start.y + deltaY;
                height = start.height - deltaY;
                break;
            case 's':
                height = start.height + deltaY;
                break;
            case 'nw':
                x = start.x + deltaX;
                y = start.y + deltaY;
                width = start.width - deltaX;
                height = start.height - deltaY;
                break;
            case 'ne':
                y = start.y + deltaY;
                width = start.width + deltaX;
                height = start.height - deltaY;
                break;
            case 'se':
                width = start.width + deltaX;
                height = start.height + deltaY;
                break;
            case 'sw':
                x = start.x + deltaX;
                width = start.width - deltaX;
                height = start.height + deltaY;
                break;
        }
        
        return { x, y, width, height };
    }
    
    /**
     * Apply size constraints
     * @param {Object} size - Size and position object
     * @return {Object} Constrained size and position
     * @private
     */
    _applyConstraints(size) {
        // Get options
        const { minWidth, minHeight, maxWidth, maxHeight, aspectRatio } = this._options;
        
        // Apply min/max constraints
        let { x, y, width, height } = size;
        
        // Ensure minimum width
        if (width < minWidth) {
            const diff = minWidth - width;
            width = minWidth;
            
            // Adjust x position for west handles
            if (['w', 'nw', 'sw'].includes(this._resizeHandle)) {
                x -= diff;
            }
        }
        
        // Ensure minimum height
        if (height < minHeight) {
            const diff = minHeight - height;
            height = minHeight;
            
            // Adjust y position for north handles
            if (['n', 'nw', 'ne'].includes(this._resizeHandle)) {
                y -= diff;
            }
        }
        
        // Ensure maximum width
        if (width > maxWidth) {
            const diff = width - maxWidth;
            width = maxWidth;
            
            // Adjust x position for west handles
            if (['w', 'nw', 'sw'].includes(this._resizeHandle)) {
                x += diff;
            }
        }
        
        // Ensure maximum height
        if (height > maxHeight) {
            const diff = height - maxHeight;
            height = maxHeight;
            
            // Adjust y position for north handles
            if (['n', 'nw', 'ne'].includes(this._resizeHandle)) {
                y += diff;
            }
        }
        
        // Apply aspect ratio if needed
        if (aspectRatio) {
            const startRatio = this._resizeStart.width / this._resizeStart.height;
            
            // Determine which dimension to constrain
            if (width / height > startRatio) {
                // Width is too large, adjust it
                const newWidth = height * startRatio;
                
                // Adjust x position for west handles
                if (['w', 'nw', 'sw'].includes(this._resizeHandle)) {
                    x += (width - newWidth);
                }
                
                width = newWidth;
            } else {
                // Height is too large, adjust it
                const newHeight = width / startRatio;
                
                // Adjust y position for north handles
                if (['n', 'nw', 'ne'].includes(this._resizeHandle)) {
                    y += (height - newHeight);
                }
                
                height = newHeight;
            }
        }
        
        return { x, y, width, height };
    }
    
    /**
     * Apply resize to element
     * @param {Object} size - Size and position object
     * @private
     */
    _applyResize(size) {
        const { x, y, width, height } = size;
        
        // Apply to SVG element
        const svgElement = this._element.svgElement();
        if (svgElement) {
            // Different elements may need different resize methods
            // Try to use the most appropriate method
            
            if (svgElement.type === 'rect') {
                // For rectangles, we can set width/height directly
                svgElement.width(width).height(height).move(x, y);
            } else if (svgElement.type === 'circle' || svgElement.type === 'ellipse') {
                // For circles/ellipses, resize using rx/ry
                const rx = width / 2;
                const ry = height / 2;
                
                if (svgElement.type === 'circle') {
                    // Circles maintain aspect ratio
                    const r = Math.max(rx, ry);
                    svgElement.radius(r);
                } else {
                    // Ellipses can have different x/y radii
                    svgElement.rx(rx).ry(ry);
                }
                
                // Move to center
                svgElement.center(x + rx, y + ry);
            } else if (svgElement.type === 'g') {
                // For groups, we need to transform them
                // Get current scale
                const currentWidth = this._resizeStart.width;
                const currentHeight = this._resizeStart.height;
                
                // Calculate scale factors
                const scaleX = width / currentWidth;
                const scaleY = height / currentHeight;
                
                // Apply scale transform
                svgElement.transform({
                    scale: [scaleX, scaleY],
                    origin: [x, y]
                });
            } else {
                // For other elements, try to use the size method
                try {
                    svgElement.size(width, height).move(x, y);
                } catch (error) {
                    console.error('Error applying resize:', error);
                }
            }
            
            // Update handle positions
            this._updateHandlePositions();
        }
        
        // Update element properties if supported
        if (this._element.prop) {
            if (this._element.prop('width') !== undefined) {
                this._element.prop('width', width);
            }
            if (this._element.prop('height') !== undefined) {
                this._element.prop('height', height);
            }
        }
    }
    
    /**
     * Get mouse position in SVG coordinates
     * @param {Event} event - Mouse event
     * @return {Object|null} Point with x and y coordinates or null
     * @private
     */
    _getMousePosition(event) {
        try {
            const element = this._element.svgElement();
            if (!element) return null;
            
            const svg = element.doc();
            if (!svg) return null;
            
            // Convert client coordinates to SVG coordinates
            const point = svg.node.createSVGPoint();
            point.x = event.clientX;
            point.y = event.clientY;
            
            // Get SVG coordinate system
            const ctm = svg.node.getScreenCTM();
            if (!ctm) return null;
            
            const inverseCTM = ctm.inverse();
            const svgPoint = point.matrixTransform(inverseCTM);
            
            return svgPoint;
        } catch (error) {
            console.error('Error getting mouse position:', error);
            return null;
        }
    }
    
    /**
     * Handle element selection change
     * @param {Object} event - Selection change event
     * @private
     */
    _handleSelectionChange(event) {
        if (!this._enabled || !this._element) return;
        
        // Show handles when element is selected
        if (event.selected) {
            this._showHandles();
        } else {
            this._hideHandles();
        }
    }
    
    /**
     * Check if element is currently being resized
     * @return {Boolean} Whether element is being resized
     */
    isResizing() {
        return this._isResizing;
    }
}

// Export the behavior
export default ResizableBehavior;