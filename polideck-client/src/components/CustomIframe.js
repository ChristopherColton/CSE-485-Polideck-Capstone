import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const CustomIframe = ({ children, ...props }) => {
  const [contentRef, setContentRef] = useState(null);

  const mountNode = contentRef?.contentWindow?.document?.body;

  useEffect(() => {
    if (contentRef?.contentWindow) {
      const style = contentRef.contentWindow.document.createElement("style");
      style.textContent = `
        body { 
          margin: 0; 
          padding: 0; 
          width: 100%; 
          overflow: hidden;
        }
        `;
      contentRef.contentWindow.document.head.appendChild(style);
    }
  }, [contentRef]);

  return (
    <iframe
      id="login frame"
      title="childIframe"
      {...props}
      ref={setContentRef}
      style={{
        margin: 0,
        padding: 0,
        width: "100%",
        height: "30vh",
        border: "none",
      }}
    >
      {mountNode && createPortal(<>{children}</>, mountNode)}
    </iframe>
  );
};

export default CustomIframe;
