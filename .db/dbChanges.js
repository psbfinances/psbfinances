'use strict'

export const statements = [
  `CREATE TABLE IF NOT EXISTS dbChanges
    (
      id char(50) not null,
      startAt datetime null,
      endAt datetime null,
      statementCount int null,
      tenantId int default -1 not null,
      constraint dbChanges_id_uindex
        unique (id)
    );`,
  `alter table dbChanges add primary key (id); `
]
