/**
 * Light Plot Designer - Editor JavaScript
 * 
 * This file contains the core functionality for the vector-based
 * theatrical lighting plot designer.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if SVG.js is properly loaded
    if (typeof SVG !== 'function') {
        console.error('SVG.js library not loaded!');
        alert('Error: Required SVG.js library is not loaded. Please refresh the page.');
        return;
    }
    
    // Initialize SVG canvas
    const draw = SVG().addTo('#canvas').size('100%', '100%');
    
    // Constants for the editor
    const GRID_SIZE = 10;
    const FIXTURE_SCALE = 1.0;
    
    // A4 paper dimensions in mm (landscape orientation)
    const A4_WIDTH = 297;
    const A4_HEIGHT = 210;
    
    // Scaling factor to convert mm to pixels (assuming 96 DPI)
    const SCALE_FACTOR = 3.78; // This gives roughly 1122x793 pixels for A4
    
    // Default stage dimensions in meters
    const DEFAULT_STAGE_WIDTH = 12;
    const DEFAULT_STAGE_DEPTH = 8;
    const DEFAULT_FOH_DEPTH = 3;
    
    // State management
    let currentTool = 'select';
    let selectedFixtures = [];
    let isDragging = false;
    let stageGroup = null;
    let fixturesGroup = null;
    let gridGroup = null;
    let paperGroup = null;
    let fohGroup = null;
    
    // Paper size and scaling information
    let paperSize = {
        width: A4_WIDTH * SCALE_FACTOR,
        height: A4_HEIGHT * SCALE_FACTOR
    };
    
    // Stage dimensions (in stage units, typically meters)
    let stageDimensions = {
        width: DEFAULT_STAGE_WIDTH,
        depth: DEFAULT_STAGE_DEPTH,
        fohDepth: DEFAULT_FOH_DEPTH
    };
    
    // Viewport and zoom info
    let viewportInfo = {
        zoom: 1,
        pan: { x: 0, y: 0 }
    };
    
    // Initialize editor
    function initEditor() {
        console.log('Initializing Light Plot Editor');
        
        // Create main groups, order matters for layering
        paperGroup = draw.group().id('paper-group');
        gridGroup = draw.group().id('grid-group');
        fohGroup = draw.group().id('foh-group');
        stageGroup = draw.group().id('stage-group');
        fixturesGroup = draw.group().id('fixtures-group');
        
        // Set up the paper size as a background
        setupPaperSize();
        
        // Draw grid
        drawGrid();
        
        // Draw initial stage and FOH
        drawDefaultStage();
        
        // Center the view
        centerView();
        
        // Set up event handlers for tools
        setupToolHandlers();
        
        // Set up fixture library events
        setupFixtureLibrary();
        
        // Set up property panel events
        setupPropertyPanel();
        
        console.log('Editor initialized');
    }
    
    // Setup paper size background
    function setupPaperSize() {
        paperGroup.clear();
        
        // Draw paper background
        paperGroup.rect(paperSize.width, paperSize.height)
            .fill('#ffffff')
            .stroke({ width: 1, color: '#000000' })
            .center(0, 0);
            
        // Add paper margins (20mm)
        const marginSize = 20 * SCALE_FACTOR;
        const innerWidth = paperSize.width - (marginSize * 2);
        const innerHeight = paperSize.height - (marginSize * 2);
        
        paperGroup.rect(innerWidth, innerHeight)
            .fill('none')
            .stroke({ width: 0.5, color: '#cccccc', dasharray: '5,5' })
            .center(0, 0);
            
        // Add title block at the bottom
        const titleBlockHeight = 30 * SCALE_FACTOR;
        paperGroup.rect(innerWidth, titleBlockHeight)
            .fill('#f8f8f8')
            .stroke({ width: 0.5, color: '#000000' })
            .move(-innerWidth/2, paperSize.height/2 - titleBlockHeight - marginSize);
            
        // Add default text in title block
        paperGroup.text("LIGHT PLOT - NEW DESIGN")
            .font({ size: 16, family: 'Arial', weight: 'bold' })
            .move(-innerWidth/2 + 10, paperSize.height/2 - titleBlockHeight - marginSize + 10);
    }
    
    // Draw grid
    function drawGrid() {
        gridGroup.clear();
        
        const gridColor = '#e0e0e0';
        const gridWidth = paperSize.width - 40 * SCALE_FACTOR;
        const gridHeight = paperSize.height - 60 * SCALE_FACTOR; // Leave room for title block
        
        // Create a pattern of grid lines
        for (let x = -gridWidth/2; x <= gridWidth/2; x += GRID_SIZE * SCALE_FACTOR) {
            gridGroup.line(x, -gridHeight/2, x, gridHeight/2)
                .stroke({ width: 0.5, color: gridColor });
        }
        
        for (let y = -gridHeight/2; y <= gridHeight/2; y += GRID_SIZE * SCALE_FACTOR) {
            gridGroup.line(-gridWidth/2, y, gridWidth/2, y)
                .stroke({ width: 0.5, color: gridColor });
        }
    }
    
    // Center the view
    function centerView() {
        // In a full implementation, this would adjust the viewBox correctly
        // For now, we'll just set a simple viewBox
        const viewBoxWidth = paperSize.width * 1.1;
        const viewBoxHeight = paperSize.height * 1.1;
        draw.viewbox(-viewBoxWidth/2, -viewBoxHeight/2, viewBoxWidth, viewBoxHeight);
    }
    
    // Draw a default stage
    function drawDefaultStage() {
        stageGroup.clear();
        fohGroup.clear();
        
        // Calculate stage dimensions in pixels
        const stageWidthPx = stageDimensions.width * SCALE_FACTOR * 20; // 20px per meter
        const stageDepthPx = stageDimensions.depth * SCALE_FACTOR * 20;
        const fohDepthPx = stageDimensions.fohDepth * SCALE_FACTOR * 20;
        
        // Position stage so it fits nicely on the paper with the title block at the bottom
        const stageY = -stageDepthPx/2 - 20 * SCALE_FACTOR; // Shift up a bit for title block
        
        // Draw stage shape with dotted line
        stageGroup.rect(stageWidthPx, stageDepthPx)
            .fill('#f9f9f9')
            .stroke({ width: 2, color: '#000', dasharray: '5,5' })
            .center(0, stageY);
            
        // Draw FOH area
        fohGroup.rect(stageWidthPx, fohDepthPx)
            .fill('#f0f0f0') 
            .stroke({ width: 1, color: '#000', dasharray: '5,5' })
            .center(0, stageY + stageDepthPx/2 + fohDepthPx/2);
            
        // Add FOH label
        fohGroup.text("FRONT OF HOUSE")
            .font({ size: 14, family: 'Arial', weight: 'bold' })
            .center(0, stageY + stageDepthPx/2 + fohDepthPx/2);
            
        // Draw center line
        stageGroup.line(-stageWidthPx/2, stageY, stageWidthPx/2, stageY)
            .stroke({ width: 1, color: '#999', dasharray: '5,5' });
            
        // Draw plaster line
        stageGroup.line(-stageWidthPx/2, stageY - stageDepthPx * 0.2, stageWidthPx/2, stageY - stageDepthPx * 0.2)
            .stroke({ width: 2, color: '#333' });
        
        // Add label for plaster line
        stageGroup.text("PLASTER LINE")
            .font({ size: 12, family: 'Arial' })
            .center(0, stageY - stageDepthPx * 0.2 - 15);
    }
    
    // Set up tool button handlers
    function setupToolHandlers() {
        // Select tool
        document.getElementById('select-tool').addEventListener('click', function() {
            setActiveTool('select');
        });
        
        // Add fixture tool
        document.getElementById('add-fixture-tool').addEventListener('click', function() {
            setActiveTool('add-fixture');
        });
        
        // Pan tool
        document.getElementById('pan-tool').addEventListener('click', function() {
            setActiveTool('pan');
        });
        
        // Zoom in
        document.getElementById('zoom-in').addEventListener('click', function() {
            zoomCanvas(1.2);
        });
        
        // Zoom out
        document.getElementById('zoom-out').addEventListener('click', function() {
            zoomCanvas(0.8);
        });
        
        // Set up keyboard shortcuts
        document.addEventListener('keydown', function(event) {
            // Escape key - switch to select tool
            if (event.key === 'Escape') {
                setActiveTool('select');
            }
            
            // Space key - switch to pan tool temporarily
            if (event.key === ' ' && !event.repeat) {
                // Save current tool and switch to pan
                tempTool = currentTool;
                setActiveTool('pan');
            }
            
            // + key for zoom in
            if (event.key === '+' || event.key === '=') {
                zoomCanvas(1.2);
            }
            
            // - key for zoom out
            if (event.key === '-' || event.key === '_') {
                zoomCanvas(0.8);
            }
        });
        
        // Release space key to return to previous tool
        document.addEventListener('keyup', function(event) {
            if (event.key === ' ' && tempTool) {
                setActiveTool(tempTool);
                tempTool = null;
            }
        });
        
        // Set up mouse wheel for zooming
        document.getElementById('canvas').addEventListener('wheel', function(event) {
            event.preventDefault();
            const factor = event.deltaY < 0 ? 1.1 : 0.9;
            zoomCanvas(factor);
        });
        
        // Set up panning functionality
        setupPanning();
    }
    
    // Set up panning
    function setupPanning() {
        const canvas = document.getElementById('canvas');
        let isPanning = false;
        let startPoint = { x: 0, y: 0 };
        
        canvas.addEventListener('mousedown', function(event) {
            if (currentTool === 'pan') {
                isPanning = true;
                startPoint = {
                    x: event.clientX,
                    y: event.clientY
                };
                canvas.style.cursor = 'grabbing';
            }
        });
        
        canvas.addEventListener('mousemove', function(event) {
            if (isPanning) {
                const dx = event.clientX - startPoint.x;
                const dy = event.clientY - startPoint.y;
                
                // Update pan values
                viewportInfo.pan.x += dx / viewportInfo.zoom;
                viewportInfo.pan.y += dy / viewportInfo.zoom;
                
                // Update viewport
                updateViewport();
                
                // Update start point
                startPoint = {
                    x: event.clientX,
                    y: event.clientY
                };
            }
        });
        
        canvas.addEventListener('mouseup', function() {
            if (isPanning) {
                isPanning = false;
                canvas.style.cursor = 'grab';
            }
        });
        
        canvas.addEventListener('mouseleave', function() {
            if (isPanning) {
                isPanning = false;
                canvas.style.cursor = 'grab';
            }
        });
    }
    
    // Update viewport based on pan and zoom
    function updateViewport() {
        const viewBoxWidth = paperSize.width * 1.1 / viewportInfo.zoom;
        const viewBoxHeight = paperSize.height * 1.1 / viewportInfo.zoom;
        
        // Apply pan offset
        const viewBoxX = -viewBoxWidth/2 + viewportInfo.pan.x;
        const viewBoxY = -viewBoxHeight/2 + viewportInfo.pan.y;
        
        draw.viewbox(viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight);
    }
    
    // Set the active tool
    function setActiveTool(tool) {
        currentTool = tool;
        
        // Reset all tool buttons
        document.querySelectorAll('#toolbar button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Highlight the active tool
        const toolButton = document.getElementById(`${tool}-tool`);
        if (toolButton) {
            toolButton.classList.add('active');
        }
        
        // Update cursor style based on the tool
        const canvas = document.getElementById('canvas');
        switch (tool) {
            case 'pan':
                canvas.style.cursor = 'grab';
                break;
            case 'add-fixture':
                canvas.style.cursor = 'cell';
                break;
            default:
                canvas.style.cursor = 'default';
        }
        
        console.log(`Active tool set to: ${tool}`);
    }
    
    // Zoom the canvas
    function zoomCanvas(factor) {
        // Update zoom factor
        viewportInfo.zoom *= factor;
        
        // Clamp zoom between reasonable values
        viewportInfo.zoom = Math.max(0.2, Math.min(5, viewportInfo.zoom));
        
        // Update viewport
        updateViewport();
        
        console.log(`Zoom: ${viewportInfo.zoom.toFixed(2)}`);
    }
    
    // Set up fixture library interactions
    function setupFixtureLibrary() {
        const fixtureItems = document.querySelectorAll('.fixture-item');
        let selectedFixtureId = null;
        let placementPreviewElement = null;
        
        fixtureItems.forEach(item => {
            item.addEventListener('click', function() {
                const fixtureId = this.getAttribute('data-fixture-id');
                
                // Highlight the selected fixture in the list
                fixtureItems.forEach(fi => fi.classList.remove('selected'));
                this.classList.add('selected');
                
                selectedFixtureId = fixtureId;
                
                if (currentTool !== 'add-fixture') {
                    setActiveTool('add-fixture');
                }
                
                console.log(`Selected fixture: ${fixtureId}`);
            });
        });
        
        // Set up canvas events for fixture placement
        const canvas = document.getElementById('canvas');
        
        // Preview fixture position during mousemove
        canvas.addEventListener('mousemove', function(event) {
            if (currentTool === 'add-fixture' && selectedFixtureId) {
                // Convert mouse position to SVG coordinates
                const point = getCanvasPoint(event);
                
                // Create or update placement preview
                showFixturePlacementPreview(selectedFixtureId, point.x, point.y);
            }
        });
        
        // Place fixture on click
        canvas.addEventListener('click', function(event) {
            if (currentTool === 'add-fixture' && selectedFixtureId) {
                // Convert mouse position to SVG coordinates
                const point = getCanvasPoint(event);
                
                // Place fixture at this position
                placeFixture(selectedFixtureId, point.x, point.y);
                
                // Remove preview after placement
                if (placementPreviewElement) {
                    placementPreviewElement.remove();
                    placementPreviewElement = null;
                }
            }
        });
        
        // Convert mouse position to SVG coordinates
        function getCanvasPoint(event) {
            const svg = document.querySelector('#canvas svg');
            const point = svg.createSVGPoint();
            point.x = event.clientX;
            point.y = event.clientY;
            
            // Get SVG coordinate system
            const ctm = svg.getScreenCTM().inverse();
            const svgPoint = point.matrixTransform(ctm);
            
            return svgPoint;
        }
        
        // Show preview of fixture during placement
        function showFixturePlacementPreview(fixtureId, x, y) {
            // Remove existing preview
            if (placementPreviewElement) {
                placementPreviewElement.remove();
            }
            
            // For now, we'll use a simple circle as a placeholder
            // In a full implementation, this would use the actual fixture SVG
            placementPreviewElement = draw.circle(30)
                .fill('rgba(0, 150, 255, 0.5)')
                .stroke({ width: 1, color: '#0066cc', dasharray: '5,5' })
                .center(x, y)
                .attr('data-fixture-id', fixtureId);
                
            // Add a label with fixture type
            const fixtureType = document.querySelector(`.fixture-item[data-fixture-id="${fixtureId}"]`).textContent.trim();
            draw.text(fixtureType)
                .font({ size: 10, family: 'Arial' })
                .center(x, y + 25)
                .addTo(placementPreviewElement);
        }
        
        // Actually place a fixture on the plot
        function placeFixture(fixtureId, x, y) {
            // Create a unique ID for this fixture instance
            const fixtureInstanceId = `fixture-${Date.now()}`;
            
            // For now, we'll use a simple circle
            // In a full implementation, this would use the SVG from the fixture model
            const fixtureElement = draw.group().id(fixtureInstanceId);
            fixtureElement.circle(30)
                .fill('#0066cc')
                .center(0, 0);
                
            // Add fixture number/channel
            fixtureElement.circle(16)
                .fill('white')
                .center(0, 0);
                
            fixtureElement.text("1")
                .font({ size: 12, family: 'Arial', weight: 'bold', anchor: 'middle' })
                .center(0, 0);
                
            // Position the fixture
            fixtureElement.center(x, y);
            
            // Store fixture data
            fixtureElement.attr({
                'data-fixture-id': fixtureId,
                'data-fixture-instance-id': fixtureInstanceId,
                'data-channel': 1, // Default channel
                'data-purpose': '',
                'data-color': '',
                'data-notes': '',
                'data-dimmer': '',
            });
            
            // Add to fixtures group
            fixturesGroup.add(fixtureElement);
            
            // Make the fixture selectable
            makeFixtureSelectable(fixtureElement);
            
            console.log(`Placed fixture ${fixtureId} at position ${x},${y}`);
            
            // After placing, switch back to select tool
            setActiveTool('select');
        }
        
        // Make a fixture instance selectable and draggable
        function makeFixtureSelectable(fixtureElement) {
            fixtureElement.click(function(event) {
                // Prevent event bubbling
                event.stopPropagation();
                
                if (currentTool === 'select') {
                    // Deselect previously selected fixtures
                    selectedFixtures.forEach(f => {
                        f.stroke({ width: 0 });
                    });
                    
                    // Select this fixture
                    selectedFixtures = [fixtureElement];
                    fixtureElement.stroke({ width: 2, color: '#ff3300' });
                    
                    // Show properties
                    showFixtureProperties(fixtureElement);
                }
            });
            
            // Make draggable
            fixtureElement.draggable();
            
            // Update properties when dragged
            fixtureElement.on('dragend', function() {
                // Update position in plot data
                console.log(`Fixture moved to ${fixtureElement.cx()},${fixtureElement.cy()}`);
            });
        }
    }
    
    // Set up property panel interactions
    function setupPropertyPanel() {
        const propertiesPanel = document.getElementById('fixture-properties');
        const propertiesForm = document.getElementById('fixture-properties-form');
        
        // Handle stage properties
        const stageSelect = document.getElementById('stage-select');
        if (stageSelect) {
            stageSelect.addEventListener('change', function() {
                const stageId = this.value;
                console.log(`Selected stage: ${stageId}`);
                // In a full implementation, this would update the stage
            });
        }
        
        // Handle grid toggle
        const showGridCheckbox = document.getElementById('show-grid');
        if (showGridCheckbox) {
            showGridCheckbox.addEventListener('change', function() {
                gridGroup.style('display', this.checked ? 'block' : 'none');
            });
        }
        
        // Handle grid size
        const gridSizeInput = document.getElementById('grid-size');
        if (gridSizeInput) {
            gridSizeInput.addEventListener('change', function() {
                // Redraw grid with new size
                console.log(`Grid size changed to: ${this.value}`);
                // In a full implementation, this would update the grid
            });
        }
        
        console.log('Property panel initialized');
    }
    
    // Show fixture properties in the properties panel
    function showFixtureProperties(fixtureElement) {
        const propertiesPanel = document.getElementById('fixture-properties');
        
        if (!propertiesPanel) return;
        
        // Show the panel
        propertiesPanel.style.display = 'block';
        
        // Get fixture data
        const fixtureId = fixtureElement.attr('data-fixture-id');
        const instanceId = fixtureElement.attr('data-fixture-instance-id');
        const channel = fixtureElement.attr('data-channel') || '';
        const dimmer = fixtureElement.attr('data-dimmer') || '';
        const color = fixtureElement.attr('data-color') || '';
        const purpose = fixtureElement.attr('data-purpose') || '';
        const notes = fixtureElement.attr('data-notes') || '';
        
        // Set form values
        document.getElementById('channel').value = channel;
        document.getElementById('dimmer').value = dimmer;
        document.getElementById('color').value = color;
        document.getElementById('purpose').value = purpose;
        document.getElementById('notes').value = notes;
        
        // Event listeners for property changes
        document.getElementById('channel').onchange = function() {
            fixtureElement.attr('data-channel', this.value);
            // Update channel number in fixture
            const channelText = fixtureElement.findOne('text');
            if (channelText) {
                channelText.text(this.value || '');
            }
        };
        
        document.getElementById('dimmer').onchange = function() {
            fixtureElement.attr('data-dimmer', this.value);
        };
        
        document.getElementById('color').onchange = function() {
            fixtureElement.attr('data-color', this.value);
            // Could visually update the fixture color
        };
        
        document.getElementById('purpose').onchange = function() {
            fixtureElement.attr('data-purpose', this.value);
        };
        
        document.getElementById('notes').onchange = function() {
            fixtureElement.attr('data-notes', this.value);
        };
    }
    
    // Save the current plot
    function savePlot() {
        // Check if we're editing an existing plot
        const plotId = document.querySelector('input[name="plot_id"]')?.value;
        const plotTitle = document.querySelector('input[name="plot_title"]')?.value || 'Untitled Plot';
        const stageId = document.getElementById('stage-select')?.value;
        
        if (!stageId) {
            alert('Please select a stage first');
            return;
        }
        
        // Collect all fixtures data
        const fixturesData = [];
        fixturesGroup.children().forEach(fixtureElement => {
            // Get fixture position (center point)
            const pos = fixtureElement.bbox();
            const x = pos.cx;
            const y = pos.cy;
            
            // Get other fixture data from attributes
            fixturesData.push({
                fixture_id: fixtureElement.attr('data-fixture-id'),
                x: x,
                y: y,
                rotation: fixtureElement.transform().rotation || 0,
                channel: fixtureElement.attr('data-channel') || null,
                dimmer: fixtureElement.attr('data-dimmer') || null,
                color: fixtureElement.attr('data-color') || '',
                purpose: fixtureElement.attr('data-purpose') || '',
                notes: fixtureElement.attr('data-notes') || ''
            });
        });
        
        // Get additional plot data if needed (like stage configuration, etc.)
        const plotData = {
            paperSize: {
                width: paperSize.width,
                height: paperSize.height
            },
            stageDimensions: stageDimensions,
            viewportInfo: viewportInfo
        };
        
        // Prepare data for submission
        const data = {
            plot_id: plotId || null,
            title: plotTitle,
            stage_id: stageId,
            fixtures: fixturesData,
            plot_data: plotData
        };
        
        // Show saving indicator
        const saveButton = document.getElementById('save-button');
        const originalText = saveButton.innerHTML;
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
        saveButton.disabled = true;
        
        // Submit to server
        fetch('/designer/api/plot/save/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                // Update plot ID if this was a new plot
                if (!plotId && result.plot_id) {
                    // Add the plot ID to the form for future saves
                    const plotIdInput = document.createElement('input');
                    plotIdInput.type = 'hidden';
                    plotIdInput.name = 'plot_id';
                    plotIdInput.value = result.plot_id;
                    document.body.appendChild(plotIdInput);
                    
                    // Update URL to reflect the new plot ID
                    const newUrl = window.location.pathname.replace('/editor/', `/editor/${result.plot_id}/`);
                    window.history.replaceState({}, '', newUrl);
                }
                
                // Show success message
                showToast('Success', 'Plot saved successfully', 'success');
            } else {
                showToast('Error', result.message || 'Error saving plot', 'error');
            }
        })
        .catch(error => {
            console.error('Error saving plot:', error);
            showToast('Error', 'Failed to save plot', 'error');
        })
        .finally(() => {
            // Restore save button
            saveButton.innerHTML = originalText;
            saveButton.disabled = false;
        });
    }
    
    // Load an existing plot
    function loadPlot(plotId) {
        if (!plotId) return;
        
        // Show loading indicator
        showToast('Loading', 'Loading plot...', 'info');
        
        fetch(`/designer/api/plot/${plotId}/`)
            .then(response => response.json())
            .then(data => {
                // Clear existing fixtures
                fixturesGroup.clear();
                
                // If there's stage data, update the stage
                if (data.plot.stage_id) {
                    const stageSelect = document.getElementById('stage-select');
                    if (stageSelect) {
                        stageSelect.value = data.plot.stage_id;
                        // TODO: Redraw stage based on selection
                    }
                }
                
                // If there's plot data, restore viewbox and other settings
                if (data.plot.plot_data) {
                    if (data.plot.plot_data.viewportInfo) {
                        viewportInfo = data.plot.plot_data.viewportInfo;
                        updateViewport();
                    }
                    
                    if (data.plot.plot_data.stageDimensions) {
                        stageDimensions = data.plot.plot_data.stageDimensions;
                        drawDefaultStage();
                    }
                }
                
                // Add fixtures to the plot
                data.fixtures.forEach(fixture => {
                    // Similar to placeFixture function but with existing data
                    const fixtureInstanceId = `fixture-${fixture.id}`;
                    
                    const fixtureElement = draw.group().id(fixtureInstanceId);
                    fixtureElement.circle(30)
                        .fill('#0066cc')
                        .center(0, 0);
                        
                    fixtureElement.circle(16)
                        .fill('white')
                        .center(0, 0);
                        
                    fixtureElement.text(fixture.channel || '')
                        .font({ size: 12, family: 'Arial', weight: 'bold', anchor: 'middle' })
                        .center(0, 0);
                        
                    // Position the fixture
                    fixtureElement.center(fixture.x, fixture.y);
                    
                    // Store fixture data
                    fixtureElement.attr({
                        'data-fixture-id': fixture.fixture_id,
                        'data-fixture-instance-id': fixtureInstanceId,
                        'data-channel': fixture.channel || '',
                        'data-purpose': fixture.purpose || '',
                        'data-color': fixture.color || '',
                        'data-notes': fixture.notes || '',
                        'data-dimmer': fixture.dimmer || '',
                    });
                    
                    // Rotate if needed
                    if (fixture.rotation) {
                        fixtureElement.rotate(fixture.rotation);
                    }
                    
                    // Add to fixtures group
                    fixturesGroup.add(fixtureElement);
                    
                    // Make the fixture selectable
                    makeFixtureSelectable(fixtureElement);
                });
                
                showToast('Success', 'Plot loaded successfully', 'success');
            })
            .catch(error => {
                console.error('Error loading plot:', error);
                showToast('Error', 'Failed to load plot', 'error');
            });
    }
    
    // Helper function to get CSRF token
    function getCsrfToken() {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
        return cookieValue;
    }
    
    // Show a toast/notification
    function showToast(title, message, type = 'info') {
        // Check if we have a toast container
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
            toastContainer.style.zIndex = '1050';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast
        const toastId = `toast-${Date.now()}`;
        const toast = document.createElement('div');
        toast.className = `toast ${type === 'error' ? 'bg-danger text-white' : ''}`;
        toast.id = toastId;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        // Toast header
        const header = document.createElement('div');
        header.className = 'toast-header';
        header.innerHTML = `
            <strong class="me-auto">${title}</strong>
            <small>just now</small>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        `;
        
        // Toast body
        const body = document.createElement('div');
        body.className = 'toast-body';
        body.textContent = message;
        
        // Assemble and show toast
        toast.appendChild(header);
        toast.appendChild(body);
        toastContainer.appendChild(toast);
        
        // Using Bootstrap's Toast API
        const bsToast = new bootstrap.Toast(toast, { autohide: true, delay: 5000 });
        bsToast.show();
        
        // Remove toast after it's hidden
        toast.addEventListener('hidden.bs.toast', function() {
            toast.remove();
        });
    }
    
    // Initialize the editor
    function initializeEditor() {
        // Make sure SVG.js is loaded
        if (typeof SVG !== 'function') {
            console.error('SVG.js library not loaded!');
            return;
        }
        
        try {
            // Initialize the editor
            initEditor();
            
            // Set up save button
            const saveButton = document.getElementById('save-button');
            if (saveButton) {
                saveButton.addEventListener('click', savePlot);
            }
            
            // Check if we're editing an existing plot
            const plotId = window.location.pathname.match(/\/editor\/(\d+)/)?.[1];
            if (plotId) {
                loadPlot(plotId);
            }
        } catch (error) {
            console.error('Error initializing editor:', error);
        }
    }
    
    // Ensure the SVG.js library is loaded before initializing
    if (document.readyState === 'complete') {
        initializeEditor();
    } else {
        window.addEventListener('load', initializeEditor);
    }
    
    // Initialize a variable for temporary tool storage (for space key panning)
    let tempTool = null;
});