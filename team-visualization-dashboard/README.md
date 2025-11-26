# Team Visualization Dashboard

A real-time web dashboard that visualizes engineering team agents and their collaboration.

## Features

- 🏗️ **Agent Status Cards** - Real-time status of each team member
- 📊 **Workflow Graph** - Interactive visualization of agent dependencies
- 📋 **Task Board** - Active, completed, and blocked tasks
- ✅ **Quality Gates** - Status of each quality gate
- 📈 **Project Overview** - Current phase and progress

## Tech Stack

- React 18 + TypeScript
- Vite
- React Flow (workflow visualization)
- Tailwind CSS
- React Query (data synchronization)

## Getting Started

### Install Dependencies
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

## Project Structure

```
team-visualization-dashboard/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom hooks
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   └── services/       # API services
├── public/             # Static assets
└── docs/               # Documentation
```

## Data Source

The dashboard reads from:
- `.cursor/agents/shared-context.json` - Agent status and project state
- `.cursor/agents/task-board.md` - Task information
- `.cursor/agents/team-structure.md` - Team member info

