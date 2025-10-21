import React, { useState, useEffect } from 'react';

const AdminSettings = () => {
  const [activities, setActivities] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('scores');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/data?action=settings');
        const data = await res.json();
        setActivities(data.activities);
        setMembers(data.members);
      } catch (e) {
        setMessage('Error loading settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // --- SCORE MANAGEMENT ---
  const handleScoreChange = (id, newScore) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, score: parseInt(newScore) || 0 } : a));
  };

  const saveScores = async () => {
    setMessage('Saving scores...');
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateScores', payload: { activities } })
      });
      const data = await res.json();
      setMessage(res.ok ? '✅ Scores updated!' : `❌ Error: ${data.message}`);
    } catch (error) {
      setMessage('❌ Network error while saving scores.');
    }
  };

  // --- MEMBER MANAGEMENT ---
  const handleMemberChange = (id, field, value) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const addMember = () => {
    setMembers(prev => [
      ...prev,
      { id: Date.now(), name: 'New SAM', bu: '', region: '', role: 'Sales' }
    ]);
  };

  const removeMember = (id) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const saveMembers = async () => {
    setMessage('Saving members...');
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateMembers', payload: { members } })
      });
      const data = await res.json();
      setMessage(res.ok ? '✅ Members list updated!' : `❌ Error: ${data.message}`);
    } catch (error) {
      setMessage('❌ Network error while saving members.');
    }
  };


  if (loading) return <p>Loading Admin Settings...</p>;

  return (
    <div>
      <h1>⚙️ Admin Control Panel</h1>
      <p style={{ color: 'red', fontWeight: 'bold' }}>⚠️ **Warning:** Changes here affect all calculations. This is a high-privilege page.</p>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('scores')} style={{ padding: '10px', marginRight: '10px', backgroundColor: activeTab === 'scores' ? '#ddd' : 'white' }}>Update Activity Scores</button>
        <button onClick={() => setActiveTab('members')} style={{ padding: '10px', backgroundColor: activeTab === 'members' ? '#ddd' : 'white' }}>Manage SAM/AM Team</button>
      </div>

      {message && <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{message}</p>}

      {/* --- Activity Scores Tab --- */}
      {activeTab === 'scores' && (
        <>
          <h2>Dynamic Scoring (Change Rewards Anytime)</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#ccc' }}>
                <th>Activity</th>
                <th>Role</th>
                <th>New Score</th>
              </tr>
            </thead>
            <tbody>
              {activities.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td>{a.activity}</td>
                  <td>{a.role}</td>
                  <td>
                    <input
                      type="number"
                      value={a.score}
                      onChange={(e) => handleScoreChange(a.id, e.target.value)}
                      style={{ width: '80px', padding: '5px' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={saveScores} style={{ padding: '10px', marginTop: '20px', backgroundColor: '#3498db', color: 'white', border: 'none', cursor: 'pointer' }}>Save All Scores</button>
        </>
      )}

      {/* --- Member Management Tab --- */}
      {activeTab === 'members' && (
        <>
          <h2>Manage Team Members</h2>
          <button onClick={addMember} style={{ padding: '10px', marginBottom: '10px', backgroundColor: '#2ecc71', color: 'white', border: 'none', cursor: 'pointer' }}>+ Add New Member</button>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#ccc' }}>
                <th>Name</th>
                <th>Role</th>
                <th>Region</th>
                <th>BU</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td><input type="text" value={m.name} onChange={(e) => handleMemberChange(m.id, 'name', e.target.value)} style={{ padding: '5px' }} /></td>
                  <td>
                    <select value={m.role} onChange={(e) => handleMemberChange(m.id, 'role', e.target.value)} style={{ padding: '5px' }}>
                      <option value="Sales">Sales</option>
                      <option value="Account Manager">Account Manager</option>
                    </select>
                  </td>
                  <td><input type="text" value={m.region} onChange={(e) => handleMemberChange(m.id, 'region', e.target.value)} style={{ padding: '5px' }} /></td>
                  <td><input type="text" value={m.bu} onChange={(e) => handleMemberChange(m.id, 'bu', e.target.value)} style={{ padding: '5px' }} /></td>
                  <td><button onClick={() => removeMember(m.id)} style={{ padding: '5px', backgroundColor: '#e74c3c', color: 'white', border: 'none' }}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={saveMembers} style={{ padding: '10px', marginTop: '20px', backgroundColor: '#3498db', color: 'white', border: 'none', cursor: 'pointer' }}>Save All Members</button>
        </>
      )}
    </div>
  );
};

export default AdminSettings;