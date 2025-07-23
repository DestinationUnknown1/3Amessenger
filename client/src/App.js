import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './styles.css';

const socket = io();

function App() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [username, setUsername] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on('message_history', (history) => {
      setMessages(history);
    });

    socket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('message_history');
      socket.off('new_message');
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !username.trim()) return;

    const message = {
      username,
      text: messageInput
    };

    socket.emit('send_message', message);
    setMessageInput('');
  };

  return (
    <div className="app">
      <div className="chat-container">
        <h1>Real-Time Messenger</h1>
        
        <div className="messages">
          {messages.map((msg) => (
            <div key={msg.id} className="message">
              <strong>{msg.username}: </strong>
              <span>{msg.text}</span>
              <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="message-form">
          <input
            type="text"
            placeholder="Your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            required
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default App;
