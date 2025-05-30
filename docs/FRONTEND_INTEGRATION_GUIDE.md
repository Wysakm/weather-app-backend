// Frontend API Integration Examples for Weather App

// 1. Authentication
const authAPI = {
  // Login
  login: async (username, password) => {
    const response = await fetch('http://localhost:3030/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return response.json();
  },

  // Register
  register: async (email, password, username) => {
    const response = await fetch('http://localhost:3030/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username })
    });
    return response.json();
  },

  // Forgot Password
  forgotPassword: async (email) => {
    const response = await fetch('http://localhost:3030/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return response.json();
  },

  // Reset Password
  resetPassword: async (token, newPassword) => {
    const response = await fetch('http://localhost:3030/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });
    return response.json();
  }
};

// 2. Weather API
const weatherAPI = {
  // Get current weather
  getCurrentWeather: async (placeId) => {
    const response = await fetch(`http://localhost:3030/api/weather/current/${placeId}`);
    return response.json();
  },

  // Get weather forecast
  getForecast: async (placeId) => {
    const response = await fetch(`http://localhost:3030/api/weather/forecast/${placeId}`);
    return response.json();
  },

  // Get weather statistics
  getStatistics: async () => {
    const response = await fetch('http://localhost:3030/api/weather/statistics');
    return response.json();
  }
};

// 3. AQI API
const aqiAPI = {
  // Get current AQI
  getCurrentAQI: async (placeId) => {
    const response = await fetch(`http://localhost:3030/api/aqi/current/${placeId}`);
    return response.json();
  },

  // Get AQI forecast
  getAQIForecast: async (placeId) => {
    const response = await fetch(`http://localhost:3030/api/aqi/forecast/${placeId}`);
    return response.json();
  }
};

// 4. Places API
const placesAPI = {
  // Get all places
  getAllPlaces: async () => {
    const response = await fetch('http://localhost:3030/api/places');
    return response.json();
  },

  // Get provinces
  getProvinces: async () => {
    const response = await fetch('http://localhost:3030/api/provinces');
    return response.json();
  },

  // Create place (requires auth)
  createPlace: async (placeData, token) => {
    const response = await fetch('http://localhost:3030/api/places', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(placeData)
    });
    return response.json();
  }
};

// 5. Posts API
const postsAPI = {
  // Get all posts
  getAllPosts: async () => {
    const response = await fetch('http://localhost:3030/api/posts');
    return response.json();
  },

  // Create post (requires auth)
  createPost: async (postData, token) => {
    const formData = new FormData();
    formData.append('title', postData.title);
    formData.append('body', postData.body);
    formData.append('id_place', postData.id_place);
    if (postData.image) {
      formData.append('image', postData.image);
    }

    const response = await fetch('http://localhost:3030/api/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return response.json();
  },

  // Approve post (Admin only)
  approvePost: async (postId, token) => {
    const response = await fetch(`http://localhost:3030/api/posts/${postId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  }
};

// 6. Error Handling
const handleAPIError = (error) => {
  console.error('API Error:', error);
  
  if (error.message?.includes('401')) {
    // Unauthorized - redirect to login
    window.location.href = '/login';
  } else if (error.message?.includes('403')) {
    // Forbidden - show access denied
    alert('Access denied');
  } else if (error.message?.includes('429')) {
    // Rate limited
    alert('Too many requests. Please try again later.');
  } else {
    // Generic error
    alert('Something went wrong. Please try again.');
  }
};

// 7. React Hook Example
const useWeatherData = (placeId) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const data = await weatherAPI.getCurrentWeather(placeId);
        setWeather(data);
      } catch (err) {
        setError(err);
        handleAPIError(err);
      } finally {
        setLoading(false);
      }
    };

    if (placeId) {
      fetchWeather();
    }
  }, [placeId]);

  return { weather, loading, error };
};

// 8. Vue.js Composable Example
const useAuth = () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('auth_token'));
  
  const login = async (username, password) => {
    try {
      const response = await authAPI.login(username, password);
      if (response.success) {
        user.value = response.user;
        token.value = response.token;
        localStorage.setItem('auth_token', response.token);
        return true;
      }
      return false;
    } catch (error) {
      handleAPIError(error);
      return false;
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('auth_token');
  };

  return { user, token, login, logout };
};

export {
  authAPI,
  weatherAPI,
  aqiAPI,
  placesAPI,
  postsAPI,
  handleAPIError,
  useWeatherData,
  useAuth
};
