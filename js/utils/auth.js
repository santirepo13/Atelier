import { auth } from '../firebase-init.js';

export async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export function getCurrentUser() {
  return auth.currentUser;
}