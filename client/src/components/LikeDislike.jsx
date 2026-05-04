import { IconButton, Stack, Typography, Box } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { useState } from 'react';
import { apiVideos } from '../api/axios';


export default function LikeButton({ 
  videoId, 
  likesCount = 0, 
  liked: initialLiked = false,
  onCountChange
 }) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(likesCount);

  const handleToggle = async () => {
    try {
      const isLiked = !liked;
      setLiked(isLiked);
      setCount(isLiked ? count + 1 : Math.max(0, count - 1));
      
      const response = await apiVideos.toggleLike(videoId, isLiked);
      
      setCount(response.data.likesCount);
      
      if (onCountChange) {
        onCountChange(response.data.likesCount);
      }
    } catch (err) {
      console.error('Like toggle failed', err);
      setLiked(!liked);
      setCount(likesCount);
    }
  };

  return (
    <Stack
      direction="row"
      spacing={0}
      alignItems="center"
      sx={{
        background: `linear-gradient(135deg, rgba(124, 77, 255, 0.1) 0%, rgba(255, 0, 255, 0.05) 100%)`,
        border: '2px solid #7C4DFF',
        borderRadius: 2,
        p: 1,
        boxShadow: '0 0 15px rgba(124, 77, 255, 0.2)',
      }}
    >
      <IconButton
        onClick={handleToggle}
        sx={{
          color: liked ? '#FF00FF' : '#A0A0E0',
          transition: 'all 0.3s ease',
          textShadow: liked ? '0 0 10px #FF00FF' : 'none',
          '&:hover': {
            color: '#FF00FF',
            textShadow: '0 0 10px #FF00FF',
          },
        }}
      >
        <ThumbUpIcon />
      </IconButton>
      <Typography
        sx={{
          color: liked ? '#FF00FF' : '#E0E0FF',
          fontWeight: 700,
          minWidth: '40px',
          textAlign: 'center',
          transition: 'all 0.3s ease',
        }}
      >
        {count}
      </Typography>
    </Stack>
  );
}

