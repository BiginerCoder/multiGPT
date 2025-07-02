# multiGPT
MultiGPT is an intelligent and context-aware AI application that allows users to query multiple APIs in one go, compare their responses, and retain the context of previous chats. Designed for power users and developers, it offers seamless interaction, chat history retention, and smart response comparison—all from a unified interface.

🌐 Live Demo
🔗https://multigpt-xsz8.onrender.com
![multi-1](https://github.com/user-attachment![Screenshot 2025-06-13 212257](https://github.com/user-attachments/assets/c87b018c-bfc4-48fb-b71c-6f9318d85931)

![multi-2](https://github.com/user-attachments/assets/538e8e8b-8d4a-4eda-9e4b-94828e![multi-3](https://github.com/user-attachments/assets/ba6f11e7-2fd6-48e8-850d-ab4ac7edf944)

![multi-4](https://github.com/user-attachments/assets/9d97e1af-d371-4cf2-8ab6-f95df1065b8b)

![mutli-5](https://github.com/user-attachments/assets/f86b8aa3-b1cf-4f2f-be79-4101dbe05469)



##🚀 Features
Multi-API Querying: Search across multiple APIs simultaneously and get aggregated, side-by-side responses.

Response Comparison: Visually compare outputs from different APIs in real time.

Chat History: Previous conversations are saved for context-aware interactions.

Context Retention: AI remembers past messages to provide more relevant answers.

Responsive Design: Optimized for desktops, tablets, and smartphones.

Clean and Interactive UI: Smooth user experience with dynamic content rendering.

##🛠️ Technologies Used

Frontend: HTML5, CSS3, JavaScript

Styling: Custom CSS and animations

Backend: Node.js, Express.js (if used)

Context & Storage: Local Storage / Database (e.g., MongoDB / IndexedDB / FileSystem)

API Integration: Supports OpenAI API, DeepSeek API, Gemini API, etc.

Additional: WebSocket for real-time updates (optional)

##📁 File Structure
bash
Copy
Edit
multigpt/
├── index.html           # Entry point of the application
├── css/
│   └── styles.css       # Custom styles
├── js/
│   ├── main.js          # Core app logic
│   ├── chat.js          # Context and message handling
│   └── api.js           # API call and comparison logic
├── assets/
│   └── [images/icons]   # App assets
├── server/              # Backend logic (if applicable)
│   ├── server.js
│   └── routes/
├── database/            # Chat history and user context (if DB used)
💻 How to Use
1. Clone the repository
bash
Copy
Edit
git clone https://github.com/your-username/multigpt.git
2. Navigate to the project folder
bash
Copy
Edit
cd multigpt
3. Start the application
If static only:

bash
Copy
Edit
Open index.html in your browser
If backend is used:

bash
Copy
Edit
npm install
node server/server.js
🔮 Future Enhancements
Add user authentication and profiles

Implement export/share chat history feature

Introduce more AI model integrations

Real-time voice query and TTS support

Dark/light mode toggle

Admin panel for managing APIs and analytics

🤝 Contributing
Contributions are welcome! If you'd like to enhance MultiGPT, feel free to fork the repo, create a feature branch, and submit a pull request.

📄 License
This project is open-source and available under the MIT License.
