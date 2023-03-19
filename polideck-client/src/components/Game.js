import { useState, useEffect } from 'react';
import Modal from './Modal';

const Game = () => {
  // Modal State
  const [open, setOpen] = useState(false);

  // Message State
  const [message, setMessage] = useState('');

  // Add event listener to listen for child iframe postMessages
  useEffect(() => {
    const handler = (e) => {
      setMessage(e.data.message);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <>
      <div className='flex flex-col justify-center items-center bg-[#0474af] w-2/5 rounded-lg'>
        <img
          className='rounded-lg'
          alt='valorant'
          src='https://cdn.arstechnica.net/wp-content/uploads/2020/04/valorant-listing-800x450.jpg'
        />
        <h1 className='text-2xl'>Game Title</h1>
        <h2>{message}</h2>
        <div className='p-4'>
          <button
            onClick={() => {
              setOpen(true);
            }}
            className='bg-blue-400 p-2 rounded-lg hover:bg-blue-300'
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
