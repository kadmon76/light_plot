// File: designer/static/designer/js/core/state.js

/**
 * Light Plot Designer - Application State
 * 
 * Manages the global state of the application.
 * Uses a simple observer pattern to notify of changes.
 */

 import { TOOLS } from './config.js';
 import { EventEmitter } from '../utils/event-emitter.js';
 
 // State change events
 const events = new EventEmitter();
 
 // State object
 const state = {
     // Canvas and viewport
     draw: null, // SVG.js drawing
     viewportInfo: {
         zoom: 1,
         pan: { x: 0, y: 0 }
     },
     
     // Element groups
     paperGroup: null,
     gridGroup: null,
     stageGroup: null,
     fohGroup: null, 
     pipesGroup: null,
     fixturesGroup: null,
     
     // Tools and selection
     currentTool: TOOLS.SELECT,
     selectedElement: null,
     
     // Counters for generating unique IDs
     pipeCounter: 1,
     fixtureCounter: 1
 };
 
 /**
  * Get a state value
  * @param {String} key - State key
  * @return {*} State value
  */
 export function getState(key) {
     return state[key];
 }
 
 /**
  * Set a state value
  * @param {String} key - State key
  * @param {*} value - New value
  */
 export function setState(key, value) {
     const oldValue = state[key];
     state[key] = value;
     
     // Emit change event
     events.emit('state:change', { key, value, oldValue });
     events.emit(`state:change:${key}`, { value, oldValue });
 }
 
 /**
  * Subscribe to state changes
  * @param {String} key - State key to watch (or 'all' for any change)
  * @param {Function} callback - Callback function
  */
 export function onStateChange(key, callback) {
     const eventName = key === 'all' ? 'state:change' : `state:change:${key}`;
     events.on(eventName, callback);
 }
 
 /**
  * Initialize SVG drawing and element groups
  * @param {SVG.Container} draw - SVG.js drawing object
  */
 export function initDrawing(draw) {
     setState('draw', draw);
     
     // Create main groups for organization
     setState('paperGroup', draw.group().id('paper-group'));
     setState('gridGroup', draw.group().id('grid-group'));
     setState('stageGroup', draw.group().id('stage-group'));
     setState('fohGroup', draw.group().id('foh-group'));
     setState('pipesGroup', draw.group().id('pipes-group'));
     setState('fixturesGroup', draw.group().id('fixtures-group'));
 }
 
 /**
  * Set the current tool
  * @param {String} tool - Tool type
  */
 export function setCurrentTool(tool) {
     if (Object.values(TOOLS).includes(tool)) {
         setState('currentTool', tool);
         
         // Emit specific tool change event
         events.emit('tool:change', { tool });
     }
 }
 
 /**
  * Select an element
  * @param {BaseElement|null} element - Element to select, or null to clear selection
  */
  export function selectElement(element) {
    console.log('State: selectElement called with:', element);
    
    const currentElement = state.selectedElement;
    
    // Deselect current element if it exists and is different
    if (currentElement && currentElement !== element && currentElement.select) {
        console.log(`State: Deselecting current element: ${currentElement.id()}`);
        currentElement.select(false);
    }
    
    // Update selected element
    setState('selectedElement', element);
    
    // Select new element if it exists
    if (element && element.select) {
        console.log(`State: Selecting new element: ${element.id()}`);
        element.select(true);
    }
    
    // Emit selection change event
    console.log('State: Emitting selection:change event');
    const event = new CustomEvent('selection:change', { detail: { element } });
    document.dispatchEvent(event);
    events.emit('selection:change', { element });
    
    console.log('State: selectElement completed');
}