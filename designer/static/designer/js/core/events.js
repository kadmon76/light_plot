// File: designer/static/designer/js/core/events.js

/**
 * Events Module
 * 
 * Sets up global event listeners for the application.
 */

 import { getState, selectElement } from './state.js';
 import { TOOLS } from './config.js';
 
 /**
  * Set up global event listeners
  */
 export function setupEventListeners() {
     console.log('Events: Setting up global event listeners');
     
     // Canvas click for selection clearing
     setupCanvasClickListener();
     
     // Keyboard shortcuts
     setupKeyboardShortcuts();
     
     console.log('Events: Global event listeners set up');
 }
 
 /**
  * Set up canvas click listener for clearing selection
  */
 function setupCanvasClickListener() {
     const canvas = document.getElementById('canvas');
     if (!canvas) {
         console.error('Events: Canvas element not found');
         return;
     }
     
     // Listen for clicks on canvas background
     canvas.addEventListener('click', (event) => {
         // Only handle direct clicks on the canvas or SVG element
         if (event.target.id === 'canvas' || event.target.tagName === 'svg') {
             console.log('Events: Canvas background clicked, clearing selection');
             selectElement(null);
         }
     });
 }
 
 /**
  * Set up keyboard shortcuts
  */
 function setupKeyboardShortcuts() {
     document.addEventListener('keydown', (event) => {
         // Escape key - switch to select tool
         if (event.key === 'Escape') {
             console.log('Events: Escape key pressed, switching to select tool');
             const currentTool = getState('currentTool');
             if (currentTool !== TOOLS.SELECT) {
                 setCurrentTool(TOOLS.SELECT);
             }
         }
         
         // Delete key - delete selected element
         if (event.key === 'Delete' || event.key === 'Backspace') {
             const selectedElement = getState('selectedElement');
             if (selectedElement) {
                 console.log(`Events: Delete key pressed, removing element ${selectedElement.id()}`);
                 selectedElement.remove();
                 selectElement(null);
             }
         }
     });
 }