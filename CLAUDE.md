# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Lint/Test Commands
- Run server: `python manage.py runserver`
- Create migrations: `python manage.py makemigrations`
- Apply migrations: `python manage.py migrate`
- Create superuser: `python manage.py createsuperuser`
- Shell: `python manage.py shell`
- Test all: `python manage.py test`
- Test specific app: `python manage.py test designer`
- Test specific file: `python manage.py test designer.tests.test_models`
- Collect static files: `python manage.py collectstatic --noinput`

## Project Architecture
The project follows the Model-Controller-Presenter (MCP) architecture:
- **Models**: Handle data structure and storage in database
- **Controllers**: Handle business logic and data operations
- **Presenters**: Handle UI logic and preparing data for views
- **Views**: Handle rendering templates and user interaction

The frontend JavaScript follows a behavior-based architecture:
- **Base Elements**: Core functionality shared by all elements
- **Behaviors**: Composable pieces of functionality (draggable, selectable, etc.)
- **Element Types**: Specific implementations (pipes, fixtures)
- **UI Components**: User interface elements and interactions

## Architecture Principles
- **DRY (Don't Repeat Yourself)**: Identify common functionality and create reusable components
- **Single Responsibility**: Each module/class has one clear purpose
- **Composable Behaviors**: Elements are built by composing multiple behaviors
- **Command Pattern**: Used for undoable operations
- **Event System**: For loose coupling between components

## Code Style Guidelines
- **Formatting**: Follow PEP 8 style guide for Python code
- **Imports**: Group imports: 1) Python standard library 2) Django modules 3) Third-party packages 4) Local modules
- **Naming**: snake_case for variables/functions, PascalCase for classes
- **Django Models**: Fields first, then Meta class, then methods
- **Error Handling**: Use try/except blocks; log errors with context; never suppress errors
- **Templates**: Use Django template inheritance with base.html
- **File Structure**: Modular organization - models/ for model modules
- **JavaScript**: Use ES6 modules with proper imports/exports
- **Doc String**: Use descriptive docstrings for all functions and classes

## JavaScript Organization
- All JavaScript is organized into ES6 modules
- Follows DRY principle with reusable components
- Core directory structure:
  - `/modules/elements/` - Base element and registry
  - `/modules/elements/behaviors/` - Reusable behaviors
  - `/modules/elements/commands/` - Undoable operations
  - `/modules/types/` - Element implementations
  - `/modules/ui/` - UI components
- Use proper import/export syntax for module dependencies
- Handle errors gracefully in try/catch blocks
- Use consistent naming conventions for functions and variables
- Implement proper event cleanup to prevent memory leaks

# Rotation Handle Implementation Notes

## Recent Implementation Attempts
We've been working on implementing rotation handles for elements in the Light Plot Designer. We've tried:

1. Creating a new `RotatableBehavior` class to manage rotation handles
2. Improving the DraggableBehavior to work consistently
3. Enhancing the LockableBehavior with better visual feedback

## Current Issues
The implementation is not working as expected:

1. The rotation handle from the test script doesn't properly rotate elements
2. The handles don't follow elements when dragged
3. The locking mechanism isn't applying consistently
4. The behavior system integration needs refinement

## Next Steps
The next chat should focus on:

1. Implementing a clean, working `RotatableBehavior` that's properly integrated with the behavior system
2. Ensuring consistent visual feedback for both selected and locked states
3. Making handles part of element groups so they move with elements
4. Following the DRY principle for all these implementations
5. Making the behaviors work with both fixtures and pipes

## Approach Recommendation
1. Start with one behavior at a time, verify it works
2. Use SVG groups properly to ensure handles are children of elements
3. Implement proper event handling for rotation
4. Ensure behaviors cooperate (e.g., locking disables rotation)
5. Add visual feedback with CSS rather than manual SVG attribute manipulation when possible