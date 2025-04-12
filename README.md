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

### In Progress
- 🔄 Pipe/truss enhancements
  - Ability to stretch/resize pipes
  - Unique naming validation for pipes
  - Fix deletion of pipes from canvas
- 🔄 Stage measurement display
  - Toggle-able measurements
  - Improved stage representation

### Planned Features
- 📋 Locking fixtures and pipes in place
- 📋 Fixture focus and beam visualization
- 📋 DMX addressing and patch integration
- 📋 Plot export (PDF, DWG)
- 📋 Collaboration features
- 📋 Detailed inventory reports

## Code Structure

- `/designer` - Django app for the lighting plot designer
  - `/models` - Database models for plots, fixtures, stages
  - `/static/designer/js` - JavaScript code
    - `/modules` - Modular JavaScript components
  - `/templates` - HTML templates

## Running the Project

1. Install dependencies: `pip install -r requirements.txt`
2. Apply migrations: `python manage.py migrate`
3. Run the server: `python manage.py runserver`
4. Access the application at http://localhost:8000

## Technical Notes

- The JavaScript codebase uses ES6 modules for better organization and reduced memory usage
- SVG.js is used for vector manipulation
- Bootstrap is used for UI components