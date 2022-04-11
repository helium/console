let stripe = {
  elements: () => {},
  confirmCardSetup: () => {},
  confirmCardPayment: () => {},
}

if (!process.env.SELF_HOSTED || window.stripe_public_key) {
  stripe = Stripe(process.env.STRIPE_PUBLIC_KEY || window.stripe_public_key || 'pk_test_tpiYaEpZAZ8EGaqTZTujgQKG00e64rEo1V')
}

export default stripe
