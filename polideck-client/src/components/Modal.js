import CustomIframe from "./CustomIframe";
import Child from "./Child";

const Modal = ({ open, onClose, children }) => {
  return (
    <div
      className={`fixed flex justify-center items-center inset-0 ${
        open ? "" : "pointer-events-none"
      }`}
    >
      {/* background */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          open ? "opacity-50" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* content */}
      <div
        className={`fixed bg-white shadow-lg w-full max-w-screen-sm p-4 transition-opacity duration-300 ${
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
