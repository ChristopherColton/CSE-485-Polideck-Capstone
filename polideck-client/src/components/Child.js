import { useState } from 'react';
import '../App.css';

const Child = () => {
  const [childMsg, setChildMsg] = useState('');

  // post a message to the parent page
  const postToParent = () => {
    window.parent.postMessage(
      {
        type: 'button-click',
        message: childMsg,
      },
      '*'
    );
  };

  const handleInputChange = (e) => {
    const newMessage = e.target.value;
    setChildMsg(newMessage);
  };

  return (
    <>
      <div>
        <h1 className=''>Confirm Purchase</h1>
        <input onChange={handleInputChange}></input>
        <button onClick={postToParent}>Post</button>
        <button
          onClick={() => {
            window.open('https://www.example.com/');
          }}
        >
          Purchase
        </button>
      </div>
    </>
  );
};

export default Child;
