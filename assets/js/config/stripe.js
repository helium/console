const stripe = Stripe(process.env.AUTH_0_DOMAIN || 'pk_test_tpiYaEpZAZ8EGaqTZTujgQKG00e64rEo1V')

export default stripe
