// App.js

import { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useUser } from "../hooks/useUser";

function HomePage() {
  const user = useUser();
  const socket = io("http://localhost:5000", {
    auth: {
      token: user?.token,
    },
  });

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({ author: "", content: "" });

  useEffect(() => {
    // Fetch initial messages from the server
    axios
      .get("http://localhost:5000/messages")
      .then((response) => setMessages(response.data))
      .catch((error) => console.error(error));

    // Listen for new messages from the server
    socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send new message to the server
    axios
      .post("http://localhost:5000/messages", newMessage)
      .then(() => setNewMessage({ author: "", content: "" }))
      .catch((error) => console.error(error));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewMessage((prevMessage) => ({ ...prevMessage, [name]: value }));
  };

  return (
    <div>
      <h1>Messenger</h1>
      <div>
        {messages.map((message, index) => (
          <div key={index}>
            <strong>{message.author}: </strong>
            {message.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="content"
          value={newMessage.content}
          placeholder="Your Message"
          onChange={handleChange}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default HomePage;
