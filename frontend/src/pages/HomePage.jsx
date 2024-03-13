import { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useUser } from "../hooks/useUser";

function HomePage() {
  const user = useUser();

  const socket = io("http://localhost:5000", {
    "force new connection": true,
    reconnectionAttempts: "Infinity",
    timeout: 10000,
  });

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({ author: "", content: "" });

  useEffect(() => {
    axios
      .get("http://localhost:5000/messages")
      .then((response) => setMessages(response.data))
      .catch((error) => console.error("Error fetching messages:", error));

    socket.on("message", (message) => {
      console.log("Received new message:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const handleSubmit = () => {
    axios
      .post("http://localhost:5000/messages", {
        ...newMessage,
        author: user?.name || "Anonymous",
      })
      .then(() => setNewMessage({ author: "", content: "" }))
      .catch((error) => console.error("Error sending message:", error));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewMessage((prevMessage) => ({ ...prevMessage, [name]: value }));
  };

  return (
    <div>
      <h1>Messenger</h1>
      <div>
        {messages.map((message) => {
          const date = new Date(message.timestamp);

          const options = {
            day: "numeric",
            month: "long",
            hour: "numeric",
            minute: "numeric",
            hour12: false,
          };

          const formattedDate = date.toLocaleString("en-EN", options);

          return (
            <div key={message._id}>
              <strong>{message.author}: </strong>
              {message.content} <i>{formattedDate}</i>
            </div>
          );
        })}
      </div>
      <div>
        New Message:{" "}
        <input
          type="text"
          name="content"
          value={newMessage.content}
          placeholder="Your Message"
          onChange={handleChange}
        />
        <button onClick={handleSubmit}>Send</button>
      </div>
    </div>
  );
}

export default HomePage;
