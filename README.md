Clippa or Clipzy– YouTube Video Clipper SaaS
Clippa is a lightweight SaaS tool that allows users to clip and download specific segments of any YouTube video by simply providing the URL and desired timestamps. It trims the video on the backend using yt-dlp and ffmpeg, and instantly delivers downloadable clips — no cloud storage required.

✨ Features
🎯 Precise timestamp-based clipping

🎥 Supports most YouTube formats via yt-dlp

⚡ Fast, on-demand backend trimming using ffmpeg

🧾 Subtitles and format selection support (optional)

🧩 Clean UI built with shadcn/ui and TailwindCSS

🧷 No login, no storage — just paste and clip

🧱 Tech Stack
Frontend
React + TypeScript

TailwindCSS + shadcn/ui

Backend
Express (running on Bun)

yt-dlp for video fetching

FFmpeg for cutting and encoding

Supabase 

Hosted on Render

🚀 Getting Started
1. Clone the repo
bash
Copy
Edit
git clone https://github.com/Shreyas2004wagh/clipzy.git
cd clippa
2. Install dependencies
Backend (Bun + Express):

bash
Copy
Edit
cd backend
bun install
Frontend (React + TS):

bash
Copy
Edit
cd frontend
npm install
3. Environment Variables
Create a .env file in backend/:

env
Copy
Edit
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
Optional: Add any keys required by your analytics or logging tools.

4. Run the app
Backend:

bash
Copy
Edit
bun run src/index.ts or bun --watch src/index.ts
Frontend (Vite):

bash
Copy
Edit
cd frontend
npm run dev


🛠️ Future Improvements
🗃️ Save clip history (if user opts in)

🧠 Smart timestamp suggestions using subtitles or GPT

🌐 Deployable Docker container

📼 Batch clipping / playlist support

💻 Contributing
Open to contributions! Feel free to open issues or submit PRs for:

UI/UX improvements

Bug fixes

Feature requests

📄 License
MIT © 2025 Shreyas Wagh
