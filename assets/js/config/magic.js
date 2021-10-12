export const config = {
  useMagicAuth: process.env.USE_MAGIC_AUTH || process.env.NODE_ENV === 'development',
}
