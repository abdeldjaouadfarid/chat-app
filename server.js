import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

// __dirname is not available in ES modules,
// so we need to use fileURLToPath to get the current file path and then derive the directory name from it
const metaUrl = import.meta.url
const __filename = fileURLToPath(metaUrl)
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000
const app = express()


app.use(express.static(path.join(__dirname, 'public')))
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`)
})