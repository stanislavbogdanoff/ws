import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import { useUser } from "../hooks/useUser";

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({ author: "", content: "" });

  const { userId } = useParams();
  const recieverId = userId;

  const user = useUser();
  const token = user?.token || null;

  const socket = io("http://localhost:5000", {
    autoConnect: false,
    extraHeaders: {
      authorization: `bearer ${token}`,
    },
  });

  useEffect(() => {
    if (token && typeof token === "string") {
      socket.connect();
      axios
        .get(`http://localhost:5000/messages/private/${recieverId}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        })
        .then((response) => setMessages(response.data))
        .catch((error) => console.error("Error fetching messages:", error));

      socket.on("message", (message) => {
        console.log("Received new message:", message);
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      return () => {
        socket.off("message");
      };
    }
  }, [token]);

  const handleSubmit = () => {
    axios
      .post(
        "http://localhost:5000/messages/private",
        {
          ...newMessage,
          recieverId: recieverId,
        },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      )
      .then(() => setNewMessage({ author: "", content: "" }))
      .catch((error) => console.error("Error sending message:", error));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewMessage((prevMessage) => ({ ...prevMessage, [name]: value }));
  };

  return (
    <>
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
              <strong>{message.sender.name}: </strong>
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
    </>
  );
};

export default ChatPage;
