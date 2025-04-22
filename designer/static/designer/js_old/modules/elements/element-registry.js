// File: designer/static/designer/js/modules/elements/element-registry.js

/**
 * Element Registry Module
 * 
 * Registry for managing element types and their factories.
 * Enables the system to create elements by type without direct dependencies.
 */

 import { EventEmitter } from '../utils/event-emitter.js';

 /**
  * ElementRegistry class
  * Registry for element type factories
  */
 export class ElementRegistry extends EventEmitter {
     constructor() {
         super();
         
         // Map of element types to factory functions
         this._factories = new Map();
     }
     
     /**
      * Register a factory function for an element type
      * @param {String} type - Element type name
      * @param {Function} factory - Factory function to create elements of this type
      * @return {ElementRegistry} this
      */
     registerType(type, factory) {
         if (!type || typeof factory !== 'function') return this;
         
         this._factories.set(type, factory);
         this.emit('type:registered', { type });
         
         return this;
     }
     
     /**
      * Check if a type is registered
      * @param {String} type - Element type name
      * @return {Boolean} Whether the type is registered
      */
     hasType(type) {
         return this._factories.has(type);
     }
     
     /**
      * Create an element of a specific type
      * @param {String} type - Element type name
      * @param {Object} options - Options for element creation
      * @return {BaseElement|null} Created element or null if type not found
      */
     createElement(type, options = {}) {
         const factory = this._factories.get(type);
         if (!factory) {
             console.error(`Element type "${type}" is not registered`);
             return null;
         }
         
         try {
             return factory(options);
         } catch (error) {
             console.error(`Error creating element of type "${type}":`, error);
             return null;
         }
     }
     
     /**
      * Get a list of all registered element types
      * @return {Array<String>} Array of registered type names
      */
     getRegisteredTypes() {
         return Array.from(this._factories.keys());
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