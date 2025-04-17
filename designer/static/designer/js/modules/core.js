/**
 * Light Plot Designer - Core Module
 * 
 * Core functionality for the vector-based theatrical lighting plot designer.
 * Contains the main initialization logic and shared state.
 */

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

// Shared state
let draw = null;
let currentTool = 'select';
let selectedFixtures = [];
let selectedPipe = null;
let isDragging = false;
let stageGroup = null;
let fixturesGroup = null;
let pipesGroup = null;
let gridGroup = null;
let paperGroup = null;
let fohGroup = null;

// Pipe counter for unique IDs
let pipeCounter = 1;

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
    
    // Create SVG drawing
    draw = SVG().addTo('#canvas').size('100%', '100%');
    
    // Create main groups, order matters for layering
    paperGroup = draw.group().id('paper-group');
    gridGroup = draw.group().id('grid-group');
    fohGroup = draw.group().id('foh-group');
    stageGroup = draw.group().id('stage-group');
    pipesGroup = draw.group().id('pipes-group');
    fixturesGroup = draw.group().id('fixtures-group');
    
    // Initialize view modules
    setupPaperSize();
    drawGrid();
    drawDefaultStage();
    centerView();
    
    // Setup event handlers and libraries
    setupToolHandlers();
    setupFixtureLibrary();
    setupPipesLibrary();
    setupPropertyPanel();
    
    console.log('Editor initialized');
}

// Center the view
function centerView() {
    // In a full implementation, this would adjust the viewBox correctly
    // For now, we'll just set a simple viewBox
    const viewBoxWidth = paperSize.width * 1.1;
    const viewBoxHeight = paperSize.height * 1.1;
    draw.viewbox(-viewBoxWidth/2, -viewBoxHeight/2, viewBoxWidth, viewBoxHeight);
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

// Function to set the selected pipe
function setSelectedPipe(pipe) {
    selectedPipe = pipe;
    console.log(`Selected pipe set to: ${pipe ? pipe.id() : 'null'}`);
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

// Convert mouse position to SVG coordinates (utility function)
function getCanvasPoint(event) {
    try {
        const svg = document.querySelector('#canvas svg');
        if (!svg) {
            console.error('SVG element not found');
            return { x: 0, y: 0 };
        }
        
        const point = svg.createSVGPoint();
        point.x = event.clientX;
        point.y = event.clientY;
        
        // Get SVG coordinate system
        const ctm = svg.getScreenCTM();
        if (!ctm) {
            console.error('Failed to get screen CTM');
            return { x: 0, y: 0 };
        }
        
        const inverseCTM = ctm.inverse();
        const svgPoint = point.matrixTransform(inverseCTM);
        
        return svgPoint;
    } catch (error) {
        console.error('Error in getCanvasPoint:', error);
        return { x: 0, y: 0 };
    }
}

// Function to update pipe counter
function updatePipeCounter(value) {
    pipeCounter = value;
}

// Export shared variables and functions
export {
    // Constants
    GRID_SIZE,
    FIXTURE_SCALE,
    A4_WIDTH,
    A4_HEIGHT,
    SCALE_FACTOR,
    DEFAULT_STAGE_WIDTH,
    DEFAULT_STAGE_DEPTH,
    DEFAULT_FOH_DEPTH,
    
    // State variables
    draw,
    currentTool,
    selectedFixtures,
    selectedPipe,
    isDragging,
    stageGroup,
    fixturesGroup,
    pipesGroup,
    gridGroup,
    paperGroup,
    fohGroup,
    pipeCounter,
    updatePipeCounter,
    paperSize,
    stageDimensions,
    viewportInfo,
    
    // Functions
    initEditor,
    centerView,
    updateViewport,
    setActiveTool,
    setSelectedPipe,
    getCsrfToken,
    showToast,
    zoomCanvas,
    getCanvasPoint,
    
    // Module initialization
    setupPaperSize,
    drawGrid,
    drawDefaultStage,
    setupToolHandlers,
    setupFixtureLibrary,
    setupPipesLibrary,
    setupPropertyPanel
};

// Import module implementations
import { setupPaperSize } from './paper.js';
import { drawGrid } from './grid.js';
import { drawDefaultStage } from './stage.js';
import { setupToolHandlers } from './tools.js';
import { setupFixtureLibrary } from './fixtures.js';
import { setupPipesLibrary } from './pipes.js';
import { setupPropertyPanel } from './properties.js';