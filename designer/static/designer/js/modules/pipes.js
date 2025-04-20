/**
 * Light Plot Designer - Pipes Module
 *
 * Handles pipe/truss library, placement and manipulation
 */

import { 
    draw, 
    pipesGroup, 
    pipeCounter, 
    updatePipeCounter,
    selectedFixtures, 
    selectedPipe,
    setSelectedPipe,
    clearSelectedFixtures,
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
        updatePipeCounter(pipeCounter + 1);
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
                'data-pipe-original-length': pipeLength, // Store original length for reference
                'data-pipe-color': pipeColor,
                'data-locked': 'false'
            });
            
            // Set up draggability based on locked status
            const isLocked = pipeElement.attr('data-locked') === 'true';
            
            // Make pipe draggable only if not locked
            if (!isLocked) {
                // Store the initial position and time to distinguish between clicks and drags
                let dragStartPos = { x: 0, y: 0 };
                let dragStartTime = 0;
                let isDragging = false;
                
                pipeElement.draggable()
                    .on('beforedrag', function(e) {
                        // Only allow drag if in select mode or after selection
                        if (currentTool !== 'select') {
                            e.preventDefault();
                            return false;
                        }
                        
                        // Store initial position and time
                        dragStartPos = { x: e.detail.event.clientX, y: e.detail.event.clientY };
                        dragStartTime = Date.now();
                        return true;
                    })
                    .on('dragstart', function(e) {
                        // Mark as dragging
                        isDragging = true;
                        this.addClass('dragging');
                    })
                    .on('dragmove', function(e) {
                        // Confirm this is a real drag, not just a click
                        const dx = e.detail.event.clientX - dragStartPos.x;
                        const dy = e.detail.event.clientY - dragStartPos.y;
                        const distance = Math.sqrt(dx*dx + dy*dy);
                        
                        // If we've moved more than 5px, it's definitely a drag
                        if (distance > 5) {
                            isDragging = true;
                        }
                    })
                    .on('dragend', function(e) {
                        this.removeClass('dragging');
                        
                        // Calculate total drag time and distance
                        const dragTime = Date.now() - dragStartTime;
                        const dx = e.detail.event.clientX - dragStartPos.x;
                        const dy = e.detail.event.clientY - dragStartPos.y;
                        const distance = Math.sqrt(dx*dx + dy*dy);
                        
                        // If this was just a quick tap or very small movement, treat it as a click, not a drag
                        if (dragTime < 300 && distance < 5) {
                            isDragging = false;
                            
                            // Restore original position
                            if (dragStartPos.originalX !== undefined && dragStartPos.originalY !== undefined) {
                                this.move(dragStartPos.originalX, dragStartPos.originalY);
                            }
                        }
                        
                        isDragging = false;
                    });
            }
               
            console.log(`Placed pipe ${pipeId} on canvas`);
        } catch (error) {
            console.error('Error placing pipe on canvas:', error);
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
        'data-pipe-original-length': pipeData.pipe_original_length || pipeLength,
        'data-pipe-color': pipeColor,
        'data-locked': pipeData.locked || 'false'
    });
    
    // Set up draggability based on locked status
    const isLocked = pipeElement.attr('data-locked') === 'true';
    
    // Make pipe draggable only if not locked
    if (!isLocked) {
        pipeElement.draggable()
            .on('dragstart', function() {
                this.addClass('dragging');
            })
            .on('dragend', function() {
                this.removeClass('dragging');
            });
    }  
    console.log(`Loaded pipe ${pipeId} from saved data`);
    
    // Update pipe counter if needed
    const pipeIdNum = parseInt(pipeId.replace('pipe-', ''), 10);
    if (!isNaN(pipeIdNum) && pipeIdNum >= pipeCounter) {
        updatePipeCounter(pipeIdNum + 1);
    }
}

// Create the userPipeInventory array to store user-created pipes
const userPipeInventory = [];

// Show pipe properties
function showPipeProperties(pipeElement) {
    if (!pipeElement) return;
    
    // Get the pipe properties panel
    const propertiesPanel = document.getElementById('pipe-properties');
    if (!propertiesPanel) return;
    
    // Hide fixture properties panel if it's visible
    const fixturePropertiesPanel = document.getElementById('fixture-properties');
    if (fixturePropertiesPanel) {
        fixturePropertiesPanel.style.display = 'none';
    }
    
    // Show pipe properties panel
    propertiesPanel.style.display = 'block';
    
    // Make sure properties tab is active
    const propertiesTab = document.getElementById('properties-tab');
    if (propertiesTab) {
        // Activate the properties tab
        const tabInstance = new bootstrap.Tab(propertiesTab);
        tabInstance.show();
        console.log('Activated properties tab');
    }
    
    // Populate properties form
    const nameInput = document.getElementById('pipe-name');
    const lengthInput = document.getElementById('pipe-length');
    const colorSelect = document.getElementById('pipe-color');
    const lockedCheckbox = document.getElementById('pipe-locked');
    
    // Get pipe data from attributes
    const pipeName = pipeElement.attr('data-pipe-name') || '';
    const pipeLength = pipeElement.attr('data-pipe-length') || 10;
    const pipeColor = pipeElement.attr('data-pipe-color') || '#666666';
    const pipeLocked = pipeElement.attr('data-locked') === 'true';
    
    // Set form values
    if (nameInput) nameInput.value = pipeName;
    if (lengthInput) lengthInput.value = pipeLength;
    if (colorSelect) colorSelect.value = pipeColor;
    if (lockedCheckbox) lockedCheckbox.checked = pipeLocked;
    
    // Handle apply changes button
    const applyButton = document.getElementById('apply-pipe-properties');
    if (applyButton) {
        console.log('Setting up apply button for pipe:', pipeElement.id());
        
        // First, directly set a data attribute to store the pipe ID
        applyButton.setAttribute('data-pipe-id', pipeElement.id());
        
        // Clear any existing event listeners (safer approach)
        applyButton.removeEventListener('click', applyButtonHandler);
        
        // Create a named handler function to improve debugging
        function applyButtonHandler() {
            console.log('Apply button clicked for pipe:', pipeElement.id());
            const pipeId = this.getAttribute('data-pipe-id');
            console.log('Target pipe ID from button attribute:', pipeId);
            
            // Get the pipe element directly from the pipes group
            const targetPipe = SVG('#' + pipeId);
            if (targetPipe) {
                console.log('Found target pipe element');
                applyPipeProperties(targetPipe);
            } else {
                console.error('Could not find pipe element with ID:', pipeId);
                // Fallback to the original pipe element
                applyPipeProperties(pipeElement);
            }
        }
        
        // Add the click event handler
        applyButton.addEventListener('click', applyButtonHandler);
        console.log('Apply button event handler attached');
    } else {
        console.error('Apply button not found in the DOM');
    }
    
    // Add direct event listener to checkbox for immediate feedback
    if (lockedCheckbox) {
        lockedCheckbox.addEventListener('change', function() {
            console.log('Lock checkbox changed:', this.checked);
        });
    }
}

// Apply pipe properties from the form to the pipe element
function applyPipeProperties(pipeElement) {
    if (!pipeElement) {
        console.error('Cannot apply properties: pipe element is null');
        return;
    }
    
    console.log('Applying properties to pipe:', pipeElement.id());
    
    try {
        // Get form values
        const nameInput = document.getElementById('pipe-name');
        const lengthInput = document.getElementById('pipe-length');
        const colorSelect = document.getElementById('pipe-color');
        const lockedCheckbox = document.getElementById('pipe-locked');
        
        if (!nameInput || !lengthInput || !colorSelect || !lockedCheckbox) {
            console.error('Property form inputs not found!');
            return;
        }
        
        console.log('Current form values:', {
            name: nameInput.value,
            length: lengthInput.value,
            color: colorSelect.value,
            locked: lockedCheckbox.checked
        });
        
        const newName = nameInput.value || '';
        const newLength = parseFloat(lengthInput.value) || 10;
        const newColor = colorSelect.value || '#666666';
        const newLocked = lockedCheckbox.checked;
        
        console.log('Updating pipe attributes to:', {
            name: newName,
            length: newLength,
            color: newColor,
            locked: newLocked
        });
        
        // Update pipe attributes
        pipeElement.attr({
            'data-pipe-name': newName,
            'data-pipe-length': newLength,
            'data-pipe-color': newColor,
            'data-locked': newLocked ? 'true' : 'false'  // Ensure boolean is converted to string
        });
        
        // Get current pipe data after update
        console.log('Pipe attributes after update:', {
            name: pipeElement.attr('data-pipe-name'),
            length: pipeElement.attr('data-pipe-length'),
            color: pipeElement.attr('data-pipe-color'),
            locked: pipeElement.attr('data-locked')
        });
        
        // Update pipe visuals
        console.log('Updating pipe visuals...');
        updatePipeVisuals(pipeElement, newLength, newColor);
        
        // Check if SVG.js draggable plugin is available
        if (typeof SVG !== 'undefined') {
            console.log('SVG library is available');
        } else {
            console.error('SVG library is not available!');
            // Show visual indicator even if SVG isn't available
            const pipeRect = pipeElement.findOne('rect');
            if (pipeRect) {
                if (newLocked) {
                    pipeRect.stroke({ width: 2, color: '#009900' });
                } else if (pipeElement.hasClass('selected')) {
                    pipeRect.stroke({ width: 2, color: '#ff0000', dasharray: '5,5' });
                } else {
                    pipeRect.stroke({ width: 1, color: '#000' });
                }
            }
        }
        
        console.log(`Successfully updated pipe properties: Name=${newName}, Length=${newLength}, Color=${newColor}, Locked=${newLocked}`);
        
        // Show success message to user
        const statusElement = document.getElementById('pipe-update-status');
        if (statusElement) {
            statusElement.textContent = `Updated pipe: Length=${newLength}m, ${newLocked ? 'Locked' : 'Unlocked'}`;
            statusElement.style.display = 'block';
            statusElement.className = 'mt-2 small text-success';
            
            // Hide after 3 seconds
            setTimeout(() => {
                statusElement.style.display = 'none';
            }, 3000);
        }
    } catch (error) {
        console.error('Error applying pipe properties:', error);
    }
}

// Update pipe visuals based on properties
function updatePipeVisuals(pipeElement, newLength, newColor) {
    if (!pipeElement) {
        console.error('Cannot update visuals: pipe element is null');
        return;
    }
    
    try {
        console.log(`Updating pipe visuals: Length=${newLength}m, Color=${newColor}`);
        
        // Calculate dimensions based on length
        const pipeWidthPx = newLength * SCALE_FACTOR * 10; // 10px per meter
        const pipeHeightPx = pipeElement.attr('data-pipe-type') === 'truss' ? 15 : 8;
        console.log(`New pipe dimensions: ${pipeWidthPx}px × ${pipeHeightPx}px`);
        
        // Get the rectangle element (first child of the group)
        const pipeRect = pipeElement.findOne('rect');
        if (pipeRect) {
            console.log('Found pipe rectangle element');
            
            // Get current stroke style
            const currentStroke = pipeRect.attr('stroke') || '#000';
            const currentStrokeWidth = pipeRect.attr('stroke-width') || 1;
            const currentDasharray = pipeRect.attr('stroke-dasharray') || '';
            
            console.log('Current stroke style:', {
                color: currentStroke,
                width: currentStrokeWidth,
                dasharray: currentDasharray
            });
            
            // Update size and color while preserving stroke
            console.log(`Resizing to ${pipeWidthPx}×${pipeHeightPx} and changing fill to ${newColor}`);
            
            try {
                // Try a more direct approach to resize the rect
                pipeRect.width(pipeWidthPx);
                pipeRect.height(pipeHeightPx);
                pipeRect.fill(newColor);
                console.log('Resized using width/height methods');
            } catch (sizeError) {
                console.error('Error using width/height methods:', sizeError);
                try {
                    // Fallback to the size method
                    pipeRect.size(pipeWidthPx, pipeHeightPx).fill(newColor);
                    console.log('Resized using size method');
                } catch (error) {
                    console.error('Failed to resize pipe:', error);
                }
            }
            
            // Restore stroke
            console.log('Restoring original stroke style');
            try {
                pipeRect.stroke({
                    color: currentStroke,
                    width: currentStrokeWidth,
                    dasharray: currentDasharray
                });
            } catch (strokeError) {
                console.error('Error restoring stroke:', strokeError);
                // Try setting stroke properties individually
                pipeRect.stroke({ color: currentStroke });
                pipeRect.stroke({ width: currentStrokeWidth });
                if (currentDasharray) {
                    pipeRect.attr('stroke-dasharray', currentDasharray);
                }
            }
            
            // Update truss pattern if it's a truss
            const pipeType = pipeElement.attr('data-pipe-type');
            if (pipeType === 'truss') {
                console.log('Applying truss pattern');
                try {
                    // Add visual pattern for truss
                    const pattern = draw.pattern(20, pipeHeightPx, function(add) {
                        add.line(0, 0, 10, pipeHeightPx).stroke({ width: 1, color: 'rgba(255,255,255,0.3)' });
                        add.line(10, 0, 20, pipeHeightPx).stroke({ width: 1, color: 'rgba(255,255,255,0.3)' });
                    });
                    
                    pipeRect.fill(pattern);
                    console.log('Truss pattern applied successfully');
                } catch (patternError) {
                    console.error('Error creating truss pattern:', patternError);
                    // Fallback to solid fill if pattern creation fails
                    pipeRect.fill(newColor);
                }
            }
        } else {
            console.error('Pipe rectangle element not found!');
        }
        
        // Update label position
        const pipeLabel = pipeElement.findOne('text');
        if (pipeLabel) {
            console.log('Updating label position');
            pipeLabel.center(pipeWidthPx / 2, pipeHeightPx / 2 - 15);
        } else {
            console.warn('Pipe label not found');
        }
        
        console.log('Pipe visuals updated successfully');
    } catch (error) {
        console.error('Error updating pipe visuals:', error);
    }
}

export { 
    setupPipesLibrary,
    loadPipe,
    userPipeInventory,
    showPipeProperties
};