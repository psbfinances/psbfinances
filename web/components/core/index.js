'use strict'

import AccountSelector from './AccountSelector.jsx'
import AccountInput from './AccountInput.jsx'
import AmountField from './AmountField.jsx'
import AmountTd from './AmountTd.jsx'
import BusinessInput from './BusinessInput.jsx'
import ButtonOk from './ButtonOk.jsx'
import CancelOkButtons from './CancelOkButtons.jsx'
import CategoryInput from './CategoryInput.jsx'
import CategorySelector from './CategorySelector.jsx'
import CheckboxField from './CheckboxField.jsx'
import DescriptionInput from './DescriptionInput.jsx'
import Error from './Error.jsx'
import FormButtons from './FormButtons.jsx'
import FormHeader from './FormHeader.jsx'
import FormError from './FormError.jsx'
import ErrorPage from './ErrorPage.jsx'
import IconButton from './IconButton.jsx'
import InputField from './InputField.jsx'
import Loading from './Loading.jsx'
import Logo from './Logo.jsx'
import PeriodSelector from './PeriodSelector.jsx'
import SearchEntry from './SearchEntry.jsx'
import SelectField from './SelectField.jsx'
import StyledDropzone from './StyledDropzone.jsx'

/**
 *
 * @param {React.Component} component
 * @param {SyncEvent} e
 * @param {function} [cb]
 * @param {Object} [cbParams]
 */
function handleInputChange (component, e, cb, cbParams) {
  const target = e.target
  const value = target.type === 'checkbox' ? target.checked : target.value
  const name = target.name

  if (cb) component.setState({ [name]: value }, (state) => cb(state))
  else component.setState({ [name]: value })
}

export {
  handleInputChange,
  AccountSelector,
  AccountInput,
  AmountField,
  AmountTd,
  BusinessInput,
  ButtonOk,
  CancelOkButtons,
  CategoryInput,
  CategorySelector,
  CheckboxField,
  DescriptionInput,
  Error,
  ErrorPage,
  FormButtons,
  FormError,
  FormHeader,
  IconButton,
  InputField,
  Loading,
  Logo,
  PeriodSelector,
  SearchEntry,
  SelectField,
  StyledDropzone
}
