/**
 * Pipe Element Module
 * 
 * Implements a theatrical pipe/truss using the base element architecture
 * with composable behaviors.
 */

import { BaseElement } from '../elements/base-element.js';
import behaviorManager from '../elements/behavior-manager.js';
import { draw, pipesGroup, SCALE_FACTOR } from '../core.js';

/**
 * PipeElement class
 * Represents a pipe/truss in the plot
 */
export class PipeElement extends BaseElement {
    /**
     * Create a new PipeElement
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        // Set default type and generate ID if not provided
        const pipeId = options.id || `pipe-${Date.now()}`;
        
        // Default pipe properties
        const defaultProps = {
            pipeName: 'Unnamed Pipe',
            pipeType: 'pipe',
            pipeLength: 10,
            originalLength: 10,
            pipeColor: '#666666',
            rotation: 0
        };
        
        // Merge with provided properties
        const pipeProps = { ...defaultProps, ...(options.properties || {}) };
        
        // Initialize base element
        super({
            id: pipeId,
            type: 'pipe',
            properties: pipeProps,
            svgElement: options.svgElement
        });
        
        // Add to pipes group if no parent element
        if (!options.parent && !options.svgElement) {
            pipesGroup.add(this._svgElement);
        }
        
        // Apply default behaviors
        const behaviors = options.behaviors || ['selectable', 'draggable', 'lockable', 'rotatable'];
        this._applyBehaviors(behaviors);
    }
    
    /**
     * Initialize the pipe element
     * @protected
     */
    _initElement() {
        const pipeLength = this.prop('pipeLength');
        const pipeType = this.prop('pipeType');
        const pipeColor = this.prop('pipeColor');
        
        // Calculate dimensions based on length
        const pipeWidthPx = pipeLength * SCALE_FACTOR * 10; // 10px per meter
        const pipeHeightPx = pipeType === 'truss' ? 15 : 8;
        
        // Draw the pipe shape
        const pipeRect = this._svgElement.rect(pipeWidthPx, pipeHeightPx)
            .fill(pipeColor)
            .stroke({ width: 1, color: '#000' });
        
        // Add truss pattern if it's a truss
        if (pipeType === 'truss') {
            try {
                // Add visual pattern for truss
                const pattern = draw.pattern(20, pipeHeightPx, function(add) {
                    add.line(0, 0, 10, pipeHeightPx).stroke({ width: 1, color: 'rgba(255,255,255,0.3)' });
                    add.line(10, 0, 20, pipeHeightPx).stroke({ width: 1, color: 'rgba(255,255,255,0.3)' });
                });
                
                pipeRect.fill(pattern);
            } catch (error) {
                console.error('Error creating truss pattern:', error);
            }
        }
        
        // Add pipe label
        this._svgElement.text(this.prop('pipeName'))
            .font({ size: 12, family: 'Arial', weight: 'bold' })
            .center(pipeWidthPx / 2, pipeHeightPx / 2 - 15);
            
        // Apply initial rotation if specified
        const rotation = this.prop('rotation');
        if (rotation) {
            this._svgElement.rotate(rotation);
        }
    }
    
    /**
     * Apply behaviors to the pipe
     * @param {Array<String|Object>} behaviors - Behaviors to apply
     * @private
     */
    _applyBehaviors(behaviors) {
        behaviors.forEach(behavior => {
            if (typeof behavior === 'string') {
                // Simple string behavior name
                behaviorManager.applyBehavior(this, behavior);
            } else if (behavior && typeof behavior === 'object') {
                // Behavior config object with type and options
                const { type, options = {} } = behavior;
                if (type) {
                    behaviorManager.applyBehavior(this, type, options);
                }
            }
        });
    }
    
    /**
     * Set the pipe's length
     * @param {Number} length - Pipe length in meters
     * @return {PipeElement} this
     */
    setLength(length) {
        const oldLength = this.prop('pipeLength');
        this.prop('pipeLength', length);
        
        // Update the visual representation
        this._updatePipeVisuals();
        
        return this;
    }
    
    /**
     * Set the pipe's color
     * @param {String} color - Color value (CSS color)
     * @return {PipeElement} this
     */
    setColor(color) {
        this.prop('pipeColor', color);
        
        // Update the visual representation
        this._updatePipeVisuals();
        
        return this;
    }
    
    /**
     * Set the pipe's name
     * @param {String} name - New pipe name
     * @return {PipeElement} this
     */
    setName(name) {
        this.prop('pipeName', name);
        
        // Update the label
        const textElement = this._svgElement.findOne('text');
        if (textElement) {
            textElement.text(name);
        }
        
        return this;
    }
    
    /**
     * Update the pipe's visual representation
     * @private
     */
    _updatePipeVisuals() {
        const pipeLength = this.prop('pipeLength');
        const pipeType = this.prop('pipeType');
        const pipeColor = this.prop('pipeColor');
        
        // Calculate dimensions based on length
        const pipeWidthPx = pipeLength * SCALE_FACTOR * 10; // 10px per meter
        const pipeHeightPx = pipeType === 'truss' ? 15 : 8;
        
        // Update the rectangle
        const pipeRect = this._svgElement.findOne('rect');
        if (pipeRect) {
            // Get current stroke style
            const currentStroke = pipeRect.attr('stroke') || '#000';
            const currentStrokeWidth = pipeRect.attr('stroke-width') || 1;
            const currentDasharray = pipeRect.attr('stroke-dasharray') || '';
            
            // Update size and color
            pipeRect.width(pipeWidthPx);
            pipeRect.height(pipeHeightPx);
            pipeRect.fill(pipeColor);
            
            // Restore stroke
            pipeRect.stroke({
                color: currentStroke,
                width: currentStrokeWidth,
                dasharray: currentDasharray
            });
            
            // Update truss pattern if it's a truss
            if (pipeType === 'truss') {
                try {
                    // Add visual pattern for truss
                    const pattern = draw.pattern(20, pipeHeightPx, function(add) {
                        add.line(0, 0, 10, pipeHeightPx).stroke({ width: 1, color: 'rgba(255,255,255,0.3)' });
                        add.line(10, 0, 20, pipeHeightPx).stroke({ width: 1, color: 'rgba(255,255,255,0.3)' });
                    });
                    
                    pipeRect.fill(pattern);
                } catch (error) {
                    console.error('Error creating truss pattern:', error);
                    pipeRect.fill(pipeColor);
                }
            }
        }
        
        // Update label position
        const pipeLabel = this._svgElement.findOne('text');
        if (pipeLabel) {
            pipeLabel.center(pipeWidthPx / 2, pipeHeightPx / 2 - 15);
        }
    }
    // Add the lock method here
    lock(state = true) {
        super.lock(state);
        
        // Additional element-specific lock behavior can be added here
        // Set data attribute for CSS targeting
        const svgElement = this._svgElement;
        if (svgElement) {
            svgElement.attr('data-locked', state ? 'true' : 'false');
        }
        
        return this;
    }
    /**
     * Get pipe data for serialization
     * @return {Object} Serialized pipe data
     */
    serialize() {
        const baseData = super.serialize();
        const position = this.position();
        
        return {
            ...baseData,
            pipe_id: this.id(),
            pipe_name: this.prop('pipeName'),
            pipe_type: this.prop('pipeType'),
            pipe_length: this.prop('pipeLength'),
            pipe_original_length: this.prop('originalLength'),
            pipe_color: this.prop('pipeColor'),
            x: position.x,
            y: position.y,
            rotation: this.prop('rotation')
        };
    }
}

/**
 * Create a pipe from the pipe library
 * @param {Object} pipeConfig - Pipe configuration
 * @param {Number} x - X position
 * @param {Number} y - Y position
 * @return {PipeElement} The created pipe
 */
export function createPipe(pipeConfig, x, y) {
    // Create pipe with position and properties
    const pipe = new PipeElement({
        id: pipeConfig.pipeId,
        properties: {
            pipeName: pipeConfig.pipeName,
            pipeType: pipeConfig.pipeType,
            pipeLength: pipeConfig.pipeLength,
            originalLength: pipeConfig.pipeLength,
            pipeColor: pipeConfig.pipeColor
        }
    });
    
    // Position pipe
    pipe.move(x, y);
    
    return pipe;
}

/**
 * Load a pipe from saved data
 * @param {Object} pipeData - Serialized pipe data
 * @return {PipeElement} The loaded pipe
 */
export function loadPipe(pipeData) {
    const pipe = new PipeElement({
        id: pipeData.pipe_id,
        properties: {
            pipeName: pipeData.pipe_name,
            pipeType: pipeData.pipe_type,
            pipeLength: pipeData.pipe_length,
            originalLength: pipeData.pipe_original_length || pipeData.pipe_length,
            pipeColor: pipeData.pipe_color,
            rotation: pipeData.rotation || 0
        }
    });
    
    // Position pipe
    pipe.move(pipeData.x || 0, pipeData.y || 0);
    
    // Apply rotation
    if (pipeData.rotation) {
        pipe._svgElement.rotate(pipeData.rotation);
    }
    
    // Set locked state if specified
    if (pipeData.locked) {
        pipe.lock(true);
    }
    
    return pipe;
}

export default PipeElement;