import { useState } from "react"
import axios from "axios"

function AdminLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const login = async () => {
    try {
        const res = await axios.post("http://localhost:5000/login", {
            username,
            password
        })

        if (res.data.success) {
            onLoginSuccess()
        } else {
            alert("Invalid credentials")
        }
    } catch (err) {
        alert("Connection error")
    }
  }

  return (
    <div>
      <h2 className="form-title">Admin Portal</h2>
      
      <div className="input-group">
        <input
          className="form-input"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="input-group" style={{ position: 'relative' }}>
        <input
          className="form-input"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#7f8c8d'
          }}
        >
          {showPassword ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>

      <button 
        onClick={login}
        className="btn btn-primary"
      >
        Secure Login
      </button>
    </div>
  )
}

export default AdminLogin