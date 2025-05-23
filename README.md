# Light Plot Designer

A web application for creating theatrical lighting plots using vector graphics.

## Project Overview

Light Plot Designer is a Django-based application that allows lighting designers to create, edit, and share theatrical lighting plots. The application uses SVG.js for vector graphics manipulation and provides a user-friendly interface for designing lighting layouts.

## Current Features

- Vector-based drawing with zoom and pan capabilities
- Standard A4 layout with stage representation
- Fixture library with drag-and-drop placement
- Pipe/truss system for hanging fixtures
- Property editing for fixtures (channel, color, purpose, etc.)
- Save/load functionality for lighting plots

## Development Progress

### Completed
- ✅ Basic application structure with Django
- ✅ Editor interface with SVG canvas
- ✅ Fixture placement and manipulation
- ✅ Pipe/truss placement and manipulation
- ✅ Basic saving and loading of plots
- ✅ Modular JavaScript architecture
- ✅ Model-Controller-Presenter (MCP) architecture
- ✅ Pipe/truss enhancements
  - Ability to stretch/resize pipes through properties panel
  - Locking pipes in place to prevent movement
  - Visual indicators for selected and locked pipes
- ✅ Fixed pipe dragging behavior

### In Progress
- 🔄 Modular behavior system refactoring
  - Implementing DRY principle with shared behaviors
  - Creating behavior-based architecture for elements
- 🔄 Fixture enhancements
  - Locking fixtures in place
  - Improving fixture selection and property editing
- 🔄 Stage measurement display
  - Toggle-able measurements
  - Improved stage representation
### future use case behaviors and proporties 
Additional Use Cases to Consider:
- Element Duplication
  - Copy/paste functionality
  - Duplicate with offset (common in design tools)
- Alignment Controls
  - Align to grid
  - Align selected elements (left, center, right, top, middle, bottom)
  - Distribute evenly (horizontally or vertically)
- Grouping and Ungrouping
  - Group elements to move/edit them together
  - Ungroup to edit individually
- Snap to Grid/Guides
 - Elements snap to grid points or guide lines
 - Option to toggle snapping on/off
- Context-Sensitive Handles
- Different element types might need different handle behaviors
  For example, pipes might need handles to stretch in length but not height
- Quick Actions
  - Right-click context menu for common actions
  - Keyboard shortcuts for rotation (e.g., R+drag for rotation)
- Mass Property Editing
  - filtering in the sidebar (show only PAR-64 fixtures)
  - Batch operations (select all PAR-64s, change their color)
- Show light cone/direction for fixtures
- Bring forward/send backward for elements that overlap
- Undo/Redo
- History of actions for undoing mistakes

### Planned Features
- 📋 Fixture focus and beam visualization
- 📋 DMX addressing and patch integration
- 📋 Plot export (PDF, DWG)
- 📋 Collaboration features
- 📋 Detailed inventory reports
- 📋 Direct manipulation handles for pipe stretching

## Code Structure

- `/designer` - Django app for the lighting plot designer
  - `/models` - Database models for plots, fixtures, stages
  - `/controllers` - Business logic layer for MCP architecture
  - `/presenters` - UI logic layer for MCP architecture
  - `/static/designer/js/modules` - Modular JavaScript components
    - `/elements` - Core element functionality (base element, behaviors)
    - `/behaviors` - Composable behaviors (dragging, rotating, etc.)
    - `/types` - Element type implementations (pipes, fixtures, etc.)
    - `/ui` - UI components (properties panel, selection, etc.)
  - `/templates` - HTML templates

## Architecture Principles

The project follows these key principles:
- **DRY (Don't Repeat Yourself)** - Identify common functionality across different elements and create reusable, shared components rather than duplicating code
- **Single Responsibility** - Each module has a clear, focused purpose
- **Composable Behaviors** - Elements are built from reusable behaviors
- **Command Pattern** - For undoable operations
- **Event-based communication** - For loose coupling between components

## Running the Project

1. Install dependencies: `pip install -r requirements.txt`
2. Apply migrations: `python manage.py migrate`
3. Run the server: `python manage.py runserver`
4. Access the application at http://localhost:8000