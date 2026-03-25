import { useState } from "react"
import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'

function Admin({ onLogout, onLinkAdded }) {
    const [name, setName] = useState("")
    const [url, setUrl] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [draftName, setDraftName] = useState("")
    const [draftUrl, setDraftUrl] = useState("")

    const fetchLinks = async () => {
        try {
            const res = await axios.get(`${API_URL}/links`)
            return res.data
        } catch (err) {
            console.error(err)
            return []
        }
    }

    const startEdit = (link) => {
        setEditingId(link._id)
        setDraftName(link.name || "")
        setDraftUrl(link.url || "")
    }

    const cancelEdit = () => {
        setEditingId(null)
        setDraftName("")
        setDraftUrl("")
    }

    const addLink = async () => {
        if (!name || !url) return alert("Please fill all fields")
        if (submitting) return

        try {
            setSubmitting(true)
            await axios.post(`${API_URL}/links`, {
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

    const saveEdit = async (id) => {
        if (!draftName || !draftUrl) return alert("Please fill all fields")
        try {
            await axios.put(`${API_URL}/links/${id}`, {
                name: draftName,
                url: draftUrl,
            })
            cancelEdit()
            await fetchLinks()
            alert("Link updated")
        } catch (err) {
            console.error(err)
            alert("Failed to update link")
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