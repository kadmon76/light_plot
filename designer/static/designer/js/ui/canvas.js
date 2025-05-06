// File: designer/static/designer/js/ui/canvas.js

/**
 * Canvas Module
 * 
 * Handles the SVG canvas initialization and management.
 * Provides functions for creating, manipulating and zooming the canvas.
 */

import { getState, setState, initDrawing } from '../core/state.js';
import { PAPER_WIDTH, PAPER_HEIGHT, SCALE_FACTOR } from '../core/config.js';

// Constants for internal use
const MARGIN_SIZE = 20; // Margin in mm
const TITLE_BLOCK_HEIGHT = 20; // Title block height in mm
const GRID_SPACING = 10; // Grid spacing in cm
const PAPER_MARGIN = 1.1; // Viewbox margin factor (10% extra)

/**
 * Initialize the canvas
 * Creates the SVG drawing and all required groups, then draws initial elements
 */
export function initCanvas() {
    try {
        // Create SVG drawing
        const draw = SVG().addTo('#canvas').size('100%', '100%');
        if (!draw) {
            throw new Error('Failed to create SVG drawing');
        }
        
        // Initialize state with drawing
        initDrawing(draw);
        
        // Set up viewport
        setupViewport();
        
        // Clear any existing elements
        draw.clear();
        
        // Create all required groups in the correct order
        const paperGroup = draw.group().id('paper-group');
        const gridGroup = draw.group().id('grid-group');
        const stageGroup = draw.group().id('stage-group');
        const fohGroup = draw.group().id('foh-group');
        const fixturesGroup = draw.group().id('fixtures-group');
        
        // Store all groups in state
        setState('paperGroup', paperGroup);
        setState('gridGroup', gridGroup);
        setState('stageGroup', stageGroup);
        setState('fohGroup', fohGroup);
        setState('fixturesGroup', fixturesGroup);
        
        // Draw basic elements
        drawPaper();
        drawGrid();
        drawStage();
        
        // Configure fixtures group for better visibility
        configureFixturesGroup(fixturesGroup, draw);
    } catch (error) {
        console.error('Failed to initialize canvas:', error);
    }
}

/**
 * Configure the fixtures group for optimal visibility
 * @param {SVG.G} fixturesGroup - Fixtures group element
 * @param {SVG.Doc} draw - SVG.js drawing object
 * @private
 */
function configureFixturesGroup(fixturesGroup, draw) {
    if (!fixturesGroup) return;
    
    // Ensure fixtures are fully visible
    fixturesGroup.attr({
        'fill-opacity': 1,
        'stroke-opacity': 1,
        'pointer-events': 'all'
    });
    
    // Position fixtures group relative to viewport center
    if (draw) {
        const viewBox = draw.viewbox();
        const centerX = viewBox.x + viewBox.width/2;
        const centerY = viewBox.y + viewBox.height/2;
        fixturesGroup.move(centerX, centerY);
    }
}

/**
 * Set up initial viewport
 */
function setupViewport() {
    const draw = getState('draw');
    if (!draw) {
        console.error('Canvas: SVG drawing not initialized');
        return;
    }
    
    try {
        // Calculate paper size in pixels
        const paperWidth = PAPER_WIDTH * SCALE_FACTOR;
        const paperHeight = PAPER_HEIGHT * SCALE_FACTOR;
        
        // Set up initial viewbox to show whole paper with some margin
        const viewBoxWidth = paperWidth * PAPER_MARGIN;
        const viewBoxHeight = paperHeight * PAPER_MARGIN;
        
        // Center the view
        const viewBoxX = -viewBoxWidth / 2;
        const viewBoxY = -viewBoxHeight / 2;
        
        draw.viewbox(viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight);
    } catch (error) {
        console.error('Failed to setup viewport:', error);
    }
}

/**
 * Draw paper background
 */
function drawPaper() {
    const paperGroup = getState('paperGroup');
    if (!paperGroup) {
        console.error('Canvas: Paper group not initialized');
        return;
    }
    
    try {
        // Calculate paper size in pixels
        const paperWidth = PAPER_WIDTH * SCALE_FACTOR;
        const paperHeight = PAPER_HEIGHT * SCALE_FACTOR;
        
        // Calculate margin and inner dimensions
        const marginSizePx = MARGIN_SIZE * SCALE_FACTOR;
        const titleBlockHeightPx = TITLE_BLOCK_HEIGHT * SCALE_FACTOR;
        const innerWidth = paperWidth - (marginSizePx * 2);
        const innerHeight = paperHeight - (marginSizePx * 2);
        
        // Draw paper background
        paperGroup.rect(paperWidth, paperHeight)
            .fill('#ffffff')
            .stroke({ width: 1, color: '#000000' })
            .center(0, 0);
        
        // Draw margin area
        paperGroup.rect(innerWidth, innerHeight)
            .fill('none')
            .stroke({ width: 0.5, color: '#cccccc', dasharray: '5,5' })
            .center(0, 0);
        
        // Add title block at the bottom
        paperGroup.rect(innerWidth, titleBlockHeightPx)
            .fill('#f8f8f8')
            .stroke({ width: 0.5, color: '#000000' })
            .move(-innerWidth/2, paperHeight/2 - titleBlockHeightPx - marginSizePx);
        
        // Add default text in title block
        paperGroup.text('LIGHT PLOT - NEW DESIGN')
            .font({ size: 16, family: 'Arial', weight: 'bold' })
            .move(-innerWidth/2 + 10, paperHeight/2 - titleBlockHeightPx - marginSizePx + 10);
    } catch (error) {
        console.error('Failed to draw paper:', error);
    }
}

/**
 * Draw grid
 */
function drawGrid() {
    const gridGroup = getState('gridGroup');
    if (!gridGroup) {
        console.error('Canvas: Grid group not initialized');
        return;
    }
    
    try {
        // Calculate paper size in pixels
        const paperWidth = PAPER_WIDTH * SCALE_FACTOR;
        const paperHeight = PAPER_HEIGHT * SCALE_FACTOR;
        
        // Draw grid with spacing converted to pixels
        const gridSpacingPx = GRID_SPACING * SCALE_FACTOR;
        const gridColor = '#e0e0e0';
        
        // Draw vertical grid lines
        for (let x = -paperWidth/2; x <= paperWidth/2; x += gridSpacingPx) {
            gridGroup.line(x, -paperHeight/2, x, paperHeight/2)
                .stroke({ width: 0.5, color: gridColor });
        }
        
        // Draw horizontal grid lines
        for (let y = -paperHeight/2; y <= paperHeight/2; y += gridSpacingPx) {
            gridGroup.line(-paperWidth/2, y, paperWidth/2, y)
                .stroke({ width: 0.5, color: gridColor });
        }
    } catch (error) {
        console.error('Failed to draw grid:', error);
    }
}

/**
 * Draw stage
 */
function drawStage() {
    const stageGroup = getState('stageGroup');
    const fohGroup = getState('fohGroup');
    
    if (!stageGroup || !fohGroup) {
        console.error('Canvas: Stage or FOH group not initialized');
        return;
    }
    
    try {
        // Calculate dimensions
        const paperWidth = PAPER_WIDTH * SCALE_FACTOR;
        const paperHeight = PAPER_HEIGHT * SCALE_FACTOR;
        const marginSizePx = MARGIN_SIZE * SCALE_FACTOR;
        const titleBlockHeightPx = TITLE_BLOCK_HEIGHT * SCALE_FACTOR;
        
        // Calculate available space on paper
        const innerWidth = paperWidth - (marginSizePx * 2);
        const innerHeight = paperHeight - (marginSizePx * 2) - titleBlockHeightPx;
        
        // Calculate stage and FOH dimensions
        const stageWidthPx = innerWidth;
        const stageDepthPx = innerHeight * 0.7; // 70% for stage
        const fohDepthPx = innerHeight * 0.2;   // 20% for FOH
        
        // Calculate positions
        const paperTopEdge = -paperHeight/2 + marginSizePx;
        const stageY = paperTopEdge + stageDepthPx/2;
        const fohY = stageY + stageDepthPx/2 + fohDepthPx/2;
        
        // Draw stage
        drawStageArea(stageGroup, stageWidthPx, stageDepthPx, stageY);
        
        // Draw FOH
        drawFohArea(fohGroup, stageWidthPx, fohDepthPx, fohY);
        
        // Draw stage lines
        drawStageLines(stageGroup, stageWidthPx, stageDepthPx, stageY);
    } catch (error) {
        console.error('Failed to draw stage:', error);
    }
}

/**
 * Draw the main stage area
 * @param {SVG.G} stageGroup - Stage group element
 * @param {Number} width - Stage width in pixels
 * @param {Number} depth - Stage depth in pixels
 * @param {Number} yPosition - Y position of stage center
 * @private
 */
function drawStageArea(stageGroup, width, depth, yPosition) {
    stageGroup.rect(width, depth)
        .fill('#f9f9f9')
        .stroke({ width: 2, color: '#000', dasharray: '5,5' })
        .center(0, yPosition);
    
    // Draw center line
    stageGroup.line(-width/2, yPosition, width/2, yPosition)
        .stroke({ width: 1, color: '#999', dasharray: '5,5' });
}

/**
 * Draw the front of house area
 * @param {SVG.G} fohGroup - FOH group element
 * @param {Number} width - FOH width in pixels
 * @param {Number} depth - FOH depth in pixels
 * @param {Number} yPosition - Y position of FOH center
 * @private
 */
function drawFohArea(fohGroup, width, depth, yPosition) {
    fohGroup.rect(width, depth)
        .fill('#f0f0f0')
        .stroke({ width: 1, color: '#000', dasharray: '5,5' })
        .center(0, yPosition);
    
    // Add FOH label
    fohGroup.text("FRONT OF HOUSE")
        .font({ size: 14, family: 'Arial', weight: 'bold' })
        .center(0, yPosition);
}

/**
 * Draw stage reference lines (plaster line, etc.)
 * @param {SVG.G} stageGroup - Stage group element
 * @param {Number} width - Stage width in pixels
 * @param {Number} depth - Stage depth in pixels
 * @param {Number} yPosition - Y position of stage center
 * @private
 */
function drawStageLines(stageGroup, width, depth, yPosition) {
    // Draw plaster line at the downstage edge of the stage
    const plasterLineY = yPosition + depth/2;
    
    stageGroup.line(-width/2, plasterLineY, width/2, plasterLineY)
        .stroke({ width: 2, color: '#333' });
    
    // Add label for plaster line
    stageGroup.text("PLASTER LINE")
        .font({ size: 12, family: 'Arial' })
        .center(0, plasterLineY + 15);
}

/**
 * Update viewport based on zoom and pan
 * @param {Number} zoom - Zoom level
 * @param {Object} pan - Pan offset {x, y}
 */
export function updateViewport(zoom, pan) {
    const draw = getState('draw');
    if (!draw) {
        console.error('Canvas: SVG drawing not initialized');
        return;
    }
    
    try {
        // Calculate paper size in pixels
        const paperWidth = PAPER_WIDTH * SCALE_FACTOR;
        const paperHeight = PAPER_HEIGHT * SCALE_FACTOR;
        
        // Calculate viewbox dimensions based on zoom
        const viewBoxWidth = paperWidth * PAPER_MARGIN / zoom;
        const viewBoxHeight = paperHeight * PAPER_MARGIN / zoom;
        
        // Apply pan offset
        const viewBoxX = -viewBoxWidth/2 + pan.x;
        const viewBoxY = -viewBoxHeight/2 + pan.y;
        
        // Update viewbox
        draw.viewbox(viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight);
    } catch (error) {
        console.error('Failed to update viewport:', error);
    }
}

/**
 * Zoom canvas
 * @param {Number} factor - Zoom factor (>1 to zoom in, <1 to zoom out)
 * @param {Object} center - Center point for zoom {x, y}, defaults to viewport center
 */
export function zoomCanvas(factor, center) {
    const draw = getState('draw');
    if (!draw) {
        console.error('Canvas: SVG drawing not initialized');
        return;
    }
    
    try {
        // Get current viewbox
        const viewbox = draw.viewbox();
        
        // Calculate new zoom level
        let zoom = (1 / viewbox.width) * PAPER_WIDTH * SCALE_FACTOR * PAPER_MARGIN;
        zoom *= factor;
        
        // Clamp zoom to reasonable values
        zoom = Math.max(0.2, Math.min(5, zoom));
        
        // Get current pan
        const pan = {
            x: viewbox.x + viewbox.width/2,
            y: viewbox.y + viewbox.height/2
        };
        
        // Update viewport
        updateViewport(zoom, pan);
    } catch (error) {
        console.error('Failed to zoom canvas:', error);
    }
}