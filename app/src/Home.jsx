import { useEffect, useState } from "react"
import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'

function Home({ refreshKey, editable }) {
    const [links, setLinks] = useState([])
    const [loading, setLoading] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [draftName, setDraftName] = useState("")
    const [draftUrl, setDraftUrl] = useState("")
    const [error, setError] = useState("")
    const [draggingId, setDraggingId] = useState(null)
    const [dragOverId, setDragOverId] = useState(null)
    const [isReordering, setIsReordering] = useState(false)

    const fetchLinks = async () => {
        setLoading(true)
        setError("")
        try {
            const res = await axios.get(`${API_URL}/links`)
            setLinks(res.data)
        } catch (err) {
            console.error(err)
            setError("Failed to load links")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // If links refresh (e.g., after publish), avoid leaving stale edit drafts.
        cancelEdit()
        fetchLinks()
    }, [refreshKey])

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

    useEffect(() => {
        if (!editable) cancelEdit()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editable])

    const saveEdit = async (id) => {
        if (!draftName || !draftUrl) return alert("Please fill all fields")
        try {
            await axios.put(`http://localhost:5000/links/${id}`, {
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

    const deleteLink = async (id) => {
        const ok = window.confirm("Delete this link?")
        if (!ok) return
        try {
            await axios.delete(`${API_URL}/links/${id}`)
            if (editingId === id) cancelEdit()
            await fetchLinks()
        } catch (err) {
            console.error(err)
            alert("Failed to delete link")
        }
    }

    const persistOrder = async (orderedIds) => {
        await axios.post(`${API_URL}/links/reorder`, { orderedIds })
    }

    const handleDropOn = async (targetId, e) => {
        e.preventDefault()
        if (!editable || isReordering) return
        if (!draggingId) return
        if (targetId === draggingId) return

        const sourceIndex = links.findIndex((l) => l._id === draggingId)
        const targetIndex = links.findIndex((l) => l._id === targetId)
        if (sourceIndex === -1 || targetIndex === -1) return

        const next = [...links]
        const [moved] = next.splice(sourceIndex, 1)
        next.splice(targetIndex, 0, moved)

        setIsReordering(true)
        try {
            setLinks(next) // immediate UI update
            const orderedIds = next.map((l) => l._id)
            await persistOrder(orderedIds)
            await fetchLinks()
        } catch (err) {
            console.error(err)
            alert("Failed to reorder links")
            await fetchLinks()
        } finally {
            setIsReordering(false)
            setDraggingId(null)
            setDragOverId(null)
        }
    }

    return (
        <div className="links-container">
            {loading ? <div className="links-status">Loading...</div> : null}
            {error ? <div className="links-status links-status--error">{error}</div> : null}

            <div className="links-grid" aria-label="Links">
                {links.map((link) => {
                    const isEditing = editable && editingId === link._id

                    if (!editable) {
                        return (
                            <a
                                key={link._id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link-card"
                                title={link.url}
                            >
                                <div className="link-text">
                                    <span className="link-name">{link.name}</span>
                                    <span className="link-url-preview">{link.url}</span>
                                </div>
                                <span className="link-open-hint">Open</span>
                            </a>
                        )
                    }

                    return (
                        <div
                            key={link._id}
                            className={
                                "link-card link-card--editable" +
                                (!isEditing && dragOverId === link._id ? " link-card--dragover" : "")
                            }
                            onDragOver={(e) => {
                                if (!editable || isEditing || isReordering) return
                                e.preventDefault()
                                setDragOverId(link._id)
                            }}
                            onDragLeave={() => {
                                if (dragOverId === link._id) setDragOverId(null)
                            }}
                            onDrop={(e) => {
                                if (!editable || isEditing || isReordering) return
                                handleDropOn(link._id, e)
                            }}
                        >
                            <div className="link-text">
                                {isEditing ? (
                                    <div className="edit-fields">
                                        <input
                                            className="edit-input"
                                            value={draftName}
                                            onChange={(e) => setDraftName(e.target.value)}
                                            placeholder="Link name"
                                        />
                                        <input
                                            className="edit-input"
                                            value={draftUrl}
                                            onChange={(e) => setDraftUrl(e.target.value)}
                                            placeholder="https://..."
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <span className="link-name">{link.name}</span>
                                        <span className="link-url-preview" title={link.url}>
                                            {link.url}
                                        </span>
                                    </>
                                )}
                            </div>

                            <div className="link-actions">
                                {isEditing ? (
                                    <>
                                        <button
                                            className="btn btn-primary btn-small"
                                            onClick={() => saveEdit(link._id)}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="btn btn-secondary btn-small"
                                            onClick={cancelEdit}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div
                                            className="drag-handle"
                                            draggable={!isReordering}
                                            title="Drag to reorder"
                                            onDragStart={(e) => {
                                                e.dataTransfer.setData("text/plain", link._id)
                                                setDraggingId(link._id)
                                            }}
                                            onDragEnd={() => {
                                                setDraggingId(null)
                                                setDragOverId(null)
                                            }}
                                        >
                                            Move
                                        </div>
                                        <a
                                            className="btn btn-primary btn-small"
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Open
                                        </a>
                                        <button
                                            className="btn btn-secondary btn-small"
                                            onClick={() => startEdit(link)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-danger btn-small"
                                            onClick={() => deleteLink(link._id)}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Home