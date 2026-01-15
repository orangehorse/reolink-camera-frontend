import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

function Dashboard({ onLogout }) {
  const [cameraStatus, setCameraStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ptzLoading, setPtzLoading] = useState(false);
  const [presets, setPresets] = useState([]);

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchCameraStatus();
    fetchPresets();
  }, []);

  const fetchCameraStatus = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${apiUrl}/api/camera/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCameraStatus(response.data);
    } catch (err) {
      setError('Failed to fetch camera status');
      console.error('Status error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPresets = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/camera/presets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPresets(response.data.presets || []);
    } catch (err) {
      console.error('Presets error:', err);
    }
  };

  const handlePTZ = async (direction, value) => {
    setPtzLoading(true);
    try {
      setError('');
      const payload = {
        camera_uid: process.env.REACT_APP_CAMERA_UID || ''
      };
      payload[direction] = value;

      await axios.post(`${apiUrl}/api/camera/ptz`, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setTimeout(fetchCameraStatus, 500);
    } catch (err) {
      setError('Failed to control camera');
      console.error('PTZ error:', err);
    } finally {
      setPtzLoading(false);
    }
  };

  const handlePreset = async (presetId) => {
    setPtzLoading(true);
    try {
      setError('');
      await axios.post(`${apiUrl}/api/camera/preset`, {
        camera_uid: process.env.REACT_APP_CAMERA_UID || '',
        preset_id: presetId
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setTimeout(fetchCameraStatus, 500);
    } catch (err) {
      setError('Failed to recall preset');
      console.error('Preset error:', err);
    } finally {
      setPtzLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard">
        <div className="header">
          <h1>🎥 Camera Control Dashboard</h1>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading camera status...</div>
        ) : (
          <div className="content">
            <div className="status-section">
              <h2>Camera Status</h2>
              {cameraStatus ? (
                <div className="status-info">
                  <p><strong>Status:</strong> {cameraStatus.status || 'Online'}</p>
                  <p><strong>Pan:</strong> {cameraStatus.pan || 'N/A'}°</p>
                  <p><strong>Tilt:</strong> {cameraStatus.tilt || 'N/A'}°</p>
                  <p><strong>Zoom:</strong> {cameraStatus.zoom || 'N/A'}x</p>
                  <button onClick={fetchCameraStatus} className="refresh-btn">
                    Refresh Status
                  </button>
                </div>
              ) : (
                <p>No camera status available</p>
              )}
            </div>

            <div className="control-section">
              <h2>Pan & Tilt Control</h2>
              <div className="ptz-controls">
                <div className="direction-pad">
                  <button
                    onClick={() => handlePTZ('tilt', 1)}
                    disabled={ptzLoading}
                    className="btn-up"
                  >
                    ▲
                  </button>
                  <div className="middle-row">
                    <button
                      onClick={() => handlePTZ('pan', -1)}
                      disabled={ptzLoading}
                      className="btn-left"
                    >
                      ◄
                    </button>
                    <button
                      onClick={() => handlePTZ('pan', 0)}
                      disabled={ptzLoading}
                      className="btn-center"
                    >
                      ◉
                    </button>
                    <button
                      onClick={() => handlePTZ('pan', 1)}
                      disabled={ptzLoading}
                      className="btn-right"
                    >
                      ►
                    </button>
                  </div>
                  <button
                    onClick={() => handlePTZ('tilt', -1)}
                    disabled={ptzLoading}
                    className="btn-down"
                  >
                    ▼
                  </button>
                </div>
              </div>

              <div className="zoom-controls">
                <h3>Zoom Control</h3>
                <div className="zoom-buttons">
                  <button
                    onClick={() => handlePTZ('zoom', -1)}
                    disabled={ptzLoading}
                    className="zoom-btn"
                  >
                    Zoom Out
                  </button>
                  <button
                    onClick={() => handlePTZ('zoom', 1)}
                    disabled={ptzLoading}
                    className="zoom-btn"
                  >
                    Zoom In
                  </button>
                </div>
              </div>
            </div>

            {presets.length > 0 && (
              <div className="presets-section">
                <h2>Camera Presets</h2>
                <div className="presets-grid">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handlePreset(preset.id)}
                      disabled={ptzLoading}
                      className="preset-btn"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
