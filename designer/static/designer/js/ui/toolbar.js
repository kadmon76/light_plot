// File: designer/static/designer/js/ui/toolbar.js

/**
 * Toolbar Module
 * 
 * Handles toolbar buttons and tool selection.
 */

 import { getState, setCurrentTool } from '../core/state.js';
 import { TOOLS } from '../core/config.js';
 import { zoomCanvas } from './canvas.js';
 
 /**
  * Initialize toolbar
  */
export function initToolbar() {
    console.log('Toolbar: Initializing toolbar');
     
    // Set up tool buttons
    setupToolButtons();
     
    // Set up zoom buttons
    setupZoomButtons();
     
    // Set default tool
    setCurrentTool(TOOLS.SELECT);
     
    console.log('Toolbar: Toolbar initialized');
}
 
 /**
  * Set up tool buttons
  */
function setupToolButtons() {
     // Get buttons
    const selectBtn = document.getElementById('select-tool');
    const addFixtureBtn = document.getElementById('add-fixture-tool');
    const panBtn = document.getElementById('pan-tool');
     
     // Ensure buttons exist
    if (!selectBtn || !addFixtureBtn || !panBtn) {
        console.error('Toolbar: One or more toolbar buttons not found');
        return;
    }
     
     // Set up events
    selectBtn.addEventListener('click', () => {
        console.log('Toolbar: Select tool activated');
        setCurrentTool(TOOLS.SELECT);
        updateToolButtons(TOOLS.SELECT);
    });
     
    addFixtureBtn.addEventListener('click', () => {
        console.log('Toolbar: Add fixture tool activated');
        setCurrentTool(TOOLS.ADD_FIXTURE);
        updateToolButtons(TOOLS.ADD_FIXTURE);
    });
     
    panBtn.addEventListener('click', () => {
        console.log('Toolbar: Pan tool activated');
        setCurrentTool(TOOLS.PAN);
        updateToolButtons(TOOLS.PAN);
    });
     
     // Listen for tool changes from other sources
    document.addEventListener('tool:change', (event) => {
        updateToolButtons(event.tool);
    }); 
}
 
 /**
  * Set up zoom buttons
  */
function setupZoomButtons() {
    // Get buttons
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
     
    // Ensure buttons exist
    if (!zoomInBtn || !zoomOutBtn) {
        console.error('Toolbar: Zoom buttons not found');
        return;
    }
     
     // Set up events
    zoomInBtn.addEventListener('click', () => {
        console.log('Toolbar: Zoom in');
        zoomCanvas(1.2);
    });
     
    zoomOutBtn.addEventListener('click', () => {
        console.log('Toolbar: Zoom out');
        zoomCanvas(0.8);
    });
}
 
 /**
  * Update tool buttons to reflect current tool
  * @param {String} currentTool - Current active tool
  */
function updateToolButtons(currentTool) {
    // Get all tool buttons
    const toolButtons = document.querySelectorAll('#toolbar button');
     
    // Remove active class from all buttons
    toolButtons.forEach(button => {
        button.classList.remove('active');
    });
     
     // Add active class to current tool button
    switch (currentTool) {
        case TOOLS.SELECT:
            document.getElementById('select-tool')?.classList.add('active');
            break;
        case TOOLS.ADD_FIXTURE:
            document.getElementById('add-fixture-tool')?.classList.add('active');
            break;
        case TOOLS.PAN:
            document.getElementById('pan-tool')?.classList.add('active');
            break;
    }
     
     // Update cursor style based on tool
    updateCursor(currentTool);
}
 
 /**
  * Update cursor style based on current tool
  * @param {String} tool - Current active tool
  */
function updateCursor(tool) {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
     
    switch (tool) {
        case TOOLS.SELECT:
            canvas.style.cursor = 'default';
            break;
        case TOOLS.ADD_FIXTURE:
            canvas.style.cursor = 'cell';
            break;
        case TOOLS.PAN:
            canvas.style.cursor = 'grab';
            break;
        default:
            canvas.style.cursor = 'default';
    }
}