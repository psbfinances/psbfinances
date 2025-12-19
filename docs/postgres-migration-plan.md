# MySQL to PostgreSQL Migration Plan

## Overview
Migrate psbFinances from MySQL to PostgreSQL.

**Scope:**
- ~18,880 transactions to migrate
- 17 database tables
- Complete cutover (no dual-database support)
- Downtime acceptable

---

## Phase 1: Environment Setup

### 1.1 Install PostgreSQL Driver

```bash
cd server
npm install pg
```

### 1.2 PostgreSQL via Docker

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    container_name: psbf-postgres
    environment:
      POSTGRES_USER: psbf
      POSTGRES_PASSWORD: strongpassword
      POSTGRES_DB: psbf
    ports:
      - "5432:5432"
    volumes:
      - psbf_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U psbf -d psbf"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  psbf_postgres_data:
```

Start PostgreSQL:
```bash
docker-compose up -d
```

---

## Phase 2: Schema Migration

### 2.1 Data Type Conversions

| MySQL Type | PostgreSQL Type | Notes |
|------------|-----------------|-------|
| `TINYINT(1)` | `BOOLEAN` | 15 columns across tables |
| `LONGTEXT` + `json_valid` check | `JSONB` | 16 JSON columns |
| `BIGINT AUTO_INCREMENT` | `BIGSERIAL` | 5 tables |
| `DATETIME` | `TIMESTAMP` | All datetime columns |
| `ENGINE=InnoDB` | (remove) | Not applicable |
| `CHARSET=latin1` | (remove) | PostgreSQL uses UTF-8 |

### 2.2 PostgreSQL Schema

Create `.db/postgres-schema.sql`:

```sql
-- PostgreSQL Schema for psbFinances

-- Migration tracking table
CREATE TABLE IF NOT EXISTS "dbChanges" (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    "startAt" TIMESTAMP NULL,
    "endAt" TIMESTAMP NULL,
    "statementCount" INTEGER NULL,
    "tenantId" INTEGER DEFAULT -1 NOT NULL
);

-- Accounts
CREATE TABLE IF NOT EXISTS accounts (
    id CHAR(25) NOT NULL PRIMARY KEY,
    "tenantId" CHAR(25) NULL,
    "shortName" VARCHAR(25) NULL,
    "fullName" VARCHAR(100) NULL,
    type VARCHAR(25) NULL,
    "bankId" CHAR(25) NULL,
    closed BOOLEAN NULL,
    visible BOOLEAN NULL,
    deleted BOOLEAN NULL,
    "businessId" CHAR(25) NULL,
    "isDefault" BOOLEAN NULL,
    "openingBalance" INTEGER DEFAULT 0 NULL,
    balance INTEGER DEFAULT 0 NULL,
    format CHAR(10) NULL,
    meta JSONB NULL,
    note VARCHAR(1000) NULL,
    "createdAt" TIMESTAMP NULL
);

-- Attachments
CREATE TABLE IF NOT EXISTS attachments (
    id CHAR(25) NOT NULL PRIMARY KEY,
    "tenantId" CHAR(25) NULL,
    "entityId" CHAR(25) NULL,
    "fileName" VARCHAR(100) NULL,
    "uploadedDate" TIMESTAMP NULL,
    meta JSONB NULL,
    "fileInfo" JSONB NULL
);

-- Banks
CREATE TABLE IF NOT EXISTS banks (
    id VARCHAR(25) NOT NULL PRIMARY KEY,
    "shortName" VARCHAR(25) NULL,
    "fullName" VARCHAR(100) NULL
);

-- Budgets
CREATE TABLE IF NOT EXISTS budgets (
    id BIGSERIAL PRIMARY KEY,
    "tenantId" CHAR(25) NULL,
    year SMALLINT NULL,
    "monthNo" SMALLINT NULL,
    "categoryId" CHAR(25) NULL,
    amount INTEGER NULL,
    comment VARCHAR(500) NULL
);

-- Businesses
CREATE TABLE IF NOT EXISTS businesses (
    id CHAR(25) NOT NULL PRIMARY KEY,
    "tenantId" CHAR(25) NULL,
    "fullName" VARCHAR(100) NULL,
    nickname VARCHAR(20) NULL,
    "entityType" VARCHAR(10) NULL,
    "ownerId" CHAR(25) NULL
);

-- Cars
CREATE TABLE IF NOT EXISTS cars (
    id CHAR(25) NOT NULL PRIMARY KEY,
    "tenantId" CHAR(25) NULL,
    description VARCHAR(50) NULL,
    "isInUse" BOOLEAN NULL
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id CHAR(25) NOT NULL PRIMARY KEY,
    "tenantId" CHAR(25) NULL,
    name VARCHAR(100) NULL,
    "isPersonal" BOOLEAN NULL,
    type CHAR(2) DEFAULT 'e' NULL
);

-- Data Changes (audit log)
CREATE TABLE IF NOT EXISTS "dataChanges" (
    id BIGSERIAL PRIMARY KEY,
    "tenantId" CHAR(25) NULL,
    entity CHAR(50) NULL,
    "dataId" CHAR(25) NULL,
    "entryDateTime" TIMESTAMP NULL,
    operation CHAR(1) NULL,
    "userId" CHAR(25) NULL,
    data JSONB NULL,
    "importProcessId" CHAR(25) NULL
);

-- Duplicate Candidates
CREATE TABLE IF NOT EXISTS "duplicateCandidates" (
    id BIGSERIAL PRIMARY KEY,
    "transactionId" CHAR(25) NULL,
    "duplicateId" CHAR(25) NULL,
    "importId" CHAR(25) NULL,
    resolved BOOLEAN NULL
);

-- Duplicates
CREATE TABLE IF NOT EXISTS duplicates (
    id BIGSERIAL PRIMARY KEY,
    "tenantId" CHAR(25) NULL,
    "transactionId" CHAR(25) NULL,
    "parentTransactionId" CHAR(25) NULL,
    "transactionData" JSONB NULL,
    "externalUid" CHAR(150) NULL
);

-- Expired Tokens
CREATE TABLE IF NOT EXISTS "expiredTokens" (
    id CHAR(250) NOT NULL PRIMARY KEY,
    "createdDateTime" TIMESTAMP NULL,
    meta JSONB NULL
);

-- Import Rule Transactions
CREATE TABLE IF NOT EXISTS "importRuleTransactions" (
    id BIGSERIAL PRIMARY KEY,
    "tenantId" CHAR(25) NULL,
    "transactionId" CHAR(25) NULL,
    "ruleId" CHAR(25) NULL,
    "importId" CHAR(25) NULL,
    "createdAt" TIMESTAMP NULL,
    meta JSONB NULL
);

-- Import Rules
CREATE TABLE IF NOT EXISTS "importRules" (
    id CHAR(25) NOT NULL PRIMARY KEY,
    "tenantId" CHAR(25) NULL,
    "adapterId" CHAR(25) NULL,
    conditions JSONB NULL,
    actions JSONB NULL,
    disabled BOOLEAN DEFAULT FALSE NULL,
    "createdAt" TIMESTAMP NULL
);

-- Imports
CREATE TABLE IF NOT EXISTS imports (
    id CHAR(25) NOT NULL PRIMARY KEY,
    "tenantId" CHAR(25) NULL,
    "processId" CHAR(25) NULL,
    step CHAR(20) NULL,
    source CHAR(50) NULL,
    "fileName" VARCHAR(150) NULL,
    counts JSONB NULL,
    stats JSONB NULL,
    "stepDateTime" TIMESTAMP NULL,
    "fileInfo" JSONB NULL,
    "newData" JSONB NULL
);

-- Tenants
CREATE TABLE IF NOT EXISTS tenants (
    id CHAR(25) NOT NULL PRIMARY KEY,
    name VARCHAR(100) NULL,
    settings JSONB NULL,
    meta JSONB NULL
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id CHAR(25) NOT NULL PRIMARY KEY,
    "tenantId" CHAR(25) NULL,
    "postedDate" DATE NULL,
    "accountId" CHAR(25) NULL,
    "categoryId" CHAR(25) NULL,
    description VARCHAR(150) NULL,
    amount INTEGER NULL,
    "businessId" CHAR(25) NULL,
    "originalDescription" VARCHAR(150) NULL,
    "sourceOriginalDescription" VARCHAR(150) NULL,
    frequency VARCHAR(150) NULL,
    scheduled BOOLEAN NULL,
    completed BOOLEAN NULL,
    reconciled BOOLEAN NULL,
    deleted BOOLEAN NULL,
    "hasChildren" BOOLEAN NULL,
    note VARCHAR(1000) NULL,
    "parentId" CHAR(25) NULL,
    "externalUid" VARCHAR(150) NULL,
    "dipSourceId" CHAR(25) NULL,
    "hasOpenTasks" BOOLEAN NULL,
    "importProcessId" CHAR(25) NULL,
    "hasDuplicates" BOOLEAN NULL,
    source CHAR(10) NULL,
    "tripId" CHAR(25) NULL,
    meta JSONB NULL
);

-- Trips
CREATE TABLE IF NOT EXISTS trips (
    id CHAR(25) NOT NULL PRIMARY KEY,
    "tenantId" CHAR(25) NULL,
    "carId" CHAR(25) NULL,
    description VARCHAR(100) NULL,
    "startDate" DATE NULL,
    "endDate" DATE NULL,
    distance INTEGER NULL,
    "transactionId" CHAR(25) NULL,
    meta JSONB NULL
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id CHAR(25) NOT NULL PRIMARY KEY,
    "tenantId" CHAR(25) NULL,
    nickname VARCHAR(25) NULL,
    "fullName" VARCHAR(100) NULL,
    email VARCHAR(50) NULL,
    password CHAR(100) NULL,
    "hasAccess" BOOLEAN DEFAULT TRUE NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_account ON transactions("tenantId", "accountId");
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_posted ON transactions("tenantId", "postedDate");
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_external ON transactions("tenantId", "externalUid");
CREATE INDEX IF NOT EXISTS idx_accounts_tenant ON accounts("tenantId");
CREATE INDEX IF NOT EXISTS idx_categories_tenant ON categories("tenantId");
```

---

## Phase 3: Code Changes

### 3.1 Knex Configuration

**File: `server/db/db.js`**

**Change 1: Update Knex client (lines 14-24)**

```javascript
// BEFORE:
knexPool = knexDb({
  client: 'mysql',
  connection: {
    host: config.mysql.server,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    charset: 'utf8mb4'
  },
  pool: { min: 1, max: 10 }
})

// AFTER:
knexPool = knexDb({
  client: 'pg',
  connection: {
    host: config.postgres.server,
    user: config.postgres.user,
    password: config.postgres.password,
    database: config.postgres.database,
    port: config.postgres.port || 5432
  },
  pool: { min: 1, max: 10 }
})
```

**Change 2: Fix raw query result handling (line ~62)**

PostgreSQL returns `{ rows: [...] }` instead of MySQL's `[[...]]`:

```javascript
// BEFORE:
async raw(query, params) {
  return (await knexPool.raw(query, params))[0]
}

// AFTER:
async raw(query, params) {
  const result = await knexPool.raw(query, params)
  return result.rows
}
```

### 3.2 Account Database

**File: `server/db/accountDb.js`**

**Change 1: Boolean comparison (line 25)**

```javascript
// BEFORE:
return this.knex.where({ tenantId, isDefault: 1 }).select()

// AFTER:
return this.knex.where({ tenantId, isDefault: true }).select()
```

**Change 2: UPDATE...JOIN to UPDATE...FROM (lines 38-47)**

```javascript
// BEFORE:
const query = `
  UPDATE accounts
      JOIN (
      SELECT accountId, sum(amount) AS total
      FROM transactions
      WHERE tenantId = ?
      GROUP BY accountId) AS totals ON accounts.id = totals.accountId
  SET balance = totals.total;
`
return this.knex.raw(query, [tenantId])

// AFTER:
const query = `
  UPDATE accounts
  SET balance = totals.total
  FROM (
    SELECT "accountId", SUM(amount) AS total
    FROM transactions
    WHERE "tenantId" = $1
    GROUP BY "accountId"
  ) AS totals
  WHERE accounts.id = totals."accountId";
`
return this.knex.raw(query, [tenantId])
```

**Change 3: Balance calculation query (lines 51-64)**

```javascript
// BEFORE:
const query = `
    SELECT
      a.id,
      (a.openingBalance + COALESCE(SUM(CASE WHEN t.reconciled = 1 THEN t.amount END), 0)) / 100 as balance,
      COUNT(CASE WHEN t.reconciled = 0 THEN 1 END) as unreconciledCount
  FROM accounts a
  LEFT JOIN transactions t ON a.id = t.accountId
      AND t.source = 'i'
      AND t.deleted = 0
      AND t.parentId IS NULL
  WHERE a.tenantId = ?
      AND a.deleted = 0
  GROUP BY a.id, a.openingBalance;`

// AFTER:
const query = `
    SELECT
      a.id,
      (a."openingBalance" + COALESCE(SUM(CASE WHEN t.reconciled = true THEN t.amount END), 0)) / 100 as balance,
      COUNT(CASE WHEN t.reconciled = false THEN 1 END) as "unreconciledCount"
  FROM accounts a
  LEFT JOIN transactions t ON a.id = t."accountId"
      AND t.source = 'i'
      AND t.deleted = false
      AND t."parentId" IS NULL
  WHERE a."tenantId" = $1
      AND a.deleted = false
  GROUP BY a.id, a."openingBalance";`
```

**Change 4: getWithExtras method (lines 67-96)**

Update all boolean comparisons and quote camelCase identifiers.

### 3.3 Dashboard Database

**File: `server/db/dashboardDb.js`**

**Change 1: Boolean clause helper (line 6)**

```javascript
// BEFORE:
const getReconciledClause = reconciledOnly => reconciledOnly ? 'reconciled = 1 AND ' : ' '

// AFTER:
const getReconciledClause = reconciledOnly => reconciledOnly ? 'reconciled = true AND ' : ' '
```

**Change 2: All YEAR()/MONTH() functions**

Replace throughout the file:

| MySQL | PostgreSQL |
|-------|------------|
| `YEAR(postedDate)` | `EXTRACT(YEAR FROM "postedDate")` |
| `MONTH(postedDate)` | `EXTRACT(MONTH FROM "postedDate")` |

**Example (listReportExcludedTransactions, lines 54-67):**

```javascript
// BEFORE:
YEAR(postedDate) = ? AND

// AFTER:
EXTRACT(YEAR FROM "postedDate") = $2 AND
```

**Change 3: Quote all camelCase column names**

Add double quotes around: `accountId`, `shortName`, `openingBalance`, `parentId`, `tenantId`, `categoryId`, `postedDate`, `businessId`

### 3.4 Transaction Database

**File: `server/db/transactionDb.js`**

**Change 1: DATEDIFF conversion (lines 59-68)**

```javascript
// BEFORE:
return this.raw(`SELECT id, sourceOriginalDescription, originalDescription
  FROM transactions
  WHERE tenantId = ?
    AND id != ?
    AND accountId = ?
    AND amount = ?
    AND ABS(DATEDIFF(?, postedDate)) < 7;`,
  [tenantId, id, accountId, amount, postedDate])

// AFTER:
return this.raw(`SELECT id, "sourceOriginalDescription", "originalDescription"
  FROM transactions
  WHERE "tenantId" = $1
    AND id != $2
    AND "accountId" = $3
    AND amount = $4
    AND ABS($5::date - "postedDate") < 7;`,
  [tenantId, id, accountId, amount, postedDate])
```

**Change 2: Boolean comparisons (lines 81, 95)**

```javascript
// BEFORE:
where('accounts.visible', '=', 1)

// AFTER:
where('accounts.visible', '=', true)
```

### 3.5 Import Database

**File: `server/db/importDb.js`**

**Change: Quote identifiers in DELETE (lines 34-35)**

```javascript
// BEFORE:
await this.knex.client.raw(
  'DELETE FROM trips WHERE transactionId IN (SELECT id FROM transactions WHERE importProcessId = ? AND tenantId = ?);', [processId, tenantId])

// AFTER:
await this.knex.client.raw(
  'DELETE FROM trips WHERE "transactionId" IN (SELECT id FROM transactions WHERE "importProcessId" = $1 AND "tenantId" = $2);', [processId, tenantId])
```

### 3.6 Budget Database

**File: `server/db/budgetDb.js`**

**Change: Named to positional parameters (lines 45-49)**

```javascript
// BEFORE:
return this.raw(`INSERT INTO budgets (tenantId, year, monthNo, categoryId, amount, comment)
  SELECT tenantId, :year AS year, monthNo, categoryId, amount, comment FROM budgets
  WHERE tenantId=:tenantId AND year=:prevYear;`,
  {tenantId, year, prevYear: year - 1})

// AFTER:
return this.raw(`INSERT INTO budgets ("tenantId", year, "monthNo", "categoryId", amount, comment)
  SELECT "tenantId", $1 AS year, "monthNo", "categoryId", amount, comment FROM budgets
  WHERE "tenantId" = $2 AND year = $3;`,
  [year, tenantId, year - 1])
```

### 3.7 Duplicate Candidate Database

**File: `server/db/duplicateCandidateDb.js`**

**Change: Boolean comparison (line 16)**

```javascript
// BEFORE:
return this.knex.where({ resolved: 0 }).whereIn('transactionId', ids).select()

// AFTER:
return this.knex.where({ resolved: false }).whereIn('transactionId', ids).select()
```

### 3.8 Configuration Files

**Files: `server/config/config.*.yaml` (all 4 files)**

```yaml
# BEFORE:
mysql:
  server: localhost
  user: psbf
  password: yourpassword
  database: psbf

# AFTER:
postgres:
  server: localhost
  user: psbf
  password: yourpassword
  database: psbf
  port: 5432
```

---

## Phase 4: Data Migration Script

Create `scripts/migrate-mysql-to-postgres.js`:

```javascript
#!/usr/bin/env node
'use strict'

import knex from 'knex'
import fs from 'fs'

// MySQL source configuration
const mysqlConfig = {
  client: 'mysql',
  connection: {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'psbf',
    password: process.env.MYSQL_PASSWORD || 'password',
    database: process.env.MYSQL_DATABASE || 'psbf'
  }
}

// PostgreSQL target configuration
const pgConfig = {
  client: 'pg',
  connection: {
    host: process.env.PG_HOST || 'localhost',
    user: process.env.PG_USER || 'psbf',
    password: process.env.PG_PASSWORD || 'password',
    database: process.env.PG_DATABASE || 'psbf',
    port: process.env.PG_PORT || 5432
  }
}

// Tables in dependency order
const tables = [
  'dbChanges',
  'tenants',
  'banks',
  'users',
  'businesses',
  'accounts',
  'cars',
  'categories',
  'transactions',
  'trips',
  'attachments',
  'budgets',
  'dataChanges',
  'duplicateCandidates',
  'duplicates',
  'expiredTokens',
  'importRules',
  'imports',
  'importRuleTransactions'
]

// Boolean columns by table
const booleanColumns = {
  accounts: ['closed', 'visible', 'deleted', 'isDefault'],
  cars: ['isInUse'],
  categories: ['isPersonal'],
  duplicateCandidates: ['resolved'],
  importRules: ['disabled'],
  transactions: ['scheduled', 'completed', 'reconciled', 'deleted', 'hasChildren', 'hasOpenTasks', 'hasDuplicates'],
  users: ['hasAccess']
}

async function migrate() {
  const mysqlDb = knex(mysqlConfig)
  const pgDb = knex(pgConfig)

  console.log('Starting MySQL to PostgreSQL migration...')

  try {
    // Execute PostgreSQL schema
    console.log('Creating PostgreSQL schema...')
    const schema = fs.readFileSync('.db/postgres-schema.sql', 'utf8')
    await pgDb.raw(schema)

    for (const table of tables) {
      console.log(`Migrating table: ${table}`)

      const rows = await mysqlDb(table).select()
      console.log(`  Found ${rows.length} rows`)

      if (rows.length === 0) continue

      // Convert boolean columns
      const boolCols = booleanColumns[table] || []

      const convertedRows = rows.map(row => {
        const newRow = { ...row }
        for (const col of boolCols) {
          if (col in newRow) {
            newRow[col] = newRow[col] === 1 || newRow[col] === true
          }
        }
        return newRow
      })

      // Insert in batches
      const batchSize = 500
      for (let i = 0; i < convertedRows.length; i += batchSize) {
        const batch = convertedRows.slice(i, i + batchSize)
        await pgDb(table).insert(batch)
        console.log(`  Inserted ${Math.min(i + batchSize, convertedRows.length)}/${convertedRows.length}`)
      }
    }

    // Reset sequences
    console.log('Resetting sequences...')
    const serialTables = ['budgets', 'dataChanges', 'duplicateCandidates', 'duplicates', 'importRuleTransactions']
    for (const table of serialTables) {
      const maxId = await pgDb(table).max('id as max').first()
      if (maxId?.max) {
        await pgDb.raw(`SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), ${maxId.max})`)
      }
    }

    // Verify counts
    console.log('\nVerification:')
    for (const table of tables) {
      const mysqlCount = await mysqlDb(table).count('* as count').first()
      const pgCount = await pgDb(table).count('* as count').first()
      const match = mysqlCount.count === Number(pgCount.count) ? '✓' : '✗'
      console.log(`  ${match} ${table}: MySQL=${mysqlCount.count}, PostgreSQL=${pgCount.count}`)
    }

    console.log('\nMigration completed successfully!')

  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    await mysqlDb.destroy()
    await pgDb.destroy()
  }
}

migrate()
```

---

## Phase 5: Testing Checklist

### Pre-Migration
- [ ] Backup MySQL database: `mysqldump -u psbf -p psbf > backup.sql`
- [ ] Document row counts for all tables
- [ ] Run existing test suite: `npm test`

### Post-Migration Verification
- [ ] All table row counts match
- [ ] Server starts without errors
- [ ] Authentication works (login/logout)
- [ ] Account listing displays correctly
- [ ] Account balance calculations work
- [ ] Transaction listing by date range works
- [ ] Transaction search by amount works
- [ ] Transaction search by description works
- [ ] Duplicate detection works
- [ ] Dashboard balances correct
- [ ] Dashboard P&L reports work
- [ ] Budget reports work
- [ ] Data import process works
- [ ] Trip calculations work
- [ ] Existing test suite passes

---

## Execution Steps

### 1. Preparation
```bash
# Backup MySQL
mysqldump -u psbf -p psbf > mysql-backup-$(date +%Y%m%d).sql

# Install dependencies
cd server && npm install pg

# Start PostgreSQL
docker-compose up -d
```

### 2. Apply Code Changes
Apply all changes from Phase 3 in this order:
1. `server/db/db.js` (Knex config + raw result handling)
2. `server/db/accountDb.js`
3. `server/db/dashboardDb.js`
4. `server/db/transactionDb.js`
5. `server/db/importDb.js`
6. `server/db/budgetDb.js`
7. `server/db/duplicateCandidateDb.js`
8. `server/config/config.*.yaml`

### 3. Create Schema
```bash
# Create schema file
# (copy content from Phase 2.2 to .db/postgres-schema.sql)

# Apply schema
psql -h localhost -U psbf -d psbf -f .db/postgres-schema.sql
```

### 4. Migrate Data
```bash
# Set environment variables
export MYSQL_HOST=old-mysql-host
export MYSQL_USER=psbf
export MYSQL_PASSWORD=yourpassword
export MYSQL_DATABASE=psbf
export PG_HOST=localhost
export PG_USER=psbf
export PG_PASSWORD=strongpassword
export PG_DATABASE=psbf

# Run migration
node scripts/migrate-mysql-to-postgres.js
```

### 5. Test
```bash
npm run start:server
npm test
```

### 6. Cleanup (after successful migration)
```bash
cd server && npm uninstall mysql
```

---

## Rollback Plan

If migration fails:
1. Stop application
2. Revert code changes (git checkout)
3. Point config back to MySQL
4. Restore MySQL backup if needed
5. Restart application

---

## Files Summary

### Files to Modify
| File | Changes |
|------|---------|
| `server/db/db.js` | Knex client config, raw() result handling |
| `server/db/accountDb.js` | UPDATE...JOIN→FROM, booleans, identifiers |
| `server/db/dashboardDb.js` | YEAR/MONTH→EXTRACT, booleans (8 queries) |
| `server/db/transactionDb.js` | DATEDIFF conversion, booleans |
| `server/db/importDb.js` | Quoted identifiers |
| `server/db/budgetDb.js` | Named→positional params |
| `server/db/duplicateCandidateDb.js` | Boolean comparison |
| `server/config/config._dev.yaml` | mysql→postgres section |
| `server/config/config.dev.yaml` | mysql→postgres section |
| `server/config/config.test.yaml` | mysql→postgres section |
| `server/config/config.prod.yaml` | mysql→postgres section |

### Files to Create
| File | Purpose |
|------|---------|
| `docker-compose.yml` | PostgreSQL container |
| `.db/postgres-schema.sql` | PostgreSQL DDL |
| `scripts/migrate-mysql-to-postgres.js` | Data migration |
