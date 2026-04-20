Operational Commands

All development must use Bun (npm/yarn/pnpm forbidden):

Development
- `bun run dev` - Start API server (port 3002) + Vite dev server (port 5173) concurrently
- `bun run server` - Run API server only with watch mode (TypeScript reload)
- `bun build` - Compile TypeScript and build Vite for production
- `bun run lint` - Run ESLint checks
- `bun install` - Install dependencies (no npm install)

Testing & Validation
- ESLint must pass before merge (no eslint-disable without justification)

Golden Rules

Component Generation Constraints (enforced by system prompt in server/index.ts)
1. Inline styles only - No CSS imports, modules, or external stylesheets
2. Plain JavaScript - No TypeScript syntax (no type annotations, interfaces, generics)
3. Global React - No import statements; React is globally available
4. Self-contained - Component must include all necessary code and render() call
5. Interactive - Include hover states, click handlers, state management where appropriate
6. Modern styling - Use gradients, shadows, polished visual design

Server-Side Rules
- Do: Validate API keys from .env or client request before calling AI APIs
- Do: Strip markdown code fences from AI response and add render() if missing
- Do: Support both Anthropic and Google providers with fallback routing
- Do not: Expose API keys in responses; always filter sensitive data
- Do not: Pass TypeScript syntax to react-live (plain JS only)

Frontend Rules
- Do: Show provider availability badge (e.g., ".env 설정됨") for each AI provider
- Do: Allow user override of server API key via input field
- Do: Validate component code in LivePreview before rendering (catch errors)
- Do not: Import external CSS; use inline styles only
- Do not: Use TypeScript syntax in generated code view

Project Context

React Component Generator is a full-stack AI-powered IDE for generating interactive React components from natural language descriptions. Users enter a prompt, select an AI provider (Anthropic Claude or Google Gemini), and see a live preview + syntax-highlighted code.

Tech Stack
- Frontend: React 19, TypeScript, Vite, react-live (runtime JSX evaluation)
- Backend: Bun, TypeScript
- AI APIs: Anthropic Claude, Google Gemini
- Styling: Inline styles + Tailwind-like utilities (no external CSS)
- Linting: ESLint (React/Hooks plugins)

Multi-Provider Architecture
- API keys sourced from .env or per-request override
- server/index.ts proxies requests to Anthropic or Google endpoints
- Unified POST /api/generate endpoint with provider selection
- GET /api/config returns available providers (env check)

Standards & References

Commit Message Format
- Prefix: feat, fix, refactor, style, chore, docs
- Example: `feat: add live preview code syntax highlighting`
- Example: `fix: validate API key before sending request`
- Body: Explain WHY, not WHAT (code speaks for itself)

Coding Conventions
- Functional components + React hooks (no class components)
- TypeScript strict mode enabled; no implicit any
- File naming: PascalCase for components (ComponentName.tsx), camelCase for hooks/utils
- Prop drilling acceptable for 1-2 levels; no prop-drilling beyond that

Type Definitions
- Store interfaces in src/types/index.ts (Provider, GeneratedComponent)
- Export types from components only when needed by consumers
- Use Zod or TypeScript validation at API boundaries

API Contract
- POST /api/generate request: { prompt: string, provider: "anthropic"|"google", apiKey?: string }
- Response: { code: string } or { error: string }
- GET /api/config response: { anthropic: boolean, google: boolean } (key availability)

Error Handling
- Client: Catch and display errors in ComponentCard (render error state)
- Server: Log errors to console; return { error: string } to client

Maintenance Policy
When code and rules diverge, update AGENTS.md to reflect reality. Include justification in the commit message. This document is descriptive, not prescriptive.

Context Map

Agents should self-navigate the codebase. No nested AGENTS.md required for this project's simplified structure.
