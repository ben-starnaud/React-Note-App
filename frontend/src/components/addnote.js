import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';


export default function AddNote(props) {
    const location = useLocation();
    const [newnote, setnewnote] = useState('');
    const [category, setcategory] = useState('');
    const [content, setContent] = useState('');
    const navigate = useNavigate();
    const { notes, token ,user} = location.state;

    const [categories, setCategories] = useState([]);
   // const categories = ['Work', 'School', 'Personal', 'Other'];  

   const getCats = async () => {
    try {
      const response = await fetch(`http://localhost:3000/categories`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Action': 'delete_note',
                'Authorization' : token
              }
              //body: JSON.stringify(formData),
            });
            if (response.ok) {
              const body = await response.json()
              console.log(body)
              setCategories(body)
            } else {
              console.log('unexpected error getting categories')
            }
    } catch (error) {
        // Handle network or request errors.
        console.error('An error occurred:', error);
      }

   };

    const handleSaveChanges = async () => {
        // Logic to save changes and redirect to home page after successful registration
        const currentDate = new Date();

        const year = currentDate.getFullYear();
        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month is 0-based
        const hours = String(currentDate.getHours()).padStart(2, '0');
        const minutes = String(currentDate.getMinutes()).padStart(2, '0');
        const seconds = String(currentDate.getSeconds()).padStart(2, '0');
        const milliseconds = String(currentDate.getMilliseconds()).padStart(3, '0');
        const isoDateString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
        console.log(isoDateString)
        const tempNewNote = { 'note_id': '', 'title': newnote, 'content': content, 'category': category, 'last_update': isoDateString }

        
        try {
            const response = await fetch('http://localhost:3000/notes', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Action': 'addnote',
                'Authorization' : token,
              },
              body: JSON.stringify(tempNewNote),
            });
            if (response.ok) { //MUST CHANGE TO RESPONSE.OK FOR LOGIN VALIDATION
              // Handle a successful login (e.g., redirect to another page).
                try {
                    const response = await fetch('http://localhost:3000/notes', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Action': 'getnotes',
                        'Authorization': token
                },
                    });
                    if (response.ok) { //MUST CHANGE TO RESPONSE.OK FOR LOGIN VALIDATION
                        // Handle a successful login (e.g., redirect to another page).
                        const body = await response.json();
                        navigate('/home', { state: {'token': token} });
                      } else {
                        // Handle login errors (e.g., display an error message).
                        console.error('Server Error');
                      }
                
                } catch (error) {
                console.error('An error occurred:', error);
                }

              //navigate('/home', { state: { notes, token } });
            } else {
              // Handle login errors (e.g., display an error message).
              console.error('add Note Failed');
            }
          } catch (error) {
            // Handle network or request errors.
            console.error('An error occurred:', error);
          }
    };


    
    useEffect(() => {
      // Call your function here to populate data
      getCats();
      
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-custom-image">
            
            <div className="bg-white p-8 rounded-md w-full max-w-md mx-auto mt-10 ">
                <div className="space-y-4">
                    <div>
                        <label className="text-gray-600" htmlFor="email">Note Name</label>
                        <input 
                            id="Name"
                            type="text"
                            onChange={e => setnewnote(e.target.value)}
                            className="mt-1 w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="text-gray-600" htmlFor="username">
                          Category
                        </label>
                        <select
                            id="category"
                            onChange={(e) => setcategory(e.target.value)}
                            className="mt-1 w-full p-2 border rounded"
                        >
                            {categories.map((cat, index) => (
                                <option key={index} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-between items-center mt-6">
                        <button 
                            onClick={handleSaveChanges}
                            className="w-full bg-green-400 text-gray-700 py-2 rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-600"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
        );
};