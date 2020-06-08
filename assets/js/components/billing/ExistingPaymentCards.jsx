import React from 'react'
import { Divider, Radio, Typography } from 'antd';
const { Text } = Typography
import PaymentCard from './PaymentCard'

const ExistingPaymentCards = ({ paymentMethods, onRadioChange, paymentMethodSelected }) => (
  <div style={{ marginBottom: 24 }}>
    <Text strong>
      Choose from Stored Cards
    </Text>
    <Divider style={{ margin: '8px 0px 16px 0px' }}/>
    {
      paymentMethods.length === 0 && (
        <Text>
          None available, create one below...
        </Text>
      )
    }
    {
      paymentMethods.length > 0 && (
        <div style={{ maxHeight: 150, overflowY: 'scroll' }}>
          <Radio.Group onChange={onRadioChange} value={paymentMethodSelected}>
            {
              paymentMethods.map(p => (
                <div key={p.id} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <Radio value={p.id} />
                  <PaymentCard key={p.id} card={p.card} style={{ margin: 12, marginLeft: 8 }}/>
                </div>
              ))
            }
          </Radio.Group>
        </div>
      )
    }
  </div>
)

export default ExistingPaymentCards
