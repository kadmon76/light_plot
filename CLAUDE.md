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

## Implementation Progress

### Completed Work
1. Analyzed the DRY principles in element creation
2. Refactored `ElementFactory` to centralize common functionality:
   - Created `_createElement` method for shared element creation logic
   - Simplified `createFixture`, `createPipe`, `loadFixture`, and `loadPipe` methods
   - Standardized position, rotation, and locking behavior in one place

### Next Steps
1. Clean up redundant code in `fixtures.js` and `pipes.js`
2. Update these files to use the `ElementFactory` instead of their own implementations
3. Migrate remaining functionality to appropriate classes (element-specific functionality to element classes)
4. Ensure UI code properly connects to the new system

### Specific Focus for Next Chat
For the next chat, focus ONLY on refactoring `fixtures.js` to:
1. Remove redundant code that duplicates `ElementFactory` functionality
2. Replace direct element creation with calls to `ElementFactory` methods
3. Move any fixture-specific behavior to the `FixtureElement` class
4. Update UI code to use the factory and element classes

No need to implement new functionality - just clean up existing code while maintaining all current features.