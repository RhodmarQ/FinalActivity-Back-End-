import { Button } from '@mui/material';
import { useState } from 'react';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function SubscribeButton({ channelId, onSubscribe }) {
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleClick = () => {
    setIsSubscribed(!isSubscribed);
    if (onSubscribe) {
      onSubscribe(channelId, !isSubscribed);
    }
  };

  return (
    <Button
      variant={isSubscribed ? 'outlined' : 'contained'}
      onClick={handleClick}
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
      {isSubscribed ? 'Subscribed' : 'Subscribe'}
    </Button>
  );
}
 
 

