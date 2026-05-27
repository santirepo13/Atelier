import { auth } from '../firebase-init.js';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js';
import { fetchAPI } from './api.js';

export async function login(email, password, claveTipo, claveRespuesta) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const token = await cred.user.getIdToken();

  try {
    const data = await fetchAPI('/users/2auth', {
      method: 'POST',
      body: JSON.stringify({ tipo: claveTipo, respuesta: claveRespuesta }),
    });
    if (!data.valid) {
      await signOut(auth);
      throw new Error('Palabra clave o respuesta incorrecta.');
    }
  } catch (err) {
    if (err.message === 'Palabra clave o respuesta incorrecta.') throw err;
    throw new Error('Error al validar la palabra clave. Verifica tu conexión.');
  }

  return cred.user;
}

export async function googleLogin() {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);

  try {
    await fetchAPI('/users/profile');
    return { user: cred.user, isNewUser: false };
  } catch (err) {
    if (err.status === 404) {
      return { user: cred.user, isNewUser: true };
    }
    throw err;
  }
}

export async function completeGoogleRegistration(username, claveTipo, claveResp) {
  const user = auth.currentUser;
  if (!user) throw new Error('No hay sesión activa de Google');

  await fetchAPI('/users', {
    method: 'POST',
    body: JSON.stringify({
      uid: user.uid,
      username,
      email: user.email,
      claveTipo,
      claveRespuesta: claveResp,
    }),
  });
}

export async function register(formData) {
  const { username, email, password, claveTipo, claveResp } = formData;
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: username });

  const token = await cred.user.getIdToken();
  await fetchAPI('/users', {
    method: 'POST',
    body: JSON.stringify({
      uid: cred.user.uid,
      username,
      email,
      claveTipo,
      claveRespuesta: claveResp,
    }),
  });

  await signOut(auth);
  return cred.user;
}

export async function logout() {
  await signOut(auth);
}

export async function getUserByUsername(username) {
  return fetchAPI(`/users/by-username/${encodeURIComponent(username)}`);
}