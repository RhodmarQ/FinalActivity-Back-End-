import { Button } from '@mui/material';
import { useState, useEffect } from 'react';
import useAuth from '../context/useAuth';
import { apiUsers } from '../api/axios';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function SubscribeButton({ channelId, onSubscribe }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();

  useEffect(() => {
    const checkSubscription = async () => {
      if (!channelId || !auth.user) {
        setIsSubscribed(false);
        return;
      }
      try {
        const response = await apiUsers.checkSubscription(channelId);
        setIsSubscribed(response.data.subscribed);
      } catch (err) {
        console.error('Error checking subscription:', err);
        setIsSubscribed(false);
      }
    };
    checkSubscription();
  }, [channelId, auth.user]);

  const handleClick = async () => {
    if (!auth.user || isLoading) return;
    
    setIsLoading(true);
    try {
      if (isSubscribed) {
        await apiUsers.unsubscribeFromChannel(channelId);
      } else {
        await apiUsers.subscribeToChannel(channelId);
      }
      setIsSubscribed(!isSubscribed);
      if (onSubscribe) {
        onSubscribe(channelId, !isSubscribed);
      }
    } catch (err) {
      console.error('Subscription error:', err);
      alert('Subscription failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isSubscribed ? 'outlined' : 'contained'}
      onClick={handleClick}
      disabled={isLoading}
      startIcon={isSubscribed ? <NotificationsActiveIcon /> : <NotificationsIcon />}
      sx={{
        mb: 2,
        background: isSubscribed
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
        '&:hover': {
          background: isSubscribed
            ? 'rgba(255, 0, 255, 0.1)'
            : `linear-gradient(135deg, #7C4DFF 0%, #FF00FF 100%)`,
          boxShadow: '0 0 25px rgba(255, 0, 255, 0.8)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      {isLoading ? '...' : (isSubscribed ? 'Subscribed' : 'Subscribe')}
    </Button>
  );
}
 
 

