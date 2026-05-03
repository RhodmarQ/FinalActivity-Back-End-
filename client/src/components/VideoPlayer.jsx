import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { extractYouTubeId, getYouTubeEmbedUrl, isYouTubeUrl } from '../utils/youtube';
import SubscribeButton from './SubscribeButton';
import { useAuth } from '../context/AuthContext';

export default function VideoPlayer({ youtubeUrl, title, thumbnail, channel, channelId, onPlay }) {
  const theme = useTheme();
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Check if current user is the video uploader
  const isOwner = user && channelId && String(channelId) === String(user.id);

  const videoId = extractYouTubeId(youtubeUrl);
  const embedUrl = videoId ? getYouTubeEmbedUrl(videoId) : null;

  const handlePlay = () => {
    if (embedUrl) {
      setIsPlaying(true);
      onPlay?.();
    } else {
      // Fallback to opening in new tab if not a valid YouTube URL
      window.open(youtubeUrl, '_blank');
      onPlay?.();
    }
  };

  const handleClosePlayer = () => {
    setIsPlaying(false);
  };

  if (isPlaying && embedUrl) {
    return (
      <Box>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            paddingBottom: '56.25%',
            height: 0,
            overflow: 'hidden',
            borderRadius: 2,
            border: '1px solid #7C4DFF',
            boxShadow: '0 0 13px rgba(255, 0, 255, 0.4), inset 0 0 20px rgba(124, 77, 255, 0.1)',
            mb: 2,
            backgroundColor: '#0A0E27',
          }}
        >
          <iframe
            src={`${embedUrl}?autoplay=1&rel=0`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              borderRadius: '8px',
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography
              variant="h5"
              sx={{
                color: '#E0E0FF',
                fontWeight: 600,
                mb: 1,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#A0A0E0',
                fontSize: '1.1rem',
              }}
            >
              {channel || 'Unknown Channel'}
            </Typography>
          </Box>
          {channelId && !isOwner && <SubscribeButton channelId={channelId} channelName={channel} />}
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          paddingBottom: '56.25%',
          height: 0,
          overflow: 'hidden',
          borderRadius: 2,
          border: '1px solid #7C4DFF',
          boxShadow: '0 0 13px rgba(255, 0, 255, 0.4), inset 0 0 20px rgba(124, 77, 255, 0.1)',
          mb: 2,
          backgroundColor: '#0A0E27',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: '0 0 25px rgba(0, 217, 255, 0.6)',
          },
        }}
        onClick={handlePlay}
      >
        <img
          src={thumbnail || 'https://picsum.photos/1280/720?random=1'}
          alt="Thumbnail"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.9rem',
          }}
        >
          ▶ Play Video
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 60,
            height: 60,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 0, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: 'white',
            boxShadow: '0 0 20px rgba(255, 0, 255, 0.6)',
          }}
        >
          ▶
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography
            variant="h5"
            sx={{
              color: '#E0E0FF',
              fontWeight: 600,
              mb: 1,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#A0A0E0',
              fontSize: '1.1rem',
            }}
          >
            {channel || 'Unknown Channel'}
          </Typography>
        </Box>
        {channelId && !isOwner && <SubscribeButton channelId={channelId} channelName={channel} />}
      </Box>
    </Box>
  );
}

 
