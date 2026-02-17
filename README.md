
# MultiGPT

MultiGPT is an intelligent and context-aware AI application that allows users to query multiple APIs in one go, compare their responses, and retain the context of previous chats. Designed for power users and developers, it offers seamless interaction, chat history retention, and smart response comparison—all from a unified interface.

## 🌐 Live Demo
🔗 [https://multigpt-xsz8.onrender.com](https://multigpt-xsz8.onrender.com)

## 📸 Screenshots

![Response Comparison](https://github.com/user-attachments/assets/538e8e8b-8d4a-4eda-9e4b-94828e)

![Chat History](https://github.com/user-attachments/assets/ba6f11e7-2fd6-48e8-850d-ab4ac7edf944)

![Multi-API Dashboard](https://github.com/user-attachments/assets/9d97e1af-d371-4cf2-8ab6-f95df1065b8b)

![Settings Panel](https://github.com/user-attachments/assets/f86b8aa3-b1cf-4f2f-be79-4101dbe05469)

## 🚀 Features

- **Multi-API Querying**: Search across multiple APIs simultaneously and get aggregated, side-by-side responses
- **Response Comparison**: Visually compare outputs from different APIs in real time
- **Chat History**: Previous conversations are saved for context-aware interactions
- **Context Retention**: AI remembers past messages to provide more relevant answers
- **User Authentication**: Secure login and signup system with session management
- **API Key Management**: Securely store and manage API keys for different services
- **Responsive Design**: Optimized for desktops, tablets, and smartphones
- **Clean and Interactive UI**: Smooth user experience with dynamic content rendering

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript, EJS templating
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js with local strategy
- **Session Management**: Express-session with MongoDB store
- **API Integration**: OpenAI API, Google Gemini API, DeepSeek API
- **Additional**: Socket.io for real-time updates, UUID for session management

## 📁 File Structure

```
multigpt/
├── app.js                   # Main application entry point
├── package.json            # Dependencies and scripts
├── README.md               # Project documentation
├── controlers/             # Application controllers
│   ├── main.js            # Main route controllers
│   ├── openai.js          # OpenAI API integration
│   ├── gimini.js          # Google Gemini API integration
│   ├── deepSeek.js        # DeepSeek API integration
│   ├── savechat.js        # Chat saving functionality
│   └── newChatobject.js   # New chat session handling
├── models/                 # Database models
│   ├── loginShema.js      # User authentication schema
│   ├── userChat.js        # Chat history schema
│   └── apiKeys.js         # API keys schema
├── views/                  # EJS templates
│   ├── layout/
│   │   └── boilerplate.ejs
│   ├── includes/
│   │   ├── navbar.ejs
│   │   └── flash.ejs
│   └── user/
│       ├── index.ejs
│       ├── login.ejs
│       ├── signup.ejs
│       ├── addApiKeys.ejs
│       └── chatHistory.ejs
├── public/                 # Static assets
│   ├── css/
│   │   ├── index.css
│   │   └── navbar.css
│   ├── asset/             # Icons and images
│   ├── animation/         # Animation files
│   └── img/               # Background images
└── init/
    └── conn.js            # Database connection
```

## 💻 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database
- API keys for OpenAI, Google Gemini, and DeepSeek

### 1. Clone the repository
```bash
git clone https://github.com/your-username/multigpt.git
cd multigpt
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and add your API keys:
```env
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
OPENAI_API_KEY=your_openai_api_key
GIMINI_API_KEY=your_gemini_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### 4. Build frontend assets (recommended for faster load times)
```bash
npm run build
```

### 5. Start the application
```bash
npm run start
```

For one-command production startup (build + start):
```bash
npm run start:prod
```

The application will be available at `http://localhost:3001`

## 🔧 Usage

1. **Sign Up/Login**: Create an account or log in to access the application
2. **Add API Keys**: Navigate to the API keys section and add your service keys
3. **Start Chatting**: Begin a new chat session and ask questions
4. **Compare Responses**: View side-by-side responses from different AI models
5. **View History**: Access your previous conversations from the chat history

## 🔮 Future Enhancements

- [ ] Add user authentication and profiles
- [ ] Implement export/share chat history feature
- [ ] Introduce more AI model integrations (Claude, Llama, etc.)
- [ ] Real-time voice query and TTS support
- [ ] Dark/light mode toggle
- [ ] Admin panel for managing APIs and analytics
- [ ] Rate limiting and usage analytics
- [ ] File upload support for document analysis

## 🤝 Contributing

Contributions are welcome! If you'd like to enhance MultiGPT:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open-source and available under the MIT License.

## 🐛 Known Issues

- Session management needs improvement for concurrent users
- Error handling could be more robust
- Some API endpoints need better validation

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub or contact the maintainer.

---

**Made with ❤️ by [rahulurmaliay](https://github.com/rahulurmaliay)**
