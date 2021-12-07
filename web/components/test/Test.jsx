'use strict'

import React from 'react'
import styled from 'styled-components'

// import { BisLayout } from '../../stores/BisLayout'
import Splits from '../transactionForm/Splits'
import CoreFields, { CoreFieldsModel } from '../transactionForm/CoreFields'
// import SplitViewModel from '../transactionForm/splitViewModel.js'
// import {
//   accounts,
//   transactionsAmazonCard,
//   businesses,
//   cars,
//   categories,
//   transactionsCitiMain
// } from '../transactionList/__tests__/data'
import CategoryOptions from '../transactionForm/categoryOptions'
import BusinessOptions from '../transactionForm/businessOptions'
import { transactionModel } from '../../../shared/models'
import { transaction } from 'mobx'

const handler = () => {}

function TestComponent ({}) {
  // const formModel = new TransactionFormViewModel(accounts[0].id, [personalBusiness, ...businesses], categories,
  //   transactionsAmazonCard[0])
  // const splitViewModel = new SplitViewModel(transactionsAmazonCard[0], businesses, categories)
  // const childTransaction = transactionModel.getNewChild(transactionsAmazonCard[0])
  // const coreFieldsModel = new CoreFieldsModel(childTransaction, businesses, categories)

  // const handlers = {
  //   handlePostedDateChange: handler,
  //   handleDescriptionChange: handler,
  //   handleChange: handler,
  //   handleAmountChange: handler
  // }

  return <TestDiv id='testDiv'>
    <h4>Test container</h4>
    {/*<Splits model={splitViewModel}/>*/}
    {/*<CoreFields model={coreFieldsModel} />*/}
  </TestDiv>
}

const TestDiv = styled.div`
  margin-top: 20px;
  margin-left: 20px;
  width: 300px;
  background-color: #fcf9f8;
`
export default TestComponent

