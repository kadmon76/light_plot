// File: designer/static/designer/js/elements/fixture-element.js

/**
 * Fixture Element Module
 * 
 * Implements the fixture element type with SVG representation
 * and fixture-specific properties and behaviors.
 */

import { BaseElement } from './base-element.js';
import { getState, setState } from '../core/state.js';
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
     * @param {Object} properties - Fixture properties
     */
    constructor(properties = {}) {
        console.log('FixtureElement: Creating new fixture with properties:', properties);
        
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
        if (this._initialized) {
            console.log('FixtureElement: Already initialized');
            return;
        }
        
        console.log('FixtureElement: Starting initialization');
        
        // Get the SVG drawing and fixtures group
        const draw = getState('draw');
        const fixturesGroup = getState('fixturesGroup');
        
        if (!draw || !fixturesGroup) {
            console.error('FixtureElement: No SVG drawing or fixtures group found');
            return;
        }
        console.log('FixtureElement: SVG drawing and fixtures group found');
        
        // Create a group for this fixture inside the fixtures group
        this._svgElement = fixturesGroup.group().id(this.id());
        console.log('FixtureElement: Created SVG group:', this._svgElement);
        
        // Create a simple fixture shape
        const rect = this._svgElement.rect(40, 40)
            .fill(this._properties.color || '#0066cc')
            .stroke({ width: 2, color: '#000000' })
            .center(0, 0);
            
        console.log('FixtureElement: Created base rectangle:', rect);
            
        // Add channel indicator
        const circle = this._svgElement.circle(16)
            .fill('white')
            .stroke({ width: 1, color: '#000000' })
            .center(0, 0);
            
        console.log('FixtureElement: Created channel indicator:', circle);
            
        // Add channel number
        const text = this._svgElement.text(this._properties.channel || '1')
            .font({ size: 12, family: 'Arial', weight: 'bold', anchor: 'middle' })
            .center(0, 0);
            
        console.log('FixtureElement: Created channel text:', text);
        
        // Get the viewport center
        const viewBox = draw.viewbox();
        const centerX = viewBox.x + viewBox.width/2;
        const centerY = viewBox.y + viewBox.height/2;
        
        // Get the fixtures group position
        const fixturesBbox = fixturesGroup.bbox();
        console.log('FixtureElement: Fixtures group bbox:', fixturesBbox);
        
        // Calculate position relative to fixtures group
        const relativeX = 0;  // Position at the center of the viewport
        const relativeY = 0;
        console.log('FixtureElement: SETTING POSITION TO CENTER OF VIEWPORT');
        
        this._svgElement.rect(60, 60)  // Larger rectangle
            .fill('#FF0000')  // Bright red color
            .stroke({ width: 3, color: '#000000' })
            .center(0, 0);
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
        
        console.log('FixtureElement: Initialized and positioned at:', { 
            centerX, 
            centerY,
            relativeX,
            relativeY,
            fixturesBbox
        });
        
        // Mark as initialized
        this._initialized = true;
    }

    /**
     * Load SVG content for the fixture
     * @private
     */
    async _loadSvgContent() {
        try {
            console.log('FixtureElement: Loading SVG content for fixture type:', this.fixtureType);
            
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
            
            console.log('FixtureElement: Found SVG content:', svgContent);
            
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
            console.log('FixtureElement: Initial content bounding box:', bbox);
            
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
            
            // Log the final bounding box
            const finalBbox = contentGroup.bbox();
            console.log('FixtureElement: Normalized content bounding box:', finalBbox);
            
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
    _createDefaultFixture() {
        console.log('FixtureElement: Creating default fixture shape');
        
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
            
        console.log('FixtureElement: Created base rectangle:', rect);
            
        // Add channel indicator with explicit styling
        const circle = this._svgElement.circle(16)
            .fill('white')
            .stroke({ width: 1, color: '#000000' })
            .attr({
                'fill-opacity': 1,
                'stroke-opacity': 1
            })
            .center(0, 0);
            
        console.log('FixtureElement: Created channel indicator:', circle);
            
        // Add channel number with explicit styling
        const text = this._svgElement.text(this._properties.channel || '1')
            .font({ size: 12, family: 'Arial', weight: 'bold', anchor: 'middle' })
            .attr({
                'fill': '#000000',
                'fill-opacity': 1
            })
            .center(0, 0);
            
        console.log('FixtureElement: Created channel text:', text);
            
        // Store the SVG content
        this._svgContent = this._svgElement;

        // Position the fixture at its intended location
        const position = this._properties.position || { x: 0, y: 0 };
        this._svgElement.move(position.x, position.y);
        
        // Ensure the fixture is visible
        this._svgElement.front();
        
        // Log the final bounding box
        const bbox = this._svgElement.bbox();
        console.log('FixtureElement: Default fixture bounding box:', bbox);
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

    /**
     * Move the fixture to a new position
     * @param {Number} x - X coordinate
     * @param {Number} y - Y coordinate
     */
    // Replace the move method with this updated version
    move(x, y) {
        if (!this._svgElement) {
            console.error('FixtureElement: Cannot move - no SVG element');
            return;
        }
        
        console.log('FixtureElement: Moving to position:', { x, y });
        
        // Store the position in properties
        this._properties.position = { x, y };
        
        // Get the center of the viewport
        const draw = getState('draw');
        if (draw) {
            const viewBox = draw.viewbox();
            const centerX = viewBox.x + viewBox.width / 2;
            const centerY = viewBox.y + viewBox.height / 2;
            
            console.log('FixtureElement: Viewport center:', { centerX, centerY });
            
            // Use absolute positioning instead of relative
            this._svgElement.center(centerX, centerY);
            
            // Log that we're using absolute positioning
            console.log('FixtureElement: Using ABSOLUTE positioning at viewport center');
        } else {
            // Fallback to regular move if draw isn't available
            this._svgElement.move(x, y);
        }
        
        // Make fixture highly visible for debugging
        const rect = this._svgElement.findOne('rect');
        if (rect) {
            rect.fill('#FF00FF').stroke({ width: 5, color: '#000000' });
            rect.width(100).height(100);
        }
        
        // Ensure the fixture is visible
        this._svgElement.attr({
            'fill-opacity': 1,
            'stroke-opacity': 1,
            'pointer-events': 'all'
        });
        
        // Bring to front - use front() method if available, otherwise use regular DOM methods
        try {
            this._svgElement.front();
        } catch (e) {
            if (this._svgElement.node && this._svgElement.node.parentNode) {
                this._svgElement.node.parentNode.appendChild(this._svgElement.node);
            }
        }
        
        // Log the new position
        const bbox = this._svgElement.bbox();
        console.log('FixtureElement: New position after move:', bbox);
        
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
    console.log('createFixture: Creating new fixture with type:', type, 'at position:', { x, y }, 'with properties:', properties);
    
    // Create the properties object
    const fixtureProperties = {
        ...properties,
        id: properties.id || `fixture-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        fixtureType: type,
        position: { x, y }
    };
    
    console.log('createFixture: Final properties:', fixtureProperties);
    
    // Create the fixture instance
    const fixture = new FixtureElement(fixtureProperties);
    console.log('createFixture: Fixture instance created:', fixture);
    
    return fixture;
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

