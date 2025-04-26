# Light Plot Designer - Project Status

## Current Architecture

We have implemented a clean, modular architecture for the Light Plot Designer that follows DRY principles:

### Core Structure
- **State Management**: Centralized state for the application using the module pattern
- **Event System**: Loosely coupled components using EventEmitters
- **Configuration**: Constants separated in a dedicated config module

### Element Architecture
- **BaseElement**: Foundation class that all elements inherit from
- **Behaviors**: Composable behaviors that can be added to any element
- **Element Types**: FixtureElement and PipeElement implementations

### Key Components
1. **Core**: 
   - config.js: Configuration constants
   - state.js: Application state management
   - events.js: Global event handling

2. **Elements**:
   - base-element.js: Base class for all plot elements
   - fixture-element.js: Lighting fixture implementation
   - pipe-element.js: Pipes and trusses implementation

3. **Behaviors**:
   - behavior.js: Base class for all behaviors
   - behavior-manager.js: Applies behaviors to elements
   - draggable.js: Dragging functionality
   - selectable.js: Selection functionality
   - rotatable.js: Rotation functionality
   - lockable.js: Locking functionality

4. **UI**:
   - canvas.js: SVG canvas setup and management
   - toolbar.js: Tool selection and buttons
   - property-panel.js: Element property editing
   - libraries.js: Fixture and pipe libraries

5. **Utils**:
   - svg-utils.js: SVG helper functions
   - event-emitter.js: Event handling utility

### Design Principles
- **DRY (Don't Repeat Yourself)**: Common functionality in base classes and behaviors
- **Single Responsibility**: Each module has one clear purpose
- **Loose Coupling**: Components communicate via events
- **Composable Behaviors**: Elements gain functionality through behavior composition

## Recent Updates

### Added Lighting Console Paradigm Support
- Implemented two addressing systems for fixtures:
  - **Unified Approach**: Single numbering system for all fixtures
  - **Families Approach (Compulite style)**: Separate numbering for channels and spots
- Added plot-level setting for the addressing system
- Modified property panel to adapt to the selected addressing system
- Enhanced fixture creation to respect the chosen paradigm
- Added locking mechanism to prevent addressing system changes after fixtures are added

## Current Status

- ✅ Basic application structure with modular architecture
- ✅ SVG canvas with paper, grid, and stage representation
- ✅ Toolbar with tool selection (select, add fixture, pan, zoom)
- ✅ Element base class with behavior system
- ✅ Core behaviors (selectable, draggable, rotatable, lockable)
- ✅ Fixture and pipe element implementations
- ✅ Property panel for editing element properties
- ✅ Library panels for selecting and placing elements
- ✅ Multiple addressing system support (unified vs. families)
- 🔄 Save/load functionality (needs completion)

## Next Steps

1. Complete the libraries panel functionality
2. Implement save/load functionality with Django backend
3. Add element deletion and other editing operations
4. Implement keyboard shortcuts and additional tools
5. Improve visual styling and user experience
6. Add basic validation and error handling

## Code Organization
designer/static/designer/js/
├── app.js                  # Main application entry point
├── core/                   # Core functionality
│   ├── config.js           # Configuration constants
│   ├── state.js            # Application state management
│   └── events.js           # Event bus for communication
├── elements/               # Element implementations
│   ├── base-element.js     # Base element class
│   ├── fixture-element.js  # Fixture implementation
│   └── pipe-element.js     # Pipe implementation
├── behaviors/              # Reusable behaviors
│   ├── behavior.js         # Base behavior class
│   ├── behavior-manager.js # Behavior manager
│   ├── draggable.js        # Dragging behavior
│   ├── selectable.js       # Selection behavior
│   ├── rotatable.js        # Rotation behavior
│   └── lockable.js         # Locking behavior
├── ui/                     # User interface components
│   ├── canvas.js           # SVG canvas management
│   ├── toolbar.js          # Toolbar controls
│   ├── property-panel.js   # Properties panel
│   └── libraries.js        # Library panels
└── utils/                  # Utilities and helpers
├── svg-utils.js        # SVG helper functions
└── event-emitter.js    # Event handling utilities