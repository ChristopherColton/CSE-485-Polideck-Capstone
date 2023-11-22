import { useState, useEffect } from "react";
import "../App.css";
import axios from "axios";
import WebFont from "webfontloader";

const Child = () => {
  useEffect(() => {
    WebFont.load({
      google: {
        families: ["Roboto:400,700"],
      },
    });
  }, []);
  
  const [childMsg, setChildMsg] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [ethRate, setEthRate] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  // Get ETH-USD rate
  useEffect(() => {
    axios
      .get(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
      )
      .then((response) => {
        setEthRate(response.data.ethereum.usd);
      })
      .catch((error) => {
        console.error("Error fetching ETH rate", error);
      });
  }, []);

  // Calculate gwei to USD amount
  const convertGweiToUSD = (gweiAmount) => {
    if (!ethRate) return 0;
    return (gweiAmount / 1e9) * ethRate;
  };

  //Set gas price to 20,000 gwei
  let gasFeeUSD = convertGweiToUSD(20);

  // Displays total cost of the item with fee
  const calculateTotalAmount = () => {
    const inputAmount = parseFloat(childMsg) || 0;
    const gasFeeUSD = convertGweiToUSD(20);
    return inputAmount + gasFeeUSD;
  };

  useEffect(() => {
    setTotalAmount(calculateTotalAmount());
  }, [childMsg, ethRate]);

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
          fontFamily: "Roboto, sans-serif",
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
        <p
          style={{
            color: "#ffffff",
            fontFamily: "Roboto, sans-serif",
            margin: "0 8px 0 0",
            fontSize: "20px",
          }}
        >
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
      <p
        style={{
          color: "#ffffff",
          fontFamily: "Roboto, sans-serif",
          margin: "0 10px 0 0",
          paddingBottom: "10px",
          fontSize: "20px",
        }}
      >
        Gas Fee (USD): <span>${gasFeeUSD.toFixed(2)}</span>
      </p>

      <p
        style={{
          color: "#ffffff",
          fontFamily: "Roboto, sans-serif",
          margin: "10px 10px 0 0",
          paddingBottom: "20px",
          fontSize: "20px",
        }}
      >
        Total Amount (USD): <span>${totalAmount.toFixed(2)}</span>
      </p>
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
          letterSpacing: "3px",
          fontWeight: "bold",
        }}
        onClick={postToParent}
      >
        PURCHASE
      </button>
      {!isValid && (
        <p
          style={{
            color: "#ff5555",
            fontFamily: "Roboto, sans-serif",
            marginTop: "20px",
          }}
        >
          Please enter a valid amount.
        </p>
      )}
    </div>
  );
};

export default Child;
