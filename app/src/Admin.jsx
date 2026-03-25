import { useState } from "react"
import axios from "axios"

function Admin({ onLogout, onLinkAdded }) {
    const [name, setName] = useState("")
    const [url, setUrl] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const addLink = async () => {
        if (!name || !url) return alert("Please fill all fields")
        if (submitting) return

        try {
            setSubmitting(true)
            await axios.post("http://localhost:5000/links", {
                name,
                url
            })

            alert("Link Added Successfully")
            setName("")
            setUrl("")
            onLinkAdded?.()
        } catch (err) {
            console.error(err)
            alert("Failed to publish link")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div>
            <h2 className="form-title">Add New Link</h2>

            <div className="input-group">
                <input
                    className="form-input"
                    placeholder="Link Name (e.g. Portfolio)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className="input-group">
                <input
                    className="form-input"
                    placeholder="URL (https://...)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
            </div>

            <button 
                onClick={addLink}
                className="btn btn-success"
                disabled={submitting}
                style={submitting ? { opacity: 0.85, cursor: "not-allowed" } : undefined}
            >
                {submitting ? "Publishing..." : "Publish Link"}
            </button>
            
            <button 
                onClick={onLogout}
                className="btn btn-logout"
            >
                Logout
            </button>
        </div>
    )
}

export default Admin