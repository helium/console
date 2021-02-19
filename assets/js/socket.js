import { Socket } from "phoenix"

const createSocket = (token, currentOrganizationId) => {
  return new Socket("/socket", { params: { token: token, organization_id: currentOrganizationId }})
}

export default createSocket
