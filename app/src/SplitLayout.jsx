import { useState } from "react"
import Home from "./Home"
import AdminLogin from "./AdminLogin"
import Admin from "./Admin"
import './App.css' // Import CSS

function SplitLayout() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    const handleLogout = () => {
        setIsLoggedIn(false)
    }

    return (
        <div className="split-container">
            {/* Left side - Control Center */}
            <div className="panel-left">
                <div className="brand-header">PROJECT GIRINESTHAM</div>
                
                <div className="form-container">
                    {isLoggedIn ? (
                        <Admin
                            onLogout={handleLogout}
                            onLinkAdded={() => setRefreshKey((k) => k + 1)}
                        />
                    ) : (
                        <AdminLogin onLoginSuccess={() => setIsLoggedIn(true)} />
                    )}
                </div>
            </div>

            {/* Right side - Display Board */}
            <div className="panel-right">
                <h2 className="brand-header-large">PROJECT GIRINESTHAM</h2>
                <Home refreshKey={refreshKey} editable={isLoggedIn} />
            </div>
        </div>
    )
}

export default SplitLayout