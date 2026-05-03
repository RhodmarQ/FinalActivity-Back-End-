import { IconButton, Stack, Typography, Box } from '@mui/material';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import { useState } from 'react';
import { apiVideos } from '../api/axios';


export default function DislikeButton({ 
  videoId, 
  dislikesCount = 0, 
  disliked: initialDisliked = false,
  onDislikeChange,
  onLikeChange 
}) {
  const [disliked, setDisliked] = useState(initialDisliked);
  const [count, setCount] = useState(dislikesCount);



  const handleDislike = async () => {
    try {
      const isDisliked = !disliked;
      setDisliked(isDisliked);
      setCount(isDisliked ? count + 1 : Math.max(0, count - 1));
      
      const response = await apiVideos.toggleDislike(videoId, isDisliked);
      
      setCount(response.data.dislikesCount);
      
      if (onLikeChange && response.data.likesCount !== undefined) {
        onLikeChange(response.data.likesCount);
      }
      if (onDislikeChange && response.data.dislikesCount !== undefined) {
        onDislikeChange(response.data.dislikesCount);
      }
    } catch (err) {
      console.error('Dislike failed', err);
      setDisliked(!disliked);
      setCount(dislikesCount);
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
        onClick={handleDislike}
        sx={{
          color: disliked ? '#FF00FF' : '#A0A0E0',
          transition: 'all 0.3s ease',
          textShadow: disliked ? '0 0 10px #FF00FF' : 'none',
          '&:hover': {
            color: '#FF00FF',
            textShadow: '0 0 10px #FF00FF',
          },
        }}
      >
        {disliked ? <ThumbDownIcon /> : <ThumbDownOffAltIcon />}
      </IconButton>
      <Typography
        sx={{
          color: disliked ? '#FF00FF' : '#E0E0FF',
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

