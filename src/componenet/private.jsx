import React from 'react';
import {useParams} from 'react-router-dom'
import {useEffect,useState,useRef} from 'react';


export default function Private(){
    const {username}=useParams()

    const [token,setToken] = useState('')
    const [isOpen,setIsOpen] =useState(false)
    const [error,setError] =useState(null)
    const [events,setEvents] =useState([])
    const [isDisconnected,setIsDisconnected]=useState(false)
    const [messageInput,setMessageInput] =useState('');
    const wsRef= useRef(null)

    // Get token from localStorage when component mounts
    useEffect(() => {
        console.log('Private component mounted, username:', username)
        const storedToken = localStorage.getItem('token')
        console.log('Stored token:', storedToken ? 'Found' : 'Not found')
        if (storedToken) {
            setToken(storedToken)
        } else {
            setError('No token found. Please login first.')
        }
    }, [username])

    // Test backend connectivity
    useEffect(() => {
        const testBackend = async () => {
            try {
                console.log('Testing backend connectivity...')
                const response = await fetch('http://localhost:8000/test')
                if (response.ok) {
                    const data = await response.json()
                    console.log('Backend test successful:', data)
                } else {
                    console.error('Backend test failed:', response.status)
                    setError('Backend server is not accessible')
                }
            } catch (err) {
                console.error('Backend test error:', err)
                setError('Cannot connect to backend server')
            }
        }
        
        if (username) {
            testBackend()
        }
    }, [username])

    // WebSocket connection effect
    useEffect(() => {
        console.log('WebSocket effect triggered - token:', token ? 'Present' : 'Missing', 'username:', username)
        
        if (token && username && !wsRef.current) {
            console.log('Attempting WebSocket connection...')
            console.log('Token:', token)
            console.log('Target user:', username)

            const wsUrl = `ws://localhost:8000/ws/private?token=${token}&to_user=${username}`
            console.log('WebSocket URL:', wsUrl)

            const ws = new WebSocket(wsUrl)
            wsRef.current = ws
            
            ws.onopen = () => {
                console.log('WebSocket connection opened successfully')
                setIsOpen(true);
                setError(null)
            }
        
            ws.onmessage = (event) => {
                console.log('Raw message received:', event.data)
                try {
                    const data = JSON.parse(event.data);
                    console.log('Parsed message:', data)
                    
                    // Add timestamp to the message
                    const messageWithTimestamp = {
                        ...data,
                        timestamp: new Date().toLocaleTimeString()
                    }
                    
                    setEvents((prev) => [...prev, messageWithTimestamp])
                } catch (err) {
                    console.error('Error parsing message:', err)
                    console.error('Raw message that failed to parse:', event.data)
                    setError('Error parsing received message')
                }
            }
        
            ws.onerror = (error) => {
                console.error('WebSocket error occurred:', error)
                setError('WebSocket connection error')
                setIsOpen(false)
            }
        
            ws.onclose = (event) => {
                console.log('WebSocket connection closed. Code:', event.code, 'Reason:', event.reason)
                setIsOpen(false)
                setIsDisconnected(true)
                wsRef.current = null;
            }
        } else {
            console.log('WebSocket connection conditions not met:')
            console.log('- Token present:', !!token)
            console.log('- Username present:', !!username)
            console.log('- WebSocket already exists:', !!wsRef.current)
        }

        // Cleanup function
        return () => {
            if (wsRef.current) {
                console.log('Cleaning up WebSocket connection')
                wsRef.current.close();
                wsRef.current = null;
            }
        }
    }, [token, username])

    const handleSendMessage = () => {
        console.log('Attempting to send message...')
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && messageInput.trim()) {
            const msg = { message: messageInput.trim() }
            console.log('Sending message:', msg)
            
            // Add local message to show immediately
            const localMessage = {
                message: messageInput.trim(),
                from: 'You',
                timestamp: new Date().toLocaleTimeString(),
                type: 'local'
            }
            setEvents((prev) => [...prev, localMessage])
            
            wsRef.current.send(JSON.stringify(msg))
            setMessageInput('')
        } else {
            console.log('Cannot send message:')
            console.log('- WebSocket exists:', !!wsRef.current)
            console.log('- WebSocket ready state:', wsRef.current?.readyState)
            console.log('- Message input:', messageInput.trim())
            setError('Cannot send message. WebSocket not connected.')
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    }

    return (    
        <div>
            <h2>Private Chat with: {username}</h2>
            
            <div style={{marginBottom: '10px', fontSize: '12px', color: '#666'}}>
                Debug Info: Token={token ? 'Present' : 'Missing'}, Username={username}, 
                WebSocket State={wsRef.current?.readyState || 'None'}
            </div>
            
            {error && (
                <div style={{color: 'red', marginBottom: '10px'}}>
                    Error: {error}
                </div>
            )}
            
            <div style={{marginBottom: '10px'}}>
                Status: {isOpen ? 'Connected' : isDisconnected ? 'Disconnected' : 'Connecting...'}
                {isOpen && (
                    <span style={{color: 'green', marginLeft: '10px'}}>✓ Ready to chat</span>
                )}
            </div>

            {/* Messages display */}
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
                        backgroundColor: event.type === 'private_connected' ? '#e8f5e8' : 
                                         event.type === 'message_sent' ? '#fff3cd' :
                                         event.type === 'local' ? '#e3f2fd' : '#fff',
                        borderLeft: event.type === 'private_connected' ? '3px solid #28a745' :
                                   event.type === 'message_sent' ? '3px solid #ffc107' :
                                   event.type === 'local' ? '3px solid #2196f3' :
                                   '3px solid #007bff',
                        borderRadius: '3px'
                    }}>
                        <strong style={{
                            color: event.from === 'System' ? '#6c757d' : 
                                   event.from === 'You' ? '#2196f3' : '#007bff'
                        }}>
                            {event.from || 'Unknown'}:
                        </strong> {event.message}
                        {event.timestamp && (
                            <span style={{color: '#6c757d', fontSize: '0.8em', marginLeft: '10px'}}>
                                {event.timestamp}
                            </span>
                        )}
                    </div>
                ))}
                {events.length === 0 && (
                    <div style={{color: '#666', fontStyle: 'italic'}}>
                        No messages yet. Start the conversation!
                    </div>
                )}
            </div>
            
            {/* Message input */}
            <div>
                <input 
                    type="text" 
                    value={messageInput} 
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={!isOpen}
                    style={{marginRight: '10px', padding: '5px'}}
                />
                <button 
                    onClick={handleSendMessage}
                    disabled={!isOpen || !messageInput.trim()}
                >
                    Send
                </button>
            </div>
        </div>
    )
}