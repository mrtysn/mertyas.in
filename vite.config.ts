import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

const POSTS_DIR = path.resolve(__dirname, 'src/posts')
const FRONTMATTER_COMMENT = /^<!--\s*\n---\s*\n[\s\S]*?\n---\s*\n-->\s*\n/

// HTML posts in src/posts/*.html are standalone pages: served at /<slug> in dev,
// emitted as dist/<slug>/index.html at build (frontmatter comment stripped)
function htmlPosts(): Plugin {
  const findPost = (slug: string) =>
    fs
      .readdirSync(POSTS_DIR)
      .find((f) => f.endsWith('.html') && f.replace(/^\d{4}-\d{2}-\d{2}-/, '') === `${slug}.html`)

  return {
    name: 'html-posts',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const slug = req.url?.split('?')[0].replace(/^\/|\/$/g, '') ?? ''
        const file = /^[\w-]+$/.test(slug) ? findPost(slug) : undefined
        if (!file) return next()
        const html = fs
          .readFileSync(path.join(POSTS_DIR, file), 'utf-8')
          .replace(FRONTMATTER_COMMENT, '')
        res.setHeader('Content-Type', 'text/html')
        res.end(html)
      })
    },
    closeBundle() {
      for (const file of fs.readdirSync(POSTS_DIR)) {
        if (!file.endsWith('.html') || !/^\d{4}-\d{2}-\d{2}-/.test(file)) continue
        const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8')
        if (/^\s*draft:\s*true\s*$/m.test(content.match(FRONTMATTER_COMMENT)?.[0] ?? '')) continue
        const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.html$/, '')
        const outDir = path.resolve(__dirname, 'dist', slug)
        fs.mkdirSync(outDir, { recursive: true })
        fs.writeFileSync(path.join(outDir, 'index.html'), content.replace(FRONTMATTER_COMMENT, ''))
      }
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), htmlPosts()],
  server: {
    port: 5174,
  },
})
