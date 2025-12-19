const mongoose = require("mongoose");
const userchat = require("../models/userChat.js")
const mongodb_url = process.env.MONGO_URL;

mongoose.connect(mongodb_url)
  .then(() => console.log("Connected to MongoDB!"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

const initdb = async () => {
  try {
    // Insert data into the collection
    await userchat.deleteMany({});
  
    
    console.log("Database initialized with sample data");
  } catch (e) {
    console.error("Error initializing database:", e);
  }finally {
    // Close the connection
    mongoose.connection.close()
      .then(() => console.log("Connection closed"))
      .catch((err) => console.error("Error closing connection:", err));
  }
};

// Initialize the database
initdb();




//'mongodb+srv://newrahulurmaliya2004:JKMbOceeHVNdR9Ar@cluster0.0lirw.mongodb.net/chatapp?retryWrites=true&w=majority&appName=Cluster0'
// const initdb = async () => {
//   try {
//     // Insert data into the collection
//     await loginDetail.deleteMany({});
  
//     await loginDetail.insertMany(data);
//     console.log("Database initialized with sample data");
//   } catch (e) {
//     console.error("Error initializing database:", e);
//   }finally {
//     // Close the connection
//     mongoose.connection.close()
//       .then(() => console.log("Connection closed"))
//       .catch((err) => console.error("Error closing connection:", err));
//   }
// };

// // Initialize the database
// initdb();