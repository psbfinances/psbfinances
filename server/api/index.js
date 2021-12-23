'use strict'

import express from 'express'
import { auth, access } from '../middleware/index.js'
import accountController from './accountController.js'
import attachmentController from './attachmentController.js'
import authController from './authController.js'
import businessController from './businessController.js'
import categoryController from './categoryController.js'
import carController from './carController.js'
import duplicateTransactionController from './duplicateTransactionController.js'
import dashboardController from './dashboardController.js'
import importController from './importController.js'
import importRuleController from './importRuleController.js'
import importRuleTransactionController from './importRuleTransactionController.js'
import transactionController from './transactionController.js'
import tripController from './tripController.js'
import userController from './userController.js'
import budgetController from './budgetController.js'

/** @type {import('express').Router} */
const router = express.Router()

router.use('/auth', authController)

router.use(auth.authenticate)
router.use(access.authorize)

router.use('/accounts', accountController)
router.use('/attachments', attachmentController)
router.use('/businesses', businessController)
router.use('/budget', budgetController)
router.use('/categories', categoryController)
router.use('/cars', carController)
router.use('/dashboard', dashboardController)
router.use('/duplicateTransactions', duplicateTransactionController)
router.use('/imports', importController)
router.use('/importRules', importRuleController)
router.use('/importRuleTransactions', importRuleTransactionController)
router.use('/transactions', transactionController)
router.use('/trips', tripController)
router.use('/users', userController)


router.use('*', (req, res) => res.status(404).json({ error: 'Invalid API path' }))

export default router

/*
transactions
  list GET
  get GET
 */
