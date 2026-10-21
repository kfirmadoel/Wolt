import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
    const location = useLocation();
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div role="status" className="route-loading">Checking your session...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

export default ProtectedRoute;