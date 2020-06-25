import React from 'react'
import { Divider, Radio, Typography, Button } from 'antd';
const { Text } = Typography
import PaymentCard from './PaymentCard'

const ExistingPaymentCards = ({ paymentMethods, onRadioChange, paymentMethodSelected, showDelete, removePaymentMethod }) => (
  <div style={{ marginBottom: 24 }}>
    <Text strong>
      Choose from Stored Cards
    </Text>
    <Divider style={{ margin: '8px 0px 16px 0px' }}/>
    
    <div style={{ maxHeight: 150, overflowY: 'scroll' }}>
      <Radio.Group onChange={onRadioChange} value={paymentMethodSelected} style={{ width: '100%' }}>
        {
          paymentMethods.map(p => (
            <div key={p.id} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <Radio value={p.id} />
              <PaymentCard key={p.id} card={p.card} style={{ margin: 12, marginLeft: 8 }}/>
              {
                showDelete && (
                  <React.Fragment>
                    <div style={{ flex: 'grow' }}/>
                    <Button
                      type="danger"
                      icon="delete"
                      shape="circle"
                      onClick={() => removePaymentMethod(p.id)}
                    />
                  </React.Fragment>
                )
              }
            </div>
          ))
        }
      </Radio.Group>
    </div>
  </div>
)

export default ExistingPaymentCards
