// File: designer/static/designer/js/app.js

/**
 * Light Plot Designer - Main Application
 * 
 * Entry point that initializes the editor application.
 */

import { initCanvas } from './ui/canvas.js';
import { initToolbar } from './ui/toolbar.js';
import { initPropertyPanel } from './ui/property-panel.js';
import { initLibraries, lockAddressingSystem } from './ui/libraries.js'; 
import { setupEventListeners } from './core/events.js';
import { getState } from './core/state.js'; 
import { initFixturesModal } from './ui/fixtures-modal.js';

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check SVG.js availability
    if (typeof SVG !== 'function') {
        console.error('SVG.js library not loaded!');
        alert('Error: Required SVG.js library not loaded. Please refresh the page.');
        return;
    }
    
    // Initialize UI components
    initCanvas();
    initToolbar();
    initPropertyPanel();
    initLibraries();
    initFixturesModal();
    
    /**
     * Check if there are fixtures in the plot and lock addressing system if needed
     */
    function checkFixturesAndLockAddressing() {
        const fixturesGroup = getState('fixturesGroup');
        if (fixturesGroup && fixturesGroup.children().length > 0) {
            lockAddressingSystem(true);
        }
    } 
    
    checkFixturesAndLockAddressing();
    
    // Set up global event listeners
    setupEventListeners();
    
    console.log('Light Plot Designer initialized');
});

 


