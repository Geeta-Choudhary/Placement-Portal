/* eslint-disable react/prop-types */
function Notch({ text, selected, onClick }) {
    return (
      <div
        className={`pre-placement bg-white p-2 rounded-tl rounded-tr m-1 border-0 shadow-[0px_0px_1px_rgba(0,0,0,0.25)] 
          ${selected ? "border-b-2 border-b-[#2B2B8D]" : ""} cursor-pointer`}
        onClick={onClick}
      >
        {text}
      </div>
    );
  }
  
  export default Notch;
  