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
        // Check for ID first
        if (!properties.id) {
            console.error('FixtureElement: Missing ID in properties');
            throw new Error('Fixture ID is required');
        }
        
        console.log('FixtureElement constructor called with ID:', properties.id);
        
        // Create a dummy element to prevent BaseElement from creating another one
        const dummyElement = { id: () => properties.id };
        
        // Call parent constructor only ONCE with options object
        super({
            id: properties.id,
            type: FixtureElement.type,
            properties: {
                ...properties,
                fixtureType: properties.fixtureType || 'default'
            },
            svgElement: dummyElement // Pass dummy element to prevent creation
        });
        
        // Clear the SVG element so _initialize will create the real one
        this._svgElement = null;
        
        // Store fixture type
        this.fixtureType = properties.fixtureType || 'default';
        
        // Store fixture-specific properties
        this._svgContent = null;
        
        // Initialize the element first, then set position
        this._initialize();
        
        // Set initial position if provided (after initialization)
        if (properties.position) {
            console.log('Setting initial position:', properties.position);
            this.move(properties.position.x, properties.position.y);
        }
        
        console.log('FixtureElement construction complete for ID:', properties.id);
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
        // Check if already initialized
        if (this._initialized) {
            console.log(`FixtureElement: Element ${this.id()} already initialized, skipping`);
            return;
        }
        
        console.log(`FixtureElement: Start initializing element ${this.id()}`);
        
        try {
            // Get the SVG drawing and fixtures group
            const draw = getState('draw');
            const fixturesGroup = getState('fixturesGroup');
            
            if (!draw || !fixturesGroup) {
                console.error('FixtureElement: No SVG drawing or fixtures group found');
                return;
            }
            
            console.log(`FixtureElement: Creating SVG element for ${this.id()}`);
            
            // Create a group for this fixture inside the fixtures group
            this._svgElement = fixturesGroup.group().id(this.id());
            
            console.log(`FixtureElement: SVG element created for ${this.id()}`);
            
            // Try to load SVG content from fixture type
            this._loadSvgContent().catch(error => {
                console.error(`FixtureElement: SVG loading failed:`, error);
                // Create default fixture if SVG loading fails
                this._createDefaultFixture();
            });
            
            // Apply default behaviors
            this._applyBehaviors();
            
            // Mark as initialized
            this._initialized = true;
            
            console.log(`FixtureElement: Element ${this.id()} initialization complete`);
        } catch (error) {
            console.error('Error initializing fixture:', error);
        }
    }
    
    // Add this method to load SVG content
    async _loadSvgContent() {
        console.log('FixtureElement: Loading SVG content for fixture type:', this.fixtureType);
        try {
            // Get the fixture element from the DOM
            const fixtureElement = document.querySelector(`.fixture-item[data-fixture-id="${this.fixtureType}"]`);
            
            console.log('FixtureElement: Found fixture element?', !!fixtureElement);
            
            if (!fixtureElement) {
                console.error('FixtureElement: Fixture element not found for type:', this.fixtureType);
                throw new Error('Fixture element not found');
            }
            
            // Get the SVG content from the fixture element
            const svgContent = fixtureElement.dataset.svgIcon;
            console.log('FixtureElement: SVG content found?', !!svgContent);
            console.log('FixtureElement: SVG content preview:', svgContent ? svgContent.substring(0, 100) + '...' : 'None');
            
            if (!svgContent) {
                console.error('FixtureElement: SVG content not found in fixture element');
                throw new Error('SVG content not found');
            }
            
            // Create a temporary container to parse the SVG
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = svgContent.trim();
            
            const svgElement = tempContainer.querySelector('svg');
            if (!svgElement) {
                console.error('FixtureElement: Invalid SVG content');
                throw new Error('Invalid SVG content');
            }
            
            console.log('FixtureElement: Successfully parsed SVG element');
            
            // Clear existing content
            this._svgElement.clear();
            
            // Try to import the SVG using SVG.js
            try {
                const svgString = svgElement.outerHTML;
                this._svgElement.svg(svgString);
                console.log('FixtureElement: Successfully imported SVG using svg() method');
            } catch (svgError) {
                console.error('FixtureElement: Error importing SVG with svg() method:', svgError);
                
                // Fallback approach - create elements manually
                try {
                    // Get all child elements from the SVG
                    const elements = svgElement.querySelectorAll('*');
                    console.log('FixtureElement: Found', elements.length, 'SVG elements to import manually');
                    
                    elements.forEach(element => {
                        if (element.tagName === 'rect') {
                            const rect = this._svgElement.rect(
                                parseFloat(element.getAttribute('width')),
                                parseFloat(element.getAttribute('height'))
                            )
                            .fill(element.getAttribute('fill') || '#444444')
                            .stroke({ 
                                width: parseFloat(element.getAttribute('stroke-width') || 1),
                                color: element.getAttribute('stroke') || '#000000'
                            })
                            .move(
                                parseFloat(element.getAttribute('x') || 0),
                                parseFloat(element.getAttribute('y') || 0)
                            );
                        } else if (element.tagName === 'ellipse') {
                            this._svgElement.ellipse(
                                parseFloat(element.getAttribute('rx')) * 2,
                                parseFloat(element.getAttribute('ry')) * 2
                            )
                            .fill(element.getAttribute('fill') || '#666666')
                            .stroke({
                                width: parseFloat(element.getAttribute('stroke-width') || 1),
                                color: element.getAttribute('stroke') || '#000000'
                            })
                            .center(
                                parseFloat(element.getAttribute('cx') || 0),
                                parseFloat(element.getAttribute('cy') || 0)
                            );
                        } else if (element.tagName === 'circle') {
                            this._svgElement.circle(
                                parseFloat(element.getAttribute('r')) * 2
                            )
                            .fill(element.getAttribute('fill') || '#CCCCCC')
                            .stroke({
                                width: parseFloat(element.getAttribute('stroke-width') || 1),
                                color: element.getAttribute('stroke') || '#000000'
                            })
                            .center(
                                parseFloat(element.getAttribute('cx') || 0),
                                parseFloat(element.getAttribute('cy') || 0)
                            );
                        } else if (element.tagName === 'polygon') {
                            const points = element.getAttribute('points');
                            if (points) {
                                this._svgElement.polygon(points)
                                    .fill(element.getAttribute('fill') || '#000000');
                            }
                        }
                    });
                    
                    console.log('FixtureElement: Successfully recreated SVG elements manually');
                } catch (fallbackError) {
                    console.error('FixtureElement: Fallback SVG creation failed:', fallbackError);
                    throw fallbackError;
                }
            }
            
            // Scale and center the SVG
            const bbox = this._svgElement.bbox();
            const scale = 40 / Math.max(bbox.width, bbox.height);
            
            // Center at 0,0 and scale
            this._svgElement.transform({
                translateX: -bbox.cx,
                translateY: -bbox.cy,
                scale: scale
            });
            
            // Add channel indicator on top
            const channelCircle = this._svgElement.circle(16)
                .fill('white')
                .stroke({ width: 1, color: '#000000' })
                .center(0, 20); // Position below the fixture
                
            const channelText = this._svgElement.text(this._properties.channel || '1')
                .font({ size: 12, family: 'Arial', weight: 'bold', anchor: 'middle' })
                .center(0, 20);
            
            // Store the content
            this._svgContent = this._svgElement;
            
            console.log('FixtureElement: SVG content successfully loaded and positioned');
            return true;
        } catch (error) {
            console.error('FixtureElement: Error loading SVG content:', error);
            throw error;
        }
    }

    /**
     * Load SVG content for the fixture
     * @private
     */
    async _loadSvgContent() {
        try {
            // Get the fixture element from the DOM
            const fixtureElement = document.querySelector(`.fixture-item[data-fixture-id="${this.fixtureType}"]`);
            
            if (!fixtureElement) {
                console.warn(`FixtureElement: Fixture element not found for type: ${this.fixtureType}`);
                throw new Error('Fixture element not found');
            }
            
            // Get the SVG content from the fixture element
            const svgIcon = fixtureElement.dataset.svgIcon;
            
            if (!svgIcon) {
                console.warn(`FixtureElement: SVG content not found for fixture type: ${this.fixtureType}`);
                throw new Error('SVG content not found');
            }
            
            // Create a temporary container to parse the SVG
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = svgIcon.trim();
            
            const svgElement = tempContainer.querySelector('svg');
            if (!svgElement) {
                throw new Error('Invalid SVG content');
            }
            
            // Clear existing content
            this._svgElement.clear();
            
            // Try to import the SVG using SVG.js
            try {
                const svgString = svgElement.outerHTML;
                this._svgElement.svg(svgString);
            } catch (svgError) {
                console.warn('FixtureElement: SVG import failed, using manual element creation');
                this._createSvgElementsManually(svgElement);
            }
            
            // Scale and center the SVG
            this._normalizeAndCenterSvg();
            
            // Add channel indicator on top
            this._addChannelIndicator();
            
            // Store the content
            this._svgContent = this._svgElement;
            
            return true;
        } catch (error) {
            console.error('FixtureElement: Error loading SVG content:', error);
            throw error;
        }
    }
    // Extract methods for better organization
    _createSvgElementsManually(svgElement) {
        // Get all child elements from the SVG
        const elements = svgElement.querySelectorAll('*');
        
        elements.forEach(element => {
            if (element.tagName === 'rect') {
                this._createRectElement(element);
            } else if (element.tagName === 'ellipse') {
                this._createEllipseElement(element);
            } else if (element.tagName === 'circle') {
                this._createCircleElement(element);
            } else if (element.tagName === 'polygon') {
                this._createPolygonElement(element);
            }
        });
    }

    _normalizeAndCenterSvg() {
        const bbox = this._svgElement.bbox();
        const scale = 40 / Math.max(bbox.width, bbox.height);
        
        // Center at 0,0 and scale
        this._svgElement.transform({
            translateX: -bbox.cx,
            translateY: -bbox.cy,
            scale: scale
        });
    }

    _addChannelIndicator() {
        const channelCircle = this._svgElement.circle(16)
            .fill('white')
            .stroke({ width: 1, color: '#000000' })
            .center(0, 20); // Position below the fixture
            
        const channelText = this._svgElement.text(this._properties.channel || '1')
            .font({ size: 12, family: 'Arial', weight: 'bold', anchor: 'middle' })
            .center(0, 20);
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
    move(x, y) {
        console.log(`FixtureElement: Moving element ${this.id()} to (${x}, ${y})`);
        
        if (!this._svgElement) {
            console.error('FixtureElement: Cannot move - no SVG element');
            return this;
        }
        
        try {
            // Store the position in properties
            this._properties.position = { x, y };
            
            // Simply move the element - don't recreate it
            this._svgElement.move(x, y);
            
            console.log(`FixtureElement: Element ${this.id()} moved to (${x}, ${y})`);
        } catch (error) {
            console.error(`Error moving fixture ${this.id()}:`, error);
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

export function createFixture(type, x, y, properties = {}) {
    console.log('createFixture called with:', { type, x, y, properties });
    console.log('Stack trace:', new Error().stack);
    
    try {
        // Create the properties object
        const fixtureProperties = {
            ...properties,
            id: properties.id || `fixture-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            fixtureType: type,
            position: { x, y }
        };
        
        console.log('Creating fixture with properties:', fixtureProperties);
        
        // Create the fixture instance
        const fixture = new FixtureElement(fixtureProperties);
        
        console.log('Fixture created successfully:', fixture.id());
        
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