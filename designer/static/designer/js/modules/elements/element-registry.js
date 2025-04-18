/**
 * Element Registry Module
 * 
 * Manages element registration, retrieval, and type definitions.
 * Central registry for accessing all elements in the scene.
 */

import { EventEmitter } from '../../utils/event-emitter.js';

/**
 * ElementRegistry class
 * Manages all elements in the scene
 */
export class ElementRegistry extends EventEmitter {
    constructor() {
        super();
        
        // Map of elements by ID
        this._elements = new Map();
        
        // Map of element types and their factory functions
        this._elementTypes = new Map();
    }
    
    /**
     * Register an element type with a factory function
     * @param {String} type - Element type name
     * @param {Function} factory - Factory function that creates element instances
     * @return {ElementRegistry} this
     */
    registerType(type, factory) {
        if (!type || typeof factory !== 'function') return this;
        
        this._elementTypes.set(type, factory);
        this.emit('type:registered', { type });
        
        return this;
    }
    
    /**
     * Check if an element type is registered
     * @param {String} type - Element type name
     * @return {Boolean} Whether the type is registered
     */
    hasType(type) {
        return this._elementTypes.has(type);
    }
    
    /**
     * Create an element of a specific type
     * @param {String} type - Element type name
     * @param {Object} options - Options for the element
     * @return {BaseElement|null} Element instance or null if type not found
     */
    createElement(type, options = {}) {
        const factory = this._elementTypes.get(type);
        if (!factory) return null;
        
        const element = factory(options);
        
        // Auto-register if ID is provided
        if (element && element.id && options.autoRegister !== false) {
            this.register(element);
        }
        
        return element;
    }
    
    /**
     * Register an element in the registry
     * @param {BaseElement} element - Element to register
     * @return {ElementRegistry} this
     */
    register(element) {
        if (!element || !element.id) return this;
        
        const id = element.id();
        
        // If already registered, unregister first
        if (this._elements.has(id)) {
            this.unregister(id);
        }
        
        this._elements.set(id, element);
        this.emit('element:registered', { element });
        
        return this;
    }
    
    /**
     * Unregister an element from the registry
     * @param {String|BaseElement} elementOrId - Element or element ID to unregister
     * @return {BaseElement|null} Unregistered element or null
     */
    unregister(elementOrId) {
        const id = typeof elementOrId === 'string' ? elementOrId : 
                  (elementOrId && elementOrId.id ? elementOrId.id() : null);
        
        if (!id || !this._elements.has(id)) return null;
        
        const element = this._elements.get(id);
        this._elements.delete(id);
        
        this.emit('element:unregistered', { element });
        
        return element;
    }
    
    /**
     * Get an element by ID
     * @param {String} id - Element ID
     * @return {BaseElement|null} Element instance or null if not found
     */
    get(id) {
        return this._elements.get(id) || null;
    }
    
    /**
     * Check if an element is registered
     * @param {String} id - Element ID
     * @return {Boolean} Whether the element is registered
     */
    has(id) {
        return this._elements.has(id);
    }
    
    /**
     * Get all registered elements
     * @return {Array<BaseElement>} Array of all registered elements
     */
    getAll() {
        return Array.from(this._elements.values());
    }
    
    /**
     * Get all elements of a specific type
     * @param {String} type - Element type to filter by
     * @return {Array<BaseElement>} Array of matching elements
     */
    getByType(type) {
        if (!type) return [];
        
        return this.getAll().filter(element => element.type() === type);
    }
    
    /**
     * Get all selected elements
     * @return {Array<BaseElement>} Array of selected elements
     */
    getSelected() {
        return this.getAll().filter(element => element.isSelected());
    }
    
    /**
     * Get count of registered elements
     * @return {Number} Count of registered elements
     */
    count() {
        return this._elements.size;
    }
    
    /**
     * Clear all elements from the registry
     * @param {Boolean} [removeFromScene=false] - Whether to also remove elements from scene
     * @return {ElementRegistry} this
     */
    clear(removeFromScene = false) {
        if (removeFromScene) {
            this._elements.forEach(element => {
                if (element.remove && typeof element.remove === 'function') {
                    element.remove();
                }
            });
        }
        
        this._elements.clear();
        this.emit('registry:cleared');
        
        return this;
    }
    
    /**
     * Get singleton instance
     * @return {ElementRegistry} Singleton instance
     */
    static getInstance() {
        if (!ElementRegistry._instance) {
            ElementRegistry._instance = new ElementRegistry();
        }
        return ElementRegistry._instance;
    }
}

// Create and export singleton instance
const elementRegistry = ElementRegistry.getInstance();
export default elementRegistry;