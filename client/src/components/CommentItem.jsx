import { Box, Avatar, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';
import { apiVideos } from '../api/axios';

export default function CommentItem({ comment, onDelete, videoId }) {
  const auth = useAuth();
  const isOwnComment = auth.user && String(auth.user.id) === String(comment.userId._id);

  const handleDelete = async () => {
    if (window.confirm('Delete this comment?')) {
      try {
        await apiVideos.deleteComment(videoId, comment._id);
        onDelete(comment._id);
      } catch (err) {
        console.error('Delete failed', err);
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', mb: 2 }}>
      <Avatar sx={{ mr: 2 }} src={comment.userId?.profilePic}>{comment.userId?.username?.[0] || 'U'}</Avatar>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {comment.userId?.username || 'Anonymous'}
          </Typography>
          {isOwnComment && (
            <IconButton size="small" onClick={handleDelete} color="error">
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
        <Typography variant="body2" sx={{ color: 'text.primary' }}>
          {comment.text}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(comment.timestamp).toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
}
 
