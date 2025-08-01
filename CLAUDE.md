# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

psbFinances is a Node.js-based web application for managing personal and small business finances. It combines features similar to Mint and QuickBooks Self-Employed to handle personal and business transactions in a single application.

## Project Structure

This is a **monorepo** with npm workspaces containing three main packages:

- **`server/`** - Express.js REST API backend with MySQL database
- **`web/`** - React frontend with MobX state management  
- **`shared/`** - Common utilities, models, and API client used by both server and web

## Common Development Commands

### Building and Running
```bash
# Build entire application for production
npm run build

# Start development servers
npm run start:server    # Backend API server (port varies by config)
npm run start:web       # Frontend dev server with webpack

# Production start
npm start               # Runs server in production mode
```

### Testing
```bash
# Run all tests
npm test

# Run tests for specific workspace
npm run test:server     # Server-side tests with Jest
npm run test:web        # Frontend tests with Jest
```

### Database Setup
The application uses MySQL and requires initial database setup as documented in README.md. Database migrations and seeding are handled through the server's deployment scripts.

## Architecture Notes

### Backend (server/)
- **Express.js** with modular route structure under `api/`
- **Database**: MySQL with Knex.js query builder
- **Authentication**: JWT-based with middleware in `middleware/auth.js`
- **File uploads**: Handled via express-fileupload with attachment storage
- **Import system**: CSV/JSON importers in `dip/` for various data sources (Mint, Apple Card, etc.)
- **Configuration**: YAML-based configs in `config/` (environment-specific)

### Frontend (web/)
- **React 18** with function components and hooks
- **State Management**: MobX stores in `stores/`
- **Routing**: React Router with route definitions in `routes.jsx`
- **Styling**: CSS modules and styled-components
- **Build**: Webpack with separate dev/prod configurations

### Shared Code
- **API Client**: Axios-based HTTP client with endpoint definitions
- **Models**: Business logic and validation for core entities (transactions, accounts, etc.)
- **Utilities**: Common functions used across frontend and backend

### Key Features
- Multi-tenant support with user authentication
- Transaction import from external sources (Mint, bank CSV files)
- Business/personal transaction categorization and splitting
- Budget management and cash flow projections
- File attachment system for receipts/documents
- Comprehensive dashboard with financial analytics

## Testing Approach

Tests use **Jest** across all packages. The project has both unit tests and integration tests, with mocking capabilities for database operations. Test files follow the pattern `*.test.js` and are located in `__tests__/` directories.

## Configuration Management

- Environment-specific configs in `server/config/config.{env}.yaml`
- Development config template at `server/config/config._dev.yaml`
- JWT secrets and database credentials configured per environment