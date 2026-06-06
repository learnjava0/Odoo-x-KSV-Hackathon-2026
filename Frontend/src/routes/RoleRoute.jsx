import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getDefaultRoute } from '../config/access.js';

export default function RoleRoute({ allowedRoles }) {
  const user = useSelector((state) => state.auth.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRoute(user?.role)} replace />;
  }

  return <Outlet />;
}
