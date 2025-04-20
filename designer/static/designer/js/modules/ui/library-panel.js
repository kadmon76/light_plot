// File: designer/static/designer/js/modules/ui/library-panel.js

/**
 * Library Panel Module
 * 
 * Manages element library interactions for all element types (fixtures, pipes, etc.)
 * Handles selection, preview, and placement of library elements.
 */

 import { draw, currentTool, setActiveTool, getCanvasPoint, fixturesGroup, pipesGroup } from '../core.js';
 import elementFactory from '../types/element-factory.js';
 import elementRegistry from '../elements/element-registry.js';
 
 /**
  * LibraryPanel class
  * Manages the library panel UI and interactions
  */
 export class LibraryPanel {
     /**
      * Create a new LibraryPanel
      * @param {Object} options - Configuration options
      */
     constructor(options = {}) {
         this._options = {
             fixtureSelector: '.fixture-item',
             pipeSelector: '.pipe-item',
             ...options
         };
         
         this._previewElement = null;
         this._selectedItemId = null;
         this._selectedItemType = null;
         
         // Initialize panel
         this._initialize();
     }
     
     /**
      * Initialize library panel
      * @private
      */
     _initialize() {
         // Set up fixture library interactions
         this._setupFixtureLibrary();
         
         // Set up pipe library interactions
         this._setupPipeLibrary();
         
         // Set up canvas events for element placement
         this._setupCanvasEvents();
         
         console.log('Library panel initialized');
     }
     
     /**
      * Set up fixture library interactions
      * @private
      */
     _setupFixtureLibrary() {
         const fixtureItems = document.querySelectorAll(this._options.fixtureSelector);
         
         fixtureItems.forEach(item => {
             item.addEventListener('click', () => {
                 const fixtureId = item.getAttribute('data-fixture-id');
                 
                 // Highlight the selected fixture in the list
                 fixtureItems.forEach(fi => fi.classList.remove('selected'));
                 item.classList.add('selected');
                 
                 // Store selected fixture info
                 this._selectedItemId = fixtureId;
                 this._selectedItemType = 'fixture';
                 
                 // Switch to add-fixture tool
                 if (currentTool !== 'add-fixture') {
                     setActiveTool('add-fixture');
                 }
                 
                 console.log(`Selected fixture: ${fixtureId}`);
             });
         });
     }
     
     /**
      * Set up pipe library interactions
      * @private
      */
     _setupPipeLibrary() {
         const pipeItems = document.querySelectorAll(this._options.pipeSelector);
         
         pipeItems.forEach(item => {
             // Handle pipe item click
             item.addEventListener('click', (event) => {
                 // Check if the click was on an action button
                 if (event.target.closest('.pipe-actions')) {
                     // Don't select the pipe if clicking on action buttons
                     return;
                 }
                 
                 const pipeId = item.getAttribute('data-pipe-id');
                 
                 // Highlight the selected pipe in the list
                 pipeItems.forEach(pi => pi.classList.remove('selected'));
                 item.classList.add('selected');
                 
                 // Store selected pipe info
                 this._selectedItemId = pipeId;
                 this._selectedItemType = 'pipe';
                 
                 // Switch to add-fixture tool
                 if (currentTool !== 'add-fixture') {
                     setActiveTool('add-fixture');
                 }
                 
                 console.log(`Selected pipe: ${pipeId}`);
             });
             
             // Set up place button
             const placeBtn = item.querySelector('.pipe-actions .btn-outline-primary');
             if (placeBtn) {
                 placeBtn.addEventListener('click', (e) => {
                     e.stopPropagation();
                     
                     // Store selected pipe info
                     this._selectedItemId = item.getAttribute('data-pipe-id');
                     this._selectedItemType = 'pipe';
                     
                     // Switch to add-fixture tool
                     if (currentTool !== 'add-fixture') {
                         setActiveTool('add-fixture');
                     }
                     
                     console.log(`Selected pipe for placement: ${this._selectedItemId}`);
                 });
             }
         });
     }
     
     /**
      * Set up canvas events for element placement
      * @private
      */
     _setupCanvasEvents() {
         const canvas = document.getElementById('canvas');
         
         // Preview element position during mousemove
         canvas.addEventListener('mousemove', (event) => {
             if (currentTool === 'add-fixture' && this._selectedItemId) {
                 // Convert mouse position to SVG coordinates
                 const point = getCanvasPoint(event);
                 
                 // Show placement preview
                 this._showPlacementPreview(point.x, point.y);
             }
         });
         
         // Place element on click
         canvas.addEventListener('click', (event) => {
             if (currentTool === 'add-fixture' && this._selectedItemId) {
                 // Convert mouse position to SVG coordinates
                 const point = getCanvasPoint(event);
                 
                 // Place element at this position
                 this._placeElement(point.x, point.y);
                 
                 // Remove preview after placement
                 this._removePlacementPreview();
                 
                 // Switch back to select tool
                 setActiveTool('select');
             }
         });
         
         // Remove preview when leaving canvas or changing tool
         canvas.addEventListener('mouseleave', () => {
             this._removePlacementPreview();
         });
         
         // Listen for tool changes
         document.addEventListener('toolChange', (event) => {
             if (event.detail.tool !== 'add-fixture') {
                 this._removePlacementPreview();
             }
         });
     }
     
     /**
      * Show placement preview
      * @param {Number} x - X coordinate
      * @param {Number} y - Y coordinate
      * @private
      */
     _showPlacementPreview(x, y) {
         // Remove existing preview
         this._removePlacementPreview();
         
         if (!this._selectedItemId || !this._selectedItemType) {
             return;
         }
         
         // Create preview based on element type
         switch (this._selectedItemType) {
             case 'fixture':
                 this._showFixturePreview(this._selectedItemId, x, y);
                 break;
             case 'pipe':
                 this._showPipePreview(this._selectedItemId, x, y);
                 break;
         }
     }
     
     /**
      * Show fixture placement preview
      * @param {String} fixtureId - Fixture ID
      * @param {Number} x - X coordinate
      * @param {Number} y - Y coordinate
      * @private
      */
     _showFixturePreview(fixtureId, x, y) {
         // Get fixture type from the DOM
         const fixtureItem = document.querySelector(`.fixture-item[data-fixture-id="${fixtureId}"]`);
         const fixtureType = fixtureItem ? fixtureItem.textContent.trim() : 'Unknown Fixture';
         
         // Create preview group
         this._previewElement = draw.group().addClass('placement-preview');
         
         // For now, use a simple circle as preview
         // In the future, this could use the actual fixture SVG
         this._previewElement.circle(30)
             .fill('rgba(0, 150, 255, 0.5)')
             .stroke({ width: 1, color: '#0066cc', dasharray: '5,5' })
             .center(x, y);
             
         // Add a label with fixture type
         this._previewElement.text(fixtureType)
             .font({ size: 10, family: 'Arial' })
             .center(x, y + 25);
     }
     
     /**
      * Show pipe placement preview
      * @param {String} pipeId - Pipe ID
      * @param {Number} x - X coordinate
      * @param {Number} y - Y coordinate
      * @private
      */
     _showPipePreview(pipeId, x, y) {
         // Get pipe data from the DOM
         const pipeItem = document.querySelector(`.pipe-item[data-pipe-id="${pipeId}"]`);
         if (!pipeItem) return;
         
         const pipeName = pipeItem.querySelector('strong')?.textContent || 'Unnamed Pipe';
         const pipeType = pipeItem.dataset.pipeType || 'pipe';
         const pipeLength = parseFloat(pipeItem.dataset.pipeLength) || 10;
         const pipeColor = pipeItem.dataset.pipeColor || '#666666';
         
         // Create preview group
         this._previewElement = draw.group().addClass('placement-preview');
         
         // Calculate pipe dimensions
         const pipeWidthPx = pipeLength * 10; // Simplified calculation for preview
         const pipeHeightPx = pipeType === 'truss' ? 15 : 8;
         
         // Create pipe preview
         this._previewElement.rect(pipeWidthPx, pipeHeightPx)
             .fill(`${pipeColor}88`) // Add transparency
             .stroke({ width: 1, color: '#0066cc', dasharray: '5,5' })
             .move(x - pipeWidthPx/2, y - pipeHeightPx/2);
             
         // Add a label with pipe name
         this._previewElement.text(pipeName)
             .font({ size: 10, family: 'Arial' })
             .center(x, y - 15);
     }
     
     /**
      * Remove placement preview
      * @private
      */
     _removePlacementPreview() {
         if (this._previewElement) {
             this._previewElement.remove();
             this._previewElement = null;
         }
     }
     
     /**
      * Place element at a specific position
      * @param {Number} x - X coordinate
      * @param {Number} y - Y coordinate
      * @private
      */
     _placeElement(x, y) {
         if (!this._selectedItemId || !this._selectedItemType) {
             return;
         }
         
         // Place element based on type
         switch (this._selectedItemType) {
             case 'fixture':
                 this._placeFixture(this._selectedItemId, x, y);
                 break;
             case 'pipe':
                 this._placePipe(this._selectedItemId, x, y);
                 break;
         }
     }
     
     /**
      * Place a fixture on the canvas
      * @param {String} fixtureId - Fixture ID
      * @param {Number} x - X coordinate
      * @param {Number} y - Y coordinate
      * @private
      */
     _placeFixture(fixtureId, x, y) {
         // Use element factory to create the fixture
         const fixture = elementFactory.createFixture(fixtureId, x, y);
         
         console.log(`Placed fixture ${fixtureId} at position ${x},${y}`);
     }
     
     /**
      * Place a pipe on the canvas
      * @param {String} pipeId - Pipe ID
      * @param {Number} x - X coordinate
      * @param {Number} y - Y coordinate
      * @private
      */
     _placePipe(pipeId, x, y) {
         // Get pipe data from the DOM
         const pipeItem = document.querySelector(`.pipe-item[data-pipe-id="${pipeId}"]`);
         if (!pipeItem) return;
         
         const pipeName = pipeItem.querySelector('strong')?.textContent || 'Unnamed Pipe';
         const pipeType = pipeItem.dataset.pipeType || 'pipe';
         const pipeLength = parseFloat(pipeItem.dataset.pipeLength) || 10;
         const pipeColor = pipeItem.dataset.pipeColor || '#666666';
         
         // Create pipe config
         const pipeConfig = {
             pipeId: pipeId,
             pipeName: pipeName,
             pipeType: pipeType,
             pipeLength: pipeLength,
             pipeColor: pipeColor
         };
         
         // Use element factory to create the pipe
         const pipe = elementFactory.createPipe(pipeConfig, x, y);
         
         console.log(`Placed pipe ${pipeId} at position ${x},${y}`);
     }
 }
 
 // Create and export singleton instance
 const libraryPanel = new LibraryPanel();
 export default libraryPanel;