import * as rest from '../util/rest';

export const createCustomerIdAndCharge = (amountUSD) => () => (
  rest.post('/api/data_credits/create_customer_and_charge', { amountUSD })
  .then(({ data }) => data)
)

export const createCharge = (amountUSD) => () => (
  rest.post('/api/data_credits/create_charge', { amountUSD })
  .then(({ data }) => data)
)

export const getPaymentMethods = () => () => (
  rest.get('/api/data_credits/payment_methods')
  .then(({ data }) => data.data)
)

export const getSetupPaymentMethod = () => () => (
  rest.get('/api/data_credits/setup_payment_method')
  .then(({ data }) => data)
)

export const setDefaultPaymentMethod = (defaultPaymentId) => () => (
  rest.post('/api/data_credits/set_default_payment_method', { defaultPaymentId })
  .then(() => {})
)

export const removePaymentMethod = (paymentId) => () => (
  rest.post('/api/data_credits/remove_payment_method', { paymentId })
  .then(() => {})
)

export const createDCPurchase = (cost, cardType, last4, paymentId) => () => (
  rest.post('/api/data_credits/create_dc_purchase', { cost, cardType, last4, paymentId })
  .then(() => {})
)

export const setAutomaticPayments = (chargeAmount, paymentMethod, chargeOption) => () => (
  rest.post('/api/data_credits/set_automatic_payments', { paymentMethod, chargeAmount, chargeOption })
  .then(() => {})
)
