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

### In Progress
- 🔄 Fixture enhancements
  - Locking fixtures in place
  - Improving fixture selection and property editing
- 🔄 Stage measurement display
  - Toggle-able measurements
  - Improved stage representation

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
  - `/templates` - HTML templates

## Running the Project

1. Install dependencies: `pip install -r requirements.txt`
2. Apply migrations: `python manage.py migrate`
3. Run the server: `python manage.py runserver`
4. Access the application at http://localhost:8000

## Technical Notes

- Model-Controller-Presenter (MCP) architecture for cleaner code organization
- The JavaScript codebase uses ES6 modules for better organization and reduced memory usage
- SVG.js is used for vector graphics manipulation
- Bootstrap is used for responsive UI components
- JavaScript module pattern with proper import/export for code organization
- Enhanced caching mechanisms to reduce API costs
- Robust error handling throughout the application