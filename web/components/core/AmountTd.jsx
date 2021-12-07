'use strict'

import React from 'react'
import numeral from 'numeral'

const formatCurrency = amount => numeral(amount).format('$0,0.00')

const AmountTd = ({amount, showValue = true, tdClass = ''}) => {
  const amountClass = `text-right ${tdClass} ${amount < 0 ? 'text-danger' : 'text-success'}`

  return <td className={amountClass}>{showValue ? formatCurrency(amount) : ''}</td>
}

export default AmountTd
