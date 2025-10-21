import fs from 'fs';
import path from 'path';

// --- File Paths ---
// IMPORTANT: In a production environment like Vercel, this local file storage is limited.
// For a live app, you must switch this to a real database (e.g., Supabase, MongoDB, PlanetScale).
const activitiesPath = path.join(process.cwd(), 'data', 'activities.json');
const membersPath = path.join(process.cwd(), 'data', 'members.json');
const logsPath = path.join(process.cwd(), 'data', 'logs.json');

// --- Helper Functions to Read/Write JSON ---
const readJsonFile = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
};
const writeJsonFile = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

// --- Main API Handler ---
export default function handler(req, res) {
  try {
    // Read current data
    const activities = readJsonFile(activitiesPath);
    const members = readJsonFile(membersPath);
    let logs = readJsonFile(logsPath);

    if (req.method === 'GET') {
      const { action, startDate, endDate } = req.query;

      if (action === 'settings') {
        return res.status(200).json({ activities, members });
      }

      if (action === 'leaderboard' && startDate && endDate) {
        // --- LEADERBOARD LOGIC ---
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Filter logs by date range (Weekly or Monthly)
        const filteredLogs = logs.filter(log => {
          const logDate = new Date(log.date);
          // Check date range inclusive
          return logDate >= start && logDate <= end;
        });

        const activityScores = activities.reduce((map, item) => {
          map[item.activity] = item.score;
          return map;
        }, {});
        
        // Initialize scores for all members
        const teamScores = members.reduce((acc, member) => {
          acc[member.name] = { ...member, score: 0 };
          return acc;
        }, {});

        // Calculate scores
        filteredLogs.forEach(log => {
          const score = activityScores[log.activity] || 0;
          if (teamScores[log.sam_name]) {
            teamScores[log.sam_name].score += score;
          }
        });

        const finalScores = Object.values(teamScores);

        // Separate and sort leaderboards
        const salesLeaderboard = finalScores
          .filter(m => m.role === 'Sales')
          .sort((a, b) => b.score - a.score);

        const amLeaderboard = finalScores
          .filter(m => m.role === 'Account Manager')
          .sort((a, b) => b.score - a.score);

        return res.status(200).json({ sales: salesLeaderboard, am: amLeaderboard });
      }

      return res.status(400).json({ message: 'Invalid GET action or missing parameters.' });
    } 
    
    if (req.method === 'POST') {
      const { action, payload } = req.body;

      if (action === 'logActivity') {
        // --- SAM/AM ACTIVITY LOGGING ---
        const member = members.find(m => m.name === payload.sam_name);
        if (!member) return res.status(400).json({ message: 'Invalid SAM Name' });

        const newLog = {
          id: Date.now(), 
          date: payload.date || new Date().toISOString().split('T')[0],
          sam_name: payload.sam_name,
          activity: payload.activity,
          client_type: payload.client_type,
          role: member.role 
        };
        logs.push(newLog);
        writeJsonFile(logsPath, logs); // WARNING: This is temporary for testing.
        return res.status(201).json({ message: 'Activity logged successfully.' });
      }

      if (action === 'updateScores') {
        // --- ADMIN UPDATE SCORES ---
        writeJsonFile(activitiesPath, payload.activities);
        return res.status(200).json({ message: 'Activity scores updated successfully.' });
      }

      if (action === 'updateMembers') {
        // --- ADMIN UPDATE TEAM MEMBERS ---
        writeJsonFile(membersPath, payload.members);
        return res.status(200).json({ message: 'Team members updated successfully.' });
      }
      
      return res.status(400).json({ message: 'Invalid POST action.' });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}