/**
 * Fixture Element Module
 * 
 * Implements a theatrical lighting fixture using the base element architecture
 * with composable behaviors.
 */

import { BaseElement } from '../elements/base-element.js';
import behaviorManager from '../elements/behavior-manager.js';
import { draw, fixturesGroup } from '../core.js';

/**
 * FixtureElement class
 * Represents a lighting fixture in the plot
 */
export class FixtureElement extends BaseElement {
    /**
     * Create a new FixtureElement
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        // Set default type and generate ID if not provided
        const fixtureId = options.id || `fixture-${Date.now()}`;
        const fixtureType = options.fixtureType || 'unknown';
        
        // Default fixture properties
        const defaultProps = {
            channel: 1,
            dimmer: '',
            color: '#0066cc',
            purpose: '',
            notes: '',
            rotation: 0,
            fixtureType: fixtureType
        };
        
        // Merge with provided properties
        const fixtureProps = { ...defaultProps, ...(options.properties || {}) };
        
        // Initialize base element
        super({
            id: fixtureId,
            type: 'fixture',
            properties: fixtureProps,
            svgElement: options.svgElement
        });
        
        // Add to fixtures group if no parent element
        if (!options.parent && !options.svgElement) {
            fixturesGroup.add(this._svgElement);
        }
        
        // Apply default behaviors
        const behaviors = options.behaviors || ['selectable', 'draggable', 'lockable', 'rotatable'];
        this._applyBehaviors(behaviors);
    }
    
    /**
     * Initialize the fixture element
     * @protected
     */
    _initElement() {
        // Create the fixture circle
        this._svgElement.circle(30)
            .fill(this.prop('color'))
            .center(0, 0);
            
        // Add channel indicator circle
        this._svgElement.circle(16)
            .fill('white')
            .center(0, 0);
            
        // Add channel number
        this._svgElement.text(this.prop('channel').toString())
            .font({ size: 12, family: 'Arial', weight: 'bold', anchor: 'middle' })
            .center(0, 0);
            
        // Apply initial rotation if any
        const rotation = this.prop('rotation');
        if (rotation) {
            this._svgElement.rotate(rotation);
        }
    }
    
    /**
     * Apply behaviors to the fixture
     * @param {Array<String|Object>} behaviors - Behaviors to apply
     * @private
     */
    _applyBehaviors(behaviors) {
        behaviors.forEach(behavior => {
            if (typeof behavior === 'string') {
                // Simple string behavior name
                behaviorManager.applyBehavior(this, behavior);
            } else if (behavior && typeof behavior === 'object') {
                // Behavior config object with type and options
                const { type, options = {} } = behavior;
                if (type) {
                    behaviorManager.applyBehavior(this, type, options);
                }
            }
        });
    }
    
    /**
     * Update the channel display
     * @private
     */
    _updateChannelDisplay() {
        const textElement = this._svgElement.findOne('text');
        if (textElement) {
            textElement.text(this.prop('channel').toString());
        }
    }
    
    /**
     * Set the fixture's channel
     * @param {Number|String} channel - Channel number
     * @return {FixtureElement} this
     */
    setChannel(channel) {
        this.prop('channel', channel);
        this._updateChannelDisplay();
        return this;
    }
    
    /**
     * Set the fixture's color
     * @param {String} color - Color value (CSS color)
     * @return {FixtureElement} this
     */
    setColor(color) {
        this.prop('color', color);
        
        const circleElement = this._svgElement.find('circle')[0];
        if (circleElement) {
            circleElement.fill(color);
        }
        
        return this;
    }
    
    /**
     * Set the fixture's rotation
     * @param {Number} degrees - Rotation in degrees
     * @return {FixtureElement} this
     */
    rotate(degrees) {
        this.prop('rotation', degrees);
        this._svgElement.rotate(degrees);
        return this;
    }
    
    /**
     * Get fixture data for serialization
     * @return {Object} Serialized fixture data
     */
    serialize() {
        const baseData = super.serialize();
        const position = this.position();
        
        return {
            ...baseData,
            x: position.x,
            y: position.y,
            fixture_id: this.prop('fixtureType'),
            fixture_type: this.prop('fixtureType'),
            instance_id: this.id(),
            channel: this.prop('channel'),
            dimmer: this.prop('dimmer'),
            color: this.prop('color'),
            purpose: this.prop('purpose'),
            notes: this.prop('notes'),
            rotation: this.prop('rotation')
        };
    }
}

/**
 * Create a fixture from the fixture library
 * @param {String} fixtureId - Fixture type ID
 * @param {Number} x - X position
 * @param {Number} y - Y position
 * @param {Object} [properties] - Additional fixture properties
 * @return {FixtureElement} The created fixture
 */
export function createFixture(fixtureId, x, y, properties = {}) {
    // Get fixture type from the DOM
    const fixtureItem = document.querySelector(`.fixture-item[data-fixture-id="${fixtureId}"]`);
    const fixtureType = fixtureItem ? fixtureItem.textContent.trim() : 'Unknown Fixture';
    
    // Create fixture with position and properties
    const fixture = new FixtureElement({
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
 * Load a fixture from saved data
 * @param {Object} fixtureData - Serialized fixture data
 * @return {FixtureElement} The loaded fixture
 */
export function loadFixture(fixtureData) {
    const fixture = new FixtureElement({
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

export default FixtureElement;