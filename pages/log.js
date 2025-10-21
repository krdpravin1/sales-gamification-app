import React, { useState, useEffect } from 'react';

const LogActivity = () => {
  const [members, setMembers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    sam_name: '',
    activity: '',
    client_type: 'Must Win'
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/data?action=settings');
        const data = await res.json();
        setMembers(data.members);
        setActivities(data.activities);
      } catch (e) {
        setMessage('Error loading data for form.');
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Submitting...');

    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logActivity', payload: formData })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Activity successfully logged!');
        setFormData(prev => ({ ...prev, activity: '', client_type: 'Must Win' }));
      } else {
        setMessage(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Network Error. Could not log activity.');
    }
  };

  const selectedMember = members.find(m => m.name === formData.sam_name);
  const availableActivities = activities.filter(a => a.role === selectedMember?.role);

  return (
    <div style={{ maxWidth: '500px', margin: 'auto' }}>
      <h1>Entry Portal (SAM/AM)</h1>
      <p>Select your name, activity, and related client type to log your points.</p>
      
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
        <label>Date: <input type="date" name="date" value={formData.date} onChange={handleChange} required disabled style={{ width: '100%' }} /></label>
        
        <label>SAM/AM Name:
          <select name="sam_name" value={formData.sam_name} onChange={handleChange} required style={{ width: '100%', padding: '8px' }}>
            <option value="">-- Select Your Name --</option>
            {members.map(m => (<option key={m.id} value={m.name}>{m.name} ({m.role})</option>))}
          </select>
        </label>
        
        <label>Activity:
          <select name="activity" value={formData.activity} onChange={handleChange} required disabled={!formData.sam_name} style={{ width: '100%', padding: '8px' }}>
            <option value="">-- Select Activity (Filters by your Role) --</option>
            {availableActivities.map(a => (<option key={a.id} value={a.activity}>{a.activity} ({a.score} pts)</option>))}
          </select>
        </label>
        
        <label>Client/Prospect Type (if applicable):
          <select name="client_type" value={formData.client_type} onChange={handleChange} required style={{ width: '100%', padding: '8px' }}>
            <option value="Must Grow">Must Grow</option>
            <option value="Client">Client</option>
            <option value="Must Win">Must Win</option>
            <option value="Prospect High">Prospect High</option>
            <option value="Prospect Low">Prospect Low</option>
            <option value="N/A">N/A (e.g., Self Social Media)</option>
          </select>
        </label>

        <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}>Log Activity</button>
      </form>
      {message && <p style={{ marginTop: '15px' }}>{message}</p>}
    </div>
  );
};

export default LogActivity;