/**
 * Selectable Behavior Module
 * 
 * Adds selection functionality to elements.
 * Handles visual feedback and selection state.
 */

import BaseBehavior from './behavior.js';

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
     * @param {Function} [options.onSelect] - Callback when element is selected
     * @param {Function} [options.onDeselect] - Callback when element is deselected
     */
    constructor(options = {}) {
        super({
            selectedClass: 'selected',
            selectedStyles: {
                stroke: '#2196F3', 
                'stroke-width': 2,
                'stroke-dasharray': ''
            },
            onSelect: null,
            onDeselect: null,
            ...options
        });
        
        // Bound event handlers
        this._onMouseDown = this._handleMouseDown.bind(this);
        this._onSelectionChange = this._handleSelectionChange.bind(this);
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
        this._element.on('selection:change', this._onSelectionChange);
        
        // Apply initial state if already selected
        if (this._element.isSelected && this._element.isSelected()) {
            this._applySelectedState();
        }
        
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
        this._element.off('selection:change', this._onSelectionChange);
        
        // Remove selection styling
        this._removeSelectedState();
        
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
        
        // Check for shift key to add to selection
        const multiSelect = event.shiftKey;
        
        // Update selection state
        if (this._element.isSelected && !multiSelect) {
            if (!this._element.isSelected()) {
                // Deselect others and select this one
                this._selectElement(true);
            }
        } else {
            // Toggle selection with shift key
            if (multiSelect && this._element.isSelected) {
                this._selectElement(!this._element.isSelected());
            } else {
                this._selectElement(true);
            }
        }
        
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
        
        if (event.selected) {
            this._applySelectedState();
        } else {
            this._removeSelectedState();
        }
    }
    
    /**
     * Select or deselect the element
     * @param {Boolean} selected - Whether to select the element
     * @private
     */
     _selectElement(selected) {
        if (!this._element || !this._element.select) return;
        
        this._element.select(selected);
        
        // Dispatch custom event for property panel integration
        if (selected) {
            document.dispatchEvent(new CustomEvent('element:selected', {
                detail: { element: this._element }
            }));
        } else {
            document.dispatchEvent(new CustomEvent('element:deselected', {
                detail: { element: this._element }
            }));
        }
        
        // Call appropriate callback
        if (selected && typeof this._options.onSelect === 'function') {
            this._options.onSelect(this._element);
        } else if (!selected && typeof this._options.onDeselect === 'function') {
            this._options.onDeselect(this._element);
        }
    }
    
    
    /**
     * Apply selected visual state
     * @private
     */
    _applySelectedState() {
        if (!this._element) return;
        
        const svgElement = this._element.svgElement();
        if (!svgElement) return;
        
        // Apply CSS class if specified
        if (this._options.selectedClass) {
            svgElement.addClass(this._options.selectedClass);
        }
        
        // Apply SVG styles if specified
        if (this._options.selectedStyles) {
            const styles = this._options.selectedStyles;
            Object.entries(styles).forEach(([key, value]) => {
                // Store original value before changing
                const origValue = svgElement.attr(key);
                if (origValue !== undefined && !svgElement._origStyles) {
                    svgElement._origStyles = svgElement._origStyles || {};
                    svgElement._origStyles[key] = origValue;
                }
                
                // Apply new style
                svgElement.attr(key, value);
            });
        }
    }
    
    /**
     * Remove selected visual state
     * @private
     */
    _removeSelectedState() {
        if (!this._element) return;
        
        const svgElement = this._element.svgElement();
        if (!svgElement) return;
        
        // Remove CSS class if specified
        if (this._options.selectedClass) {
            svgElement.removeClass(this._options.selectedClass);
        }
        
        // Restore original SVG styles
        if (this._options.selectedStyles && svgElement._origStyles) {
            Object.entries(svgElement._origStyles).forEach(([key, value]) => {
                svgElement.attr(key, value);
            });
            delete svgElement._origStyles;
        }
    }
}

// Export the behavior
export default SelectableBehavior;