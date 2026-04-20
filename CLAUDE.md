@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `bun run dev` - Run API server and Vite dev server concurrently (port 5173 for frontend, 3002 for API)
- `bun run server` - Run API server only in watch mode
- `bun build` - Compile TypeScript and build with Vite for production
- `bun run lint` - Run ESLint checks

### Dependencies
- `bun install` - Install dependencies

## Project Architecture

**React Component Generator** is a full-stack application that generates React components from natural language descriptions using AI.

### Core Components

**Frontend (Vite + React 19 + TypeScript)**
- `src/App.tsx` - Main application component managing state, provider selection, and API key handling
- `src/components/`:
  - `PromptInput.tsx` - Text input for component descriptions
  - `ComponentCard.tsx` - Displays generated component with preview and code
  - `LivePreview.tsx` - Runtime rendering of generated code via react-live
  - `CodeView.tsx` - Syntax-highlighted code display
- `src/hooks/useComponentGenerator.ts` - React hook managing component generation state and API calls
- `src/types/index.ts` - TypeScript interfaces for `Provider` and `GeneratedComponent`

**Backend (Bun + TypeScript)**
- `server/index.ts` - HTTP server that:
  - Acts as a proxy to Anthropic Claude and Google Gemini APIs
  - Handles prompt engineering with strict system prompts for self-contained React components
  - Validates API keys from environment or client request
  - Processes API responses and ensures `render()` function is called

### Architecture Pattern

```
User → Frontend (Vite) →[/api/generate]→ Bun Server → AI API (Anthropic/Google)
                 ↓                              ↓
            react-live renders             Transforms response
            generated code               (strips fences, adds render)
```

### Key Design Constraints

**Component Generation Rules** (enforced by system prompt in `server/index.ts`):
1. **Inline styles only** - No CSS imports, modules, or external stylesheets
2. **Plain JavaScript** - No TypeScript syntax (no type annotations, interfaces, generics)
3. **Global React** - No import statements; React is available as a global
4. **Self-contained** - Component must include all necessary code and render call
5. **Interactive** - Components should have hover states, click handlers where appropriate
6. **Modern styling** - Uses gradients, shadows, and polished visual design

### API Endpoints

- `GET /api/config` - Returns which AI providers have API keys configured (`.env` check)
- `POST /api/generate` - Accepts `{prompt, apiKey?, provider}`, returns `{code}` or `{error}`

### Multi-Provider Support

Supported providers: `anthropic` | `google`
- API keys can come from `.env` environment variables or be passed per-request
- `App.tsx` shows which provider has a `.env` key with a `.env 설정됨` badge
- Users can override server keys by entering their own API key in the UI

### Development Notes

- Vite proxies `/api/*` requests to Bun server on `localhost:3002`
- Component IDs use timestamp + random suffix for uniqueness
- React 19 is the latest major version; uses functional components and hooks exclusively
- ESLint configured with React, React Hooks, and React Refresh plugins
