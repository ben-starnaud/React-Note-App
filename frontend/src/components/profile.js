
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
export default function ProfilePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { notes, token, user } = location.state;
    const [email, setEmail] = useState(user.email);
    const [username, setUsername] = useState(user.username);
    const [password, setPassword] = useState(user.password);
    const [avatarURL, setAvatarURL] = useState(user.user_avatar);
    const [reqPassword, setReqPassword] = useState(false);
    console.log(user)

    const handleDeleteAccount = async () => {
        try {
            if (window.confirm("Are you sure you want to delete your account?")) {
            const response = await fetch('http://localhost:3000/users/me', {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Action': 'delete',
                'Authorization': token
              },
              body: JSON.stringify({
                'username': username,
                'email': email,
                'password': password,
                'user_avatar': avatarURL,
              }),
            
            });
            if (response.ok) { 
                console.log('Account Deleted');
                navigate('/register', {state: {'notes': notes, 'token': token}});
            }
        }
          } catch (error) {
            console.error('An error occurred:', error);
          }
        
    };

    const handleSaveChanges = async () => {
            if (!password || !username || !email) {
                if (!password) {
                    setReqPassword(true);
                }
            } else {

            try {
                const response = await fetch('http://localhost:3000/users/me', {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Action': 'update',
                    'Authorization': token
                  },
                  body: JSON.stringify({
                    'username': username,
                    'email': email,
                    'password': password,
                    'user_avatar': avatarURL,
                  }),
                  //body: JSON.stringify(formData),
                });
                if (response.ok) { //MUST CHANGE TO RESPONSE.OK FOR LOGIN VALIDATION
                    const newUserInfo = {username: username, email: email, userAvatar:avatarURL, userId: user.userId}
                    console.log('Update Succcesful');
                    console.log(newUserInfo)
                  navigate('/home', {state: {'token': token}});
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
            <h1 className="text-gray-600 font-bold mb-6">Edit Profile</h1>
            
            <div className="space-y-4">
                <div>
                    <label className="text-gray-600" htmlFor="email">Email</label>
                    <input 
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className={`mt-1 w-full p-2 border ${!email ? 'border-red-500 rounded' : 'rounded'}`}
                    />
                </div>
                <div>
                    <label className="text-gray-600" htmlFor="username">Username</label>
                    <input 
                        id="username"
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className={`mt-1 w-full p-2 border ${!username ? 'border-red-500 rounded' : 'rounded'}`}
                    />
                </div>
                <div>
                    <label className="text-gray-600" htmlFor="password">Password</label>
                    <input 
                        id="password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className={`mt-1 w-full p-2 border ${!password ? 'border-red-500 rounded' : 'rounded'}`}
                    />
                </div>
                <div>
                    <label className="text-gray-600" htmlFor="avatarURL">Avatar URL</label>
                    <input 
                        id="avatarURL"
                        type="url"
                        value={user.user_avatar}
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
                        Save Changes
                    </button>
                    <button 
                        onClick={handleDeleteAccount}
                        className="text-red-600 hover:text-red-700 p-6"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    </div>
    );
}
