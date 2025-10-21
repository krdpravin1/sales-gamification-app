import React, { useState, useEffect } from 'react';

const Leaderboard = () => {
  const [sales, setSales] = useState([]);
  const [am, setAm] = useState([]);
  const [filterType, setFilterType] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateDates = (type) => {
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    let startDate;

    if (type === 'weekly') {
      const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Start of week (Monday)
      startDate = new Date(today.setDate(diff)).toISOString().split('T')[0];
    } else { // monthly
      startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    }
    return { startDate, endDate };
  };

  const fetchData = async (type) => {
    setLoading(true);
    setError(null);
    const { startDate, endDate } = calculateDates(type);

    try {
      const res = await fetch(`/api/data?action=leaderboard&startDate=${startDate}&endDate=${endDate}`);
      if (!res.ok) throw new Error('Failed to fetch leaderboard data.');
      const data = await res.json();
      setSales(data.sales);
      setAm(data.am);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(filterType);
  }, [filterType]);

  const LeaderboardTable = ({ title, data }) => (
    <div style={{ margin: '20px 0' }}>
      <h3>{title}</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#ccc' }}>
            <th>Rank</th>
            <th>Name</th>
            <th>Region</th>
            <th>BU</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {data.map((member, index) => (
            <tr key={member.name} style={{ borderBottom: '1px solid #eee' }}>
              <td>{index + 1}</td>
              <td>{member.name}</td>
              <td>{member.region}</td>
              <td>{member.bu}</td>
              <td>{member.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (loading) return <p>Loading Leaderboard...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div>
      <h1>🏆 Sales Gamification Leaderboard</h1>
      <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '8px' }}>
        <option value="weekly">Weekly Leaderboard</option>
        <option value="monthly">Monthly Award (Cumulative)</option>
      </select>
      
      <p>Scores are calculated for the **{filterType}** period.</p>
      
      <LeaderboardTable title="Sales Team Leaderboard" data={sales} />
      <LeaderboardTable title="Account Management Team Leaderboard" data={am} />
    </div>
  );
};

export default Leaderboard;