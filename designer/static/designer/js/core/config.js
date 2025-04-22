// File: designer/static/designer/js/core/config.js

/**
 * Light Plot Designer - Configuration
 * 
 * Constants and configuration settings for the application.
 */

// Grid and scaling settings
export const GRID_SIZE = 10;
export const SCALE_FACTOR = 3.78; // Scaling factor for mm to pixels

// Paper size (A4 landscape in mm)
export const PAPER_WIDTH = 297;
export const PAPER_HEIGHT = 210;

// Default stage dimensions (in meters)
export const DEFAULT_STAGE_WIDTH = 12;
export const DEFAULT_STAGE_DEPTH = 8;
export const DEFAULT_FOH_DEPTH = 3;

// Element settings
export const FIXTURE_SCALE = 1.0;

// Tool types
export const TOOLS = {
    SELECT: 'select',
    PAN: 'pan',
    ADD_FIXTURE: 'add-fixture',
    ADD_PIPE: 'add-pipe'
};

// Behavior types
export const BEHAVIORS = {
    DRAGGABLE: 'draggable',
    SELECTABLE: 'selectable',
    ROTATABLE: 'rotatable',
    LOCKABLE: 'lockable'
};