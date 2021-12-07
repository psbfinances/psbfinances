'use strict'

import { endpoint, Api } from './api.js'
import DashboardApi from './dashboardApi.js'
import DuplicateTransactionApi from './duplicateTransactionApi.js'
import TransactionApi from './transactionApi.js'
import AuthApi from './authApi.js'
import ImportApi from './importApi.js'
import AttachmentApi from './attachmentApi.js'

export const accountApi = new Api(endpoint.ACCOUNTS)
export const attachmentApi = new AttachmentApi(endpoint.ATTACHMENTS)
export const authApi = new AuthApi(endpoint.AUTH)
export const businessApi = new Api(endpoint.BUSINESSES)
export const categoryApi = new Api(endpoint.CATEGORIES)
export const carApi = new Api(endpoint.CARS)
export const dashboardApi = new DashboardApi(endpoint.DASHBOARD)
export const duplicateTransactionApi = new DuplicateTransactionApi(endpoint.DUPLICATE_TRANSACTIONS)
export const importApi = new ImportApi(endpoint.IMPORTS)
export const importRuleApi = new Api(endpoint.IMPORT_RULES)
export const tenantApi = new TransactionApi(endpoint.TENANTS)
export const transactionApi = new TransactionApi(endpoint.TRANSACTIONS)
export const tripApi = new Api(endpoint.TRIPS)
export const userApi = new Api(endpoint.USERS)

