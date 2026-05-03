import { Box, TextField, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import CommentItem from './CommentItem';
import API from '../api/axios';

export default function CommentSection({ videoId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data } = await API.get(`/videos/${videoId}/comments`);
        setComments(data);
      } catch (err) {
        console.error('Comments fetch failed', err);
      }
    };
    if (videoId) fetchComments();
  }, [videoId]);

  const handlePost = async () => {
    if (text.trim()) {
      setLoading(true);
      try {
        const { data } = await API.post(`/videos/${videoId}/comments`, { text });
        setComments([data, ...comments]);
        setText('');
      } catch (err) {
        console.error('Comment failed', err);
        alert('Failed to post comment. Check server logs: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteComment = (commentId) => {
    setComments(comments.filter(c => c._id !== commentId));
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          placeholder="Add a public comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        />
        <Button onClick={handlePost} sx={{ mt: 1 }} variant="contained" disabled={loading || !text.trim()}>
          Comment
        </Button>
      </Box>
      {comments.map((c) => (
        <CommentItem key={c._id} comment={c} onDelete={handleDeleteComment} videoId={videoId} />
      ))}
    </Box>
  );
}
 
