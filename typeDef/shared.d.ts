export declare namespace psbf {
  /**
   *
   */
  interface BasicTransactionInfo {
    id?: string
    tenantId?: string
    accountId?: string
    postedDate?: Date|string
    description: string
    categoryId?: string
    businessId?: string
    amount: number
    note?: string
  }

  interface Transaction extends BasicTransactionInfo {
    originalDescription?: string
    sourceOriginalDescription?: string
    scheduled: boolean
    reconciled: boolean
    deleted: boolean
    hasChildren: boolean
    importProcessId?: string
    hasDuplicates: boolean
    parentId?: string
    externalUid?: string
    hasOpenTasks?: boolean
    source: string
    duplicateCandidateId?: string
    tripId?: string,
    meta?: {
      hasAttachment?: boolean
    } | string
  }

  interface TransactionUI extends Transaction {
    accountName?: string
    categoryDescription?: string
    businessDescription?: string
    balance?: number
    isNewMonth?: boolean
    isNewDate?: boolean
    tripDistance?: number
    isDuplicate: boolean
  }

  interface Category {
    id: string
    tenantId?: string
    name: string
    isPersonal: boolean,
    type?: string
  }

  interface Attachment {
    id: string
    tenantId?: string
    entityId: string
    fileName: string
    uploadedDate: Date,
    meta?: Object,
    fileInfo: Object
  }

  interface ImportRuleTransaction {
    id?: number
    tenantId?: string
    transactionId: string
    ruleId: string
    importId: string
    createdAt: Date
  }

  interface Budget {
    id?: number
    tenantId?: string
    year: number
    monthNo: number
    categoryId: string
    amount: number
    comment?: string
  }
}

export default psbf
