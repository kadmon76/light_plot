// File: designer/static/designer/js/elements/fixture-element.js

/**
 * Fixture Element Module
 * 
 * Implements a theatrical lighting fixture using the base element architecture
 * with composable behaviors.
 */

 import BaseElement from './base-element.js';
 import behaviorManager from '../behaviors/behavior-manager.js';
 import { getState } from '../core/state.js';
 import { createTextElement } from '../utils/svg-utils.js';
 
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
         // Generate unique ID if not provided
         const fixtureId = options.id || `fixture-${Date.now()}`;
         
         // Prepare fixture-specific properties
         const fixtureProps = {
             channel: options.properties?.channel || '1',
             dimmer: options.properties?.dimmer || '',
             color: options.properties?.color || '#0066cc',
             purpose: options.properties?.purpose || '',
             notes: options.properties?.notes || '',
             rotation: options.properties?.rotation || 0,
             fixtureType: options.properties?.fixtureType || 'channel'
             
         };
         
         // Initialize base element with these properties
         super({
             id: fixtureId,
             type: 'fixture',
             properties: fixtureProps,
             svgElement: options.svgElement
         });
         
         console.log(`FixtureElement: Created new fixture with ID ${fixtureId}`);
         
         // Add to fixtures group if no parent element
         if (!options.svgElement) {
             const fixturesGroup = getState('fixturesGroup');
             if (fixturesGroup) {
                 fixturesGroup.add(this._svgElement);
             }
         }
         
         // Apply default behaviors
         this._applyBehaviors(options.behaviors || ['selectable', 'draggable', 'lockable', 'rotatable']);
         
         // Listen to property changes to update visual representation
         this.on('property:change', this._handlePropertyChange.bind(this));
     }
     
     /**
      * Initialize the fixture element
      * @protected
      */
     _initElement() {
         console.log(`FixtureElement: Initializing element ${this.id()}`);
         
         // Create the fixture circle
         this._svgElement.circle(30)
             .fill(this.prop('color'))
             .center(0, 0);
             
         // Add channel indicator circle
         this._svgElement.circle(16)
             .fill('white')
             .center(0, 0);
             
         // Add channel number
         createTextElement(this.prop('channel'), this._svgElement, {
             center: [0, 0],
             font: {
                 size: 12,
                 family: 'Arial',
                 weight: 'bold',
                 anchor: 'middle'
             }
         });
         
         // Apply initial rotation if specified
         const rotation = this.prop('rotation');
         if (rotation) {
             this._svgElement.rotate(rotation);
         }
         
         console.log(`FixtureElement: Element ${this.id()} initialized`);
     }
     
     /**
      * Handle property changes
      * @param {Object} event - Property change event
      * @private
      */
     _handlePropertyChange(event) {
         const { key, value } = event;
         
         console.log(`FixtureElement: Property '${key}' changed to '${value}' for fixture ${this.id()}`);
         
         // Update visual representation based on property changes
         switch (key) {
             case 'channel':
                 this._updateChannelDisplay();
                 break;
             case 'color':
                 this._updateColor();
                 break;
             case 'rotation':
                 // Rotation is handled by the rotatable behavior
                 break;
         }
     }
     
     /**
      * Apply behaviors to the fixture
      * @param {Array<String|Object>} behaviors - Behaviors to apply
      * @private
      */
     _applyBehaviors(behaviors) {
         console.log(`FixtureElement: Applying behaviors to fixture ${this.id()}`);
         
         behaviorManager.applyBehaviors(this, behaviors);
         
         console.log(`FixtureElement: Applied behaviors to fixture ${this.id()}`);
     }
     
     /**
      * Update the channel display
      * @private
      */
    _updateChannelDisplay() {
        const channel = this.prop('channel');
        console.log(`FixtureElement: Updating channel display to ${channel} for fixture ${this.id()}`);
        
        const textElement = this._svgElement.findOne('text');
        if (textElement) {
            textElement.text(channel.toString());
        }
    }
     
     /**
      * Update the fixture's color
      * @private
      */
     _updateColor() {
         const color = this.prop('color');
         console.log(`FixtureElement: Updating color to ${color} for fixture ${this.id()}`);
         
         const circleElement = this._svgElement.find('circle')[0];
         if (circleElement) {
             circleElement.fill(color);
         }
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
             fixture_type: this.prop('fixtureType'),
             channel: this.prop('channel'),
             dimmer: this.prop('dimmer'),
             color: this.prop('color'),
             purpose: this.prop('purpose'),
             notes: this.prop('notes'),
             rotation: this.prop('rotation')
         };
     }
 }
 
 export default FixtureElement;
 
 /**
  * Create a fixture from configuration
  * @param {String} fixtureType - Type of fixture
  * @param {Number} x - X position
  * @param {Number} y - Y position
  * @param {Object} properties - Additional properties
  * @return {FixtureElement} Created fixture
  */
 export function createFixture(fixtureType, x, y, properties = {}) {
     console.log(`Creating fixture of type '${fixtureType}' at position (${x}, ${y})`);
     
     const fixture = new FixtureElement({
         properties: {
             ...properties,
             fixtureType
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