import React from "react";

import "./components.css";

const Message = () => {
  return (
    <div className="">
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
  );
};

export default Message;
