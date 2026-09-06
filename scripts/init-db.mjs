import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const schemaPath = path.join(root, 'schema.sql')
const outDir = path.join(root, 'public', 'data')
const outPath = path.join(outDir, 'bsb_database.sqlite')

fs.mkdirSync(outDir, { recursive: true })
if (fs.existsSync(outPath)) {
  fs.unlinkSync(outPath)
}

const schema = fs.readFileSync(schemaPath, 'utf8')
const db = new Database(outPath)
db.exec(schema)
db.close()

console.log(`[db:init] SQLite ready => ${outPath}`)
