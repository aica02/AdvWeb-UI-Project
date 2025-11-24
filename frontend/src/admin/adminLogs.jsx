import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/admin.css';

const API = import.meta.env.VITE_API_URL;

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/logs/admin`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setLogs(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  if (loading) return <div className="loading">Loading logs...</div>;

  return (
    <section className="orders-overview">
      <h2>Activity Logs</h2>
      <p>  Recent administrative actions and time stamps.</p>

      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Meta</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td>
                  No logs found
                </td>
              </tr>
            ) : (
              logs.map((l) => {
              let actorName = "Admin"; // default

              if (l.actorName && l.actorName.trim() !== "") {
                actorName = l.actorName;
              } else if (l.actor && (l.actor.firstName || l.actor.lastName)) {
                actorName = `${l.actor.firstName || ""} ${l.actor.lastName || ""}`.trim();
              }

              return (
                <tr key={l._id}>
                  <td>{new Date(l.createdAt).toLocaleString()}</td>
                  <td>{actorName}</td>
                  <td>{l.action}</td>
                  <td className='MetaColumn'>
                    {l.meta ? JSON.stringify(l.meta) : ""}
                  </td>
                </tr>
              );
            })


            )}
          </tbody>

        </table>
      </div>
    </section>
  );
};

export default AdminLogs;
