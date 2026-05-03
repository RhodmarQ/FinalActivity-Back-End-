import { useState, useEffect, useCallback } from 'react';
import useAuth from '../context/useAuth';
import { apiUsers } from '../api/axios';
import VideoGrid from '../components/VideoGrid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

export default function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (user) {
        try {
          const userId = user._id || user.id;
          const { data } = await apiUsers.getHistory(userId);
          setHistory(data.map(entry => ({ 
            ...entry.videoId._doc || entry.videoId, 
            id: entry.videoId._id || entry.videoId.id,
            watchedAt: entry.watchedAt 
          })));
        } catch (err) {
          console.error('History fetch error', err);
        }
      }
      setLoading(false);
    };
    fetchHistory();
  }, [user]);

  if (loading) return <Typography>Loading history...</Typography>;
  if (!user || history.length === 0) return <Typography>No watch history yet.</Typography>;

  const refetchHistory = async () => {
    setLoading(true);
    try {
      const userId = user._id || user.id;
      const { data } = await apiUsers.getHistory(userId);
      setHistory(data.map(entry => ({ 
        ...(entry.videoId._doc || entry.videoId), 
        id: entry.videoId._id || entry.videoId.id || entry.videoId,
        watchedAt: entry.watchedAt 
      })));
    } catch (err) {
      console.error('History refetch error', err);
    }
    setLoading(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#00D9FF' }}>
          Watch History
        </Typography>
        <Button variant="outlined" onClick={refetchHistory} disabled={loading}>
          Refresh
        </Button>
      </Box>
      <VideoGrid videos={history} />
    </Box>
  );
}
 

 
