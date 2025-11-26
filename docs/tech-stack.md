# Technology Stack

## Frontend Stack

### Core Framework
- **React 18+** - Modern UI library
- **TypeScript 5+** - Type safety and better DX

### Build Tools
- **Vite** - Fast build tool and dev server
- **ESBuild** - Fast bundler (via Vite)

### UI Libraries
- **React Flow** - Workflow graph visualization
  - Version: ^11.x
  - For interactive dependency graphs
- **Tailwind CSS** - Utility-first CSS framework
  - Version: ^3.x
  - For rapid styling

### Data Fetching
- **Axios** or **Fetch API** - HTTP requests
- **React Query** (optional) - Data synchronization
  - Version: ^5.x
  - For caching and polling

### State Management
- **React Context** - Simple global state
- **Zustand** (optional) - Lightweight state management

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

## Backend Stack (Optional)

### Runtime
- **Node.js** - JavaScript runtime
- **Express** - Web framework

### Utilities
- **chokidar** - File system watcher
- **ws** - WebSocket support (optional)
- **cors** - CORS middleware

## Deployment

### Hosting
- **Vercel** (recommended) - Static hosting
- **Netlify** - Alternative static hosting
- **GitHub Pages** - Free static hosting

### CI/CD (Optional)
- **GitHub Actions** - Automated deployment
- **Vercel CLI** - Deployment automation

## Package Dependencies

### Production Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "reactflow": "^11.10.0",
  "axios": "^1.6.0",
  "@tanstack/react-query": "^5.0.0"
}
```

### Development Dependencies
```json
{
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "@vitejs/plugin-react": "^4.2.0",
  "typescript": "^5.3.0",
  "vite": "^5.0.0",
  "tailwindcss": "^3.4.0",
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0",
  "eslint": "^8.55.0",
  "prettier": "^3.1.0"
}
```

## Rationale

### Why React?
- Most popular, large ecosystem
- Great for interactive UIs
- Strong TypeScript support

### Why Vite?
- Fast development server
- Quick HMR (Hot Module Replacement)
- Simple configuration

### Why React Flow?
- Purpose-built for graph visualization
- Interactive and customizable
- Good performance

### Why Tailwind CSS?
- Rapid development
- Consistent design system
- Small bundle size

### Why TypeScript?
- Type safety
- Better IDE support
- Catches errors early

