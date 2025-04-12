/**
 * Light Plot Designer - Pipes Module
 *
 * Handles pipe/truss library, placement and manipulation
 */

import { 
    draw, 
    pipesGroup, 
    pipeCounter, 
    selectedFixtures, 
    selectedPipe,
    currentTool,
    SCALE_FACTOR,
    getCanvasPoint
} from './core.js';

// Set up pipes/trusses functionality
function setupPipesLibrary() {
    const pipesList = document.getElementById('pipes-list');
    const addPipeBtn = document.getElementById('add-pipe-btn');
    
    if (!addPipeBtn) {
        console.error('Add pipe button not found');
        return;
    }
    
    // Add pipe button click handler
    addPipeBtn.addEventListener('click', function() {
        const pipeName = document.getElementById('pipe-name').value || `Pipe ${pipeCounter}`;
        const pipeType = document.getElementById('pipe-type').value;
        const pipeLength = parseFloat(document.getElementById('pipe-length').value) || 10;
        const pipeColor = document.getElementById('pipe-color').value;
        
        // Add pipe to the list
        addPipeToList(pipeName, pipeType, pipeLength, pipeColor);
        
        // Clear form
        document.getElementById('pipe-name').value = '';
        document.getElementById('pipe-length').value = '10';
        
        // Increment counter for next pipe
        pipeCounter++;
    });
    
    // Function to add pipe to the sidebar list
    function addPipeToList(name, type, length, color) {
        // Clear "no pipes" message if this is the first pipe
        if (pipesList.querySelector('p.text-muted')) {
            pipesList.innerHTML = '';
        }
        
        // Create pipe item in sidebar
        const pipeItem = document.createElement('div');
        pipeItem.className = 'pipe-item';
        pipeItem.dataset.pipeId = `pipe-${pipeCounter}`;
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
            pipePreview.style.height = '15px';
            pipePreview.style.backgroundImage = 'repeating-linear-gradient(90deg, transparent, transparent 5px, rgba(255,255,255,0.2) 5px, rgba(255,255,255,0.2) 10px)';
        }
        
        // Add pipe content
        pipeItem.innerHTML = `
            <div>
                <div><strong>${name}</strong></div>
                <div class="small text-muted">${type}, ${length}m</div>
            </div>
        `;
        
        // Add pipe preview
        const previewContainer = document.createElement('div');
        previewContainer.appendChild(pipePreview);
        pipeItem.insertBefore(previewContainer, pipeItem.firstChild);
        
        // Add actions
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'pipe-actions';
        
        const placeBtn = document.createElement('button');
        placeBtn.className = 'btn btn-sm btn-outline-primary';
        placeBtn.innerHTML = 'Place';
        placeBtn.onclick = function(e) {
            e.stopPropagation();
            placePipe(pipeItem);
        };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-outline-danger';
        deleteBtn.innerHTML = '×';
        deleteBtn.onclick = function(e) {
            e.stopPropagation();
            pipeItem.remove();
            
            // If no pipes left, show the "no pipes" message
            if (pipesList.children.length === 0) {
                pipesList.innerHTML = '<p class="text-muted small">No pipes or trusses added yet. Use the form above to add one.</p>';
            }
        };
        
        actionsDiv.appendChild(placeBtn);
        actionsDiv.appendChild(deleteBtn);
        pipeItem.appendChild(actionsDiv);
        
        // Add to pipes list
        pipesList.appendChild(pipeItem);
        
        // Make item draggable for placement
        pipeItem.addEventListener('dragstart', function(e) {
            try {
                e.dataTransfer.setData('text/plain', pipeItem.dataset.pipeId);
                e.dataTransfer.effectAllowed = 'copy';
                
                // Add dragging class for visual feedback
                pipeItem.classList.add('dragging');
                
                // Create drag image if supported
                if (e.dataTransfer.setDragImage) {
                    const pipePreview = pipeItem.querySelector('.pipe-preview');
                    if (pipePreview) {
                        // Create custom drag image
                        const dragImage = pipePreview.cloneNode(true);
                        dragImage.style.width = '100px';
                        dragImage.style.height = '15px';
                        dragImage.style.backgroundColor = pipeItem.dataset.pipeColor || '#666';
                        document.body.appendChild(dragImage);
                        e.dataTransfer.setDragImage(dragImage, 50, 10);
                        
                        // Remove element after drag starts
                        setTimeout(() => {
                            document.body.removeChild(dragImage);
                        }, 0);
                    }
                }
            } catch (error) {
                console.error('Error starting pipe drag:', error);
            }
        });
        
        pipeItem.addEventListener('dragend', function() {
            pipeItem.classList.remove('dragging');
        });
        
        pipeItem.draggable = true;
        
        console.log(`Pipe created: ${name}, ${type}, ${length}m`);
    }
    
    // Function to place a pipe on the canvas
    function placePipe(pipeItem) {
        try {
            if (!pipeItem || !pipeItem.dataset) {
                console.error('Invalid pipe item provided');
                return;
            }

            const pipeId = pipeItem.dataset.pipeId;
            const pipeName = pipeItem.querySelector('strong')?.textContent || 'Unnamed Pipe';
            const pipeType = pipeItem.dataset.pipeType || 'pipe';
            const pipeLength = parseFloat(pipeItem.dataset.pipeLength) || 10;
            const pipeColor = pipeItem.dataset.pipeColor || '#666666';
            
            // Calculate dimensions based on length
            const pipeWidthPx = pipeLength * SCALE_FACTOR * 10; // 10px per meter
            const pipeHeightPx = pipeType === 'truss' ? 15 : 8;
            
            // Create pipe element
            const pipeElement = pipesGroup.group().addClass('pipe-element').id(pipeId);
            
            // Draw the pipe shape
            const pipeRect = pipeElement.rect(pipeWidthPx, pipeHeightPx)
                .fill(pipeColor)
                .stroke({ width: 1, color: '#000' });
            
            // Add truss pattern if it's a truss
            if (pipeType === 'truss') {
                try {
                    // Add visual pattern for truss
                    const pattern = draw.pattern(20, pipeHeightPx, function(add) {
                        add.line(0, 0, 10, pipeHeightPx).stroke({ width: 1, color: 'rgba(255,255,255,0.3)' });
                        add.line(10, 0, 20, pipeHeightPx).stroke({ width: 1, color: 'rgba(255,255,255,0.3)' });
                    });
                    
                    pipeRect.fill(pattern);
                } catch (patternError) {
                    console.error('Error creating truss pattern:', patternError);
                    // Fallback to solid fill if pattern creation fails
                    pipeRect.fill(pipeColor);
                }
            }
            
            // Add label
            pipeElement.text(pipeName)
                .font({ size: 12, family: 'Arial', weight: 'bold' })
                .center(pipeWidthPx / 2, pipeHeightPx / 2 - 15);
            
            // Position in the center of view initially
            pipeElement.center(0, 0);
            
            // Store pipe data
            pipeElement.attr({
                'data-pipe-id': pipeId,
                'data-pipe-name': pipeName,
                'data-pipe-type': pipeType,
                'data-pipe-length': pipeLength,
                'data-pipe-color': pipeColor
            });
            
            // Make pipe draggable
            pipeElement.draggable()
                .on('dragstart', function() {
                    this.addClass('dragging');
                })
                .on('dragend', function() {
                    this.removeClass('dragging');
                });
            
            // Make pipe selectable
            makePipeSelectable(pipeElement);
            
            console.log(`Placed pipe ${pipeId} on canvas`);
        } catch (error) {
            console.error('Error placing pipe on canvas:', error);
        }
    }
    
    // Make a pipe selectable
    function makePipeSelectable(pipeElement) {
        if (!pipeElement || typeof pipeElement.click !== 'function') {
            console.error('Invalid pipe element provided to makePipeSelectable');
            return;
        }
        
        pipeElement.click(function(event) {
            try {
                // Prevent event bubbling
                event.stopPropagation();
                
                if (currentTool === 'select') {
                    // Deselect previously selected items
                    if (selectedPipe && typeof selectedPipe.removeClass === 'function') {
                        selectedPipe.removeClass('selected');
                    }
                    
                    selectedFixtures.forEach(f => {
                        if (f && typeof f.stroke === 'function') {
                            f.stroke({ width: 0 });
                        }
                    });
                    selectedFixtures = [];
                    
                    // Select this pipe
                    selectedPipe = pipeElement;
                    pipeElement.addClass('selected');
                    
                    // Show properties (would need to add a pipe properties panel)
                    // showPipeProperties(pipeElement);
                }
            } catch (error) {
                console.error('Error in pipe selection handler:', error);
            }
        });
        
        try {
            // Update when dragged
            pipeElement.on('dragend', function() {
                try {
                    const x = pipeElement.x();
                    const y = pipeElement.y();
                    console.log(`Pipe moved to ${x},${y}`);
                } catch (posError) {
                    console.error('Error getting pipe position:', posError);
                }
            });
        } catch (error) {
            console.error('Error setting up drag handler for pipe:', error);
        }
    }
    
    // Initialize drag-and-drop for pipes
    const canvas = document.getElementById('canvas');
    
    canvas.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });
    
    canvas.addEventListener('drop', function(e) {
        e.preventDefault();
        try {
            const pipeId = e.dataTransfer.getData('text/plain');
            if (pipeId) {
                const pipeItem = document.querySelector(`.pipe-item[data-pipe-id="${pipeId}"]`);
                if (pipeItem) {
                    placePipe(pipeItem);
                    
                    // If dropped, position at drop point
                    const point = getCanvasPoint(e);
                    const pipeElement = document.getElementById(pipeId);
                    if (pipeElement) {
                        try {
                            const svgElement = SVG(pipeElement);
                            if (svgElement && typeof svgElement.center === 'function') {
                                svgElement.center(point.x, point.y);
                            } else {
                                console.error('Invalid SVG element or center method not available');
                            }
                        } catch (svgError) {
                            console.error('Error positioning pipe after drop:', svgError);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error handling pipe drop:', error);
        }
    });
}

// Load a pipe from saved data (for plot loading)
function loadPipe(pipeData) {
    const pipeId = pipeData.pipe_id;
    const pipeName = pipeData.pipe_name;
    const pipeType = pipeData.pipe_type;
    const pipeLength = parseFloat(pipeData.pipe_length);
    const pipeColor = pipeData.pipe_color;
    
    // Calculate dimensions based on length
    const pipeWidthPx = pipeLength * SCALE_FACTOR * 10; // 10px per meter
    const pipeHeightPx = pipeType === 'truss' ? 15 : 8;
    
    // Create pipe element
    const pipeElement = pipesGroup.group().addClass('pipe-element').id(pipeId);
    
    // Draw the pipe shape
    const pipeRect = pipeElement.rect(pipeWidthPx, pipeHeightPx)
        .fill(pipeColor)
        .stroke({ width: 1, color: '#000' });
    
    // Add truss pattern if it's a truss
    if (pipeType === 'truss') {
        // Add visual pattern for truss
        const pattern = draw.pattern(20, pipeHeightPx, function(add) {
            add.line(0, 0, 10, pipeHeightPx).stroke({ width: 1, color: 'rgba(255,255,255,0.3)' });
            add.line(10, 0, 20, pipeHeightPx).stroke({ width: 1, color: 'rgba(255,255,255,0.3)' });
        });
        
        pipeRect.fill(pattern);
    }
    
    // Add label
    pipeElement.text(pipeName)
        .font({ size: 12, family: 'Arial', weight: 'bold' })
        .center(pipeWidthPx / 2, pipeHeightPx / 2 - 15);
    
    // Position the pipe
    pipeElement.move(pipeData.x, pipeData.y);
    
    // Rotate if needed
    if (pipeData.rotation) {
        pipeElement.rotate(pipeData.rotation);
    }
    
    // Store pipe data
    pipeElement.attr({
        'data-pipe-id': pipeId,
        'data-pipe-name': pipeName,
        'data-pipe-type': pipeType,
        'data-pipe-length': pipeLength,
        'data-pipe-color': pipeColor
    });
    
    // Make pipe draggable
    pipeElement.draggable()
        .on('dragstart', function() {
            this.addClass('dragging');
        })
        .on('dragend', function() {
            this.removeClass('dragging');
        });
    
    // Make pipe selectable
    makePipeSelectable(pipeElement);
    
    console.log(`Loaded pipe ${pipeId} from saved data`);
    
    // Update pipe counter if needed
    const pipeIdNum = parseInt(pipeId.replace('pipe-', ''), 10);
    if (!isNaN(pipeIdNum) && pipeIdNum >= pipeCounter) {
        pipeCounter = pipeIdNum + 1;
    }
}

export { 
    setupPipesLibrary,
    loadPipe
};