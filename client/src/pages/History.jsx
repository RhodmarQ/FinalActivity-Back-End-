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
          const { data } = await apiUsers.getHistory(user.id);
          setHistory(data.map(entry => ({ ...entry.videoId, watchedAt: entry.watchedAt })));
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

  const refetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiUsers.getHistory(user.id);
      setHistory(data.map(entry => ({ ...entry.videoId, watchedAt: entry.watchedAt })));
    } catch (err) {
      console.error('History refetch error', err);
    }
    setLoading(false);
  }, [user]);

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
 

 
