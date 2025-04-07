/**
 * Auth Header Utility
 * 
 * Returns an object with the Authorization header containing the JWT token
 * if the user is logged in. This is used to add the token to API requests.
 */
export default function authHeader() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  } else {
    return {};
  }
} 