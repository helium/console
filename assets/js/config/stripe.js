const stripe = Stripe(process.env.STRIPE_PUBLIC_KEY || 'pk_test_tpiYaEpZAZ8EGaqTZTujgQKG00e64rEo1V')

export default stripe
