import React, { useState } from 'react';
import axios from 'axios';
import '../styles/AdminUtils.css';

const AdminUtils = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRefreshQuestionCache = async () => {
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_BASEAPI}/admin/problems/refresh-cache`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setMessage(response.data.message || 'Cache refreshed successfully');
    } catch (error) {
      console.error('Error refreshing cache:', error);
      setMessage('Failed to refresh cache');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-utils-container">
      <h2 className="admin-utils-title">Admin Utilities</h2>

      <button
        className="admin-utils-button"
        onClick={handleRefreshQuestionCache}
        disabled={loading}
      >
        {loading ? 'Refreshing Cache...' : 'Refresh Question Cache'}
      </button>

      {message && <p className="admin-utils-message">{message}</p>}
    </div>
  );
};

export default AdminUtils;
