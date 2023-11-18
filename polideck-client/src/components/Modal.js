import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import CustomIframe from "./CustomIframe";
import Child from "./Child";
import "../App.css";

const Modal = ({ open, onClose, children }) => {
  const [showAlert, setShowAlert] = useState(false);

  const transactionSuccess = useSelector(
    (state) => state.transaction.transactionSuccess,
  );

  useEffect(() => {
    if (transactionSuccess !== null) {
      console.log("Transaction Status:", transactionSuccess);
      setShowAlert(true);
      const timer = setTimeout(() => setShowAlert(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [transactionSuccess]);

  // validate useEffect is working
  /*useEffect(() => {
    if (showAlert) {
      console.log("showAlert is now true");
    } else {
      console.log("showAlert is now false");
    }
  }, [showAlert]);*/

  return (
    <div
      className={`fixed flex justify-center items-center inset-0 ${
        open ? "" : "pointer-events-none"
      }`}
    >
      {showAlert && (
        <div
          className={`fixed top-0 inset-x-0 p-4 text-center text-white ${
            transactionSuccess ? "bg-green-500" : "bg-red-500"
          } transition-opacity duration-1000 ease-out ${
            !showAlert && "opacity-0 transform translate-y-[-100%]"
          }`}
        >
          {transactionSuccess
            ? "Transaction Successful"
            : "Error: Transaction Unsuccessful"}
        </div>
      )}

      {/* background */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          open ? "opacity-50" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* content */}
      <div
        className={`fixed bg-iframe m-0 shadow-lg w-full max-w-screen-sm p-4 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <button onClick={onClose}>X</button>
        <CustomIframe title="Child IFrame">
          <Child />
        </CustomIframe>
        {children}
      </div>
    </div>
  );
};

export default Modal;
