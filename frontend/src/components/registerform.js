
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState(null);
    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);
    const [avatarURL, setAvatarURL] = useState('');
    const [duplicate, setDuplicate] = useState(false);

    const handleSaveChanges = async () => {
        // Logic to save changes and redirect to home page after successful registration
        if (!username || !email || !password) {
            if (!username || username === '$$-!$$^&%^&') {
                setUsername(false);
            }
            if (!password || email === '$$-!$$^&%^&') {
                setPassword(false);
            }
            if (!email || password === '$$-!$$^&%^&') {
                setEmail(false);
            }
        } else {
            try {
                const response = await fetch('http://localhost:3000/register', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Action': 'register'
                  },
                  body: JSON.stringify({
                    'username': username,
                    'email': email,
                    'password': password,
                    'avatarURL': avatarURL,
                  }),
                  //body: JSON.stringify(formData),
                });
                if (response.ok) { //MUST CHANGE TO RESPONSE.OK FOR LOGIN VALIDATION
                    console.log('Registration Succcesful');
                  navigate('/');

                } else if (!response.ok) {
                  // Handle login errors (e.g., display an error message).
                    const error = await response.json();
                    console.log(response)
                    if (error.error === 'email' || error.error === 'username') {
                        setDuplicate(true)
                    }
                    console.log(duplicate)
                    console.error('Registration failed');
                }
              } catch (error) {
                // Handle network or request errors.
                console.error('An error occurred:', error);
              }
            }
        
    };

    return (
        
    <div className="min-h-screen flex items-center justify-center bg-custom-image">
        
        <div className="bg-white p-8 rounded-md w-full max-w-md mx-auto mt-10 ">
            <div className="flex flex-col items-center mb-6">
                <img 
                    src={avatarURL || '/simple.jpg'} 
                    alt="User Avatar"
                    className="w-24 h-24 rounded-full mb-2"
                />
                <span className="text-sm text-gray-600">Your Avatar</span>
            </div>
            <h1 className="text-gray-600 font-bold mb-6">Create Profile</h1>
            {duplicate && <h2 className='text-2 font-bold mb-6 text-red-600'>Username or Email already exists</h2>}
            <div className="space-y-4">
            <div>
                <label className="text-gray-600" htmlFor="email">Email</label>
                    <input 
                        id="email"
                        type="email"
                        onChange={e => setEmail(e.target.value)}
                        className={`mt-1 w-full p-2 border rounded ${email === false ? 'border-2 border-red-500' : ''}`}
                    />
            </div>
                <div>
                    <label className="text-gray-600" htmlFor="username">Username</label>
                    <input 
                        id="username"
                        type="text"
                        onChange={e => setUsername(e.target.value)}
                        className={`mt-1 w-full p-2 border rounded ${username === false ? 'border-2 border-red-500' : ''}`}
                    />
                </div>

                <div>
                    <label className="text-gray-600" htmlFor="password">Password</label>
                    <input 
                        id="password"
                        type="password"
                        onChange={e => setPassword(e.target.value)}
                        className={`mt-1 w-full p-2 border rounded ${password === false ? 'border-2 border-red-500' : ''}`}
                    />
                </div>
                <div>
                    <label className="text-gray-600" htmlFor="avatarURL">Avatar URL</label>
                    <input 
                        id="avatarURL"
                        type="url"
                        value={avatarURL}
                        onChange={e => setAvatarURL(e.target.value)}
                        className="mt-1 w-full p-2 border rounded"
                        placeholder="Enter the URL for your avatar image"
                        />
                    </div>
                <div className="flex justify-between items-center mt-6">
                    <button 
                        onClick={handleSaveChanges}
                        className="w-full bg-green-400 text-gray-700 py-2 rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-600"
                    >
                        Register
                    </button>
                </div>
            </div>
        </div>
    </div>
    );
    }