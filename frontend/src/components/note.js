import React, { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import { UNSAFE_LocationContext, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
export default function NotesPage(props) {

  const [markdownText, setMarkdownText] = useState('');


  const location = useLocation()
  const token = location.state.token
  const navigate = useNavigate()
  const [note, setNote] = useState(location.state.note)
  const [noteName, setNoteName] = useState(note.title);
  const [noteContent, setNoteContent] = useState(note.content)
  const [allUsers, setAllUsers] = useState([])
  const [toShare, setToShare] = useState({})

  const getAllUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/all-users', {
        method: 'GET',
        headers:{
          'Authorization': token
        }
      });
      if (response.ok) {
        const body = await response.json()
        setAllUsers(body)
        
      }
    } catch (error) {
      console.error(error)
    }
  };

  useEffect(() => {
    getAllUsers();
    console.log(allUsers)
}, []);

  const handleUpdateNote = async () => {
    if (!noteName) {
      console.log('Note name is empty')
  } else {
      try {
     const response = await fetch(`http://localhost:3000/notes/${note.note_id}`, {
      method: 'PUT',
      headers: {
              'Content-Type': 'application/json',
             'Authorization': token,
       },
       body: JSON.stringify({'title': noteName, 'content' : noteContent}),
     });
     console.log(response)
     if (response.ok) {
         console.log('note succesfully edited');
         navigate('/home', {state: {'token': token}})
     }
  } catch (error) {
      console.error(error.message)
      if (error.response) {
          console.log("tests", error.response.data)
      }
  }
  }
  }

  const handleShareNote = async () => {
    try {
      const response = await fetch(`http://localhost:3000/share-note`, {
       method: 'POST',
       headers: {
               'Content-Type': 'application/json',
              'Authorization': token,
        },
        body: JSON.stringify({'noteId': note.note_id, 'sharedWithUserId' : parseInt(toShare)}),
      });
      console.log(response)
      if (response.ok) {
          console.log('note succesfully shared');
          window.confirm("Note succesfully shared")
      }
   } catch (error) {
       console.error(error.message)
       if (error.response) {
          window.confirm("Error: Note not shared")
           console.log("tests", error.response.data)
       }
   }
  };

  const outputBoxRef = useRef(null);

  useEffect(() => {
    if (outputBoxRef.current) {
      outputBoxRef.current.style.height = ''; 
      outputBoxRef.current.style.height = outputBoxRef.current.scrollHeight + 'px';
    }
  }, [markdownText]);

  marked.setOptions({
    breaks: true,
  });

  return (
    <div className="bg-custom-image p-8 w-full h-full min-h-screen">
      <br />
      <div className="mb-10 p-8 bg-white rounded-lg shadow-md">
        <div className="mb-4 flex items-center">
            <label className="block text-gray-700 text-sm font-bold mb-2 w-1/6">Users:</label>
            <select
                id="category"
                onChange={(e) => setToShare(e.target.value)}
                className="mt-1 w-3/4 p-2 border rounded-lg shadow-md mr-8 border-gray-300"
            >
                {allUsers.map((shareuser, index) => (
                    <option key={index} value={shareuser.user_id}>
                        {shareuser.username}
                    </option>
                ))}
            </select>
            <button
            className="w-1/4 bg-blue-600 hover:bg-blue-700 text-gray-50 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
            onClick={handleShareNote}
          >
            Share Note
          </button>
        </div>
        <div className="mb-4 flex items-center">
          <label className="block text-gray-700 text-sm font-bold mb-2 w-1/6">Note Name:</label>
          <input
            type="text"
            value={noteName}
            onChange={(e) => setNoteName(e.target.value)}
            placeholder="Enter note name"
            className={`w-3/4 p-2 mr-8 bg-white rounded-lg shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${!noteName ? 'border-red-500 rounded' : 'rounded'}`}
          />
          <button
            className="w-1/4 bg-green-400 hover:bg-green-500 text-gray-700 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
            onClick={handleUpdateNote}
          >
            Save
          </button>
        </div>

        {/* Markdown Text Viewer Box with Larger Default Size */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2"></label>
          <div
            ref={outputBoxRef}
            className="border border-gray-300 p-2 h-48 bg-white rounded-lg shadow-md" // Adjust the default size (h-48)
            dangerouslySetInnerHTML={{ __html: marked(noteContent) }}
          ></div>
        </div>

        {/* Input Box */}
        <textarea
          id="markdown"
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Type your notes here..."
          className="w-full p-4 bg-white rounded-lg shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows="10"
        />
      </div>
    </div>
  );
}