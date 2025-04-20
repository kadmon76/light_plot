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
         
         // Position element
         if (x !== undefined && y !== undefined) {
             element.move(x, y);
         }
         
         // Apply rotation if specified
         if (properties.rotation) {
             element.rotate(properties.rotation);
         }
         
         // Apply locked state if specified
         if (options.locked) {
             element.lock(true);
         }
         
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
         return this._createElement('fixture', instanceId, {
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
     }
     
     /**
      * Create a pipe element
      * @param {Object} pipeConfig - Pipe configuration
      * @param {Number} x - X position
      * @param {Number} y - Y position
      * @return {PipeElement} The created pipe
      */
     createPipe(pipeConfig, x, y) {
         // Generate a unique instance ID
         const instanceId = pipeConfig.pipeId || `pipe-${Date.now()}`;
         
         // Create pipe with standard properties
         return this._createElement('pipe', instanceId, {
             pipeName: pipeConfig.pipeName,
             pipeType: pipeConfig.pipeType,
             pipeLength: pipeConfig.pipeLength,
             originalLength: pipeConfig.pipeLength,
             pipeColor: pipeConfig.pipeColor,
             rotation: pipeConfig.rotation || 0
         }, x, y);
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
                 pipeName: pipeData.pipe_name,
                 pipeType: pipeData.pipe_type,
                 pipeLength: pipeData.pipe_length,
                 originalLength: pipeData.pipe_original_length || pipeData.pipe_length,
                 pipeColor: pipeData.pipe_color,
                 rotation: pipeData.rotation || 0
             },
             pipeData.x,
             pipeData.y,
             { locked: pipeData.locked }
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