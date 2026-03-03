# Personal Chat Bot (MultiGPT)

Personal Chat Bot is a multi-provider AI chat app that lets you query several model APIs in one session, compare responses, and keep chat history for context-aware follow-ups. It is built for developers and power users who want a unified interface across providers.

## Live Demo
- https://multigpt-xsz8.onrender.com

## Screenshots
![Response Comparison](https://github.com/user-attachments/assets/ba6f11e7-2fd6-48e8-850d-ab4ac7edf944)

![Chat History](https://github.com/user-attachments/assets/ba6f11e7-2fd6-48e8-850d-ab4ac7edf944)

![Multi-API Dashboard](https://github.com/user-attachments/assets/9d97e1af-d371-4cf2-8ab6-f95df1065b8b)

![Settings Panel](https://github.com/user-attachments/assets/f86b8aa3-b1cf-4f2f-be79-4101dbe05469)

- Response comparison: https://github.com/user-attachments/assets/538e8e8b-8d4a-4eda-9e4b-94828e
- Chat history: https://github.com/user-attachments/assets/ba6f11e7-2fd6-48e8-850d-ab4ac7edf944
- Multi-API dashboard: https://github.com/user-attachments/assets/9d97e1af-d371-4cf2-8ab6-f95df1065b8b
- Settings panel: https://github.com/user-attachments/assets/f86b8aa3-b1cf-4f2f-be79-4101dbe05469

## Features
- Multi-provider querying with side-by-side responses
- Conversation history and context retention
- User authentication with sessions
- API key management
- Responsive UI

## Tech Stack
- Backend: Node.js, Express
- Frontend: EJS, HTML, CSS, JavaScript
- Database: MongoDB with Mongoose
- Auth: Passport (local strategy), express-session, connect-mongo
- Realtime: Socket.io

## Project Structure
```
personal chat bot/
├── app.js
├── package.json
├── README.md
├── controlers/
│   ├── main.js
│   ├── openai.js
│   ├── gimini.js
│   ├── deepSeek.js
│   ├── savechat.js
│   └── newChatobject.js
├── models/
│   ├── loginShema.js
│   ├── userChat.js
│   └── apiKeys.js
├── views/
│   ├── layout/
│   ├── includes/
│   └── user/
├── public/
│   ├── css/
│   ├── asset/
│   ├── animation/
│   └── img/
├── landing/
│   └── dist/ (after build)
└── init/
    └── conn.js
```

## Requirements
- Node.js 14+ (18+ recommended)
- MongoDB
- Provider API keys (see Environment Variables)

## Setup
1. Install dependencies
```bash
npm install
```

2. Configure environment variables
Create a `.env` file in the project root:
```env
MONGO_URL=your_mongodb_connection_string
SECRET=your_session_secret
CLIENT_ORIGIN=http://localhost:3001
PORT=3001

# Provider keys
OPENAI_OPENROUTER_KEY=your_openrouter_key
OPENROUTER_DEEPSEEK_API_KEY=your_openrouter_deepseek_key
GIMINI_API_KEY=your_gemini_key
API_KEY=your_generic_provider_key
API_URL=https://example.com/v1
```

3. Build landing assets (optional but recommended)
```bash
npm run build
```

4. Start the app
```bash
npm run start
```

Local default: `http://localhost:3001`

## Scripts
- `npm run dev` runs the server directly
- `npm run build` installs and builds the `landing` app
- `npm run start` starts the server
- `npm run start:prod` builds and then starts the server

## Usage
1. Sign up or log in
2. Add API keys in Settings
3. Start a chat and compare model responses
4. Review past conversations in History

## Contributing
1. Fork the repo
2. Create a branch: `git checkout -b feature/my-change`
3. Commit: `git commit -m "Add feature"`
4. Push: `git push origin feature/my-change`
5. Open a PR

## License
ISC

## Known Issues
- Session handling can be improved for high concurrency
- Some API routes need stricter validation
