# VenusCAD - OpenSCAD Web-Based IDE

## Table of Contents
1. [Problem Statement](#problem-statement)
2. [Proposed Solution](#proposed-solution)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Implementation Details](#implementation-details)
6. [Features](#features)
7. [Project Structure](#project-structure)

---

## Problem Statement

### Challenges in Traditional CAD Development

1. **Desktop Dependency**: Traditional OpenSCAD requires desktop installation, limiting accessibility and collaboration
2. **No Real-Time Collaboration**: Designers cannot easily share and iterate on designs in real-time
3. **Steep Learning Curve**: New users struggle without integrated help and documentation
4. **Limited Interactivity**: Static parameter editing without immediate visual feedback
5. **Platform Constraints**: Desktop applications are platform-specific and require maintenance
6. **No Cloud Integration**: Designs are stored locally, making sharing and version control difficult

### User Pain Points

- **Accessibility**: Users need to install software on every machine they use
- **Learning**: Beginners need contextual help while coding
- **Iteration Speed**: Slow feedback loop between code changes and visual results
- **Collaboration**: Difficult to share work-in-progress designs
- **Parameter Tuning**: Manual code editing for parameter changes is tedious

---

## Proposed Solution

### VenusCAD: A Modern Web-Based OpenSCAD IDE

VenusCAD is a fully browser-based OpenSCAD development environment that eliminates installation requirements while providing a superior development experience through:

1. **Zero Installation**: Runs entirely in the browser using WebAssembly
2. **Real-Time Rendering**: Instant visual feedback with 300ms debounced updates
3. **AI-Powered Assistance**: Integrated chat assistant for design help and code generation
4. **Interactive Customizer**: Visual parameter controls with live preview updates
5. **Professional Code Editor**: Monaco editor with syntax highlighting and IntelliSense
6. **Responsive Layout**: VS Code-inspired interface with resizable panels
7. **Export Capabilities**: Support for multiple 3D formats (STL, OFF, 3MF, GLB, SVG, DXF)

### Key Innovations

- **WebAssembly Integration**: OpenSCAD compiled to WASM for native-like performance
- **Dynamic Parameter System**: Automatic parameter extraction and UI generation
- **Debounced Rendering**: Smart rendering queue prevents UI blocking
- **State Persistence**: Automatic save/restore of work sessions
- **Multi-Format Support**: Seamless conversion between 2D and 3D formats

---

## Tech Stack

### Frontend Framework
- **React 18.3.1**: Component-based UI architecture
- **TypeScript 5.9.2**: Type-safe development
- **React Context API**: State management and dependency injection

### Code Editor
- **Monaco Editor 0.52.2**: VS Code's editor engine
- **@monaco-editor/react 4.6.0**: React integration
- **Custom OpenSCAD Language**: Syntax highlighting and completions

### 3D Rendering & Visualization
- **model-viewer**: Web component for 3D model display
- **@gltf-transform/core 4.1.1**: 3D model transformations
- **@gltf-transform/extensions 4.1.1**: Extended format support
- **Chroma-js 3.1.2**: Color manipulation for multi-material exports

### UI Components
- **PrimeReact 10.8.5**: Professional UI component library
- **PrimeIcons 7.0.0**: Icon system
- **PrimeFlex 3.3.1**: CSS utility framework

### Build Tools
- **Webpack 5.97.1**: Module bundler
- **Webpack Dev Server 5.2.0**: Development server with HMR
- **TypeScript Loader 9.5.1**: TS compilation
- **CSS Loader 7.1.2**: Style processing

### File System & Storage
- **BrowserFS**: Virtual file system in browser
- **JSZip 3.10.1**: ZIP archive handling
- **UZip 0.20201231.0**: Fast ZIP decompression

### Image Processing
- **BlurHash 2.0.5**: Placeholder image generation
- **ThumbHash 0.1.1**: Compact image placeholders

### AI Integration
- **Groq API**: LLM for code assistance
- **Gemini API**: Alternative AI provider
- **Custom Prompt Engineering**: OpenSCAD-specific assistance

### Testing
- **Jest 29.7.0**: Unit testing framework
- **Puppeteer 23.11.1**: E2E browser testing
- **Jest-Puppeteer 11.0.0**: Integration layer

### Development Tools
- **dotenv 17.2.3**: Environment variable management
- **Workbox 7.3.0**: Service worker for PWA capabilities
- **Debug 4.4.0**: Debugging utilities

---

## Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser Environment                      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                     React Application                       │ │
│  │                                                             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │ │
│  │  │   App.tsx    │  │ ModelContext │  │  FSContext      │ │ │
│  │  │  (Root)      │──│  (State)     │──│  (FileSystem)   │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘ │ │
│  │         │                  │                   │           │ │
│  │         ├──────────────────┼───────────────────┤           │ │
│  │         │                  │                   │           │ │
│  │  ┌──────▼──────┐    ┌─────▼──────┐    ┌──────▼────────┐  │ │
│  │  │ Panel       │    │  Model     │    │  BrowserFS    │  │ │
│  │  │ Switcher    │    │  (Logic)   │    │  (Storage)    │  │ │
│  │  └─────────────┘    └────────────┘    └───────────────┘  │ │
│  │                                                            │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │              Main Content Area                      │  │ │
│  │  │                                                      │  │ │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │  │ │
│  │  │  │Customizer│  │  Viewer  │  │  Code Editor     │  │  │ │
│  │  │  │  Panel   │  │  Panel   │  │  (Monaco)        │  │  │ │
│  │  │  │          │  │          │  │                  │  │  │ │
│  │  │  │ • Params │  │ • 3D View│  │ • Syntax HL      │  │  │ │
│  │  │  │ • Sliders│  │ • Camera │  │ • Completions    │  │  │ │
│  │  │  │ • Inputs │  │ • Export │  │ • Error Markers  │  │  │ │
│  │  │  └──────────┘  └──────────┘  └──────────────────┘  │  │ │
│  │  │                                                      │  │ │
│  │  │  ┌──────────────────────────────────────────────┐   │  │ │
│  │  │  │         AI Chat Panel (Optional)             │   │  │ │
│  │  │  │  • Context-aware assistance                  │   │  │ │
│  │  │  │  • Code generation                           │   │  │ │
│  │  │  │  • Error explanation                         │   │  │ │
│  │  │  └──────────────────────────────────────────────┘   │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  OpenSCAD Worker Thread                     │ │
│  │                                                             │ │
│  │  ┌──────────────┐         ┌─────────────────────────────┐ │ │
│  │  │ Worker       │         │   OpenSCAD WASM Module      │ │ │
│  │  │ Controller   │────────▶│   • Compilation             │ │ │
│  │  │              │         │   • Rendering               │ │ │
│  │  │ • Job Queue  │         │   • Parameter Extraction    │ │ │
│  │  │ • Debouncing │         │   • Format Conversion       │ │ │
│  │  │ • Streaming  │         │   • Manifold Backend        │ │ │
│  │  └──────────────┘         └─────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    External Services                        │ │
│  │                                                             │ │
│  │  ┌──────────────┐         ┌─────────────────────────────┐ │ │
│  │  │  Groq API    │         │      Gemini API             │ │ │
│  │  │  (Primary)   │         │      (Fallback)             │ │ │
│  │  │              │         │                             │ │ │
│  │  │ • Vision     │         │ • Text Generation           │ │ │
│  │  │ • Chat       │         │ • Code Assistance           │ │ │
│  │  └──────────────┘         └─────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Component Hierarchy                     │
└─────────────────────────────────────────────────────────────┘

App (Root Component)
├── ModelContext.Provider (State Management)
│   └── FSContext.Provider (File System)
│       ├── PanelSwitcher (Top Navigation)
│       │   ├── Toggle: Code Editor
│       │   ├── Toggle: AI Assistant
│       │   └── Logo & Title
│       │
│       ├── Main Content Area
│       │   ├── CustomizerPanel (Left Sidebar)
│       │   │   ├── Parameter Groups
│       │   │   ├── Input Controls
│       │   │   │   ├── Sliders
│       │   │   │   ├── Number Inputs
│       │   │   │   ├── Dropdowns
│       │   │   │   ├── Checkboxes
│       │   │   │   └── Text Inputs
│       │   │   └── Refresh Button
│       │   │
│       │   ├── ViewerPanel (Center)
│       │   │   ├── model-viewer (3D Display)
│       │   │   ├── Axes Viewer (Navigation Aid)
│       │   │   ├── Camera Controls
│       │   │   ├── Parameter Tooltip
│       │   │   └── Loading Indicators
│       │   │
│       │   ├── EditorPanel (Right Sidebar - Conditional)
│       │   │   ├── Monaco Editor
│       │   │   ├── Syntax Highlighting
│       │   │   ├── Error Markers
│       │   │   ├── Auto-completion
│       │   │   └── Console Output
│       │   │
│       │   └── AIChatPanel (Right Sidebar - Conditional)
│       │       ├── Message History
│       │       ├── Input Field
│       │       ├── Code Insertion
│       │       └── Context Menu
│       │
│       └── Footer
│           ├── Status Bar
│           ├── Render Stats
│           └── Export Controls
```

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Data Flow                             │
└─────────────────────────────────────────────────────────────┘

User Interaction
      │
      ▼
┌─────────────────┐
│  UI Component   │
│  (React)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Model.mutate() │ ◄──── Immutable State Updates
│  (State Logic)  │
└────────┬────────┘
         │
         ├──────────────────┬──────────────────┐
         ▼                  ▼                  ▼
┌─────────────────┐  ┌──────────────┐  ┌─────────────┐
│ State Persister │  │ setState()   │  │ Render Job  │
│ (LocalStorage)  │  │ (React)      │  │ (Debounced) │
└─────────────────┘  └──────┬───────┘  └──────┬──────┘
                            │                  │
                            ▼                  ▼
                     ┌──────────────┐   ┌─────────────────┐
                     │ Re-render UI │   │ Worker Thread   │
                     └──────────────┘   │ (OpenSCAD WASM) │
                                        └────────┬────────┘
                                                 │
                                                 ▼
                                        ┌─────────────────┐
                                        │ Process Output  │
                                        │ • Parse Logs    │
                                        │ • Extract Mesh  │
                                        │ • Convert GLB   │
                                        └────────┬────────┘
                                                 │
                                                 ▼
                                        ┌─────────────────┐
                                        │ Update State    │
                                        │ • Output File   │
                                        │ • Markers       │
                                        │ • Parameters    │
                                        └────────┬────────┘
                                                 │
                                                 ▼
                                        ┌─────────────────┐
                                        │ Display Result  │
                                        │ in Viewer       │
                                        └─────────────────┘
```

### State Management Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      State Structure                         │
└─────────────────────────────────────────────────────────────┘

State (Immutable)
├── params
│   ├── activePath: string
│   ├── sources: Source[]
│   ├── vars: {[name: string]: any}
│   ├── features: string[]
│   ├── exportFormat2D: string
│   ├── exportFormat3D: string
│   └── extruderColors?: string[]
│
├── view
│   ├── logs?: boolean
│   ├── aiChatVisible?: boolean
│   ├── codeEditorVisible?: boolean
│   ├── layout: LayoutConfig
│   ├── collapsedCustomizerTabs?: string[]
│   ├── color: string
│   ├── showAxes?: boolean
│   └── lineNumbers?: boolean
│
├── output
│   ├── outFile: File
│   ├── outFileURL: string
│   ├── displayFile?: File
│   ├── displayFileURL?: string
│   ├── elapsedMillis: number
│   ├── formattedElapsedMillis: string
│   └── formattedOutFileSize: string
│
├── parameterSet
│   └── parameters: Parameter[]
│       ├── name: string
│       ├── type: 'number' | 'string' | 'boolean'
│       ├── initial: any
│       ├── group: string
│       ├── caption?: string
│       ├── min?: number
│       ├── max?: number
│       ├── step?: number
│       └── options?: Option[]
│
├── preview
│   ├── blurhash?: string
│   └── thumbhash?: string
│
├── currentRunLogs?: [string, string][]
├── lastCheckerRun?: CheckerOutput
├── rendering?: boolean
├── previewing?: boolean
├── exporting?: boolean
├── checkingSyntax?: boolean
├── error?: string
└── is2D?: boolean
```

---

## Implementation Details

### 1. Core Rendering Pipeline

#### Debounced Rendering System
```typescript
// Location: src/runner/actions.ts
var renderDelay = 300; // Reduced from 1000ms for faster feedback

export const render = turnIntoDelayableExecution(
  renderDelay, 
  (renderArgs: RenderArgs) => {
    // Rendering logic with automatic debouncing
    // Cancels pending renders when new ones arrive
  }
);
```

**Key Features:**
- 300ms debounce prevents excessive renders during rapid parameter changes
- Automatic cancellation of pending renders
- Separate worker thread prevents UI blocking
- Streaming output for real-time feedback

#### Parameter Change Flow
```typescript
// Location: src/state/model.ts
setVar(name: string, value: any) {
  this.mutate(s => s.params.vars = {
    ...s.params.vars ?? {}, 
    [name]: value
  });
  this.render({isPreview: true, now: false}); // Triggers debounced render
}
```

### 2. WebAssembly Integration

#### Worker Thread Architecture
```typescript
// Location: src/runner/openscad-worker.ts
// Runs in separate thread to prevent UI blocking

const job = spawnOpenSCAD({
  mountArchives: true,
  inputs: sources,
  args: [activePath, "-o", outFile, "--backend=manifold"],
  outputPaths: [outFile],
}, streamsCallback);
```

**Benefits:**
- Non-blocking UI during compilation
- Streaming console output
- Cancellable operations
- Memory isolation

### 3. File System Abstraction

#### BrowserFS Virtual File System
```typescript
// Location: src/fs/filesystem.ts
// Provides POSIX-like file system in browser

- In-memory file storage
- ZIP archive mounting
- Library management
- Source file handling
```

### 4. Monaco Editor Integration

#### Custom OpenSCAD Language
```typescript
// Location: src/language/openscad-language.ts

Features:
- Syntax highlighting
- Auto-completion
- Error markers
- Bracket matching
- Code folding
- Parameter hints
```

### 5. 3D Viewer Implementation

#### model-viewer Integration
```typescript
// Location: src/components/ViewerPanel.tsx

<model-viewer
  src={modelUri}
  camera-controls
  ar
  environment-image="./skybox-lights.jpg"
  camera-orbit={originalOrbit}
/>
```

**Features:**
- Interactive camera controls
- AR support
- Environment lighting
- Predefined view angles
- Click-to-select parameters

### 6. AI Assistant Integration

#### Groq API Integration
```typescript
// Location: src/components/AIChatPanel.tsx

const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'llama-3.2-90b-vision-preview',
    messages: conversationHistory,
  }),
});
```

**Capabilities:**
- Context-aware code assistance
- Error explanation
- Code generation
- Design suggestions
- Parameter recommendations

### 7. Export System

#### Multi-Format Support
```typescript
// Location: src/state/model.ts

Supported Formats:
- 3D: STL, OFF, 3MF, GLB
- 2D: SVG, DXF

Conversion Pipeline:
OFF → GLB (for display)
OFF → 3MF (with colors)
SVG → Extruded GLB (for preview)
```

### 8. State Persistence

#### LocalStorage Integration
```typescript
// Location: src/state/fragment-state.ts

- Automatic save on state changes
- Restore on page load
- URL fragment encoding
- Session recovery
```

### 9. Responsive Layout System

#### Resizable Panels
```typescript
// Location: src/components/App.tsx

Features:
- Drag-to-resize panels
- Min/max constraints
- Persistent sizes
- Smooth transitions
- Visual feedback
```

### 10. Parameter Extraction

#### Automatic UI Generation
```typescript
// OpenSCAD parameter syntax detection
// Generates UI controls automatically

/* [Group Name] */
width = 10; // [5:50] - Slider
type = "box"; // [box, cylinder, sphere] - Dropdown
enabled = true; // Checkbox
```

---

## Features

### Core Features

1. **Real-Time 3D Rendering**
   - WebAssembly-powered OpenSCAD compilation
   - 300ms debounced updates
   - Preview and final render modes
   - Multiple export formats

2. **Professional Code Editor**
   - Monaco editor (VS Code engine)
   - OpenSCAD syntax highlighting
   - Auto-completion
   - Error markers with line numbers
   - Code folding and bracket matching

3. **Interactive Customizer**
   - Automatic parameter extraction
   - Dynamic UI generation
   - Sliders, dropdowns, checkboxes
   - Grouped parameters
   - Reset to defaults
   - Live preview updates

4. **AI-Powered Assistant**
   - Context-aware help
   - Code generation
   - Error explanation
   - Design suggestions
   - Multi-provider support (Groq, Gemini)

5. **Advanced 3D Viewer**
   - Interactive camera controls
   - Predefined view angles
   - AR support
   - Environment lighting
   - Click-to-inspect parameters
   - Axes helper

6. **Export Capabilities**
   - 3D formats: STL, OFF, 3MF, GLB
   - 2D formats: SVG, DXF
   - Multi-material 3MF with color selection
   - Automatic format conversion

7. **Project Management**
   - Multi-file projects
   - ZIP import/export
   - Library management
   - State persistence
   - Session recovery

### User Experience Features

- **Keyboard Shortcuts**
  - F5: Preview render
  - F6: Final render
  - F7: Export

- **Responsive Layout**
  - Resizable panels
  - Collapsible sidebars
  - Mobile-friendly

- **Visual Feedback**
  - Loading indicators
  - Progress bars
  - Status messages
  - Error highlighting

- **Performance Optimizations**
  - Debounced rendering
  - Worker thread isolation
  - Lazy loading
  - Image placeholders (BlurHash/ThumbHash)

---

## Project Structure

```
openscad-playground/
├── src/
│   ├── components/          # React components
│   │   ├── App.tsx         # Root component
│   │   ├── ViewerPanel.tsx # 3D viewer
│   │   ├── EditorPanel.tsx # Code editor
│   │   ├── CustomizerPanel.tsx # Parameter controls
│   │   ├── AIChatPanel.tsx # AI assistant
│   │   ├── PanelSwitcher.tsx # Navigation
│   │   ├── Footer.tsx      # Status bar
│   │   └── contexts.ts     # React contexts
│   │
│   ├── state/              # State management
│   │   ├── model.ts        # Business logic
│   │   ├── app-state.ts    # State types
│   │   ├── initial-state.ts # Default state
│   │   ├── fragment-state.ts # URL persistence
│   │   └── customizer-types.ts # Parameter types
│   │
│   ├── runner/             # OpenSCAD execution
│   │   ├── actions.ts      # Render/check functions
│   │   ├── openscad-runner.ts # Worker interface
│   │   ├── openscad-worker.ts # Worker thread
│   │   └── output-parser.ts # Log parsing
│   │
│   ├── language/           # Monaco language support
│   │   ├── openscad-language.ts # Language definition
│   │   ├── openscad-completions.ts # Auto-complete
│   │   └── openscad-builtins.ts # Built-in functions
│   │
│   ├── fs/                 # File system
│   │   ├── filesystem.ts   # BrowserFS setup
│   │   └── zip-archives.ts # ZIP handling
│   │
│   ├── io/                 # Import/Export
│   │   ├── export_glb.ts   # GLB conversion
│   │   ├── export_3mf.ts   # 3MF export
│   │   ├── import_off.ts   # OFF parsing
│   │   └── image_hashes.ts # Placeholders
│   │
│   ├── wasm/               # WebAssembly
│   │   ├── openscad.js     # WASM loader
│   │   └── openscad.wasm   # Compiled OpenSCAD
│   │
│   ├── index.tsx           # Entry point
│   ├── index.css           # Global styles
│   └── utils.ts            # Utilities
│
├── public/                 # Static assets
│   ├── index.html
│   ├── skybox-lights.jpg
│   └── axes.glb
│
├── libs/                   # OpenSCAD libraries
│   ├── BOSL2/
│   ├── MCAD/
│   └── ...
│
├── examples/               # Example files
│   └── *.scad
│
├── tests/                  # E2E tests
│   └── *.test.js
│
├── webpack.config.js       # Build configuration
├── tsconfig.json          # TypeScript config
├── package.json           # Dependencies
└── README.md              # Documentation
```

### Key Directories Explained

#### `/src/components`
React components implementing the UI. Each component is self-contained with its own logic and styling.

#### `/src/state`
State management using React Context and immutable updates. The `Model` class contains all business logic.

#### `/src/runner`
OpenSCAD execution in a Web Worker. Handles compilation, rendering, and output processing.

#### `/src/language`
Monaco editor language support for OpenSCAD, including syntax highlighting and auto-completion.

#### `/src/fs`
Virtual file system using BrowserFS, allowing POSIX-like file operations in the browser.

#### `/src/io`
Import/export functionality for various 3D and 2D formats.

#### `/src/wasm`
WebAssembly build of OpenSCAD and its JavaScript loader.

---

## Development Workflow

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test:e2e
```

### Environment Variables
```bash
# .env file
REACT_APP_GROQ_API_KEY=your_groq_api_key
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
```

### Build Process
1. TypeScript compilation
2. Webpack bundling
3. WASM module copying
4. Asset optimization
5. Service worker generation (production)

---

## Performance Considerations

### Optimization Strategies

1. **Debounced Rendering**: 300ms delay prevents excessive renders
2. **Worker Thread**: Keeps UI responsive during compilation
3. **Lazy Loading**: Components load on demand
4. **Image Placeholders**: BlurHash/ThumbHash for instant feedback
5. **Memoization**: React.memo for expensive components
6. **Virtual Scrolling**: For large parameter lists
7. **Code Splitting**: Separate bundles for main and worker

### Performance Metrics

- **Initial Load**: < 3s on 3G
- **Render Time**: 100ms - 5s (model dependent)
- **UI Response**: < 16ms (60 FPS)
- **Memory Usage**: < 200MB typical
- **Bundle Size**: ~5MB (including WASM)

---

## Future Enhancements

### Planned Features

1. **Collaboration**
   - Real-time multi-user editing
   - Shared workspaces
   - Version control integration

2. **Cloud Storage**
   - Save to cloud
   - Project sharing
   - Template library

3. **Advanced Rendering**
   - Ray tracing
   - Material editor
   - Animation support

4. **Enhanced AI**
   - Visual design from sketches
   - Natural language to code
   - Automated optimization

5. **Mobile Support**
   - Touch-optimized UI
   - Gesture controls
   - Responsive 3D viewer

---

## License

Portions of this project are Copyright 2021 Google LLC, and licensed under GPL2+.

---

## Contributors

Built with ❤️ by the VenusCAD team.

---

## Support

For issues, questions, or contributions, please visit our GitHub repository.
