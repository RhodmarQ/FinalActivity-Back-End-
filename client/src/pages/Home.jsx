import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import { apiVideos } from '../api/axios';
import VideoGrid from '../components/VideoGrid';
import CategoryChips from '../components/CategoryChips';
import LoadingSpinner from '../components/LoadingSpinner';

function Home() {
  const theme = useTheme();
  const [videos, setVideos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const backendRes = await apiVideos.getAll();
        setVideos(backendRes.data || []);
      } catch (err) {
        console.error('Home fetch error:', err);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const filteredVideos = selectedCategory === 'All' 
    ? videos 
    : videos.filter(video => (video.categories || []).includes(selectedCategory));



  return (
    <Box sx={{ width: '100%', color: '#E0E0FF' }}>
      <Box
        sx={{
          mb: 4,
          background: `linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(124, 77, 255, 0.1) 100%)`,
          p: 3,
          borderRadius: 2,
          border: '2px solid rgba(0, 217, 255, 0.3)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'visible',
          animation: 'border-light 4s linear infinite',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.4), transparent)',
            animation: 'light-sweep 3s infinite',
            zIndex: 1,
            pointerEvents: 'none',
          },
          '&:after': {
            content: '""',
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            borderRadius: 2,
            background: `linear-gradient(45deg, rgba(255, 0, 255, 0.8), rgba(0, 217, 255, 0.8), rgba(124, 77, 255, 0.8), rgba(255, 0, 255, 0.8))`,
            backgroundSize: '300% 300%',
            animation: 'border-rotate 4s linear infinite',
            zIndex: -1,
            opacity: 0.8,
          },
        }}
      >
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            fontWeight: 800,
            color: '#00D9FF',
            letterSpacing: 1,
            mb: 2,
            position: 'relative',
            zIndex: 1,
          }}
        >
          🎮 Welcome to CloneTube
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#E0E0FF',
            fontSize: '1.1rem',
            letterSpacing: 0.5,
            position: 'relative',
            zIndex: 1,
          }}
        >
          Discover amazing gaming, music, and tech content. Stream, like, comment, and subscribe!
        </Typography>
      </Box>

      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography
          variant="h5"
          sx={{
            mb: 2,
            fontWeight: 700,
            color: '#00D9FF',
            textTransform: 'uppercase',
            letterSpacing: 1,
            position: 'relative',
            display: 'inline-block',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: 0,
              width: '100%',
              height: '3px',
              background: `linear-gradient(90deg, #00D9FF 0%, #7C4DFF 50%, #FF00FF 100%)`,
              borderRadius: 2,
            },
          }}
        >
          Filter by Category
        </Typography>
      </Box>

      <CategoryChips selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />

      <Box sx={{ mt: 4, width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#00D9FF',
              textTransform: 'uppercase',
              letterSpacing: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '&:before': {
                content: '""',
                display: 'inline-block',
                width: '4px',
                height: '24px',
                background: `linear-gradient(180deg, #00D9FF 0%, #7C4DFF 100%)`,
                borderRadius: 2,
              },
            }}
          >
            Trending Now
          </Typography>
        </Box>
        <VideoGrid videos={filteredVideos} />
      </Box>
    </Box>
  );
}

export default Home; 


