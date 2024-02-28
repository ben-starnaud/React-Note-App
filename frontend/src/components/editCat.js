import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export default function Editcat(props) {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const location = useLocation();
    const token = location.state.token;
    const [catEdit, setCatEdit] = useState('');
    const [newCat, setNewCat] = useState('');
    const [reqNewCat, setReqNewCat] = useState(false);
    const [reqCatName, setReqCatName] = useState(false);


    const handleSaveChanges = async () => {
        // Implement the logic for saving changes here
        if (!newCat) {
            setReqNewCat(true)
        } else {
            try {
            console.log(catEdit)
            console.log(catEdit.name)
           const response = await fetch(`http://localhost:3000/categories/${catEdit.category_id}`, {
            method: 'PUT',
            headers: {
                    'Content-Type': 'application/json',
                   'Authorization': token,
             },
             body: JSON.stringify({name: newCat}),
           });
           console.log(response)
           if (response.ok) {
               console.log('category succesfully edited');
               navigate('/home', {state: {'token': token}})
           }
        } catch (error) {
            console.error(error.message)
            if (error.response) {
                console.log("tests", error.response.data)
            }
        }
        }
    };

    const handleDeleteCategory = async () => {
        // Implement the logic for deleting category here
        try {
            console.log(catEdit)
           const response = await fetch(`http://localhost:3000/categories/${catEdit.category_id}`, {
            method: 'DELETE',
            headers: {
                    'Content-Type': 'application/json',
                   'Authorization': token,
             },
           });
           console.log(response)
           if (response.ok) {
               console.log('category succesfully deleted');
               navigate('/home', {state: {'token': token}})
           }
        } catch (error) {
            console.error(error.message)
            if (error.response) {
                console.log("tests", error.response.data)
            }
        }
    }

    const handleAddCategory = async () => {
        console.log(newCat)

        console.log(token)
        if (!newCat) {
            setReqNewCat(true);

        } else {
            try {
               const response = await fetch(`http://localhost:3000/categories`, {
                method: 'POST',
                headers: {
                        'Content-Type': 'application/json',
                       'Authorization': token,
                 },
                 body: JSON.stringify({name: newCat}),
               });
               console.log(response)
               if (response.ok) {
                   console.log('category succesfully added');
                   navigate('/home', {state: {'token': token}})
               }
            } catch (error) {
                console.error(error.message)
                if (error.response) {
                    console.log("tests", error.response.data)
                }
            }
        }

    };


    const getCats = async () => {
        try {
          const response = await fetch('http://localhost:3000/categories', {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization' : token
                  }
                  //body: JSON.stringify(formData),
                });
                if (response.ok) {
                  const body = await response.json()
                  console.log(body)
                  setCategories(body)
                  setCatEdit(body[0] || '');
                } else {
                  console.log('unexpected error getting categories')
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
            <div className="bg-white p-8 rounded-md w-full max-w-md mx-auto mt-10">
                <div className="space-y-4">
                    {/* Category Dropdown */}
                    <div>
                        <label className="text-gray-600" htmlFor="category">
                            Category
                        </label>
                        <select
                            id="category"
                            className="mt-1 w-full p-2 border rounded"
                            onChange={(e) => setCatEdit(JSON.parse(e.target.value))}
                        >
                            {categories.map((category, index) => (
                                <option key={index} value={JSON.stringify(category)}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* New Category Text Section */}
                    <div>
                        <label className="text-gray-600" htmlFor="newCategory">
                            New Category Name
                        </label>
                        <input
                            id="newCategory"
                            type="text"
                            className={`mt-1 w-full p-2 border ${reqNewCat ? 'border-red-500 rounded' : 'rounded'}`}
                            onChange={(e) => setNewCat(e.target.value)}
                        />
                    </div>
                    {/* Save Button */}
                    <div>
                        <button
                            onClick={handleSaveChanges}
                            className="w-full bg-green-400 text-black-700 py-2 rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-600"
                        >
                            Edit Category
                        </button>
                    </div>
                    {/* Add Category Button */}
                    <div>
                        <button
                            onClick={handleAddCategory}
                            className="w-full bg-green-400 text-black-700 py-2 rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-600"
                        >
                            Add Category
                        </button>
                    </div>
                    {/* Delete Category Button */}
                    <div>
                        <button
                            onClick={handleDeleteCategory}
                            className="w-full bg-red-400 text-black-700 py-2 rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                        >
                            Delete Category
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
