import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Avatar, Container, Card, CardContent } from '@mui/material';
import VideoGrid from '../components/VideoGrid';
import SubscribeButton from '../components/SubscribeButton';
import { apiVideos } from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Channel() {
  const { channelId } = useParams();
  const [channelVideos, setChannelVideos] = useState([]);
  const [channelInfo, setChannelInfo] = useState({ name: '', profilePic: '' });
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChannelData = async () => {
      if (!channelId) return;

      try {
        setIsLoading(true);
        const { data } = await apiVideos.getChannel(channelId);
        setChannelVideos(data.videos || []);
        setChannelInfo({
          name: data.channel.username || 'Unknown Channel',
          profilePic: data.channel.profilePic || ''
        });
        setSubscribersCount(data.channel.subscribersCount || 0);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Channel not found');
        } else {
          setError('Failed to load channel');
        }
        console.error('Channel load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannelData();
  }, [channelId]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Channel Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Avatar 
          sx={{ width: 80, height: 80, bgcolor: '#7C4DFF', fontSize: '2rem', fontWeight: 'bold' }}
        >
          {channelInfo.name.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="h4" sx={{ color: '#E0E0FF', fontWeight: 700 }}>
            {channelInfo.name}
          </Typography>
          <Typography variant="h6" sx={{ color: '#A0A0E0' }}>
            {subscribersCount.toLocaleString()} subscribers
          </Typography>
        </Box>
        <SubscribeButton channelId={channelId} />
      </Box>

      {/* Videos */}
      <Typography variant="h5" sx={{ mb: 3, color: '#E0E0FF' }}>
        Latest videos
      </Typography>
      {channelVideos.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', background: 'rgba(255,255,255,0.05)' }}>
          <Typography variant="h6" sx={{ color: '#A0A0E0' }}>
            No videos yet
          </Typography>
        </Card>
      ) : (
        <VideoGrid videos={channelVideos} />
      )}
    </Container>
  );
}

