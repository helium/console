import * as rest from '../util/rest';

export const createCustomerIdAndCharge = (amountUSD) => (dispatch) => (
  rest.post('/api/data_credits/create_customer', { amountUSD })
  .then(({ data }) => data)
)
