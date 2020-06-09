import * as rest from '../util/rest';

export const createCustomerIdAndCharge = (amountUSD) => (dispatch) => (
  rest.post('/api/data_credits/create_customer_and_charge', { amountUSD })
  .then(({ data }) => data)
)

export const createCharge = (amountUSD) => (dispatch) => (
  rest.post('/api/data_credits/create_charge', { amountUSD })
  .then(({ data }) => data)
)

export const getPaymentMethods = () => (dispatch) => (
  rest.get('/api/data_credits/payment_methods')
  .then(({ data }) => data.data)
)

export const getSetupPaymentMethod = () => (dispatch) => (
  rest.get('/api/data_credits/setup_payment_method')
  .then(({ data }) => data)
)

export const setDefaultPaymentMethod = (defaultPaymentId) => (dispatch) => (
  rest.post('/api/data_credits/set_default_payment_method', { defaultPaymentId })
  .then(() => {})
)
