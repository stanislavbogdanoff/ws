import { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useUser } from "../hooks/useUser";

function HomePage() {
  const user = useUser();
  const token = user?.token || null;

  const socket = io("http://localhost:5001", {
    autoConnect: false,
    extraHeaders: {
      authorization: `bearer ${token}`,
    },
  });

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({ content: "" });
  console.log("newMessage", newMessage);

  useEffect(() => {
    if (token && typeof token === "string") {
      socket.connect();

      // Считываение истории сообщений
      axios
        .get("http://localhost:5001/messages", {
          headers: { Authorization: `Bearer ${user?.token}` },
        })
        .then((response) => setMessages(response.data))
        .catch((error) => console.error("Error fetching messages:", error));

      // Слушатель событий
      socket.on("public_message", (message) => {
        console.log("Received new message:", message);
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      // Срабатывает, когда компонент перестает отрисовываться
      return () => {
        // Закрываю слушатель событий
        socket.off("public_message");
      };
    }
  }, [token]);

  const handleSubmit = () => {
    axios
      .post(
        "http://localhost:5001/messages",
        {
          ...newMessage,
          isPublic: true,
        },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      )
      .then(() => setNewMessage({ content: "" }))
      .catch((error) => console.error("Error sending message:", error));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewMessage((prevMessage) => ({ ...prevMessage, [name]: value }));
  };

  return (
    <div className="container">
      <div className="message_display">
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
            <div key={message._id} className={`message_row`}>
              <div className="message_wrapper">
                <strong>{message.sender.name}: </strong>
                <div className="message_box">
                  {message.content} <br /> <i>{formattedDate}</i>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div>
        <div className="message_input-box">
          <textarea
            className="message_input"
            type="text"
            name="content"
            value={newMessage.content}
            placeholder="Your Message"
            onChange={handleChange}
          />
          <button onClick={handleSubmit}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
