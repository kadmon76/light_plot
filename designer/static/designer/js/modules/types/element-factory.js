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
    }
    
    /**
     * Create a fixture element
     * @param {String} fixtureId - Fixture type ID
     * @param {Number} x - X position
     * @param {Number} y - Y position
     * @param {Object} [properties] - Additional fixture properties
     * @return {FixtureElement} The created fixture
     */
    createFixture(fixtureId, x, y, properties = {}) {
        // Get fixture type from the DOM
        const fixtureItem = document.querySelector(`.fixture-item[data-fixture-id="${fixtureId}"]`);
        const fixtureType = fixtureItem ? fixtureItem.textContent.trim() : 'Unknown Fixture';
        
        // Create fixture via the registry
        const fixture = elementRegistry.createElement('fixture', {
            fixtureType: fixtureType,
            properties: {
                ...properties,
                fixtureType: fixtureType
            }
        });
        
        // Position fixture
        fixture.move(x, y);
        
        return fixture;
    }
    
    /**
     * Create a pipe element
     * @param {Object} pipeConfig - Pipe configuration
     * @param {Number} x - X position
     * @param {Number} y - Y position
     * @return {PipeElement} The created pipe
     */
    createPipe(pipeConfig, x, y) {
        // Create pipe via the registry
        const pipe = elementRegistry.createElement('pipe', {
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
     * Load a fixture from saved data
     * @param {Object} fixtureData - Serialized fixture data
     * @return {FixtureElement} The loaded fixture
     */
    loadFixture(fixtureData) {
        const fixture = elementRegistry.createElement('fixture', {
            id: fixtureData.instance_id,
            fixtureType: fixtureData.fixture_type,
            properties: {
                channel: fixtureData.channel || 1,
                dimmer: fixtureData.dimmer || '',
                color: fixtureData.color || '#0066cc',
                purpose: fixtureData.purpose || '',
                notes: fixtureData.notes || '',
                rotation: fixtureData.rotation || 0,
                fixtureType: fixtureData.fixture_type
            }
        });
        
        // Position fixture
        fixture.move(fixtureData.x || 0, fixtureData.y || 0);
        
        // Apply rotation
        if (fixtureData.rotation) {
            fixture.rotate(fixtureData.rotation);
        }
        
        // Set locked state if specified
        if (fixtureData.locked) {
            fixture.lock(true);
        }
        
        return fixture;
    }
    
    /**
     * Load a pipe from saved data
     * @param {Object} pipeData - Serialized pipe data
     * @return {PipeElement} The loaded pipe
     */
    loadPipe(pipeData) {
        const pipe = elementRegistry.createElement('pipe', {
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