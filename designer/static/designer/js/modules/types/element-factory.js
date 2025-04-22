/**
 * Element Factory Module
 * 
 * Factory for creating different element types.
 * Centralizes element creation logic and integrates with the element registry.
 */

 import { FixtureElement } from './fixture-element.js';
 import { PipeElement } from './pipe-element.js';
 import elementRegistry from '../elements/element-registry.js';
 
 /**
  * ElementFactory class
  * Creates and registers plot elements
  */
 export class ElementFactory {
     constructor() {
         // Register element types with the registry
         this._registerElementTypes();
     }
     
     /**
      * Register element types with the element registry
      * @private
      */
     _registerElementTypes() {
         // Register fixture element factory
         elementRegistry.registerType('fixture', (options) => {
             return new FixtureElement(options);
         });
         
         // Register pipe element factory
         elementRegistry.registerType('pipe', (options) => {
             return new PipeElement(options);
         });
         
         // Add stage registration when implemented
     }
    /**
     * Handle element property changes
     * @param {Object} event - Property change event
     * @private
     */
    _handleElementPropertyChange(event) {
        const { element, key, value, oldValue } = event;
        
        // Log for debugging
        console.log(`Element ${element.id()} property changed: ${key}=${value}`);
        
        // Dispatch a custom event for other systems to listen to
        const customEvent = new CustomEvent('element:propertyChange', {
            detail: {
                elementId: element.id(),
                elementType: element.type(),
                propertyKey: key,
                propertyValue: value,
                oldValue: oldValue
            }
        });
        document.dispatchEvent(customEvent);
    }
    /**
     * Create or load any element type with common handling
     * @param {String} type - Element type ('fixture', 'pipe', etc.)
     * @param {String} id - Element ID
     * @param {Object} properties - Element properties
     * @param {Number} x - X position
     * @param {Number} y - Y position
     * @param {Object} [options={}] - Additional options
     * @return {BaseElement} The created element
     * @private
     */
    _createElement(type, id, properties, x, y, options = {}) {
        // Create element via the registry
        const element = elementRegistry.createElement(type, {
            id: id,
            properties: properties,
            ...options
        });
        
        if (!element) {
            console.error(`Failed to create element of type: ${type}`);
            return null;
        }
        
        // Position element
        if (x !== undefined && y !== undefined) {
            element.move(x, y);
        }
        
        // Apply rotation if specified in properties
        if (properties.rotation) {
            // Use element's rotate method which also updates the rotation property
            element.rotate(properties.rotation);
        }
        
        // Apply locked state if specified
        if (options.locked) {
            element.lock(true);
        }
        
        // Listen for property changes
        element.on('property:change', this._handleElementPropertyChange.bind(this));
        
        return element;
    }
    /**
     * Create a fixture element
     * @param {String} fixtureId - Fixture type ID
     * @param {Number} x - X position
     * @param {Number} y - Y position
     * @param {Object} [properties={}] - Additional fixture properties
     * @return {FixtureElement} The created fixture
     */
    createFixture(fixtureId, x, y, properties = {}) {
        // Get fixture type from the DOM
        const fixtureItem = document.querySelector(`.fixture-item[data-fixture-id="${fixtureId}"]`);
        const fixtureType = fixtureItem ? fixtureItem.textContent.trim() : 'Unknown Fixture';
        
        // Generate a unique instance ID
        const instanceId = `fixture-${Date.now()}`;
        
        // Create element with standard properties
        const element = this._createElement('fixture', instanceId, {
            fixtureId: fixtureId,
            fixtureType: fixtureType,
            channel: properties.channel || '1',
            dimmer: properties.dimmer || '',
            color: properties.color || '#0066cc',
            purpose: properties.purpose || '',
            notes: properties.notes || '',
            rotation: properties.rotation || 0,
            ...properties
        }, x, y);
        
        return element;
    }
    /**
     * Create a pipe element
     * @param {Object} pipeConfig - Pipe configuration
     * @param {Number} x - X position
     * @param {Number} y - Y position
     * @param {Object} [options={}] - Additional options
     * @return {PipeElement} The created pipe
     */
    createPipe(pipeConfig, x, y, options = {}) {
        // Generate a unique instance ID
        const instanceId = pipeConfig.pipeId || `pipe-${Date.now()}`;
        
        // Create pipe with standard properties
        return this._createElement('pipe', instanceId, {
            pipeName: pipeConfig.pipeName || 'Unnamed Pipe',
            pipeType: pipeConfig.pipeType || 'pipe',
            pipeLength: pipeConfig.pipeLength || 10,
            originalLength: pipeConfig.pipeLength || 10,
            pipeColor: pipeConfig.pipeColor || '#666666',
            rotation: pipeConfig.rotation || 0,
            ...options.properties
        }, x, y, options);
    }   
    /**
 * Load a fixture from saved data
 * @param {Object} fixtureData - Serialized fixture data
 * @return {FixtureElement} The loaded fixture
 */
    loadFixture(fixtureData) {
        return this._createElement('fixture', 
            fixtureData.instance_id || `fixture-${Date.now()}`,
            {
                fixtureId: fixtureData.fixture_id,
                fixtureType: fixtureData.fixture_type,
                channel: fixtureData.channel || '1',
                dimmer: fixtureData.dimmer || '',
                color: fixtureData.color || '#0066cc',
                purpose: fixtureData.purpose || '',
                notes: fixtureData.notes || '',
                rotation: fixtureData.rotation || 0
            },
            fixtureData.x, 
            fixtureData.y,
            { locked: fixtureData.locked }
        );
    }

     /**
      * Load a fixture from saved data
      * @param {Object} fixtureData - Serialized fixture data
      * @return {FixtureElement} The loaded fixture
      */
     loadFixture(fixtureData) {
         return this._createElement('fixture', 
             fixtureData.instance_id || `fixture-${Date.now()}`,
             {
                 fixtureId: fixtureData.fixture_id,
                 fixtureType: fixtureData.fixture_type,
                 channel: fixtureData.channel || '1',
                 dimmer: fixtureData.dimmer || '',
                 color: fixtureData.color || '#0066cc',
                 purpose: fixtureData.purpose || '',
                 notes: fixtureData.notes || '',
                 rotation: fixtureData.rotation || 0
             },
             fixtureData.x, 
             fixtureData.y,
             { locked: fixtureData.locked }
         );
     }
     
    /**
     * Load a pipe from saved data
     * @param {Object} pipeData - Serialized pipe data
     * @return {PipeElement} The loaded pipe
     */
    loadPipe(pipeData) {
        return this._createElement('pipe',
            pipeData.pipe_id || `pipe-${Date.now()}`,
            {
                pipeName: pipeData.pipe_name || 'Unnamed Pipe',
                pipeType: pipeData.pipe_type || 'pipe',
                pipeLength: pipeData.pipe_length || 10,
                originalLength: pipeData.pipe_original_length || pipeData.pipe_length || 10,
                pipeColor: pipeData.pipe_color || '#666666',
                rotation: pipeData.rotation || 0
            },
            pipeData.x,
            pipeData.y,
            { locked: pipeData.locked === true }
        );
    }
     
     /**
      * Get singleton instance
      * @return {ElementFactory} Singleton instance
      */
     static getInstance() {
         if (!ElementFactory._instance) {
             ElementFactory._instance = new ElementFactory();
         }
         return ElementFactory._instance;
     }
 }
 
 // Create and export singleton instance
 const elementFactory = ElementFactory.getInstance();
 export default elementFactory;