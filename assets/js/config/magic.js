export const config = {
  useMagicAuth: window.use_magic_auth || process.env.USE_MAGIC_AUTH || process.env.NODE_ENV === 'development',
}
