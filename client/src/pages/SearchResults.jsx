import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import VideoGrid from '../components/VideoGrid';
import { apiVideos } from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResults() {
  const query = useQuery();
  const q = query.get('q') || '';
  const category = query.get('category') || '';

  const [searchVideos, setSearchVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSearch = async () => {
      if (!q.trim()) {
        setSearchVideos([]);
        return;
      }
      setLoading(true);
      try {
        const res = await apiVideos.search(q);
        let results = res.data || [];
        // Apply category filter if present
        if (category && category !== 'All') {
          results = results.filter(video => video.channel.toLowerCase().includes(category.toLowerCase()));
        }
        setSearchVideos(results);
      } catch (err) {
        console.error('Search error:', err);
        setSearchVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearch();
  }, [q, category]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, color: '#00D9FF' }}>
        {loading ? 'Searching...' : `${searchVideos.length} result${searchVideos.length !== 1 ? 's' : ''} for "${q}`}
      </Typography>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <VideoGrid videos={searchVideos} />
      )}
    </Box>
  );
}
 
