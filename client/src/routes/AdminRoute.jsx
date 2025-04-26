import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

function AdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ Added loading

  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAdmin(false);
        setLoading(false);  // ✅ Finish loading
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_BASEAPI}/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Verification failed', err);
        setIsAdmin(false);
      } finally {
        setLoading(false); // ✅ Finish loading after verification
      }
    };

    verifyAdmin();
  }, []);

  if (loading) {
    return  <p>Loading...</p>;
  }

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
}

export default AdminRoute;
