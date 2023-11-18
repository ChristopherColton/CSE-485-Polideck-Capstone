import { useState } from "react";
import "../App.css";

const Child = () => {
  const [childMsg, setChildMsg] = useState("");
  const [isValid, setIsValid] = useState(true);

  // Post a message to the parent page and open a new window
  const postToParent = () => {
    if (
      childMsg &&
      !isNaN(childMsg) &&
      childMsg.includes(".") &&
      childMsg.split(".")[1].length === 2 &&
      Number(childMsg) > 0
    ) {
      window.parent.postMessage(
        {
          type: "button-click",
          message: childMsg,
        },
        "*",
      );

      // window.open("https://www.example.com/");
    } else {
      setIsValid(false);
    }
  };

  const handleInputChange = (e) => {
    setIsValid(true);
    const newMessage = e.target.value;
    setChildMsg(newMessage);
  };

  return (
    <div
      style={{
        backgroundColor: "#1e1e1e",
        borderRadius: "8px",
        padding: "20px",
      }}
    >
      <h1
        style={{
          color: "#ffffff",
          marginBottom: "15px",
          textAlign: "center",
        }}
      >
        Confirm Purchase
      </h1>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "40px",
          marginTop: "40px",
        }}
      >
        <p style={{ color: "#ffffff", margin: "0 10px 0 0", fontSize: "20px" }}>
          Price ($)
        </p>
        <input
          style={{
            backgroundColor: "#333333",
            border: "1px solid #555555",
            color: "#ffffff",
            padding: "10px",
            borderRadius: "4px",
            width: "85%",
            fontSize: "18px",
          }}
          type="number"
          placeholder="0.00"
          onChange={handleInputChange}
          required
        />
      </div>

      <button
        style={{
          backgroundColor: "#4caf50",
          color: "#ffffff",
          border: "none",
          padding: "10px 20px",
          borderRadius: "4px",
          cursor: "pointer",
          transition: "background-color 0.3s ease",
          width: "100%",
          fontSize: "20px",
        }}
        onClick={postToParent}
      >
        PURCHASE
      </button>
      {!isValid && (
        <p style={{ color: "#ff5555", marginTop: "20px" }}>
          Please enter a valid amount.
        </p>
      )}
    </div>
  );
};

export default Child;
