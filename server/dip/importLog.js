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
      categories: []
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

  addNewAccount (name) {
    this.newData.accounts.push(name)
    this.counts.newAccounts++
  }
  addNewCategory (name) {
    this.newData.categories.push(name)
    this.counts.newCategories++
  }
  countNewRule () { this.counts.newRules++ }
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
