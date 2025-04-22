// File: designer/static/designer/js/utils/svg-utils.js

/**
 * SVG Utils Module
 * 
 * Utility functions for working with SVG elements and coordinates.
 */

 import { getState } from '../core/state.js';

 /**
  * Convert mouse event coordinates to SVG coordinates
  * @param {Event} event - Mouse event
  * @return {Object} Point with x and y coordinates
  */
 export function getCanvasPoint(event) {
     const draw = getState('draw');
     if (!draw || !draw.node) {
         console.error('SVG drawing not initialized');
         return { x: 0, y: 0 };
     }
     
     try {
         // Create a point in screen coordinates
         const point = draw.node.createSVGPoint();
         point.x = event.clientX;
         point.y = event.clientY;
         
         // Convert to SVG document coordinates
         const ctm = draw.node.getScreenCTM();
         if (!ctm) {
             console.error('Failed to get screen CTM');
             return { x: 0, y: 0 };
         }
         
         const svgPoint = point.matrixTransform(ctm.inverse());
         
         return { x: svgPoint.x, y: svgPoint.y };
     } catch (error) {
         console.error('Error converting to canvas point:', error);
         return { x: 0, y: 0 };
     }
 }
 
 /**
  * Create a basic SVG element and add it to the specified group
  * @param {String} type - SVG element type (rect, circle, etc.)
  * @param {SVG.Container} group - Group to add element to
  * @param {Object} attributes - Element attributes
  * @return {SVG.Element} Created SVG element
  */
 export function createSvgElement(type, group, attributes = {}) {
     if (!group) {
         const draw = getState('draw');
         if (!draw) {
             console.error('SVG drawing not initialized');
             return null;
         }
         group = draw;
     }
     
     const element = group[type]();
     
     // Apply attributes
     for (const [key, value] of Object.entries(attributes)) {
         if (key === 'center' && Array.isArray(value) && value.length === 2) {
             element.center(value[0], value[1]);
         } else {
             element.attr(key, value);
         }
     }
     
     return element;
 }
 
 /**
  * Create a text element with common text attributes
  * @param {String} text - Text content
  * @param {SVG.Container} group - Group to add element to
  * @param {Object} attributes - Element attributes
  * @return {SVG.Text} Text element
  */
 export function createTextElement(text, group, attributes = {}) {
     if (!group) {
         const draw = getState('draw');
         if (!draw) {
             console.error('SVG drawing not initialized');
             return null;
         }
         group = draw;
     }
     
     // Default text attributes
     const textAttributes = {
         text: text,
         font: {
             size: 12,
             family: 'Arial',
             weight: 'normal',
             anchor: 'middle'
         },
         ...attributes
     };
     
     const element = group.text(text);
     
     // Apply font attributes
     if (textAttributes.font) {
         element.font(textAttributes.font);
     }
     
     // Apply other attributes
     for (const [key, value] of Object.entries(textAttributes)) {
         if (key !== 'text' && key !== 'font') {
             if (key === 'center' && Array.isArray(value) && value.length === 2) {
                 element.center(value[0], value[1]);
             } else {
                 element.attr(key, value);
             }
         }
     }
     
     return element;
 }