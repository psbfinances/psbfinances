'use strict'

class ImportLog {
  constructor () {
    this.counts = {
      allTransactions: 0,
      newTransactions: 0,
      msBusinessServices: 0,
      missingAccount: 0,
      missingCategory: 0,
      duplicateCandidates: 0,
      newAccounts: 0,
      newCategories: 0,
      newRules: 0
    }
    this.stats = {
      dateFrom: new Date(),
      dateTo: new Date('01/01/1900'),
      newTransactionsDateFrom: new Date(),
      newTransactionsDateTo: new Date('01/01/1900')
    }
    this.newData = {
      accounts: [],
      categories: [],
      rules: []
    }
  }

  /**
   * Constructs the object from DB import log entry row.
   * @param item
   * @return {ImportLog}
   */
  static getFromDbEntry (item) {
    const result = new ImportLog()
    result.counts = JSON.parse(item.counts)
    result.stats = JSON.parse(item.stats)
    return result
  }

  /**
   * Logs creation of a new account.
   * @param {string} id
   * @param {string} name
   */
  addNewAccount (id, name) {
    this.newData.accounts.push({ id, name })
    this.counts.newAccounts++
  }

  addNewCategory (id,name) {
    this.newData.categories.push({ id, name })
    this.counts.newCategories++
  }
  addNewRule (id) {
    this.newData.rules.push(id)
    this.counts.newRules++
  }
  countNewTransaction () { this.counts.newTransactions++ }
  countMsBusinessService () { this.counts.msBusinessServices++ }
  countMissingAccounts () { this.counts.missingAccount++ }
  countCategories () { this.counts.missingCategory++ }
  countDuplicateCandidates () { this.counts.duplicateCandidates++ }

  setNewTransactionsDateRange (date) {
    if (date < this.stats.newTransactionsDateFrom) this.stats.newTransactionsDateFrom = date
    if (date > this.stats.newTransactionsDateTo) this.stats.newTransactionsDateTo = date
  }

  setAllTransactionsDateRange (date) {
    if (date < this.stats.dateFrom) this.stats.dateFrom = date
    if (date > this.stats.dateTo) this.stats.dateTo = date
  }
}

export default ImportLog
