'use strict'

export const statements = [
  // `CREATE DATABASE psbf CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
  // `CREATE USER 'psbf'@'localhost' IDENTIFIED BY 'strongpassword';`,
  // `GRANT ALTER, CREATE, INDEX, DELETE, INSERT, UPDATE, SELECT ON psbf.* TO 'psbf'@'localhost';`,

  `CREATE TABLE IF NOT EXISTS accounts
  (
    id char(25) not null,
    tenantId char(25) null,
    shortName varchar(25) null,
    fullName varchar(100) null,
    type varchar(25) null,
    bankId char(25) null,
    closed tinyint(1) null,
    visible tinyint(1) null,
    deleted tinyint(1) null,
    businessId char(25) null,
    isDefault tinyint(1) null,
    openingBalance int default 0 null,
    balance int default 0 null,
    format char(10) null,
    meta json null,
    note varchar(1000) null,
    createdAt datetime null,
    CONSTRAINT pk_accounts_id PRIMARY KEY (id)
  );`,

  `CREATE TABLE IF NOT EXISTS attachments
  (
    id char(25) not null,
    tenantId char(25) null,
    entityId char(25) null,
    fileName varchar(100) null,
    uploadedDate datetime null,
    meta json null,
    fileInfo json null,
    CONSTRAINT pk_attachments_id PRIMARY KEY (id)
  );`,

  `CREATE TABLE IF NOT EXISTS banks
  (
    id varchar(25) not null,
    shortName varchar(25) null,
    fullName varchar(100) null,
    CONSTRAINT pk_banks_id PRIMARY KEY (id)
  );`,

  `CREATE TABLE IF NOT EXISTS budgets
  (
    id bigint auto_increment not null,
    tenantId char(25) null,
    year smallint null,
    monthNo smallint null,
    categoryId char(25) null,
    amount int null,
    comment varchar(500) null,
    CONSTRAINT pk_budgets_id PRIMARY KEY (id)
  );`,

  `CREATE TABLE IF NOT EXISTS businesses
  (
    id char(25) not null,
    tenantId char(25) null,
    fullName varchar(100) null,
    nickname varchar(10) null,
    entityType varchar(10) null,
    ownerId char(25) null,
    CONSTRAINT pk_businesses_id PRIMARY KEY (id)
  );`,

  `CREATE TABLE IF NOT EXISTS cars
  (
    id char(25) not null,
    tenantId char(25) null,
    description varchar(50) null,
    isInUse tinyint(1) null,
    CONSTRAINT pk_cars_id PRIMARY KEY (id)
  );`,

  `CREATE TABLE IF NOT EXISTS categories
  (
    id char(25) not null,
    tenantId char(25) null,
    name varchar(100) null,
    isPersonal tinyint(1) null,
    type char(2) default 'e' null,
    CONSTRAINT pk_categories_id PRIMARY KEY (id)
  );`,

  `CREATE TABLE IF NOT EXISTS dataChanges
  (
    id bigint auto_increment not null,
    tenantId char(25) null,
    entity char(50) null,
    dataId char(25) null,
    entryDateTime datetime null,
    operation char null,
    userId char(25) null,
    data longtext collate utf8mb4_bin null,
    importProcessId char(25) null,
    CONSTRAINT pk_dataChanges_id PRIMARY KEY (id)
  );`,

  `CREATE TABLE IF NOT EXISTS duplicateCandidates
  (
    id bigint auto_increment not null,
    transactionId char(25) null,
    duplicateId char(25) null,
    importId char(25) null,
    resolved tinyint(1) null,
    CONSTRAINT pk_duplicateCandidates_id PRIMARY KEY (id)
  );`,

  `CREATE TABLE IF NOT EXISTS duplicates
  (
    id bigint auto_increment not null,
    tenantId char(25) null,
    transactionId char(25) null,
    parentTransactionId char(25) null,
    transactionData longtext collate utf8mb4_bin null,
    externalUid char(150) null,
    CONSTRAINT pk_duplicates_id PRIMARY KEY (id)
  );`,

  `CREATE TABLE IF NOT EXISTS expiredTokens
  (
    id char(250) not null,
    createdDateTime datetime null,
    meta json null,
    CONSTRAINT pk_expiredTokens_id PRIMARY KEY (id)
  );`,

  `CREATE TABLE IF NOT EXISTS importRuleTransactions
  (
    id bigint auto_increment not null,
    tenantId char(25) null,
    transactionId char(25) null,
    ruleId char(25) null,
    importId char(25) null,
    createdAt datetime null,
    meta json null,
    CONSTRAINT pk_importRuleTransactions_id PRIMARY KEY (id)
  );`,

  `CREATE TABLE IF NOT EXISTS importRules
  (
    id char(25) not null,
    tenantId char(25) null,
    adapterId char(25) null,
    conditions json null,
    actions json null,
    disabled tinyint(1) default 0 null,
    createdAt datetime null,
    CONSTRAINT pk_importRules_id PRIMARY KEY (id)
  );`,

  `CREATE TABLE IF NOT EXISTS imports
  (
    id char(25) not null,
    tenantId char(25) null,
    processId char(25) null,
    step char(20) null,
    source char(50) null,
    fileName varchar(150) null,
    counts longtext collate utf8mb4_bin null,
    stats longtext collate utf8mb4_bin null,
    stepDateTime datetime null,
    fileInfo json null,
    CONSTRAINT pk_imports_id PRIMARY KEY (id)
  );`,

  `CREATE TABLE IF NOT EXISTS tenants
  (
    id char(25) not null,
    name varchar(100) null,
    settings json null,
    meta json null,
    CONSTRAINT pk_tenants_id PRIMARY KEY (id)
  );`,

  `CREATE TABLE IF NOT EXISTS transactions
  (
    id char(25) not null,
    tenantId char(25) null,
    postedDate date null,
    accountId char(25) null,
    categoryId char(25) null,
    description varchar(150) null,
    amount int null,
    businessId char(25) null,
    originalDescription varchar(150) null,
    sourceOriginalDescription varchar(150) null,
    frequency varchar(150) null,
    scheduled tinyint(1) null,
    completed tinyint(1) null,
    reconciled tinyint(1) null,
    deleted tinyint(1) null,
    hasChildren tinyint(1) null,
    note varchar(1000) null,
    parentId char(25) null,
    externalUid varchar(150) null,
    dipSourceId char(25) null,
    hasOpenTasks tinyint(1) null,
    importProcessId char(25) null,
    hasDuplicates tinyint(1) null,
    source char(10) null,
    tripId char(25) null,
    meta json null,
    CONSTRAINT pk_transactions_id PRIMARY KEY (id)
  );`,
  // `CREATE INDEX IF NOT EXISTS transactions__tenantId_externalUid ON transactions (tenantId, externalUid);`,

  `CREATE TABLE IF NOT EXISTS trips
  (
    id char(25) not null,
    tenantId char(25) null,
    carId char(25) null,
    description varchar(100) null,
    startDate date null,
    endDate date null,
    distance int null,
    transactionId char(25) null,
    meta json null,
    CONSTRAINT pk_trips_id PRIMARY KEY (id)
  );`,

  `CREATE TABLE IF NOT EXISTS users
  (
    id char(25) not null,
    tenantId char(25) null,
    nickname varchar(25) null,
    fullName varchar(100) null,
    email varchar(50) null,
    password char(100) null,
    hasAccess tinyint(1) default 1 null,
    CONSTRAINT pk_users_id PRIMARY KEY (id)
  );`,
]
