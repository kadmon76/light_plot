// File: designer/static/designer/js/behaviors/selectable.js

/**
 * Selectable Behavior Module
 * 
 * Adds selection functionality to elements.
 * Handles visual feedback and selection state.
 */

 import BaseBehavior from './behavior.js';
 import { selectElement } from '../core/state.js';
 
 /**
  * SelectableBehavior class
  * Makes elements selectable with visual feedback
  */
 export class SelectableBehavior extends BaseBehavior {
     /**
      * Create a new SelectableBehavior
      * @param {Object} options - Configuration options
      * @param {String} [options.selectedClass='selected'] - CSS class for selected state
      * @param {Object} [options.selectedStyles] - SVG styles to apply when selected
      */
     constructor(options = {}) {
         super({
             selectedClass: 'selected',
             selectedStyles: {
                 stroke: '#2196F3', 
                 'stroke-width': 2
             },
             ...options
         });
         
         // Bound event handlers
         this._onMouseDown = this._handleMouseDown.bind(this);
         this._onSelectionChange = this._handleSelectionChange.bind(this);
         
         console.log('SelectableBehavior: Created new instance with options:', this._options);
     }
     
     /**
      * Initialize behavior
      * @protected
      */
     _initialize() {
         if (!this._element || this._initialized) return;
         
         console.log(`SelectableBehavior: Initializing for element ${this._element.id()}`);
         
         // Get SVG element
         const svgElement = this._element.svgElement();
         if (!svgElement) {
             console.error(`SelectableBehavior: No SVG element found for ${this._element.id()}`);
             return;
         }
         
         // Add event listeners
         svgElement.on('mousedown', this._onMouseDown);
         this._element.on('selection:change', this._onSelectionChange);
         
         // Apply initial state if already selected
         if (this._element.isSelected()) {
             console.log(`SelectableBehavior: Element ${this._element.id()} is already selected, applying visual state`);
             this._applySelectedState();
         }
         
         console.log(`SelectableBehavior: Initialized for element ${this._element.id()}`);
         super._initialize();
     }
     
     /**
      * Clean up behavior
      * @protected
      */
     _cleanup() {
         if (!this._element) return;
         
         console.log(`SelectableBehavior: Cleaning up for element ${this._element.id()}`);
         
         // Get SVG element
         const svgElement = this._element.svgElement();
         if (!svgElement) {
             console.error(`SelectableBehavior: No SVG element found for cleanup ${this._element.id()}`);
             return;
         }
         
         // Remove event listeners
         svgElement.off('mousedown', this._onMouseDown);
         this._element.off('selection:change', this._onSelectionChange);
         
         // Remove selection styling
         this._removeSelectedState();
         
         console.log(`SelectableBehavior: Cleanup complete for element ${this._element.id()}`);
         super._cleanup();
     }
     
     /**
      * Handle mouse down event for selection
      * @param {Event} event - Mouse event
      * @private
      */
     _handleMouseDown(event) {
         if (!this._enabled || !this._element) return;
         
         // Ignore if middle or right button
         if (event.button !== 0) return;
         
         console.log(`SelectableBehavior: Mouse down on element ${this._element.id()}`);
         
         // Check for shift key to add to selection
         const multiSelect = event.shiftKey;
         
         // Select this element
         console.log(`SelectableBehavior: Selecting element ${this._element.id()}, multiSelect: ${multiSelect}`);
         selectElement(this._element);
         
         // Stop propagation to prevent canvas from clearing selection
         event.stopPropagation();
     }
     
     /**
      * Handle selection change event
      * @param {Object} event - Selection change event
      * @private
      */
     _handleSelectionChange(event) {
         if (!this._enabled || !this._element) return;
         
         console.log(`SelectableBehavior: Selection changed for element ${this._element.id()}, selected: ${event.selected}`);
         
         if (event.selected) {
             this._applySelectedState();
         } else {
             this._removeSelectedState();
         }
     }
     
     /**
      * Apply selected visual state
      * @private
      */
     _applySelectedState() {
         if (!this._element) return;
         
         console.log(`SelectableBehavior: Applying selected state to element ${this._element.id()}`);
         
         const svgElement = this._element.svgElement();
         if (!svgElement) {
             console.error(`SelectableBehavior: No SVG element found for ${this._element.id()}`);
             return;
         }
         
         // Apply CSS class if specified
         if (this._options.selectedClass) {
             svgElement.addClass(this._options.selectedClass);
         }
         
         // Apply SVG styles if specified
         if (this._options.selectedStyles) {
             const styles = this._options.selectedStyles;
             
             // Store original styles
             svgElement._origStyles = svgElement._origStyles || {};
             
             // Apply new styles
             Object.entries(styles).forEach(([key, value]) => {
                 // Store original value before changing if not already stored
                 if (svgElement._origStyles[key] === undefined) {
                     svgElement._origStyles[key] = svgElement.attr(key);
                 }
                 
                 // Apply new style
                 svgElement.attr(key, value);
             });
         }
         
         console.log(`SelectableBehavior: Selected state applied to element ${this._element.id()}`);
     }
     
     /**
      * Remove selected visual state
      * @private
      */
     _removeSelectedState() {
         if (!this._element) return;
         
         console.log(`SelectableBehavior: Removing selected state from element ${this._element.id()}`);
         
         const svgElement = this._element.svgElement();
         if (!svgElement) {
             console.error(`SelectableBehavior: No SVG element found for ${this._element.id()}`);
             return;
         }
         
         // Remove CSS class if specified
         if (this._options.selectedClass) {
             svgElement.removeClass(this._options.selectedClass);
         }
         
         // Restore original SVG styles
         if (svgElement._origStyles) {
             Object.entries(svgElement._origStyles).forEach(([key, value]) => {
                 svgElement.attr(key, value);
             });
             delete svgElement._origStyles;
         }
         
         console.log(`SelectableBehavior: Selected state removed from element ${this._element.id()}`);
     }
 }
 
 export default SelectableBehavior;