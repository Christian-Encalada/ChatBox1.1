import './App.css';
import { io } from 'socket.io-client';
import { useState, useEffect } from 'react';
import { LiMensaje, UlMensajes } from './ui-components';

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
      usuario: nombreUsuario, // Utiliza el nombre de usuario en lugar de socket.id
      mensaje: nuevoMensaje
    });
  }

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
