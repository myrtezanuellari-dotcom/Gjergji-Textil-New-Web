# Chat Setup (Local + GitHub Pages)

## Local (works now)
1. Install Ollama from `https://ollama.com/`.
2. Run `ollama pull llama3.1:8b`.
3. Create `.env` from `.env.example`.
4. Run `npm install`.
5. Run `npm run dev`.
6. Open `http://localhost:3000`.

## GitHub Pages (static site)
GitHub Pages cannot run a Node server, so use the Cloudflare Worker included in `cloudflare/`.

### Deploy the Worker
1. Install Wrangler (Cloudflare CLI) if you don’t have it.
2. Copy `cloudflare/wrangler.toml.example` to `cloudflare/wrangler.toml`.
3. From `cloudflare/`, run `wrangler secret put OPENAI_API_KEY`.
4. From `cloudflare/`, run `wrangler deploy`.
5. Copy the deployed URL (it will look like `https://your-worker.yourname.workers.dev`).

### Connect your GitHub Pages site
1. Edit `chat-config.js` in the project root:
2. Set `window.GJERGJI_CHAT_API = "https://your-worker.yourname.workers.dev/api/chat";`
3. Commit and push.

The chat button will now work on GitHub Pages.
