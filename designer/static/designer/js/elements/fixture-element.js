// File: designer/static/designer/js/elements/fixture-element.js

/**
 * Fixture Element Module
 * 
 * Implements the fixture element type with SVG representation
 * and fixture-specific properties and behaviors.
 */

import { BaseElement } from './base-element.js';
import { getState } from '../core/state.js';
import behaviorManager from '../behaviors/behavior-manager.js';

/**
 * FixtureElement class
 * Represents a lighting fixture in the plot
 */
export class FixtureElement extends BaseElement {
    // Static type property
    static type = 'fixture';

    /**
     * Create a new FixtureElement
     * @param {String} type - Fixture type identifier
     * @param {Number} x - X coordinate
     * @param {Number} y - Y coordinate
     * @param {Object} properties - Fixture properties
     */
    constructor(type, x, y, properties = {}) {
        console.log('FixtureElement constructor: Received properties:', properties);
        
        // Ensure we have an ID
        if (!properties.id) {
            console.error('FixtureElement: Missing ID in properties:', properties);
            throw new Error('Fixture ID is required');
        }
        
        // Call parent constructor with options object
        super({
            id: properties.id,
            type: FixtureElement.type,
            properties: {
                ...properties,
                fixtureType: type
            }
        });
        
        // Store fixture-specific properties
        this._svgContent = null;
        
        // Set initial position
        this.move(x, y);
        
        // Initialize the element
        this._initialize();
    }

    /**
     * Get the fixture type
     * @return {String} Fixture type
     */
    getFixtureType() {
        return this.prop('fixtureType');
    }

    /**
     * Initialize the element
     * @protected
     */
    _initialize() {
        if (this._initialized) return;

        // Create SVG group
        const draw = getState('draw');
        if (!draw) {
            console.error('FixtureElement: No SVG drawing found');
            return;
        }

        // Get fixtures group
        const fixturesGroup = getState('fixturesGroup');
        if (!fixturesGroup) {
            console.error('FixtureElement: No fixtures group found');
            return;
        }

        // Create group for this fixture
        this._svgElement = fixturesGroup.group();
        // Store only the element ID to avoid circular references
        this._svgElement.data('elementId', this.id());

        // Load and apply SVG content
        this._loadSvgContent();

        // Apply behaviors
        this._applyBehaviors();

        // Mark as initialized
        this._initialized = true;
    }

    /**
     * Load SVG content for the fixture
     * @private
     */
    _loadSvgContent() {
        // Get fixture type data
        const fixtureType = this.prop('fixtureType');
        if (!fixtureType) {
            console.error('FixtureElement: No fixture type specified');
            return;
        }

        console.log('FixtureElement: Looking for fixture type:', fixtureType);

        // Get fixture SVG from the library
        const fixtureItem = document.querySelector(`.fixture-item[data-fixture-id="${fixtureType}"]`);
        if (!fixtureItem) {
            console.error('FixtureElement: Fixture type not found in library:', fixtureType);
            console.log('Available fixture items:', document.querySelectorAll('.fixture-item'));
            return;
        }

        // Get SVG content
        const svgContent = fixtureItem.querySelector('.fixture-preview svg');
        if (!svgContent) {
            console.error('FixtureElement: No SVG content found for fixture type:', fixtureType);
            console.log('Fixture item content:', fixtureItem.innerHTML);
            return;
        }

        console.log('FixtureElement: Found SVG content for fixture type:', fixtureType);

        // Clone and import SVG content
        const importedSvg = document.importNode(svgContent, true);

        // --- Normalization Logic ---
        // Target box: 40x40 centered at (0,0)
        const TARGET_SIZE = 40;
        const TARGET_MIN = -20;
        const TARGET_MAX = 20;

        // Get original viewBox
        let vb = importedSvg.getAttribute('viewBox');
        let vbX = 0, vbY = 0, vbW = 40, vbH = 40;
        if (vb) {
            [vbX, vbY, vbW, vbH] = vb.split(/\s+/).map(Number);
        } else {
            // If no viewBox, try width/height
            vbW = Number(importedSvg.getAttribute('width')) || 40;
            vbH = Number(importedSvg.getAttribute('height')) || 40;
        }

        // Calculate scale to fit target box
        const scale = TARGET_SIZE / Math.max(vbW, vbH);
        // Calculate translation to center content
        const transX = -((vbX + vbW / 2) * scale) + (TARGET_MIN + TARGET_SIZE / 2);
        const transY = -((vbY + vbH / 2) * scale) + (TARGET_MIN + TARGET_SIZE / 2);

        // Remove width/height, set standardized viewBox
        importedSvg.removeAttribute('width');
        importedSvg.removeAttribute('height');
        importedSvg.setAttribute('width', TARGET_SIZE);
        importedSvg.setAttribute('height', TARGET_SIZE);
        importedSvg.setAttribute('viewBox', `${TARGET_MIN} ${TARGET_MIN} ${TARGET_SIZE} ${TARGET_SIZE}`);

        // Apply transform to all children
        for (let child of importedSvg.children) {
            let prev = child.getAttribute('transform') || '';
            child.setAttribute('transform', `scale(${scale}) translate(${transX / scale}, ${transY / scale}) ${prev}`.trim());
        }

        // Clear previous content and add the imported SVG
        this._svgElement.clear();
        this._svgElement.add(importedSvg);
        this._svgContent = importedSvg;

        // Center the SVG group at (0,0)
        this._svgElement.center(0, 0);

        // Apply properties
        this._applyProperties();
    }

    /**
     * Apply properties to the SVG element
     * @private
     */
    _applyProperties() {
        if (!this._svgElement || !this._svgContent) return;

        // Apply color to all rects in the SVG using native DOM methods
        const color = this._properties.color || '#000000';
        const rects = this._svgContent.querySelectorAll('rect');
        rects.forEach(rect => rect.setAttribute('fill', color));

        // Apply other properties as needed
        // ...
    }

    /**
     * Apply behaviors to the fixture
     * @private
     */
    _applyBehaviors() {
        // Apply default behaviors
        behaviorManager.applyBehaviors(this, [
            'selectable',
            'draggable',
            'lockable',
            'rotatable'
        ]);
    }
}

/**
 * Create a new fixture
 * @param {String} type - Fixture type
 * @param {Number} x - X coordinate
 * @param {Number} y - Y coordinate
 * @param {Object} properties - Fixture properties
 * @return {FixtureElement} The created fixture
 */
export function createFixture(type, x, y, properties = {}) {
    console.log('createFixture: Input properties:', properties);
    
    // Generate a unique ID
    const fixtureId = `fixture-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('createFixture: Generated ID:', fixtureId);
    
    // Create final properties object
    const finalProperties = {
        ...properties,
        id: fixtureId,
        fixtureType: type
    };
    console.log('createFixture: Final properties:', finalProperties);
    
    // Create and return the fixture
    return new FixtureElement(type, x, y, finalProperties);
}

/**
 * Load a fixture from saved data
 * @param {Object} fixtureData - Serialized fixture data
 * @return {FixtureElement} The loaded fixture
 */
export function loadFixture(fixtureData) {
    console.log(`Loading fixture from data:`, fixtureData);
    
    const fixture = new FixtureElement({
        id: fixtureData.id,
        properties: {
            channel: fixtureData.channel || '1',
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
    
    // Apply locked state if specified
    if (fixtureData.isLocked) {
        fixture.lock(true);
    }
    
    return fixture;
}