import React from 'react'
import {useState,useContext,useEffect} from 'react'
import {Link} from 'react-router-dom'

import userContext from '../context/userContext'

function Userss(){
    const [users,setUsers]=useState([])
    const [connectedUsers,setConnectedUsers]=useState([])
    const [loading,setLoading]=useState(false)
    const [error,setError]=useState(null)
   

    async function getUsers(){
        setLoading(true)
        setError(null)
        try{
            console.log('Fetching users...')
            const response = await fetch('http://localhost:8000/users');
            if (response.ok){
                const data= await response.json();
                console.log('Users data:', data)
                const userList = data.all_users || data.connected_users || []
                const connectedList = data.connected_users || []
                setUsers(userList)
                setConnectedUsers(connectedList)
                console.log('Set users:', userList)
                console.log('Connected users:', connectedList)
            } else {
                console.error('Failed to fetch users:', response.status)
                setError('Failed to fetch users')
            }

        }catch(e){
            console.error('Error fetching users:', e)
            setError('Error connecting to server')
        } finally {
            setLoading(false)
        }
    }

    // Load users when component mounts
    useEffect(() => {
        getUsers()
    }, [])

    // Function to create a new user for testing
    const createNewUser = async () => {
        try {
            console.log('Creating new user...')
            const response = await fetch('http://localhost:8000/');
            if (response.ok) {
                const data = await response.json();
                console.log('New user created:', data)
                // Refresh the users list
                getUsers()
            }
        } catch (e) {
            console.error('Error creating user:', e)
            setError('Error creating new user')
        }
    }

    // Function to create multiple test users
    const createTestUsers = async () => {
        try {
            console.log('Creating test users...')
            const response = await fetch('http://localhost:8000/create-test-users');
            if (response.ok) {
                const data = await response.json();
                console.log('Test users created:', data)
                // Refresh the users list
                getUsers()
            }
        } catch (e) {
            console.error('Error creating test users:', e)
            setError('Error creating test users')
        }
    }

function handleclikc(e){
    console.log(e);
}

return <div>
    <h2>Available Users</h2>
    
    <div style={{
        backgroundColor: '#e7f3ff',
        border: '1px solid #b3d9ff',
        borderRadius: '5px',
        padding: '15px',
        marginBottom: '20px'
    }}>
        <h4 style={{margin: '0 0 10px 0', color: '#0066cc'}}>How to Test Private Chat:</h4>
        <ol style={{margin: '0', paddingLeft: '20px'}}>
            <li>Click "Create Test Users (3)" to create multiple users</li>
            <li>Open another browser tab/window</li>
            <li>Visit the home page to create your own user</li>
            <li>Come back here and click on a user to start private chat</li>
            <li>In the other tab, also go to private chat with the same user</li>
        </ol>
    </div>
    
    {error && (
        <div style={{color: 'red', marginBottom: '10px'}}>
            Error: {error}
        </div>
    )}
    
    {loading && (
        <div style={{color: 'blue', marginBottom: '10px'}}>
            Loading users...
        </div>
    )}
    
    <div style={{marginBottom: '20px'}}>
        <button onClick={()=>getUsers()} disabled={loading} style={{marginRight: '10px'}}>
            {loading ? 'Loading...' : 'Refresh Users'}
        </button>
        <button onClick={createNewUser} disabled={loading} style={{marginRight: '10px'}}>
            Create New User
        </button>
        <button onClick={createTestUsers} disabled={loading}>
            Create Test Users (3)
        </button>
    </div>
    
    <div style={{marginTop: '20px'}}>
        {users.length === 0 ? (
            <div style={{color: '#666', fontStyle: 'italic'}}>
                No users found. Try refreshing or make sure the backend server is running.
            </div>
        ) : (
            users.map((e)=>{
                const isConnected = connectedUsers.includes(e)
                return (  
                    <div key={e} style={{
                        padding: '10px',
                        margin: '5px 0',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        backgroundColor: isConnected ? '#e8f5e8' : '#f9f9f9'
                    }}>
                        <Link to={`/specifi/${e}`} style={{textDecoration: 'none', color: '#007bff'}}>
                            Chat with User: {e}
                        </Link>
                        <span style={{
                            marginLeft: '10px',
                            fontSize: '0.8em',
                            color: isConnected ? '#28a745' : '#6c757d'
                        }}>
                            {isConnected ? '🟢 Online' : '⚪ Offline'}
                        </span>
                    </div>
                )
            })
        )}
    </div>
</div>
}

export default Userss;