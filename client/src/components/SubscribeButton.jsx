import { Button, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiUsers } from '../api/axios';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function SubscribeButton({ channelId }) {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      if (!user || !channelId) return;
      try {
        setLoading(true);
        const { data } = await apiUsers.checkSubscription(channelId);
        setIsSubscribed(data.subscribed);
      } catch (err) {
        console.error('Subscription check failed:', err);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, [channelId, user?.id]);

  const handleClick = async () => {
    if (!user || loading) return;
    try {
      setLoading(true);
      const newState = !isSubscribed;
      if (newState) {
        await apiUsers.subscribeToChannel(channelId);
      } else {
        await apiUsers.unsubscribeFromChannel(channelId);
      }
      setIsSubscribed(newState);
    } catch (err) {
      console.error('Subscription toggle failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isSubscribed ? 'outlined' : 'contained'}
      onClick={handleClick}
      disabled={loading}
      startIcon={isSubscribed ? <NotificationsActiveIcon /> : <NotificationsIcon />}
      sx={{
        mb: 2,
        background: loading ? 'rgba(124, 77, 255, 0.3)' : isSubscribed
          ? 'transparent'
          : `linear-gradient(135deg, #FF00FF 0%, #7C4DFF 100%)`,
        color: isSubscribed ? '#e9e9e9' : '#0A0E27',
        borderColor: '#FF00FF',
        border: '1px solid #FF00FF',
        fontWeight: 500,
        fontSize: '1rem',
        px: 3,
        py: 1,
        textTransform: 'capitalize',
        letterSpacing: 1,
        boxShadow: isSubscribed
          ? '0 0 15px rgba(255, 0, 255, 0.3)'
          : '0 0 20px rgba(255, 0, 255, 0.5)',
        '&:hover': !loading && {
          background: isSubscribed
            ? 'rgba(255, 0, 255, 0.1)'
            : `linear-gradient(135deg, #7C4DFF 0%, #FF00FF 100%)`,
          boxShadow: '0 0 25px rgba(255, 0, 255, 0.8)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      {isSubscribed ? 'Subscribed' : 'Subscribe'}
    </Button>
  );
}
 
 

