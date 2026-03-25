const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Serve static files from React app
app.use(express.static(path.join(__dirname, '../app/build')))

mongoose.connect("mongodb+srv://aarthi_db_user:MongoDB%402025@cluster.9gp09p3.mongodb.net/?appName=Cluster")

const LinkSchema = new mongoose.Schema(
    {
        name: String,
        url: String,
        // Used for ordering links in the UI (lower comes first)
        order: { type: Number, default: null },
    },
    { timestamps: true }
)

const Link = mongoose.model("Link", LinkSchema)

/* ---------------- LOGIN API ---------------- */

app.post("/login", (req, res) => {

    const { username, password } = req.body

    const ADMIN_USER = "admin@gmail.com"
    const ADMIN_PASS = "Datapro@123$"

    if (username === ADMIN_USER && password === ADMIN_PASS) {
        res.json({ success: true })
    } else {
        res.json({ success: false })
    }

})

/* ---------------- LINKS ---------------- */

app.get("/links", async (req, res) => {
    let links = await Link.find().sort({ order: 1, _id: 1 })

    // Backfill order for older documents that don't have it yet.
    const missingOrder = links.filter((l) => l.order == null)
    if (missingOrder.length > 0) {
        const bulkOps = links
            .map((l, idx) => {
                if (l.order == null) {
                    return {
                        updateOne: {
                            filter: { _id: l._id },
                            update: { $set: { order: idx } },
                        },
                    }
                }
                return null
            })
            .filter(Boolean)

        if (bulkOps.length > 0) await Link.bulkWrite(bulkOps)
        links = await Link.find().sort({ order: 1, _id: 1 })
    }

    res.json(links)
})

app.post("/links", async (req, res) => {

    const { name, url } = req.body

    const maxOrderDoc = await Link.findOne({ order: { $ne: null } }).sort({ order: -1 })
    const count = await Link.countDocuments()
    const nextOrder =
        maxOrderDoc && typeof maxOrderDoc.order === "number" ? maxOrderDoc.order + 1 : count

    const link = new Link({
        name,
        url,
        order: nextOrder,
    })

    await link.save()

    res.json(link)

})

app.put("/links/:id", async (req, res) => {
    try {
        const { name, url } = req.body
        const updated = await Link.findByIdAndUpdate(
            req.params.id,
            { name, url },
            { new: true }
        )

        if (!updated) return res.status(404).json({ error: "Link not found" })
        res.json(updated)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Failed to update link" })
    }
})

app.delete("/links/:id", async (req, res) => {
    try {
        await Link.findByIdAndDelete(req.params.id)
        res.json({ success: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Failed to delete link" })
    }
})

app.post("/links/reorder", async (req, res) => {
    try {
        const { orderedIds } = req.body
        if (!Array.isArray(orderedIds)) {
            return res.status(400).json({ error: "orderedIds must be an array" })
        }

        // Save order as the index inside orderedIds.
        const bulkOps = orderedIds.map((id, idx) => ({
            updateOne: {
                filter: { _id: id },
                update: { $set: { order: idx } },
            },
        }))

        if (bulkOps.length > 0) await Link.bulkWrite(bulkOps)
        res.json({ success: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Failed to reorder links" })
    }
})

// The "catchall" handler: for any request that doesn't match an API route, send back React's index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../app/build/index.html'))
})

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})