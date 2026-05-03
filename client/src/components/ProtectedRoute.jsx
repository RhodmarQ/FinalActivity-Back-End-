import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const auth = useContext(AuthContext);
  const { user, loading } = auth;
  if (loading) {
    return <div>Loading...</div>; // Or spinner
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
 
