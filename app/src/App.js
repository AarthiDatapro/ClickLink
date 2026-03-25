import { BrowserRouter, Routes, Route } from "react-router-dom"
import Admin from "./Admin"
import AdminLogin from "./AdminLogin"
import SplitLayout from "./SplitLayout"
import './App.css' // Import the CSS file here

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplitLayout />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/adminpanel" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App