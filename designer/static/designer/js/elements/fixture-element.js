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
    // Line 15: Static type property
    static type = 'fixture';

    /**
     * Create a new FixtureElement
     * @param {Object} properties - Fixture properties
     */
    constructor(properties = {}) {
        // Line 22: Ensure we have an ID
        if (!properties.id) {
            console.error('FixtureElement: Missing ID in properties');
            throw new Error('Fixture ID is required');
        }
        
        // Call parent constructor with options object
        super({
            id: properties.id,
            type: FixtureElement.type,
            properties: {
                ...properties,
                fixtureType: properties.fixtureType || 'default'
            }
        });
        
        // Store fixture type after super()
        this.fixtureType = properties.fixtureType || 'default';
        
        // Store fixture-specific properties
        this._svgContent = null;
        
        // Set initial position if provided
        if (properties.position) {
            this.move(properties.position.x, properties.position.y);
        }
        
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
        // Line 60: Check if already initialized
        if (this._initialized) {
            return;
        }
        
        try {
            // Get the SVG drawing and fixtures group
            const draw = getState('draw');
            const fixturesGroup = getState('fixturesGroup');
            
            if (!draw || !fixturesGroup) {
                console.error('FixtureElement: No SVG drawing or fixtures group found');
                return;
            }
            
            // Create a group for this fixture inside the fixtures group
            this._svgElement = fixturesGroup.group().id(this.id());
            
            // Create a simple fixture shape
            const rect = this._svgElement.rect(40, 40)
                .fill(this._properties.color || '#0066cc')
                .stroke({ width: 2, color: '#000000' })
                .center(0, 0);
                
            // Add channel indicator
            const circle = this._svgElement.circle(16)
                .fill('white')
                .stroke({ width: 1, color: '#000000' })
                .center(0, 0);
                
            // Add channel number
            const text = this._svgElement.text(this._properties.channel || '1')
                .font({ size: 12, family: 'Arial', weight: 'bold', anchor: 'middle' })
                .center(0, 0);
            
            // Get the viewport center
            const viewBox = draw.viewbox();
            const centerX = viewBox.x + viewBox.width/2;
            const centerY = viewBox.y + viewBox.height/2;
            
            // Calculate position relative to fixtures group
            const fixturesBbox = fixturesGroup.bbox();
            const relativeX = centerX - fixturesBbox.x;
            const relativeY = centerY - fixturesBbox.y;
            
            // Move the fixture relative to the fixtures group
            this._svgElement.move(relativeX, relativeY);
            
            // Ensure the fixture is visible
            this._svgElement.attr({
                'fill-opacity': 1,
                'stroke-opacity': 1,
                'pointer-events': 'all'
            });
            
            // Bring to front
            this._svgElement.front();
            
            // Apply default behaviors
            this._applyBehaviors();
            
            // Mark as initialized
            this._initialized = true;
        } catch (error) {
            console.error('Error initializing fixture:', error);
        }
    }

    /**
     * Load SVG content for the fixture
     * @private
     */
    // Line 123: SVG content loading
    async _loadSvgContent() {
        try {
            // Get the fixture element from the DOM - try both string and numeric IDs
            const fixtureElement = document.querySelector(`.fixture-item[data-fixture-id="${this.fixtureType}"]`) || 
                                document.querySelector(`.fixture-item[data-fixture-id='${this.fixtureType}']`);
            
            if (!fixtureElement) {
                console.error('FixtureElement: Fixture element not found for type:', this.fixtureType);
                // Create a default fixture shape as fallback
                this._createDefaultFixture();
                return;
            }
            
            // Get the SVG content from the fixture element
            const svgContent = fixtureElement.getAttribute('data-svg-icon');
            if (!svgContent) {
                console.error('FixtureElement: SVG content not found in fixture element');
                // Create a default fixture shape as fallback
                this._createDefaultFixture();
                return;
            }
            
            // Create a temporary container to parse the SVG
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = svgContent;
            const svgElement = tempContainer.querySelector('svg');
            
            if (!svgElement) {
                console.error('FixtureElement: Invalid SVG content');
                // Create a default fixture shape as fallback
                this._createDefaultFixture();
                return;
            }
            
            // Clear existing content
            this._svgElement.clear();
            
            // Create a new group for the SVG content
            const contentGroup = this._svgElement.group();
            
            // Add the SVG content to the group
            contentGroup.add(svgElement);
            
            // Get the bounding box of the content
            const bbox = contentGroup.bbox();
            
            // Calculate the center point of the content
            const centerX = bbox.x + bbox.width / 2;
            const centerY = bbox.y + bbox.height / 2;
            
            // Move the content so its center is at (0,0)
            contentGroup.move(-centerX, -centerY);
            
            // Scale the content to fit a standard size (40x40)
            const scale = Math.min(40 / bbox.width, 40 / bbox.height);
            contentGroup.scale(scale);
            
            // Store the SVG content for later use
            this._svgContent = contentGroup;
            
            // Ensure the content is visible
            contentGroup.attr({
                'fill-opacity': 1,
                'stroke-opacity': 1,
                'pointer-events': 'all'
            });
        } catch (error) {
            console.error('FixtureElement: Error loading SVG content:', error);
            // Create a default fixture shape as fallback
            this._createDefaultFixture();
        }
    }

    /**
     * Create a default fixture shape when SVG content is not available
     * @private
     */
    // Line 190: Default fixture creation
    _createDefaultFixture() {
        // Create a simple fixture shape
        this._svgElement.clear();
        
        // Create base rectangle with explicit styling
        const rect = this._svgElement.rect(40, 40)
            .fill(this._properties.color || '#0066cc')
            .stroke({ width: 2, color: '#000000' })
            .attr({
                'fill-opacity': 1,
                'stroke-opacity': 1,
                'pointer-events': 'all'
            })
            .center(0, 0);
            
        // Add channel indicator with explicit styling
        const circle = this._svgElement.circle(16)
            .fill('white')
            .stroke({ width: 1, color: '#000000' })
            .attr({
                'fill-opacity': 1,
                'stroke-opacity': 1
            })
            .center(0, 0);
            
        // Add channel number with explicit styling
        const text = this._svgElement.text(this._properties.channel || '1')
            .font({ size: 12, family: 'Arial', weight: 'bold', anchor: 'middle' })
            .attr({
                'fill': '#000000',
                'fill-opacity': 1
            })
            .center(0, 0);
            
        // Store the SVG content
        this._svgContent = this._svgElement;

        // Position the fixture at its intended location
        const position = this._properties.position || { x: 0, y: 0 };
        this._svgElement.move(position.x, position.y);
        
        // Ensure the fixture is visible
        this._svgElement.front();
    }

    /**
     * Apply properties to the SVG element
     * @private
     */
    // Line 235: Apply properties
    _applyProperties() {
        if (!this._svgElement || !this._svgContent) return;

        // Apply color to all rects in the SVG using native DOM methods
        const color = this._properties.color || '#000000';
        const rects = this._svgContent.querySelectorAll('rect');
        rects.forEach(rect => rect.setAttribute('fill', color));

        // Apply other properties as needed
    }

    /**
     * Apply behaviors to the fixture
     * @private
     */
    // Line 250: Apply behaviors
    _applyBehaviors() {
        // Apply default behaviors
        behaviorManager.applyBehaviors(this, [
            'selectable',
            'draggable',
            'lockable',
            'rotatable'
        ]);
    }

    /**
     * Move the fixture to a new position
     * @param {Number} x - X coordinate
     * @param {Number} y - Y coordinate
     * @return {FixtureElement} this for chaining
     */
    // Line 264: Move method
    move(x, y) {
        if (!this._svgElement) {
            console.error('FixtureElement: Cannot move - no SVG element');
            return this;
        }
        
        try {
            // Store the position in properties
            this._properties.position = { x, y };
            
            // Move the SVG element
            this._svgElement.move(x, y);
            
            // Ensure the fixture is visible
            this._svgElement.attr({
                'fill-opacity': 1,
                'stroke-opacity': 1,
                'pointer-events': 'all'
            });
            
            // Bring to front
            this._svgElement.front();
        } catch (error) {
            console.error('Error moving fixture:', error);
        }
        
        return this;
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
// Line 295: Create fixture function
export function createFixture(type, x, y, properties = {}) {
    try {
        // Create the properties object
        const fixtureProperties = {
            ...properties,
            id: properties.id || `fixture-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            fixtureType: type,
            position: { x, y }
        };
        
        // Create the fixture instance
        const fixture = new FixtureElement(fixtureProperties);
        
        return fixture;
    } catch (error) {
        console.error('Error creating fixture:', error);
        return null;
    }
}

/**
 * Load a fixture from saved data
 * @param {Object} fixtureData - Serialized fixture data
 * @return {FixtureElement} The loaded fixture
 */
// Line 319: Load fixture function
export function loadFixture(fixtureData) {
    try {
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
    } catch (error) {
        console.error('Error loading fixture:', error);
        return null;
    }
}