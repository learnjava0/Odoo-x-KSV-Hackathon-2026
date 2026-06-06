export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  PROCUREMENT: 'PROCUREMENT_OFFICER',
  VENDOR: 'VENDOR'
};

export const routeAccess = {
  dashboard: [ROLES.ADMIN, ROLES.MANAGER],
  vendors: [ROLES.ADMIN, ROLES.PROCUREMENT],
  rfqs: [ROLES.ADMIN, ROLES.MANAGER, ROLES.PROCUREMENT, ROLES.VENDOR],
  quotations: [ROLES.MANAGER, ROLES.PROCUREMENT],
  approvals: [ROLES.MANAGER],
  documents: [ROLES.ADMIN, ROLES.MANAGER, ROLES.PROCUREMENT],
  reports: [ROLES.ADMIN, ROLES.MANAGER],
  activities: [ROLES.ADMIN, ROLES.MANAGER, ROLES.PROCUREMENT],
  admin: [ROLES.ADMIN]
};

export const getDefaultRoute = (role) => {
  if (routeAccess.dashboard.includes(role)) return '/';
  if (routeAccess.vendors.includes(role)) return '/vendors';
  return '/rfqs';
};
