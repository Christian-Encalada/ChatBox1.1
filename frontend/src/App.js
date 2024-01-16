/* global firebase */

import './App.css';
import { io } from 'socket.io-client';
import { useState, useEffect } from 'react';
import { LiMensaje, UlMensajes } from './ui-components';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyBwBEW-vmdytwra50NwyHaQhYCqg4s_yV4",
  authDomain: "chatbox-98fbb.firebaseapp.com",
  projectId: "chatbox-98fbb",
  storageBucket: "chatbox-98fbb.appspot.com",
  messagingSenderId: "314247152483",
  appId: "1:314247152483:web:ad1e17c335f01bb6da4956"
};

const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

// Solicitar permiso de notificación al cargar la aplicación
Notification.requestPermission().then((permission) => {
  if (permission === 'granted') {
    console.log('Permiso de notificación concedido');
    return getToken(messaging, { vapidKey: '3gjp1GuVkYSZPPsz04fzhOjIoE0PYUYccu3zRlxmMMQ' });
  } else {
    throw new Error('Permiso de notificación denegado');
  }
}).then((currentToken) => {
  if (currentToken) {
    // Send the token to your server and update the UI if necessary
    console.log('Token FCM:', currentToken);
  } else {
    console.log('No registration token available. Request permission to generate one.');
  }
}).catch((err) => {
  console.error('An error occurred while retrieving token. ', err);
});

// Manejar las notificaciones entrantes
onMessage(messaging, (payload) => {
  console.log('Notificación recibida:', payload);
  // Puedes agregar lógica para mostrar la notificación al usuario aquí
});

const socket = io('http://localhost:3000');

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [mensajes, setMensajes] = useState([]);

  useEffect(() => {

    socket.on('connectado', () => setIsConnected(true));

    socket.on('enviar_mensaje', (data) => {
      setMensajes(mensajes => [...mensajes, data]);
    });

    return () => {
      socket.off('connectado');
      socket.off('enviar_mensaje');
    }
  }, []);

  const enviarMensaje = () => {
    socket.emit('enviar_mensaje', {
      usuario: nombreUsuario,
      mensaje: nuevoMensaje,
    });
  
    // Enviar notificación usando FCM
    messaging.getToken().then((token) => {
      const message = {
        notification: {
          title: 'Nuevo Mensaje',
          body: `${nombreUsuario}: ${nuevoMensaje}`,
        },
        token: token,
      };
  
      return firebase.messaging().send(message);
    }).catch((error) => {
      console.error('Error al enviar la notificación:', error);
    });
  };

  const unirseAlChat = () => {
    // Cuando el usuario se une al chat, envía su nombre al servidor
    socket.emit('unirse_al_chat', nombreUsuario);
    setIsConnected(true);
  }

  return (
    <div className="App">
      {isConnected ? (
        <>
          <h2>SI ESTAS CONECTADO</h2>
          <UlMensajes>
            {mensajes.map((mensaje, index) => (
              <LiMensaje key={index}>{mensaje.usuario}: {mensaje.mensaje}</LiMensaje>
            ))}
          </UlMensajes>
          <input
            type="text"
            onChange={e => setNuevoMensaje(e.target.value)}
          />
          <button onClick={enviarMensaje}>Enviar</button>
        </>
      ) : (
        <>
          <h2>NO ESTAS CONECTADO</h2>
          <input
            type="text"
            placeholder="Ingrese su nombre"
            onChange={e => setNombreUsuario(e.target.value)}
          />
          <button onClick={unirseAlChat}>Unirse al chat</button>
        </>
      )}
    </div>
  );
}

export default App;