import '../App.css'
import { useEffect, useState, useRef } from "react";
// import Userss from './componenet/specific'

function Apppp() {
  const [isConnected, setIsConnected] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const wsRef = useRef(null);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const hasFetchedToken = useRef(false);
  const messagesEndRef = useRef(null);
  localStorage.setItem('token',token);
  const fetchToken = async () => {
    const response = await fetch("http://localhost:8000/");
    const data = await response.json();
    console.log(data.token);
    setToken(data.token);
    // Extract user ID from token (you might need to adjust this based on your token structure)
    try {
      const tokenParts = data.token.split('.');
      console.log(tokenParts);
      if (tokenParts.length >= 2) {
        const payload = JSON.parse(atob(tokenParts[1]));
        setUserId(payload.sub || payload.user_id || 'Unknown');
      }
    } catch (e) {
      setUserId('Unknown');
    }
  };

  // Fetch token only once when component mounts
  useEffect(() => {
    if (!hasFetchedToken.current) {
      hasFetchedToken.current = true;
      fetchToken();
    }
  }, []); // Empty dependency array means this runs only once

  useEffect(() => {
    if (token && !wsRef.current) {
      console.log(token);
      const ws = new WebSocket(`ws://localhost:8000/ws?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data);
        setEvents((prev) => [...prev, data]);
      };

      ws.onerror = () => {
        setError("WebSocket error");
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsDisconnected(true);
        wsRef.current = null;
      };
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        console.log(wsRef.current);
        wsRef.current = null;
      }
    };
  }, [token]);

  const handleSendMessage = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && messageInput.trim()) {
      const msg = { message: messageInput.trim() };
      wsRef.current.send(JSON.stringify(msg));
      setMessageInput(""); // Clear input after sending
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [events]);

  const handleLogout = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    localStorage.removeItem("token");
    setIsConnected(false);
    setIsDisconnected(true);
  };

  return (

    
    <div className="App">
      <h1>Events</h1>
      <div>
        <p>
          Status:{" "}
          {isConnected
            ? "Connected"
            : isDisconnected
            ? "Disconnected"
            : "Connecting..."}
        </p>
        {userId && <p>User ID: {userId}</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
      </div>
      <div style={{ 
        border: '1px solid #ccc', 
        height: '300px', 
        overflowY: 'auto', 
        padding: '10px',
        marginBottom: '20px',
        backgroundColor: '#f9f9f9'
      }}>
        {events.map((event, index) => (
          <div key={index} style={{
            marginBottom: '8px',
            padding: '5px',
            backgroundColor: event.type === 'welcome' ? '#e8f5e8' : 
                           event.type === 'history_header' ? '#fff3cd' : '#fff',
            borderLeft: event.type === 'welcome' ? '3px solid #28a745' :
                       event.type === 'history_header' ? '3px solid #ffc107' :
                       event.type === 'broadcast' ? '3px solid #007bff' : '1px solid #ddd',
            borderRadius: '3px'
          }}>
            <strong style={{color: event.from === 'System' ? '#6c757d' : '#007bff'}}>
              {event.from || 'System'}:
            </strong> {event.message}
            {event.type && event.type !== 'broadcast' && (
              <span style={{color: '#6c757d', fontSize: '0.8em'}}> ({event.type})</span>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ marginTop: '20px' }}>
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          style={{ marginRight: '10px', padding: '5px', width: '200px' }}
        />
        <button onClick={handleSendMessage} disabled={!isConnected || !messageInput.trim()}>
          Send Message
        </button>
      </div>
      <button onClick={handleLogout} style={{ marginTop: '10px' }}>Logout</button>

    </div>
  );
}

export default Apppp;
