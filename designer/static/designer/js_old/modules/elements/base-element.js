/**
 * Base Element Module
 * 
 * Provides the foundation for all drawable elements in the light plot designer.
 * Implements core functionality shared across all elements:
 * - SVG element management
 * - Properties storage and retrieval
 * - Common element operations
 * - Event handling
 * - Behavior management integration
 */
console.log('Loading base element module')
import { draw } from '../core.js';
import { EventEmitter } from '../utils/event-emitter.js';

/**
 * BaseElement class
 * Abstract base class for all plot elements
 */
export class BaseElement extends EventEmitter {
    /**
     * Create a new BaseElement
     * @param {Object} options - Configuration options
     * @param {String} options.id - Unique element ID
     * @param {String} options.type - Element type identifier
     * @param {Object} options.properties - Initial element properties
     * @param {SVG.Element} [options.svgElement] - Existing SVG element (optional)
     */
    constructor(options = {}) {
        super();
        
        // Required parameters
        if (!options.id) throw new Error('Element ID is required');
        if (!options.type) throw new Error('Element type is required');
        
        this._id = options.id;
        this._type = options.type;
        this._properties = options.properties || {};
        this._svgElement = options.svgElement || null;
        this._behaviors = new Map();
        this._isSelected = false;
        this._isLocked = false;
        this._parent = null;
        
        // Create element container if none provided
        if (!this._svgElement) {
            this._svgElement = draw.group().id(this._id);
            this._initElement();
        }
    }
    
    /**
     * Initialize the element
     * Override in subclasses to create specific element structures
     */
    _initElement() {
        // Abstract method to be implemented by subclasses
    }
    
    /**
     * Get the element's unique ID
     * @return {String} Element ID
     */
    id() {
        return this._id;
    }
    
    /**
     * Get the element's type
     * @return {String} Element type
     */
    type() {
        return this._type;
    }
    
    /**
     * Get or set SVG element
     * @param {SVG.Element} [element] - SVG element to set (optional)
     * @return {SVG.Element|BaseElement} SVG element if getting, this if setting
     */
    svgElement(element) {
        if (element === undefined) return this._svgElement;
        this._svgElement = element;
        return this;
    }
    
    /**
     * Get or set a specific property
     * @param {String} key - Property name
     * @param {*} [value] - Property value to set (optional)
     * @return {*|BaseElement} Property value if getting, this if setting
     */
    prop(key, value) {
        if (value === undefined) return this._properties[key];
        
        const oldValue = this._properties[key];
        this._properties[key] = value;
        
        // Emit change event when property changes
        if (oldValue !== value) {
            this.emit('property:change', { key, value, oldValue, element: this });
        }
        
        return this;
    }
    
    /**
     * Get all properties
     * @return {Object} Properties object
     */
    properties() {
        return { ...this._properties };
    }
    
    /**
     * Update multiple properties at once
     * @param {Object} props - Properties to update
     * @return {BaseElement} this
     */
    setProperties(props) {
        if (!props || typeof props !== 'object') return this;
        
        Object.entries(props).forEach(([key, value]) => {
            this.prop(key, value);
        });
        
        return this;
    }
    
    /**
     * Get element serialization for storage
     * @return {Object} Serialized element data
     */
    serialize() {
        return {
            id: this._id,
            type: this._type,
            properties: { ...this._properties },
            isLocked: this._isLocked
        };
    }
    
    /**
     * Set element's selected state
     * @param {Boolean} state - Whether element is selected
     * @return {BaseElement} this
     */
    select(state = true) {
        if (this._isSelected === state) return this;
        
        this._isSelected = state;
        this.emit('selection:change', { element: this, selected: state });
        
        return this;
    }
    
    /**
     * Get element's selected state
     * @return {Boolean} Whether element is selected
     */
    isSelected() {
        return this._isSelected;
    }
    
    /**
     * Set element's locked state
     * @param {Boolean} state - Whether element is locked
     * @return {BaseElement} this
     */
    lock(state = true) {
        if (this._isLocked === state) return this;
        
        this._isLocked = state;
        this.emit('lock:change', { element: this, locked: state });
        
        return this;
    }
    
    /**
     * Get element's locked state
     * @return {Boolean} Whether element is locked
     */
    isLocked() {
        return this._isLocked;
    }
    
    /**
     * Add a behavior to the element
     * @param {String} name - Behavior name
     * @param {Object} behavior - Behavior instance
     * @return {BaseElement} this
     */
    addBehavior(name, behavior) {
        if (!name || !behavior) return this;
        
        this._behaviors.set(name, behavior);
        behavior.attach(this);
        
        return this;
    }
    
    /**
     * Remove a behavior from the element
     * @param {String} name - Behavior name
     * @return {BaseElement} this
     */
    removeBehavior(name) {
        if (!name || !this._behaviors.has(name)) return this;
        
        const behavior = this._behaviors.get(name);
        behavior.detach();
        this._behaviors.delete(name);
        
        return this;
    }
    
    /**
     * Check if element has a specific behavior
     * @param {String} name - Behavior name
     * @return {Boolean} Whether element has the behavior
     */
    hasBehavior(name) {
        return this._behaviors.has(name);
    }
    
    /**
     * Get a specific behavior instance
     * @param {String} name - Behavior name
     * @return {Object|null} Behavior instance or null if not found
     */
    getBehavior(name) {
        return this._behaviors.get(name) || null;
    }
    
    /**
     * Set parent element
     * @param {BaseElement|null} parent - Parent element or null
     * @return {BaseElement} this
     */
    setParent(parent) {
        this._parent = parent;
        return this;
    }
    
    /**
     * Get parent element
     * @return {BaseElement|null} Parent element or null
     */
    parent() {
        return this._parent;
    }
    
    /**
     * Move element to specific position
     * @param {Number} x - X coordinate
     * @param {Number} y - Y coordinate
     * @return {BaseElement} this
     */
    move(x, y) {
        if (this._isLocked) return this;
        
        if (this._svgElement) {
            this._svgElement.move(x, y);
            this.emit('position:change', { element: this, x, y });
        }
        
        return this;
    }
    
    /**
     * Remove element from canvas
     * @return {BaseElement} this
     */
    remove() {
        if (this._svgElement) {
            this._svgElement.remove();
        }
        
        // Clean up behaviors
        for (const [name, behavior] of this._behaviors.entries()) {
            behavior.detach();
        }
        this._behaviors.clear();
        
        this.emit('element:remove', { element: this });
        return this;
    }
    
    /**
     * Show element
     * @return {BaseElement} this
     */
    show() {
        if (this._svgElement) {
            this._svgElement.show();
        }
        return this;
    }
    
    /**
     * Hide element
     * @return {BaseElement} this
     */
    hide() {
        if (this._svgElement) {
            this._svgElement.hide();
        }
        return this;
    }
    
    /**
     * Get element's current position
     * @return {Object} Position with x and y coordinates
     */
    position() {
        if (!this._svgElement) return { x: 0, y: 0 };
        
        const bbox = this._svgElement.bbox();
        return {
            x: bbox.x,
            y: bbox.y
        };
    }
    
    /**
     * Get element's bounding box
     * @return {Object} Bounding box with x, y, width, height
     */
    getBBox() {
        if (!this._svgElement) return { x: 0, y: 0, width: 0, height: 0 };
        return this._svgElement.bbox();
    }
}