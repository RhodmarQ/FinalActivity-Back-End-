import { Box, TextField, Button, Typography, Alert, Chip } from '@mui/material';
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { apiVideos } from '../api/axios';

export default function Upload() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    youtubeUrl: '',
    channel: '',
    categories: ['All']
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'All',
    'Music',
    'Gaming',
    'News',
    'Sports',
    'Education',
    'Comedy',
    'Technology',
  ];

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        channel: user.username || user.name || user.email || 'My Channel'
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleCategory = (cat) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please login first');
      return;
    }
    if (formData.categories.length === 0) {
      setError('Please select at least one category');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await apiVideos.create(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Alert severity="warning">Please login to upload videos.</Alert>;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Upload Video
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        fullWidth
        name="title"
        label="Title"
        value={formData.title}
        onChange={handleChange}
        required
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        name="description"
        label="Description"
        multiline
        rows={4}
        value={formData.description}
        onChange={handleChange}
        required
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        name="thumbnail"
        label="Thumbnail URL (e.g. https://picsum.photos/320/180)"
        value={formData.thumbnail}
        onChange={handleChange}
        required
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        name="youtubeUrl"
        label="YouTube Link (will embed directly)"
        placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
        value={formData.youtubeUrl}
        onChange={handleChange}
        required
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        name="channel"
        label="Channel Name"
        value={formData.channel}
        onChange={handleChange}
        required
        sx={{ mb: 2 }}
      />
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, color: '#E0E0FF' }}>
          Categories (select one or more)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => toggleCategory(cat)}
              color={formData.categories.includes(cat) ? 'primary' : 'default'}
              variant={formData.categories.includes(cat) ? 'filled' : 'outlined'}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
        <Typography variant="caption" sx={{ color: '#A0A0E0', mt: 1, display: 'block' }}>
          Selected: {formData.categories.length === 0 ? 'None' : formData.categories.join(', ')}
        </Typography>
      </Box>
      <Button 
        variant="contained" 
        type="submit" 
        disabled={loading}
        fullWidth
      >
        {loading ? 'Uploading...' : 'Upload'}
      </Button>
    </Box>
  );
}
