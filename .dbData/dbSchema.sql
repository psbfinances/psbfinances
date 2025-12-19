create table psb_finance.accounts
(
    id             char(25)                     not null
        primary key,
    tenantId       char(25)                     null,
    shortName      varchar(25)                  null,
    fullName       varchar(100)                 null,
    type           varchar(25)                  null,
    bankId         char(25)                     null,
    closed         tinyint(1)                   null,
    visible        tinyint(1)                   null,
    deleted        tinyint(1)                   null,
    businessId     char(25)                     null,
    isDefault      tinyint(1)                   null,
    openingBalance int default 0                null,
    balance        int default 0                null,
    format         char(10)                     null,
    meta           longtext collate utf8mb4_bin null
        check (json_valid(`meta`)),
    note           varchar(1000)                null,
    createdAt      datetime                     null,
    constraint accounts_id_uindex
        unique (id)
)
    engine = InnoDB
    charset = latin1;

create table psb_finance.attachments
(
    id           char(25)                     not null
        primary key,
    tenantId     char(25)                     null,
    entityId     char(25)                     null,
    fileName     varchar(100)                 null,
    uploadedDate datetime                     null,
    meta         longtext collate utf8mb4_bin null
        check (json_valid(`meta`)),
    fileInfo     longtext collate utf8mb4_bin null
        check (json_valid(`fileInfo`)),
    constraint attachments_id_uindex
        unique (id)
)
    engine = InnoDB
    charset = latin1;

create table psb_finance.banks
(
    id        varchar(25)  not null
        primary key,
    shortName varchar(25)  null,
    fullName  varchar(100) null,
    constraint banks_id_uindex
        unique (id)
)
    engine = InnoDB
    charset = latin1;

create table psb_finance.budgets
(
    id         bigint auto_increment
        primary key,
    tenantId   char(25)     null,
    year       smallint     null,
    monthNo    smallint     null,
    categoryId char(25)     null,
    amount     int          null,
    comment    varchar(500) null,
    constraint budgets_id_uindex
        unique (id)
)
    engine = InnoDB
    charset = latin1;

create table psb_finance.businesses
(
    id         char(25)     null,
    tenantId   char(25)     null,
    fullName   varchar(100) null,
    nickname   varchar(20)  null,
    entityType varchar(10)  null,
    ownerId    char(25)     null
)
    engine = InnoDB
    charset = latin1;

create table psb_finance.cars
(
    id          char(25)    not null
        primary key,
    tenantId    char(25)    null,
    description varchar(50) null,
    isInUse     tinyint(1)  null,
    constraint cars_id_uindex
        unique (id)
)
    engine = InnoDB
    charset = latin1;

create table psb_finance.categories
(
    id         char(25)            not null
        primary key,
    tenantId   char(25)            null,
    name       varchar(100)        null,
    isPersonal tinyint(1)          null,
    type       char(2) default 'e' null,
    constraint categories_id_uindex
        unique (id)
)
    engine = InnoDB
    charset = latin1;

create table psb_finance.dataChanges
(
    id              bigint auto_increment
        primary key,
    tenantId        char(25)                     null,
    entity          char(50)                     null,
    dataId          char(25)                     null,
    entryDateTime   datetime                     null,
    operation       char                         null,
    userId          char(25)                     null,
    data            longtext collate utf8mb4_bin null,
    importProcessId char(25)                     null,
    constraint dataChanges_id_uindex
        unique (id)
)
    engine = InnoDB
    charset = latin1;

create table psb_finance.dbChanges
(
    id             char(50)       not null,
    startAt        datetime       null,
    endAt          datetime       null,
    statementCount int            null,
    tenantId       int default -1 not null,
    constraint dbChanges_id_uindex
        unique (id)
)
    engine = InnoDB
    charset = latin1;

create table psb_finance.duplicateCandidates
(
    id            bigint auto_increment
        primary key,
    transactionId char(25)   null,
    duplicateId   char(25)   null,
    importId      char(25)   null,
    resolved      tinyint(1) null,
    constraint duplicateCandidates_id_uindex
        unique (id)
)
    engine = InnoDB
    charset = latin1;

create table psb_finance.duplicates
(
    id                  bigint auto_increment
        primary key,
    tenantId            char(25)                     null,
    transactionId       char(25)                     null,
    parentTransactionId char(25)                     null,
    transactionData     longtext collate utf8mb4_bin null,
    externalUid         char(150)                    null,
    constraint duplicates_id_uindex
        unique (id)
)
    engine = InnoDB
    charset = latin1;

create table psb_finance.expiredTokens
(
    id              char(250)                    not null
        primary key,
    createdDateTime datetime                     null,
    meta            longtext collate utf8mb4_bin null
        check (json_valid(`meta`)),
    constraint expiredTokens_id_uindex
        unique (id)
)
    engine = InnoDB
    charset = latin1;

create table psb_finance.importRuleTransactions
(
    id            bigint auto_increment
        primary key,
    tenantId      char(25)                     null,
    transactionId char(25)                     null,
    ruleId        char(25)                     null,
    importId      char(25)                     null,
    createdAt     datetime                     null,
    meta          longtext collate utf8mb4_bin null
        check (json_valid(`meta`)),
    constraint importRuleTransactions_id_uindex
        unique (id)
)
    engine = InnoDB
    charset = latin1;

create table psb_finance.importRules
(
    id         char(25)                     not null
        primary key,
    tenantId   char(25)                     null,
    adapterId  char(25)                     null,
    conditions longtext collate utf8mb4_bin null
        check (json_valid(`conditions`)),
    actions    longtext collate utf8mb4_bin null
        check (json_valid(`actions`)),
    disabled   tinyint(1) default 0         null,
    createdAt  datetime                     null,
    constraint importRules_id_uindex
        unique (id)
)
    engine = InnoDB
    charset = latin1;

create table psb_finance.imports
(
    id           char(25)                     not null
        primary key,
    tenantId     char(25)                     null,
    processId    char(25)                     null,
    step         char(20)                     null,
    source       char(50)                     null,
    fileName     varchar(150)                 null,
    counts       longtext collate utf8mb4_bin null,
    stats        longtext collate utf8mb4_bin null,
    stepDateTime datetime                     null,
    fileInfo     longtext collate utf8mb4_bin null
        check (json_valid(`fileInfo`)),
    constraint imports_id_uindex
        unique (id)
)
    engine = InnoDB
    charset = latin1;

create table psb_finance.tenants
(
    id       char(25)                     not null
        primary key,
    name     varchar(100)                 null,
    settings longtext collate utf8mb4_bin null
        check (json_valid(`settings`)),
    meta     longtext collate utf8mb4_bin null
        check (json_valid(`meta`)),
    constraint tenants_id_uindex
        unique (id)
)
    engine = InnoDB
    charset = latin1;

create table psb_finance.transactions
(
    id                        char(25)                     not null
        primary key,
    tenantId                  char(25)                     null,
    postedDate                date                         null,
    accountId                 char(25)                     null,
    categoryId                char(25)                     null,
    description               varchar(150)                 null,
    amount                    int                          null,
    businessId                char(25)                     null,
    originalDescription       varchar(150)                 null,
    sourceOriginalDescription varchar(150)                 null,
    frequency                 varchar(150)                 null,
    scheduled                 tinyint(1)                   null,
    completed                 tinyint(1)                   null,
    reconciled                tinyint(1)                   null,
    deleted                   tinyint(1)                   null,
    hasChildren               tinyint(1)                   null,
    note                      varchar(1000)                null,
    parentId                  char(25)                     null,
    externalUid               varchar(150)                 null,
    dipSourceId               char(25)                     null,
    hasOpenTasks              tinyint(1)                   null,
    importProcessId           char(25)                     null,
    hasDuplicates             tinyint(1)                   null,
    source                    char(10)                     null,
    tripId                    char(25)                     null,
    meta                      longtext collate utf8mb4_bin null
        check (json_valid(`meta`)),
    constraint transactions_id_uindex
        unique (id)
)
    engine = InnoDB
    charset = latin1;

create index transactions__tenantId_externalUid
    on psb_finance.transactions (tenantId, externalUid);

create table psb_finance.trips
(
    id            char(25)                     not null
        primary key,
    tenantId      char(25)                     null,
    carId         char(25)                     null,
    description   varchar(100)                 null,
    startDate     date                         null,
    endDate       date                         null,
    distance      int                          null,
    transactionId char(25)                     null,
    meta          longtext collate utf8mb4_bin null
        check (json_valid(`meta`)),
    constraint trips_id_uindex
        unique (id)
)
    engine = InnoDB
    charset = latin1;

create table psb_finance.users
(
    id        char(25)             not null
        primary key,
    tenantId  char(25)             null,
    nickname  varchar(25)          null,
    fullName  varchar(100)         null,
    email     varchar(50)          null,
    password  char(100)            null,
    hasAccess tinyint(1) default 1 null,
    constraint users_id_uindex
        unique (id)
)
    engine = InnoDB
    charset = latin1;

