# HeartThreads - AI-Powered Storytelling Platform ✍️💡

HeartThreads is a modern, full-featured story sharing and publishing platform built using the MERN stack (MongoDB, Express.js, React.js, Node.js) with integrated AI capabilities. It enables users to write, publish, and explore stories — with the help of intelligent writing assistance powered by multiple AI models.

## 🌟 Features

- 🖥️ **Beautiful UI**: Clean, responsive interface with smooth UX and modern design
- 🔐 **Authentication**: Secure user login/signup with JWT-based auth
- 📚 **Story Collections**: Users can write, organize, and publish stories like book chapters
- 📝 **AI Writing Assistant**: Leverages multiple LLMs (e.g., OpenAI) for storytelling aid, with fallback if a model fails
- 🎨 **Emotional Tone Control**: Write with selected moods or genres (romantic, thriller, sad, inspirational, etc.)
- 🔍 **Advanced Search**: Search by keywords, tones, authors, or tags
- 💬 **Community Features**: Comment, like, and bookmark stories
- 📱 **Mobile-Responsive**: Optimized for use on any screen size

## 🤖 AI Integration

HeartThreads uses multiple AI models to provide robust story generation support:
- If one model (e.g., OpenAI's GPT) fails to generate output, the system automatically falls back to a secondary model to ensure reliability.
- Fine-tuned prompts allow the user to generate stories in different tones, styles, or lengths.

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Cloud - Atlas)
- **Authentication**: JWT (JSON Web Tokens)
- **AI/ML**: OpenAI API, Fallback Logic (Custom Handlers for Model Failures)
- **Deployment**: Vercel (Frontend), Render/Firebase/AWS (Backend)

## 📸 Screenshots

(Add 2–3 images of the interface or key features here)

## 📦 Setup Instructions

```bash
# Clone the repository
git clone https://github.com/your-username/heartthreads.git

# Go to the project directory
cd heartthreads

# Install dependencies
npm install

# heartthreads/
├── client/         # React frontend
├── server/         # Node.js/Express backend
├── models/         # MongoDB models
├── routes/         # API routes
├── ai/             # AI logic & fallback handlers
└── utils/          # Helper functions


# Add .env file with API keys, Mongo URI, etc.
touch .env

🙌 Contributors
Built with ❤️ by Hamza Ayaz Khan



# Run the app
npm run dev
