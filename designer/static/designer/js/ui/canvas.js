// File: designer/static/designer/js/ui/canvas.js

/**
 * Canvas Module
 * 
 * Handles the SVG canvas initialization and management.
 */

 import { getState, setState, initDrawing } from '../core/state.js';
 import { PAPER_WIDTH, PAPER_HEIGHT, SCALE_FACTOR } from '../core/config.js';
 
 /**
  * Initialize the canvas
  */
 export function initCanvas() {
     console.log('Canvas: Initializing SVG canvas');
     
     // Create SVG drawing
     const draw = SVG().addTo('#canvas').size('100%', '100%');
     
     // Initialize state with drawing and element groups
     initDrawing(draw);
     
     // Set up viewport
     setupViewport();
     
     // Draw paper background
     drawPaper();
     
     // Draw grid
     drawGrid();
     
     // Draw stage
     drawStage();
     
     console.log('Canvas: SVG canvas initialized');
 }
 
 /**
  * Set up initial viewport
  */
 function setupViewport() {
     console.log('Canvas: Setting up viewport');
     
     const draw = getState('draw');
     if (!draw) {
         console.error('Canvas: SVG drawing not initialized');
         return;
     }
     
     // Calculate paper size in pixels
     const paperWidth = PAPER_WIDTH * SCALE_FACTOR;
     const paperHeight = PAPER_HEIGHT * SCALE_FACTOR;
     
     // Set up initial viewbox to show whole paper with some margin
     const viewBoxWidth = paperWidth * 1.1;
     const viewBoxHeight = paperHeight * 1.1;
     
     // Center the view
     const viewBoxX = -viewBoxWidth / 2;
     const viewBoxY = -viewBoxHeight / 2;
     
     draw.viewbox(viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight);
     
     console.log(`Canvas: Viewport set to ${viewBoxX},${viewBoxY} ${viewBoxWidth}x${viewBoxHeight}`);
 }
 
 /**
  * Draw paper background
  */
 function drawPaper() {
     console.log('Canvas: Drawing paper background');
     
     const paperGroup = getState('paperGroup');
     if (!paperGroup) {
         console.error('Canvas: Paper group not initialized');
         return;
     }
     
     // Calculate paper size in pixels
     const paperWidth = PAPER_WIDTH * SCALE_FACTOR;
     const paperHeight = PAPER_HEIGHT * SCALE_FACTOR;
     
     // Draw paper background
     paperGroup.rect(paperWidth, paperHeight)
         .fill('#ffffff')
         .stroke({ width: 1, color: '#000000' })
         .center(0, 0);
     
     // Draw margin area (20mm)
     const marginSize = 20 * SCALE_FACTOR;
     const innerWidth = paperWidth - (marginSize * 2);
     const innerHeight = paperHeight - (marginSize * 2);
     
     paperGroup.rect(innerWidth, innerHeight)
         .fill('none')
         .stroke({ width: 0.5, color: '#cccccc', dasharray: '5,5' })
         .center(0, 0);
     
     // Add title block at the bottom
     const titleBlockHeight = 20 * SCALE_FACTOR;
     paperGroup.rect(innerWidth, titleBlockHeight)
         .fill('#f8f8f8')
         .stroke({ width: 0.5, color: '#000000' })
         .move(-innerWidth/2, paperHeight/2 - titleBlockHeight - marginSize);
     
     // Add default text in title block
     paperGroup.text('LIGHT PLOT - NEW DESIGN')
         .font({ size: 16, family: 'Arial', weight: 'bold' })
         .move(-innerWidth/2 + 10, paperHeight/2 - titleBlockHeight - marginSize + 10);
     
     console.log('Canvas: Paper background drawn');
 }
 

/**
 * Draw grid
 */
function drawGrid() {
    console.log('Canvas: Drawing grid');
    
    const gridGroup = getState('gridGroup');
    if (!gridGroup) {
        console.error('Canvas: Grid group not initialized');
        return;
    }
    
    // Calculate paper size in pixels
    const paperWidth = PAPER_WIDTH * SCALE_FACTOR;
    const paperHeight = PAPER_HEIGHT * SCALE_FACTOR;
    
    // Draw grid with 10cm spacing (converted to pixels)
    const gridSpacing = 10 * SCALE_FACTOR;
    const gridColor = '#e0e0e0';
    
    // Create vertical grid lines
    for (let x = -paperWidth/2; x <= paperWidth/2; x += gridSpacing) {
        gridGroup.line(x, -paperHeight/2, x, paperHeight/2)
            .stroke({ width: 0.5, color: gridColor });
    }
    
    // Create horizontal grid lines
    for (let y = -paperHeight/2; y <= paperHeight/2; y += gridSpacing) {
        gridGroup.line(-paperWidth/2, y, paperWidth/2, y)
            .stroke({ width: 0.5, color: gridColor });
    }
    
    console.log('Canvas: Grid drawn');
}

/**
 * Draw stage
 */
function drawStage() {
    console.log('Canvas: Drawing stage');
    
    const stageGroup = getState('stageGroup');
    const fohGroup = getState('fohGroup');
    
    if (!stageGroup || !fohGroup) {
        console.error('Canvas: Stage or FOH group not initialized');
        return;
    }
    
    // Get the paper dimensions for reference
    const paperWidth = PAPER_WIDTH * SCALE_FACTOR;
    const paperHeight = PAPER_HEIGHT * SCALE_FACTOR;
    
    // Calculate margin (20mm)
    const marginSize = 20 * SCALE_FACTOR;
    const titleBlockHeight = 20 * SCALE_FACTOR;
    
    // Calculate available space on paper
    const innerWidth = paperWidth - (marginSize * 2);
    const innerHeight = paperHeight - (marginSize * 2) - titleBlockHeight;
    
    // Make stage width match the inner width
    const stageWidthPx = innerWidth;
    
    // Calculate stage depth to fit in available space with FOH
    // Leave 70% for stage, 20% for FOH, 10% for spacing
    const stageDepthPx = innerHeight * 0.7;
    const fohDepthPx = innerHeight * 0.2;
    
    // Calculate the top position of the stage
    const paperTopEdge = -paperHeight/2 + marginSize;
    const stageY = paperTopEdge + stageDepthPx/2;
    
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
    
    // Draw plaster line - at the downstage edge of the stage
    stageGroup.line(-stageWidthPx/2, stageY + stageDepthPx/2, stageWidthPx/2, stageY + stageDepthPx/2)
        .stroke({ width: 2, color: '#333' });
    
    // Add label for plaster line
    stageGroup.text("PLASTER LINE")
        .font({ size: 12, family: 'Arial' })
        .center(0, stageY + stageDepthPx/2 + 15);
    
    console.log('Canvas: Stage drawn');
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
    
    // Calculate paper size in pixels
    const paperWidth = PAPER_WIDTH * SCALE_FACTOR;
    const paperHeight = PAPER_HEIGHT * SCALE_FACTOR;
    
    // Calculate viewbox dimensions based on zoom
    const viewBoxWidth = paperWidth * 1.1 / zoom;
    const viewBoxHeight = paperHeight * 1.1 / zoom;
    
    // Apply pan offset
    const viewBoxX = -viewBoxWidth/2 + pan.x;
    const viewBoxY = -viewBoxHeight/2 + pan.y;
    
    // Update viewbox
    draw.viewbox(viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight);
    
    console.log(`Canvas: Viewport updated to zoom=${zoom}, pan=(${pan.x}, ${pan.y})`);
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
    
    // Get current viewbox
    const viewbox = draw.viewbox();
    
    // Calculate new zoom level
    let zoom = (1 / viewbox.width) * PAPER_WIDTH * SCALE_FACTOR * 1.1;
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
}