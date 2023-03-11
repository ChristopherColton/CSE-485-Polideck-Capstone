import { useState } from 'react';

const Child = () => {
  const [childMsg, setChildMsg] = useState('');

  // post a message to the parent page
  const postToParent = () => {
    window.parent.postMessage(
      {
        type: "button-click",
        message: childMsg,
      },
      "*"
    );
  };

  const handleInputChange = (e) => {
    const newMessage = e.target.value;
    setChildMsg(newMessage);
  };

  return (
    <>
      <h1 className="">Child Component</h1>
      <input onChange={handleInputChange}></input>
      <button onClick={postToParent}>Post</button>
    </>
  );
};

export default Child;
