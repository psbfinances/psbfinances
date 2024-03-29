'use strict'

const c = {
  dipAdapters: {
    all: { id: 'all', label: 'All transactions' },
    boaAgr: { id: 'boaAgr', label: 'BoA Aggregator transactions' },
    appleCard: { id: 'appleCard', label: 'Apple Card transactions' },
    mint: { id: 'mint', label: 'Mint transactions' }
  },
  selectId: {
    ALL: 'all',
    NONE: '-1'
  },
  PERSONAL_TYPE_ID: 'p',
  NEW_ID_PREFIX: 'new-',
  sources: {
    IMPORT: 'i',
    MANUAL: 'm',
    GENERATED: 'g'
  },
  transactionType: {
    EXPENSE: 'e',
    INCOME: 'i',
    TRANSFER: 't'
  },
  dataStatus: {
    NEW: 'new',
    CLONE: 'clone',
    EXISTING: 'existing'
  },
  months: [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  importFormatId: {
    MINT_CSV: 'mint',
    APPLE_CARD_CSV: 'appleCard',
    BOA_AGR_CSV: 'boaAgr',
    CITI_CARD_CVS: 'citiCard'
  }
}

export default c
