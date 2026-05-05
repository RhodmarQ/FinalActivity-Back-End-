import { Card, CardMedia, CardContent, Typography, Box } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import useAuth from '../context/useAuth';
import { apiVideos, apiUsers } from '../api/axios';

export default function VideoCard({ video, fullWidth = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();

  const handleClick = async () => {
    try {
      await apiVideos.incrementView(video.id);
      if (user) {
        await apiUsers.addToHistory(user.id, video.id);
      }
    } catch (err) {
      console.error('View increment or history add failed', err);
    }
    navigate(`/watch/${video.id}`);
  };

  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <Card
      onClick={handleClick}
      sx={{
        cursor: 'pointer',
        height: fullWidth ? 'auto' : '100%',
        flex: fullWidth ? '0 1 auto' : '1 1 auto',
        width: fullWidth ? '100%' : '15vw',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, rgba(124, 77, 255, 0.1) 100%)`,
        border: `1px solid rgba(124, 77, 255, 0.3)`,
        '&:hover': {
          boxShadow: `0 0 13px rgba(255, 0, 255, 0.6), 0 0 50px rgba(124, 77, 255, 0.3), inset 0 0 20px rgba(124, 77, 255, 0.1)`,
          borderColor: '#FF00FF',
        },
      }}
    >
      <Box
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'rgba(124, 77, 255, 0.1)',
          height: fullWidth ? 240 : 500,
        }}
      >
        <CardMedia
          component="img"
          image={video.thumbnail || 'https://picsum.photos/1280/720?random=1?blur'}
          alt={video.title}
          onError={(e) => {
            e.target.src = 'https://picsum.photos/1280/720?random=1?blur';
          }}
          sx={{
            height: '100%',
            width: '100%',
            objectFit: 'cover',
            transition: 'all 0.3s ease',
            transform: isHovered ? 'scale(1.02)' : 'scale(1)',
            filter: isHovered ? 'brightness(1.05)' : 'brightness(1)',
          }}
        />

        {/* YouTube Preview - plays on hover - NO OVERLAY */}
        {isHovered && video.youtubeUrl && (
          <iframe
            src={`https://www.youtube.com/embed/${getYouTubeId(video.youtubeUrl)}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1&fs=0&branding=0&ab=0&cc_load_policy=0`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
              pointerEvents: 'none',
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen={false}
            title={`Preview - ${video.title}`}
          />
        )}

        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255, 0, 255, 0.9)',
            color: '#ffffff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            boxShadow: '0 0 10px rgba(255, 0, 255, 0.8)',
          }}
        >
          Trending
        </Box>
      </Box>
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 0,
        }}
      >
        <div>
          <Typography
            variant="subtitle1"
            noWrap
            sx={{
              fontWeight: 600,
              color: '#E0E0FF',
              '&:hover': {
                color: '#FF00FF',
              },
            }}
          >
            {video.title}
          </Typography>
          <Typography
            variant="body2"
            noWrap
            sx={{
              color: '#A0A0E0',
              mt: 0.5,
            }}
          >
            {video.channel}
          </Typography>
        </div>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mt: 1,
            fontSize: '0.75rem',
            color: '#A0A0E0',
          }}
        >
          <span>{video.views}</span>
          <span>{video.timestamp}</span>
        </Box>
      </CardContent>
    </Card>
  );
}

