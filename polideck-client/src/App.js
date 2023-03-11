import logo from "./logo.svg";
import Child from "./components/Child";
import CustomIframe from "./components/CustomIframe";
import { useEffect, useState } from 'react';
import "./App.css";

function App() {
  const [message, setMessage] = useState('');

  // Add event listener to listen for child iframe postMessages
  useEffect(() => {
    const handler = (ev) => {
      setMessage(ev.data.message)
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h4>Parent Received: {message}</h4>
        <CustomIframe title="Child IFrame" className="border">
          <Child />
        </CustomIframe>
      </header>
    </div>
  );
}

export default App;
