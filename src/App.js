import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import DynamicForm from "./components/DynamicForm";
import Admin from "./components/Admin";
import NewCategory from "./components/NewCategory";

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<DynamicForm />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/createCategory" element={<NewCategory />} />
      </Routes>
    </Router>
  );
}

export default App;
