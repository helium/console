import * as rest from '../util/rest';

export const createCustomerIdAndCharge = (amountUSD) => (dispatch) => (
  rest.post('/api/data_credits/create_customer_and_charge', { amountUSD })
  .then(({ data }) => data)
)

export const getPaymentMethods = () => (dispatch) => (
  rest.get('/api/data_credits/payment_methods')
  .then(({ data }) => data.data)
)
