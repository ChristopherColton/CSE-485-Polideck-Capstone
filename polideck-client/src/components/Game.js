import { useState, useEffect } from "react";
import Modal from "./Modal";

const Game = () => {
  // Modal State
  const [open, setOpen] = useState(false);

  // Message State
  const [message, setMessage] = useState("");

  // Add event listener to listen for child iframe postMessages
  useEffect(() => {
    const handler = (e) => {
      setMessage(e.data.message);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <>
      <div className="flex flex-col justify-center w-[45%] items-center rounded-lg bg-gradient-to-bl from-blue-400 to-indigo-500">
        <div className="w-full h-full content-center items-center">
          <img
            className="flex rounded-lg h-full w-full border bg-auto bg-center"
            alt="valorant"
            src="https://cdn.arstechnica.net/wp-content/uploads/2020/04/valorant-listing-800x450.jpg"
          />
          <h1 className="text-2xl font-righteous text-white uppercase text-center">
            Game Title
          </h1>
          <h2 className="items-center content-center text-center text-white">
            {message}
          </h2>
        </div>
        <div className="p-4">
          <button
            onClick={() => {
              setOpen(true);
            }}
            className="bg-blue-200 p-2 rounded-lg hover:bg-blue-300 font-lato transition duration-200 uppercase"
          >
            Purchase
          </button>
          <Modal open={open} onClose={() => setOpen(false)} />
        </div>
      </div>
    </>
  );
};

export default Game;