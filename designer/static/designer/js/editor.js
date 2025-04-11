/**
 * Light Plot Designer - Editor JavaScript
 * 
 * This file contains the core functionality for the vector-based
 * theatrical lighting plot designer.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize SVG canvas
    const draw = SVG().addTo('#canvas').size('100%', '100%');
    
    // Constants for the editor
    const GRID_SIZE = 10;
    const FIXTURE_SCALE = 1.0;
    
    // State management
    let currentTool = 'select';
    let selectedFixtures = [];
    let isDragging = false;
    let stageGroup = null;
    let fixturesGroup = null;
    let gridGroup = null;
    
    // Initialize editor
    function initEditor() {
        console.log('Initializing Light Plot Editor');
        
        // Create main groups
        stageGroup = draw.group().id('stage-group');
        fixturesGroup = draw.group().id('fixtures-group');
        gridGroup = draw.group().id('grid-group');
        
        // Draw initial stage
        drawDefaultStage();
        
        // Set up event handlers for tools
        setupToolHandlers();
        
        // Set up fixture library events
        setupFixtureLibrary();
        
        // Set up property panel events
        setupPropertyPanel();
        
        console.log('Editor initialized');
    }
    
    // Draw a default stage
    function drawDefaultStage() {
        stageGroup.clear();
        
        // Draw basic stage shape
        stageGroup.rect(800, 600)
            .fill('#f9f9f9')
            .stroke({ width: 2, color: '#000' })
            .center(0, 0);
            
        // Draw center line
        stageGroup.line(-400, 0, 400, 0)
            .stroke({ width: 1, color: '#999', dasharray: '5,5' });
            
        // Draw plaster line
        stageGroup.line(-400, -100, 400, -100)
            .stroke({ width: 2, color: '#333' });
        
        // Add label for plaster line
        stageGroup.text("PLASTER LINE")
            .font({ size: 12, family: 'Arial' })
            .move(-50, -120);
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
    }
    
    // Set the active tool
    function setActiveTool(tool) {
        currentTool = tool;
        
        // Reset all tool buttons
        document.querySelectorAll('#toolbar button').forEach(btn => {
            btn.classList.remove('tool-active');
        });
        
        // Highlight the active tool
        document.getElementById(`${tool}-tool`).classList.add('tool-active');
        
        console.log(`Active tool set to: ${tool}`);
    }
    
    // Zoom the canvas
    function zoomCanvas(factor) {
        // This is a placeholder for zoom functionality
        // In a full implementation, this would adjust the viewBox
        console.log(`Zoom: ${factor}`);
    }
    
    // Set up fixture library interactions
    function setupFixtureLibrary() {
        const fixtureItems = document.querySelectorAll('.fixture-item');
        
        fixtureItems.forEach(item => {
            item.addEventListener('click', function() {
                const fixtureId = this.getAttribute('data-fixture-id');
                
                if (currentTool === 'add-fixture') {
                    console.log(`Selected fixture: ${fixtureId}`);
                    
                    // In a full implementation, this would prepare the fixture
                    // for placement on the canvas
                }
            });
        });
    }
    
    // Set up property panel interactions
    function setupPropertyPanel() {
        // This is a placeholder for property panel setup
        // In a full implementation, this would handle property updates
        console.log('Property panel initialized');
    }
    
    // Initialize the editor
    initEditor();
});