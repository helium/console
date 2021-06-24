import React from 'react'
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
  <div key={id} style={{ ...style, width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', height: 40 }}>
    <img src={cards[card.brand]} style={{ marginRight: 10, height: 24, width: 32 }}/>
    <p style={{ fontFamily: 'monospace', color: '#777777', display: 'inline', top: 6, position: 'relative' }}>••••/{card.last4}</p>
  </div>
)

export default PaymentCard
