import React from "react";
import "./index.css";
import Loginform from "./components/loginform";
import { Routes, Route, BrowserRouter, Outlet } from 'react-router-dom';
import HomePage  from "./components/home";
import NotesPage from "./components/note";
import ProfilePage from "./components/profile";
import RegisterPage from "./components/registerform";
import AddNote from "./components/addnote";
import Editcat from "./components/editCat";


export default function App () {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Loginform/>}/>
          <Route path='/home' element={<HomePage/>}/>
          <Route path='note' element={<NotesPage/>}/>
          <Route path="/profile" element={<ProfilePage/>}/>
          <Route path="/register" element={<RegisterPage/>}/>
          <Route path="/addnote" element={<AddNote/>}/>
          <Route path='/editcat' element={<Editcat/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
};