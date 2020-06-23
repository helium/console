import React from 'react'
import { Typography } from 'antd';
const { Text } = Typography
import Visa from '../../../img/payment-visa-icon.svg'
import Mastercard from '../../../img/payment-mastercard-icon.svg'
import Amex from '../../../img/payment-amex-icon.svg'
import Discover from '../../../img/payment-discover-icon.svg'
import Diners from '../../../img/payment-dinersclub-icon.svg'

const cards = {
  "visa": Visa,
  "mastercard": Mastercard,
  "amex": Amex,
  "discover": Discover,
  "diners": Diners,
}

const PaymentCard = ({ id, card, style }) => (
  <div key={id} style={{ ...style, width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'space-between' }}>
    <div>
      <img src={cards[card.brand]} style={{ marginRight: 10, height: 24, width: 32 }}/>
      <Text style={{ fontFamily: 'monospace', color: '#777777' }}>••••/{card.last4}</Text>
    </div>
  </div>
)

export default PaymentCard
