import React from 'react';

const SearchBar = ({ onSearchChange }) => {
    return (
        <div className="relative w-64"> {/* Added container for search icon */}
            <input 
                type="text" 
                placeholder="Search for a note..."
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-gray-300 focus:border-green-400 focus:outline-none"  
            />
            <div className="absolute left-3 top-2.5"> {/* Search icon positioning */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6M4 4h16M4 4V4a8 8 0 0116 0v0M4 4v16a8 8 0 0116 0V4" />
                </svg>
            </div>
        </div>
    );
}

export default SearchBar;