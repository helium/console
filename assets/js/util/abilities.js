import { store } from '../store/configureStore';

const userCan = (action, itemType, item) => {
  const user = store.getState().user
  const { email, role } = user

  if (itemType === 'membership' && item && email === item.email) return false

  if (role === 'admin') return true
  if (role === 'developer' && itemType !== "auditTrails") return true
  if (role === 'analyst' && itemType !== "auditTrails") return true

  return false
}

export default userCan
