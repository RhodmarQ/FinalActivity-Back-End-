import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import VideoPlayer from '../components/VideoPlayer';

import LikeDislike from '../components/LikeDislike';

import CommentSection from '../components/CommentSection';
import VideoCard from '../components/VideoCard';
import { apiVideos, apiUsers } from '../api/axios';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import BookmarkIcon from '@mui/icons-material/Bookmark';

export default function Watch() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userLiked, setUserLiked] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(0);
  const auth = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideo = async () => {
      setLoading(true);
      try {
        const [{ data: videoData }, { data: recommendedData }] = await Promise.all([
          apiVideos.getById(id),
          apiVideos.getAll()
        ]);

        setVideo(videoData);
        setLocalLikesCount(videoData.likesCount || 0);
        setRecommended(recommendedData.filter((item) => item.id !== id).slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchVideo();
  }, [id]);

  useEffect(() => {
    const fetchUserAction = async () => {
      if (!auth.user || !id) return;
      try {
        const { data: actionData } = await apiVideos.getUserAction(id);
        setUserLiked(actionData.isLiked);
        setLocalLikesCount(actionData.likesCount);
      } catch (err) {
        console.error('Failed to fetch user action:', err);
      }
    };
    fetchUserAction();
  }, [auth.user]);

  const handlePlay = useCallback(async () => {
    if (auth.loading || !auth.user) return;
    try {
      await apiUsers.addToHistory(auth.user.id, id);
      console.log('Added to history');
    } catch (err) {
      console.error('Failed to add to history:', err);
    }
  }, [auth.user?.id, auth.loading, id]);

  const handleDelete = async () => {
    try {
      await apiVideos.deleteVideo(id);
      navigate('/');
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete video');
    }
    setDeleteDialogOpen(false);
  };

  const isOwner = auth.user?.id && video?.channelId && String(video.channelId) === String(auth.user.id);
  const publishedDate = video ? new Date(video.createdAt).toLocaleDateString() : '';

  if (loading || !video) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, pb: 4 }}>
      <Box sx={{ flex: 2 }}>
        <VideoPlayer
          youtubeUrl={video.youtubeUrl}
          title={video.title}
          thumbnail={video.thumbnail}
          channel={video.channel}
          channelId={video.channelId}
          onPlay={handlePlay}
        />

        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#FFFFFF' }}>
            {video.title}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 2, alignItems: { xs: 'flex-start', md: 'center' } }}>
            <Box>
              <Typography sx={{ color: '#A0A0E0', mb: 0.5 }}>{video.views?.toLocaleString() || 0} views • {publishedDate}</Typography>
              <Typography sx={{ color: '#A0A0E0' }}>Uploaded by <strong>{video.channel}</strong></Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>

              <LikeDislike 
                videoId={video._id || video.id} 
                likesCount={localLikesCount} 
                liked={userLiked}
                onCountChange={(newLikesCount) => setLocalLikesCount(newLikesCount)}
              />

              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                sx={{ borderColor: '#7C4DFF', color: '#E0E0FF' }}
              >
                Share
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                sx={{ borderColor: '#7C4DFF', color: '#E0E0FF' }}
              >
                Download
              </Button>
              <Button
                variant="outlined"
                startIcon={<BookmarkIcon />}
                sx={{ borderColor: '#7C4DFF', color: '#E0E0FF' }}
              >
                Save
              </Button>
              {isOwner && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setDeleteDialogOpen(true)}
                  sx={{ minWidth: 120 }}
                >
                  Delete Video
                </Button>
              )}
            </Box>

          </Box>
        </Box>

        <Box sx={{ mb: 3, p: 2, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Typography variant="subtitle1" sx={{ color: '#FFFFFF', mb: 1 }}>Description</Typography>
          <Typography sx={{ color: '#D0D0E0', whiteSpace: 'pre-line' }}>{video.description}</Typography>
        </Box>

        <CommentSection videoId={video._id || video.id} />
      </Box>

      <Box
        sx={{
          flex: 1,
          minWidth: { xs: '100%', md: '340px' },
          maxWidth: { md: '420px' },
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          maxHeight: 'calc(100vh - 120px)',
          overflowY: 'auto',
        }}
      >
        <Typography sx={{ color: '#FFFFFF', fontWeight: 700 }}>Up next</Typography>
        {recommended.map((item) => (
          <VideoCard key={item.id} video={item} fullWidth />
        ))}
      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Video?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete "{video.title}". This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
