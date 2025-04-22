// File: designer/static/designer/js/ui/property-panel.js

/**
 * Property Panel Module
 * 
 * Handles the property panel for editing element properties.
 */

 import { getState } from '../core/state.js';

 /**
  * Initialize property panel
  */
 export function initPropertyPanel() {
     console.log('PropertyPanel: Initializing property panel');
     
     // Set up event listeners for element selection
     setupSelectionListener();
     
     // Set up property change handlers
     setupPropertyChangeHandlers();
     
     console.log('PropertyPanel: Property panel initialized');
 }
 
 /**
  * Set up listener for element selection
  */
 function setupSelectionListener() {
     // Listen for selection changes in the application state
     document.addEventListener('selection:change', (event) => {
         const element = event.element;
         
         if (element) {
             console.log(`PropertyPanel: Element selected, type: ${element.type()}, id: ${element.id()}`);
             showPropertiesForElement(element);
         } else {
             console.log('PropertyPanel: No element selected, hiding property panels');
             hideAllPropertyPanels();
         }
     });
 }
 
 /**
  * Show properties for a specific element
  * @param {BaseElement} element - Element to show properties for
  */
 function showPropertiesForElement(element) {
     // Hide all property panels first
     hideAllPropertyPanels();
     
     // Show the appropriate panel based on element type
     if (element.type() === 'fixture') {
         showFixtureProperties(element);
     } else if (element.type() === 'pipe') {
         showPipeProperties(element);
     }
 }
 
 /**
  * Hide all property panels
  */
 function hideAllPropertyPanels() {
     const fixturePanel = document.getElementById('fixture-properties');
     const pipePanel = document.getElementById('pipe-properties');
     
     if (fixturePanel) fixturePanel.style.display = 'none';
     if (pipePanel) pipePanel.style.display = 'none';
 }
 
 /**
  * Show fixture properties
  * @param {FixtureElement} fixture - Fixture element
  */
 function showFixtureProperties(fixture) {
     console.log(`PropertyPanel: Showing properties for fixture ${fixture.id()}`);
     
     const propertiesPanel = document.getElementById('fixture-properties');
     if (!propertiesPanel) {
         console.error('PropertyPanel: Fixture properties panel not found');
         return;
     }
     
     // Show the panel
     propertiesPanel.style.display = 'block';
     
     // Make sure properties tab is active
     activatePropertiesTab();
     
     // Get fixture properties
     const channel = fixture.prop('channel');
     const dimmer = fixture.prop('dimmer');
     const color = fixture.prop('color');
     const purpose = fixture.prop('purpose');
     const notes = fixture.prop('notes');
     const isLocked = fixture.isLocked();
     
     // Set form values
     const channelInput = document.getElementById('channel');
     const dimmerInput = document.getElementById('dimmer');
     const colorInput = document.getElementById('color');
     const purposeInput = document.getElementById('purpose');
     const notesInput = document.getElementById('notes');
     const lockedCheckbox = document.getElementById('fixture-locked');
     
     if (channelInput) channelInput.value = channel;
     if (dimmerInput) dimmerInput.value = dimmer;
     if (colorInput) colorInput.value = color;
     if (purposeInput) purposeInput.value = purpose;
     if (notesInput) notesInput.value = notes;
     if (lockedCheckbox) lockedCheckbox.checked = isLocked;
     
     // Store reference to fixture in panel
     propertiesPanel.dataset.elementId = fixture.id();
     
     console.log(`PropertyPanel: Fixture properties loaded for ${fixture.id()}`);
 }
 
 /**
  * Show pipe properties
  * @param {PipeElement} pipe - Pipe element
  */
 function showPipeProperties(pipe) {
     console.log(`PropertyPanel: Showing properties for pipe ${pipe.id()}`);
     
     const propertiesPanel = document.getElementById('pipe-properties');
     if (!propertiesPanel) {
         console.error('PropertyPanel: Pipe properties panel not found');
         return;
     }
     
     // Show the panel
     propertiesPanel.style.display = 'block';
     
     // Make sure properties tab is active
     activatePropertiesTab();
     
     // Get pipe properties
     const pipeName = pipe.prop('pipeName');
     const pipeLength = pipe.prop('pipeLength');
     const pipeColor = pipe.prop('pipeColor');
     const isLocked = pipe.isLocked();
     
     // Set form values
     const nameInput = document.getElementById('pipe-name');
     const lengthInput = document.getElementById('pipe-length');
     const colorSelect = document.getElementById('pipe-color');
     const lockedCheckbox = document.getElementById('pipe-locked');
     
     if (nameInput) nameInput.value = pipeName;
     if (lengthInput) lengthInput.value = pipeLength;
     if (colorSelect) colorSelect.value = pipeColor;
     if (lockedCheckbox) lockedCheckbox.checked = isLocked;
     
     // Store reference to pipe in panel
     propertiesPanel.dataset.elementId = pipe.id();
     
     console.log(`PropertyPanel: Pipe properties loaded for ${pipe.id()}`);
 }
 
 /**
  * Activate the properties tab
  */
 function activatePropertiesTab() {
     const propertiesTab = document.getElementById('properties-tab');
     if (propertiesTab) {
         const tabInstance = new bootstrap.Tab(propertiesTab);
         tabInstance.show();
     }
 }
 
 /**
  * Set up property change handlers
  */
 function setupPropertyChangeHandlers() {
     // Fixture property handlers
     setupFixturePropertyHandlers();
     
     // Pipe property handlers
     setupPipePropertyHandlers();
 }
 
 /**
  * Set up fixture property change handlers
  */
 function setupFixturePropertyHandlers() {
     // Channel
     const channelInput = document.getElementById('channel');
     if (channelInput) {
         channelInput.addEventListener('change', () => {
             updateFixtureProperty('channel', channelInput.value);
         });
     }
     
     // Dimmer
     const dimmerInput = document.getElementById('dimmer');
     if (dimmerInput) {
         dimmerInput.addEventListener('change', () => {
             updateFixtureProperty('dimmer', dimmerInput.value);
         });
     }
     
     // Color
     const colorInput = document.getElementById('color');
     if (colorInput) {
         colorInput.addEventListener('change', () => {
             updateFixtureProperty('color', colorInput.value);
         });
     }
     
     // Purpose
     const purposeInput = document.getElementById('purpose');
     if (purposeInput) {
         purposeInput.addEventListener('change', () => {
             updateFixtureProperty('purpose', purposeInput.value);
         });
     }
     
     // Notes
     const notesInput = document.getElementById('notes');
     if (notesInput) {
         notesInput.addEventListener('change', () => {
             updateFixtureProperty('notes', notesInput.value);
         });
     }
     
     // Locked
     const lockedCheckbox = document.getElementById('fixture-locked');
     if (lockedCheckbox) {
         lockedCheckbox.addEventListener('change', () => {
             toggleFixtureLock(lockedCheckbox.checked);
         });
     }
 }
 
 /**
  * Set up pipe property change handlers
  */
 function setupPipePropertyHandlers() {
     // Pipe name
     const nameInput = document.getElementById('pipe-name');
     if (nameInput) {
         nameInput.addEventListener('change', () => {
             updatePipeProperty('pipeName', nameInput.value);
         });
     }
     
     // Pipe length
     const lengthInput = document.getElementById('pipe-length');
     if (lengthInput) {
         lengthInput.addEventListener('change', () => {
             updatePipeProperty('pipeLength', parseFloat(lengthInput.value) || 10);
         });
     }
     
     // Pipe color
     const colorSelect = document.getElementById('pipe-color');
     if (colorSelect) {
         colorSelect.addEventListener('change', () => {
             updatePipeProperty('pipeColor', colorSelect.value);
         });
     }
     
     // Locked
     const lockedCheckbox = document.getElementById('pipe-locked');
     if (lockedCheckbox) {
         lockedCheckbox.addEventListener('change', () => {
             togglePipeLock(lockedCheckbox.checked);
         });
     }
     
     // Apply button
     const applyButton = document.getElementById('apply-pipe-properties');
     if (applyButton) {
         applyButton.addEventListener('click', () => {
             const propertiesPanel = document.getElementById('pipe-properties');
             if (propertiesPanel && propertiesPanel.dataset.elementId) {
                 console.log(`PropertyPanel: Applying all pipe properties for ${propertiesPanel.dataset.elementId}`);
                 
                 // Show a temporary success message
                 const statusElement = document.getElementById('pipe-update-status');
                 if (statusElement) {
                     statusElement.textContent = 'Properties updated successfully';
                     statusElement.className = 'mt-2 small text-success';
                     statusElement.style.display = 'block';
                     
                     // Hide after 3 seconds
                     setTimeout(() => {
                         statusElement.style.display = 'none';
                     }, 3000);
                 }
             }
         });
     }
 }
 
 /**
  * Update a fixture property
  * @param {String} property - Property name
  * @param {*} value - Property value
  */
 function updateFixtureProperty(property, value) {
     const propertiesPanel = document.getElementById('fixture-properties');
     if (!propertiesPanel || !propertiesPanel.dataset.elementId) {
         console.error('PropertyPanel: No fixture selected');
         return;
     }
     
     const elementId = propertiesPanel.dataset.elementId;
     console.log(`PropertyPanel: Updating fixture property ${property}=${value} for ${elementId}`);
     
     // Find the element
     const element = findElementById(elementId);
     if (!element) {
         console.error(`PropertyPanel: Fixture with ID ${elementId} not found`);
         return;
     }
     
     // Update property
     element.prop(property, value);
 }
 
 /**
  * Toggle fixture lock state
  * @param {Boolean} locked - Whether to lock the fixture
  */
 function toggleFixtureLock(locked) {
     const propertiesPanel = document.getElementById('fixture-properties');
     if (!propertiesPanel || !propertiesPanel.dataset.elementId) {
         console.error('PropertyPanel: No fixture selected');
         return;
     }
     
     const elementId = propertiesPanel.dataset.elementId;
     console.log(`PropertyPanel: Setting fixture lock state to ${locked} for ${elementId}`);
     
     // Find the element
     const element = findElementById(elementId);
     if (!element) {
         console.error(`PropertyPanel: Fixture with ID ${elementId} not found`);
         return;
     }
     
     // Update lock state
     element.lock(locked);
 }
 
 /**
  * Update a pipe property
  * @param {String} property - Property name
  * @param {*} value - Property value
  */
 function updatePipeProperty(property, value) {
     const propertiesPanel = document.getElementById('pipe-properties');
     if (!propertiesPanel || !propertiesPanel.dataset.elementId) {
         console.error('PropertyPanel: No pipe selected');
         return;
     }
     
     const elementId = propertiesPanel.dataset.elementId;
     console.log(`PropertyPanel: Updating pipe property ${property}=${value} for ${elementId}`);
     
     // Find the element
     const element = findElementById(elementId);
     if (!element) {
         console.error(`PropertyPanel: Pipe with ID ${elementId} not found`);
         return;
     }
     
     // Update property
     element.prop(property, value);
 }
 
 /**
  * Toggle pipe lock state
  * @param {Boolean} locked - Whether to lock the pipe
  */
 function togglePipeLock(locked) {
     const propertiesPanel = document.getElementById('pipe-properties');
     if (!propertiesPanel || !propertiesPanel.dataset.elementId) {
         console.error('PropertyPanel: No pipe selected');
         return;
     }
     
     const elementId = propertiesPanel.dataset.elementId;
     console.log(`PropertyPanel: Setting pipe lock state to ${locked} for ${elementId}`);
     
     // Find the element
     const element = findElementById(elementId);
     if (!element) {
         console.error(`PropertyPanel: Pipe with ID ${elementId} not found`);
         return;
     }
     
     // Update lock state
     element.lock(locked);
 }
 
 /**
  * Find an element by ID
  * @param {String} id - Element ID
  * @return {BaseElement|null} Element or null if not found
  */
 function findElementById(id) {
     const draw = getState('draw');
     if (!draw) return null;
     
     // Find the SVG element
     const svgElement = draw.findOne(`#${id}`);
     if (!svgElement) return null;
     
     // NOTE: In a complete implementation, we would need to maintain a registry
     // of elements to properly find them by ID. For now, we'll rely on the
     // selectedElement state.
     
     const selectedElement = getState('selectedElement');
     if (selectedElement && selectedElement.id() === id) {
         return selectedElement;
     }
     
     return null;
 }