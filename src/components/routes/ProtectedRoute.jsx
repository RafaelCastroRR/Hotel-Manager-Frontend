import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../shared/stores/authStore';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();
  return isAuthenticated ? children : <Navigate to="/login" state={{ from: location }} replace />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default ProtectedRoute;
