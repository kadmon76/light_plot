// File: designer/static/designer/js/ui/libraries.js

/**
 * Libraries Module
 * 
 * Handles the fixture and pipe library panels.
 */

 import { getState, setCurrentTool } from '../core/state.js';
 import { TOOLS } from '../core/config.js';
 import { createFixture } from '../elements/fixture-element.js';
 import { createPipe } from '../elements/pipe-element.js';
 import { getCanvasPoint } from '../utils/svg-utils.js';
 
 /**
  * Initialize library panels
  */
 export function initLibraries() {
     console.log('Libraries: Initializing library panels');
     
     // Set up fixture library
     setupFixtureLibrary();
     
     // Set up pipe library
     setupPipeLibrary();
     
     // Set up canvas click for placing elements
     setupCanvasPlacement();
     
     console.log('Libraries: Library panels initialized');
 }
 

/**
 * Get the current addressing system from the dropdown
 * @return {String} 'unified' or 'families'
 */
 function getAddressingSystem() {
    const addressingSelect = document.getElementById('addressing-system');
    return addressingSelect ? addressingSelect.value : 'unified';
}

 /**
  * Set up fixture library
  */
 function setupFixtureLibrary() {
     console.log('Libraries: Setting up fixture library');
     
     // Get all fixture items
     const fixtureItems = document.querySelectorAll('.fixture-item');
     
     // Add click handler to select fixture type
     fixtureItems.forEach(item => {
         item.addEventListener('click', () => {
             // Get fixture type info from data attributes
             const fixtureId = item.dataset.fixtureId;
             const fixtureType = item.dataset.fixtureType;
             
             if (!fixtureId) {
                 console.error('Libraries: Fixture item missing data-fixture-id attribute');
                 return;
             }
             
             console.log(`Libraries: Selected fixture type ${fixtureType} (ID: ${fixtureId})`);
             
             // Remove selection from all items
             fixtureItems.forEach(fi => fi.classList.remove('selected'));
             
             // Add selection to clicked item
             item.classList.add('selected');
             
             // Store fixture type for placement
             window._selectedLibraryItem = {
                 type: 'fixture',
                 id: fixtureId,
                 fixtureType: getAddressingSystem() === 'families' ? 'channel' : 'fixture', // Default to channel for families
                 channel: item.dataset.channel || '1',
                 color: item.dataset.color || '#0066cc'
             };
             
             // Switch to add fixture tool
             setCurrentTool(TOOLS.ADD_FIXTURE);
         });
     });
 }
 
 /**
  * Set up pipe library
  */
 function setupPipeLibrary() {
     console.log('Libraries: Setting up pipe library');
     
     // Set up pipe form submission
     const addPipeBtn = document.getElementById('add-pipe-btn');
     if (addPipeBtn) {
         addPipeBtn.addEventListener('click', () => {
             const pipeName = document.getElementById('pipe-form-name')?.value || 'Unnamed Pipe';
             const pipeType = document.getElementById('pipe-form-type')?.value || 'pipe';
             const pipeLength = parseFloat(document.getElementById('pipe-form-length')?.value) || 10;
             const pipeColor = document.getElementById('pipe-form-color')?.value || '#666666';
             
             console.log(`Libraries: Adding pipe ${pipeName} (${pipeType}, ${pipeLength}m, ${pipeColor})`);
             
             // Add pipe to list
             addPipeToList(pipeName, pipeType, pipeLength, pipeColor);
         });
     }
 }
 
 /**
  * Add pipe to the list
  * @param {String} name - Pipe name
  * @param {String} type - Pipe type
  * @param {Number} length - Pipe length in meters
  * @param {String} color - Pipe color
  */
 function addPipeToList(name, type, length, color) {
     const pipesList = document.getElementById('pipes-list');
     if (!pipesList) {
         console.error('Libraries: Pipes list not found');
         return;
     }
     
     // Clear "no pipes" message if present
     if (pipesList.querySelector('p.text-muted')) {
         pipesList.innerHTML = '';
     }
     
     // Generate unique ID for pipe template
     const pipeId = `pipe-template-${Date.now()}`;
     
     // Create pipe item
     const pipeItem = document.createElement('div');
     pipeItem.className = 'pipe-item';
     pipeItem.dataset.pipeId = pipeId;
     pipeItem.dataset.pipeType = type;
     pipeItem.dataset.pipeLength = length;
     pipeItem.dataset.pipeColor = color;
     
     // Create pipe preview visual
     const pipePreview = document.createElement('div');
     pipePreview.className = 'pipe-preview';
     pipePreview.style.backgroundColor = color;
     pipePreview.style.width = `${Math.min(length * 6, 60)}px`;
     
     // Truss styling
     if (type === 'truss') {
         pipePreview.style.height = '12px';
         pipePreview.style.backgroundImage = 'repeating-linear-gradient(90deg, transparent, transparent 5px, rgba(255,255,255,0.2) 5px, rgba(255,255,255,0.2) 10px)';
     }
     
     // Add item content
     pipeItem.innerHTML = `
         <div class="d-flex align-items-center">
             <div class="pipe-preview" style="background-color: ${color}; width: ${Math.min(length * 6, 60)}px;"></div>
             <div>
                 <strong>${name}</strong>
                 <div class="small text-muted">${type}, ${length}m</div>
             </div>
         </div>
         <div class="pipe-actions">
             <button class="btn btn-sm btn-outline-primary place-pipe-btn">Place</button>
             <button class="btn btn-sm btn-outline-danger remove-pipe-btn">×</button>
         </div>
     `;
     
     // Replace preview div with the styled one
     pipeItem.querySelector('.pipe-preview').replaceWith(pipePreview);
     
     // Add to pipes list
     pipesList.appendChild(pipeItem);
     
     // Add click handler to select pipe
     pipeItem.addEventListener('click', (event) => {
         // Skip if clicking on a button
         if (event.target.tagName === 'BUTTON') return;
         
         // Remove selection from all items
         document.querySelectorAll('.pipe-item').forEach(pi => pi.classList.remove('selected'));
         
         // Add selection to clicked item
         pipeItem.classList.add('selected');
         
         // Store pipe type for placement
         window._selectedLibraryItem = {
             type: 'pipe',
             id: pipeId,
             pipeType: type,
             pipeName: name,
             pipeLength: length,
             pipeColor: color
         };
         
         // Switch to add fixture tool
         setCurrentTool(TOOLS.ADD_FIXTURE);
         
         console.log(`Libraries: Selected pipe ${name} for placement`);
     });
     
     // Add place button handler
     const placeBtn = pipeItem.querySelector('.place-pipe-btn');
     if (placeBtn) {
         placeBtn.addEventListener('click', (event) => {
             event.stopPropagation();
             
             // Store pipe type for placement
             window._selectedLibraryItem = {
                 type: 'pipe',
                 id: pipeId,
                 pipeType: type,
                 pipeName: name,
                 pipeLength: length,
                 pipeColor: color
             };
             
             // Switch to add fixture tool
             setCurrentTool(TOOLS.ADD_FIXTURE);
             
             console.log(`Libraries: Selected pipe ${name} for placement via button`);
         });
     }
     
     // Add remove button handler
     const removeBtn = pipeItem.querySelector('.remove-pipe-btn');
     if (removeBtn) {
         removeBtn.addEventListener('click', (event) => {
             event.stopPropagation();
             pipeItem.remove();
             
             // If no pipes left, show message
             if (pipesList.children.length === 0) {
                 pipesList.innerHTML = '<p class="text-muted small">No pipes or trusses added yet. Use the form above to add one.</p>';
             }
             
             console.log(`Libraries: Removed pipe ${name}`);
         });
     }
     
     console.log(`Libraries: Added pipe ${name} to list`);
 }
 
 /**
  * Set up canvas click for placing elements
  */
 function setupCanvasPlacement() {
     console.log('Libraries: Setting up canvas placement');
     
     const canvas = document.getElementById('canvas');
     if (!canvas) {
         console.error('Libraries: Canvas element not found');
         return;
     }
     
     // Listen for clicks on canvas
     canvas.addEventListener('click', (event) => {
         const currentTool = getState('currentTool');
         
         // Only handle direct clicks when add fixture tool is active
         if (
             currentTool === TOOLS.ADD_FIXTURE && 
             window._selectedLibraryItem &&
             (event.target.id === 'canvas' || event.target.tagName === 'svg')
         ) {
             // Get canvas point
             const point = getCanvasPoint(event);
             
             // Place element at this position
             placeElement(window._selectedLibraryItem, point.x, point.y);
         }
     });
 }
 
 /**
  * Place element at position
  * @param {Object} item - Library item information
  * @param {Number} x - X position
  * @param {Number} y - Y position
  */
 function placeElement(item, x, y) {
     console.log(`Libraries: Placing ${item.type} at position (${x}, ${y})`);
     
     if (item.type === 'fixture') {
         // Create fixture at position
        const properties = {
            channel: item.channel,
            color: item.color,
            fixtureType: item.fixtureType
        };
         
        createFixture(item.fixtureType, x, y, properties);
         // Lock the addressing system after the first fixture is added
        lockAddressingSystem(true);
     } else if (item.type === 'pipe') {
         // Create pipe at position
         const properties = {
             pipeName: item.pipeName,
             pipeType: item.pipeType,
             pipeLength: item.pipeLength,
             pipeColor: item.pipeColor
         };
         
         createPipe(item.pipeType, x, y, properties);
     }
 }
 
 export default {
     initLibraries
 };






/**
 * Lock or unlock the addressing system dropdown
 * @param {Boolean} locked - Whether to lock the dropdown
 */
 function lockAddressingSystem(locked) {
    const addressingSelect = document.getElementById('addressing-system');
    if (addressingSelect) {
        addressingSelect.disabled = locked;
        
        // Add a tooltip explaining why it's locked if locked
        if (locked) {
            addressingSelect.title = "Addressing system cannot be changed after fixtures are added";
            
            // Optional: Add a small lock icon next to the dropdown
            const lockIcon = document.createElement('i');
            lockIcon.className = 'bi bi-lock-fill ms-2';
            lockIcon.style.fontSize = '12px';
            const parent = addressingSelect.parentElement;
            if (parent && !parent.querySelector('.lock-icon')) {
                lockIcon.classList.add('lock-icon');
                parent.appendChild(lockIcon);
            }
        } else {
            addressingSelect.title = "";
            const lockIcon = addressingSelect.parentElement?.querySelector('.lock-icon');
            if (lockIcon) lockIcon.remove();
        }
    }
}

export { lockAddressingSystem };