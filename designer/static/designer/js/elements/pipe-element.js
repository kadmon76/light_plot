// File: designer/static/designer/js/elements/pipe-element.js

/**
 * Pipe Element Module
 * 
 * Implements a theatrical pipe/truss using the base element architecture
 * with composable behaviors.
 */

 import BaseElement from './base-element.js';
 import behaviorManager from '../behaviors/behavior-manager.js';
 import { getState } from '../core/state.js';
 import { createTextElement } from '../utils/svg-utils.js';
 
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
         // Generate unique ID if not provided
         const pipeId = options.id || `pipe-${Date.now()}`;
         
         // Prepare pipe-specific properties
         const pipeProps = {
             pipeName: options.properties?.pipeName || 'Unnamed Pipe',
             pipeType: options.properties?.pipeType || 'pipe',
             pipeLength: options.properties?.pipeLength || 10,
             originalLength: options.properties?.originalLength || options.properties?.pipeLength || 10,
             pipeColor: options.properties?.pipeColor || '#666666',
             rotation: options.properties?.rotation || 0
         };
         
         // Initialize base element with these properties
         super({
             id: pipeId,
             type: 'pipe',
             properties: pipeProps,
             svgElement: options.svgElement
         });
         
         console.log(`PipeElement: Created new pipe with ID ${pipeId}`);
         
         // Add to pipes group if no parent element
         if (!options.svgElement) {
             const pipesGroup = getState('pipesGroup');
             if (pipesGroup) {
                 pipesGroup.add(this._svgElement);
             }
         }
         
         // Apply default behaviors
         this._applyBehaviors(options.behaviors || ['selectable', 'draggable', 'lockable', 'rotatable']);
         
         // Listen to property changes to update visual representation
         this.on('property:change', this._handlePropertyChange.bind(this));
     }
     
     /**
      * Initialize the pipe element
      * @protected
      */
     _initElement() {
         console.log(`PipeElement: Initializing element ${this.id()}`);
         
         const pipeLength = this.prop('pipeLength');
         const pipeType = this.prop('pipeType');
         const pipeColor = this.prop('pipeColor');
         
         // Calculate dimensions based on length
         const pipeWidthPx = pipeLength * 10; // 10px per meter
         const pipeHeightPx = pipeType === 'truss' ? 15 : 8;
         
         // Draw the pipe shape
         this._svgElement.rect(pipeWidthPx, pipeHeightPx)
             .fill(pipeColor)
             .stroke({ width: 1, color: '#000' })
             .move(-pipeWidthPx / 2, -pipeHeightPx / 2);
         
         // Add truss pattern if it's a truss
         if (pipeType === 'truss') {
             try {
                 const draw = getState('draw');
                 if (draw) {
                     // Add visual pattern for truss
                     const pattern = draw.pattern(20, pipeHeightPx, function(add) {
                         add.line(0, 0, 10, pipeHeightPx).stroke({ width: 1, color: 'rgba(255,255,255,0.3)' });
                         add.line(10, 0, 20, pipeHeightPx).stroke({ width: 1, color: 'rgba(255,255,255,0.3)' });
                     });
                     
                     // Apply pattern to pipe
                     const rect = this._svgElement.findOne('rect');
                     if (rect) {
                         rect.fill(pattern);
                     }
                 }
             } catch (error) {
                 console.error('Error creating truss pattern:', error);
             }
         }
         
         // Add pipe label
         createTextElement(this.prop('pipeName'), this._svgElement, {
             center: [0, -pipeHeightPx - 10],
             font: {
                 size: 12,
                 family: 'Arial',
                 weight: 'bold',
                 anchor: 'middle'
             }
         });
         
         // Apply initial rotation if specified
         const rotation = this.prop('rotation');
         if (rotation) {
             this._svgElement.rotate(rotation);
         }
         
         console.log(`PipeElement: Element ${this.id()} initialized`);
     }
     
     /**
      * Handle property changes
      * @param {Object} event - Property change event
      * @private
      */
     _handlePropertyChange(event) {
         const { key, value } = event;
         
         console.log(`PipeElement: Property '${key}' changed to '${value}' for pipe ${this.id()}`);
         
         // Update visual representation based on property changes
         switch (key) {
             case 'pipeName':
                 this._updateNameDisplay();
                 break;
             case 'pipeLength':
                 this._updateDimensions();
                 break;
             case 'pipeColor':
                 this._updateColor();
                 break;
             case 'rotation':
                 // Rotation is handled by the rotatable behavior
                 break;
         }
     }
     
     /**
      * Apply behaviors to the pipe
      * @param {Array<String|Object>} behaviors - Behaviors to apply
      * @private
      */
     _applyBehaviors(behaviors) {
         console.log(`PipeElement: Applying behaviors to pipe ${this.id()}`);
         
         behaviorManager.applyBehaviors(this, behaviors);
         
         console.log(`PipeElement: Applied behaviors to pipe ${this.id()}`);
     }
     
     /**
      * Update the pipe name display
      * @private
      */
     _updateNameDisplay() {
         const pipeName = this.prop('pipeName');
         console.log(`PipeElement: Updating name display to '${pipeName}' for pipe ${this.id()}`);
         
         const textElement = this._svgElement.findOne('text');
         if (textElement) {
             textElement.text(pipeName);
         }
     }
     
     /**
      * Update pipe dimensions based on length
      * @private
      */
     _updateDimensions() {
         const pipeLength = this.prop('pipeLength');
         const pipeType = this.prop('pipeType');
         
         console.log(`PipeElement: Updating dimensions for pipe ${this.id()}, length: ${pipeLength}m`);
         
         // Calculate dimensions based on length
         const pipeWidthPx = pipeLength * 10; // 10px per meter
         const pipeHeightPx = pipeType === 'truss' ? 15 : 8;
         
         // Update the rectangle
         const pipeRect = this._svgElement.findOne('rect');
         if (pipeRect) {
             pipeRect.width(pipeWidthPx);
             pipeRect.height(pipeHeightPx);
             pipeRect.move(-pipeWidthPx / 2, -pipeHeightPx / 2);
         }
         
         // Update label position
         const pipeLabel = this._svgElement.findOne('text');
         if (pipeLabel) {
             pipeLabel.center(0, -pipeHeightPx - 10);
         }
     }
     
     /**
      * Update the pipe's color
      * @private
      */
     _updateColor() {
         const pipeColor = this.prop('pipeColor');
         console.log(`PipeElement: Updating color to ${pipeColor} for pipe ${this.id()}`);
         
         const rectElement = this._svgElement.findOne('rect');
         if (rectElement) {
             rectElement.fill(pipeColor);
         }
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
             x: position.x,
             y: position.y,
             pipe_name: this.prop('pipeName'),
             pipe_type: this.prop('pipeType'),
             pipe_length: this.prop('pipeLength'),
             pipe_original_length: this.prop('originalLength'),
             pipe_color: this.prop('pipeColor'),
             rotation: this.prop('rotation')
         };
     }
 }
 
 export default PipeElement;
 
 /**
  * Create a pipe from configuration
  * @param {String} pipeType - Type of pipe
  * @param {Number} x - X position
  * @param {Number} y - Y position
  * @param {Object} properties - Additional properties
  * @return {PipeElement} Created pipe
  */
 export function createPipe(pipeType, x, y, properties = {}) {
     console.log(`Creating pipe of type '${pipeType}' at position (${x}, ${y})`);
     
     const pipe = new PipeElement({
         properties: {
             ...properties,
             pipeType
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
     console.log(`Loading pipe from data:`, pipeData);
     
     const pipe = new PipeElement({
         id: pipeData.id,
         properties: {
             pipeName: pipeData.pipe_name || 'Unnamed Pipe',
             pipeType: pipeData.pipe_type || 'pipe',
             pipeLength: pipeData.pipe_length || 10,
             originalLength: pipeData.pipe_original_length || pipeData.pipe_length || 10,
             pipeColor: pipeData.pipe_color || '#666666',
             rotation: pipeData.rotation || 0
         }
     });
     
     // Position pipe
     pipe.move(pipeData.x || 0, pipeData.y || 0);
     
     // Apply locked state if specified
     if (pipeData.isLocked) {
         pipe.lock(true);
     }
     
     return pipe;
 }