import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import '../index.css';
import { useNavigate } from 'react-router-dom';


export default function Loginform () {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '', rememberMe: false });
    const [err, setErr] = useState(false);

    //REMEMBER ME FUNCTIONALITY

    const rememberMeInStorage = localStorage.getItem('rememberMe');
    if (rememberMeInStorage) {
        formData.rememberMe = JSON.parse(rememberMeInStorage);
    }

    useEffect(() => {
        const tokenFromCookie = Cookies.get('token');
        if (tokenFromCookie) {
            navigate('/home', { state: { token: tokenFromCookie } });
        }
    }, [navigate]);

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        const inputValue = type === 'checkbox' ? checked : value;
        setFormData({ ...formData, [name]: inputValue });
        
        if (name === 'rememberMe') {
            localStorage.setItem('rememberMe', JSON.stringify(inputValue));
        }
    };

    const handleRegsister = () => {
        navigate('/register');
    }


    const handleLogin = async () => {
        try {
          const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Action': 'login'
            },
            body: JSON.stringify(formData),
          });
          if (response.ok) { //MUST CHANGE TO RESPONSE.OK FOR LOGIN VALIDATION
            // Handle a successful login (e.g., redirect to another page).
            const body = await response.json();
            console.log(body)

            if (formData.rememberMe) {
                Cookies.set('token', body.token, { expires: 7}); // Store the token for 2 days
            }
            navigate('/home', { state: { 'notes': body.notes, 'token':body.token, 'user': body.user } });

          } else {
            // Handle login errors (e.g., display an error message).
            setErr(true);
            console.error('Login failed');
          }
        } catch (error) {
          // Handle network or request errors.
          console.error('An error occurred:', error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-custom-image">
            <div className="w-1/2 flex items-center justify-center bg-white rounded-lg shadow-lg">
                <div className='bg-white p-8 rounded-l-lg shadow-black shadow-left-lg w-1/2 h-full flex-1'>
                    {!err && <h1 className="text-center text-2xl font-semibold mb-6">Welcome Back</h1>}
                    {err && <h2 className="text-center text-sm text-red-500 font-semibold mb-6">Incorrect Username or Password</h2>}
                    <input
                        className="w-full px-4 py-2 rounded-md mb-4 border border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        name="username"
                        onChange={handleInputChange}
                        type="text"
                        placeholder="Username" />
                    <input
                        className="w-full px-4 py-2 rounded-md mb-4 border border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        name="password"
                        onChange={handleInputChange}
                        type="password"
                        placeholder="Password" />
                    <div className="mt-2 flex items-center">
                        <input
                        name="rememberMe"
                        onChange={handleInputChange}
                        type="checkbox"
                        className="form-checkbox text-purple-500 h-4 w-4 mb-4"
                        checked={formData.rememberMe} // Reflect the state of the component
                        />
                        <label className="ml-2 mb-4 text-gray-700">Remember Me</label>
                        <a href='/' className="text-blue-500 mb-4 w-1/2 text-right ml-5">Forgot Password</a>
                    </div>
                    <button className="w-full bg-green-400 text-gray-700 py-2 rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-600"
                            onClick={handleLogin}>Log In</button>
                </div>
                    <div className='custom-gradient-bg from-red-300 to-red-600 p-8 rounded-r-lg shadow-black shadow-r-lg w-1/2 h-full flex-1'>
                        <div className="text-center text-md font-semibold mt-24 py-2">Don't have an account?</div>
                        <button 
                            className="mb-32 w-full bg-white text-gray-700 py-2 rounded-md hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-400"
                            onClick={handleRegsister}>
                            Register
                        </button>
                    </div>
            </div>
        </div>

    );
};