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

# Code Cleanup Priorities

## Architectural Transition
The project is transitioning from an imperative, function-based approach to a modular, behavior-based architecture. During this transition, it's critical to:

1. **Remove redundant code** - Identify and eliminate old-style implementations once the behavior-based version is working
2. **Maintain clean interfaces** - Ensure API consistency between modules
3. **Delete deprecated functions** - Don't leave "dead code" in the codebase

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

## Implementation Sequence
When implementing the behavior system, follow this sequence:
1. Base element infrastructure (BaseElement, ElementRegistry)
2. Core behaviors (Selectable, Draggable, Lockable, Rotatable)
3. Element type implementations (fixtures, pipes)
4. UI connections (property panel, tools)

## Code Quality Guidelines
- Each module should have a single, clear responsibility
- Behaviors should be fully encapsulated with no leaky abstractions
- Minimize dependencies between modules
- Properly clean up resources (event listeners, etc.)
- Comment complex code, especially behavior interactions

## Testing
The test-behavior-system.js file demonstrates working implementations of dragging, selecting, locking, and rotation. New implementations should maintain all this functionality but in the cleaner, modular architecture.