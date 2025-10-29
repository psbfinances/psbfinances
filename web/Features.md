# Features Overview

## Authentication & Access
- `web/components/auth` provides signup, login, reset, and password recovery flows, issuing the session cookie that unlocks the `/app` workspace.
- `BusinessLayout.jsx` guards application routes, redirects unauthenticated users, and exposes quick logout controls with the active user avatar.

## Transactions Workspace
- `TransactionList.jsx` renders the primary ledger with account-aware columns, running balances, duplicate flags, and inline toggles for reconciliation/scheduling.
- `TransactionListToolbar.jsx` supports account switching, keyword search, advanced filter modal (period, category, duplicates/new-only), cloning, and merge actions for multi-select rows.
- `TransactionForm.jsx` exposes detailed editing, including split transactions, attachment uploads, duplicate resolution, mileage tracking, and manual vs. imported safeguards.

## Dashboard & Analytics
- `Dashboard.jsx` loads personalised or business views with account balances, task queues, and latest transactions linked back to the ledger.
- `DashboardBusinessTab.jsx` charts profit & loss trends plus category drilldowns, while the toolbar toggles year/month, business, and reconciled-only filters.

## Budget Planning
- `Budget.jsx` presents the annual budget grid with month totals, zero-toggle visibility, auto-fill helpers, and cloning of prior years for quick setup.

## Reports
- `ReportList.jsx` links to business-focused outputs, and `BusinessYearTaxes.jsx` runs Schedule C-style summaries with income, expense, profit, and mileage breakdowns.

## Imports & Data Processing
- `settings/imports/ImportList.jsx` uploads CSV sources (BoA, Apple Card, Mint), tracks enrichment status, links imported batches back to transactions, and allows recent undo.

## Duplicate Management
- `settings/duplicateTransactions/DuplicateList.jsx` surfaces suspected duplicates with undo-by-click, complementing in-form marks and splits within the transaction editor.

## Master Data & Settings
- `settings/Settings.jsx` acts as the control centre for accounts, users, businesses, categories, cars, import rules, and duplicates, each with side-by-side table/form editors.
- Accounts, business, category, user, car, and import-rule screens (`settings/*`) persist changes via shared master data stores and reflect immediately in selectors and filters.
- `settings/application/ApplicationSettings.jsx` offers a “danger zone” for seeding or purging demo data across the tenant.

## Tenants
- `tenants/TenantList.jsx` lists tenants with search, pagination hooks, and navigation into tenant detail forms, supporting multi-tenant administration.
