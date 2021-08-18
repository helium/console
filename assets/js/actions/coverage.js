import * as rest from '../util/rest';

export const updateOrganizationHotspot = (hotspot_address, claimed) => {
  return rest.post(`/api/organization_hotspots`, {
    hotspot_address,
    claimed
  })
  .then(res => res.status)
}
