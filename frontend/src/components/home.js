import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SearchBar from './searchbar';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';


export default function HomePage(props) {
    const [notes, setNotes] = useState([])
    const location = useLocation();
    const [filteredNotes, setFilteredNotes] = useState([]);
    const token = location.state.token;
    const navigate = useNavigate();
    const [user, setUser] = useState([])


    const handleSignout = () => {   
        if (token) {
            Cookies.remove('token');
        }
        navigate('/');
    };
    
    //const [currentNote, setCurrentNote] = useState(null);
    useEffect(() => {
        // Fetch user data from the API
        const fetchUser = async () => {
            try {
                const response = await fetch('http://localhost:3000/users/me', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Action': 'getuser',
                        'Authorization': token,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setUser(data); // Update the user state with the fetched user data
            
                } else {
                    console.error('Failed to fetch user data');
                }
            } catch (error) {
                console.error('An error occurred:', error);
            }
        };

        // Call the fetchUser function when the component mounts
        fetchUser();
    }, []);

    useEffect(() => {
        // Fetch notes data from the API
        const fetchNotes = async () => {
            try {
                const response = await fetch('http://localhost:3000/notes', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Action': 'getnotes',
                        'Authorization': token,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setNotes(data); // Update the filteredNotes state with the fetched data
                } else {
                    console.error('Failed to fetch notes data');
                }
            } catch (error) {
                console.error('An error occurred:', error);
            }
        };

        fetchNotes();
    }, []);

    const [sortOrder, setSortOrder] = useState('asc');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const [categoryOptions, setCategories] = useState([]);

    const filteredNotesByCategory = selectedCategory === 'All' ? filteredNotes : filteredNotes.filter(note => note.category_name === selectedCategory);
    
    const handleNoteDelete = async (noteToDelete) => {
        try {
            console.log(noteToDelete)
            const response = await fetch(`http://localhost:3000/notes/${noteToDelete.note_id}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Action': 'delete_note',
                'Authorization' : token
              },
              body: JSON.stringify({

              }),
              //body: JSON.stringify(formData),
            });
            if (response.ok) { //MUST CHANGE TO RESPONSE.OK FOR LOGIN VALIDATION
                const updatedNotes = filteredNotes.filter(obj => obj.note_id !== noteToDelete.note_id);
                setFilteredNotes(updatedNotes);
                console.log('note delete Succcesful');

            } else if (!response.ok) {
              // Handle login errors (e.g., display an error message).
              console.log('unexpected error deleting note')
                
            }
          } catch (error) {
            // Handle network or request errors.
            console.error('An error occurred:', error);
          }
    const updatedNotes = notes.filter(n => n !== noteToDelete);
        // Update the notes state (assuming you have such a state in a higher component or another mechanism to manage your notes)
    };

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
      };
      

    const handleAvatarClick = () => {
        navigate('/profile', {state: {'user': user, 'notes': notes, 'token': token}}); // Assuming '/profile' is the route to your profile component
    };
    
    const handleNoteClick = (note) => {

        navigate('/note', { state: { 'note': note, 'token': token } });
      };

    const handleEditCatagorys = () => {
        navigate('/editcat', {state: {'token': token}}); // Make sure the path here matches the route in App.js
    };
    
    
    // Components for the search bar 
    const [searchTerm, setSearchTerm] = React.useState('');
    


    const handleNewNote = () => {
        navigate('/addnote', {state: {'notes': notes, 'token': token, 'user': user}});
    }

    const handleSortClick = () => {
        const sortedNotes = [...filteredNotes];
      
        if (sortOrder === 'asc') {
          sortedNotes.sort((a, b) =>
            a.last_update.localeCompare(b.last_update)
          );
        } else {
          sortedNotes.sort((a, b) =>
            b.last_update.localeCompare(a.last_update)
          );
        }
      
        setFilteredNotes(sortedNotes);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      };

    useEffect(() => {
        const categories = notes.map(note => note.category_name);
        const uniqueCategories = [...new Set(categories)];
        setCategories(['All', ...uniqueCategories]);
        
    }, [notes]);


    useEffect(() => {
        if (notes.length !== 0) {
            setFilteredNotes(notes.filter(note => 
                note.title.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
    }, [notes, searchTerm]);

    


      

    return (
        <div className="bg-custom-image p-8 w-full h-full min-h-screen">
            <div className="flex items-center justify-between pb-6">
                <div className="flex items-center">
                <button onClick={handleAvatarClick} className="focus:outline-none mr-4">
                    <img
                    src={user.user_avatar || '/simple.jpg'}
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full hover:border-gray-400 hover-border-2"
                    />
                </button>
                <button onClick={handleSignout} className="focus:outline-none text-white underline">
                    Sign Out
                </button>


                </div>
                <div className="flex items-center">
                <select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className="px-2 py-2.5 bg-white border-grey rounded-md mr-2 ounded-lg border-2 border-gray-300 focus:border-green-400 focus:outline-none"
                >
                    {categoryOptions.map((category, index) => (
                    <option key={index} value={category}>
                        {category}
                    </option>
                    ))}
                </select>
                <SearchBar onSearchChange={setSearchTerm} />
                </div>
                {/* ... [rest of the search and buttons, unchanged] ... */}
            </div>
            <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Note Title
                                </th>
                                <th
                                    className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                    onClick={handleSortClick}
                                    >
                                    <button className="focus:outline-none">
                                        Last Updated At{' '}
                                        {sortOrder === 'asc' ? '▲' : '▼'}
                                    </button>
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                </th>

                            </tr>
                        </thead>
                        <tbody >
                            {filteredNotesByCategory.map((note, index) => (
                                <tr key={index}>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <div className="flex items-center">
                                            <div className="ml-3">
                                                <p className="text-gray-900 whitespace-no-wrap">
                                                    {note.title}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <div className="flex items-center">
                                            <div className="ml-3">
                                                <p className="text-gray-900 whitespace-no-wrap">
                                                    {note.last_update}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    

                                    {/* Assuming each note has a "createdAt" property for the date */}
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <div className="flex items-center">
                                            <div className="ml-3">
                                                <p className="text-gray-900 whitespace-no-wrap">
                                                    {note.category_name}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <button onClick={() => handleNoteClick(note)} className="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-teal-300 to-lime-300 group-hover:from-teal-300 group-hover:to-lime-300 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-lime-800">
                                            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                                Edit
                                            </span>
                                        </button>
                                        <button onClick={() => handleNoteDelete(note)} className="relative inline-flex items-center justify-center p-0.5 mb-2 ml-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-300 to-red-500 group-hover:from-red-300 group-hover:to-red-500 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-red-200 dark:focus:ring-red-800">
                                            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                                Delete
                                            </span>
                                        </button>
                                    </td>
                                </tr>
                                
                            ))}
                        </tbody>
                    </table>
                    <button
                                onClick={() => handleNewNote()}
                                className="fixed bottom-10 right-10 p-3 rounded-full bg-gray-50 text-grey-600 text-lg shadow-lg hover:bg-green-500 hover:text-gray-50 hover:border-green-500 hover:border-2"
                            >
                                Add Note
                        </button>
                        <button
                            onClick={() => handleEditCatagorys()}
                            className="fixed bottom-10 left-10 p-3 rounded-full bg-gray-50 text-grey-600 text-lg shadow-lg hover:bg-green-500 hover:text-gray-50 hover:border-green-500 hover:border-2"
                            >
                                Edit Categories
                        </button>
                    {/* ... [pagination controls, unchanged] ... */}
                </div>
            </div>
        </div>
        
    );
};