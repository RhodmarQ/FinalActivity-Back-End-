import { useEffect, useState, useContext } from 'react';
import { Box, Typography, Card, CardContent, Avatar } from '@mui/material';
import SubscribeButton from '../components/SubscribeButton';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { apiUsers } from '../api/axios';

export default function Subscriptions() {
  const auth = useContext(AuthContext);
  const { user } = auth;
  console.log('Subscriptions DEBUG - auth.user:', auth.user);
  console.log('Subscriptions DEBUG - user:', user);
  console.log('Subscriptions DEBUG - user._id:', user?._id, 'user.id:', user?.id);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSubscriptions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userId = user._id || user.id;
        console.log('Subscriptions DEBUG - calling getSubscriptions with userId:', userId, 'type:', typeof userId);
        const response = await apiUsers.getSubscriptions(userId);
        console.log('Subscriptions DEBUG - API response:', response.data);
        setSubscriptions(response.data);
      } catch (err) {
        console.error('Error loading subscriptions:', err);
        console.error('Error response:', err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptions();
  }, [user]);

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h5" sx={{ color: '#E0E0FF', mb: 2 }}>
          Please login to view your subscriptions
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h5" sx={{ color: '#E0E0FF' }}>
          Loading subscriptions...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          color: '#E0E0FF',
          fontWeight: 600,
          textAlign: 'center'
        }}
      >
        Your Subscriptions
      </Typography>

      {subscriptions.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" sx={{ color: '#A0A0E0', mb: 2 }}>
            No subscriptions yet
          </Typography>
          <Typography variant="body1" sx={{ color: '#808080' }}>
            Subscribe to channels to see their latest videos here
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {subscriptions.map((subscription) => (
            <Card
              key={subscription.channelId}
              sx={{
                background: `linear-gradient(135deg, #1A1F3A 0%, #2D1B69 100%)`,
                border: '1px solid #7C4DFF',
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 0 20px rgba(255, 0, 255, 0.3)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
              onClick={() => navigate(`/channel/${subscription.channelId}`)}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    backgroundColor: '#7C4DFF',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  {subscription.username?.charAt(0).toUpperCase() || '?'}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#E0E0FF',
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  >
                    {subscription.username || 'Unknown Channel'}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#A0A0E0',
                      mb: 1,
                    }}
                  >
                    {subscription.email || ''}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#808080',
                    }}
                  >
                    Subscribed {new Date(subscription.subscribedAt).toLocaleDateString()}
                  </Typography>
                </Box>

                <Box sx={{display: 'flex', alignItems: 'center'}} onClick={(e) => e.stopPropagation()}>
                  <SubscribeButton channelId={subscription.channelId} />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
