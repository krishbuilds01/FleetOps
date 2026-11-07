export const getApiUrl = (path) => {
  // 1. If VITE_API_URL environment variable is configured (e.g. in Vercel settings), use it
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}${path}`;
  }
  // 2. Fall back to localhost backend when running client locally
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `http://localhost:5000${path}`;
  }
  // 3. Fall back to relative API route for same-origin production deployment
  return path;
};
