/* eslint-disable react/prop-types */
function EventList({ onRegister }) {
    const events = [
      "Guest Lecture on Problem-Solving Techniques",
      "AI and Machine Learning Trends",
      "Cybersecurity in 2025",
      "Full Stack Development Workshop",
      "Guest Lecture on Problem-Solving Techniques",
      "AI and Machine Learning Trends",
      "Cybersecurity in 2025",
      "Full Stack Development Workshop",
      "Guest Lecture on Problem-Solving Techniques",
      "AI and Machine Learning Trends",
      "Cybersecurity in 2025",
      "Full Stack Development Workshop",
    ];
  
    return (
      <div>
        {events.map((event, index) => (
         <div key={index} className="flex justify-between items-center p-3 bg-white hover:shadow-md mb-2 rounded border">
         {/* Section 1: Title */}
         <div className="w-3/12">
           <h3 className="font-semibold">{event}</h3>
         </div>
       
         {/* Section 2: Date & Time */}
         <div className="w-3/12">
           <p><strong>Date:</strong> January 25, 2025</p>
           <p><strong>Time:</strong> 3:00 PM to 5:00 PM</p>
         </div>
       
         {/* Section 3: Registration Deadline & Mode */}
         <div className="w-3/12">
           <p><strong>Registration Deadline:</strong> January 22, 2025</p>
           <p><strong>Mode:</strong> Hybrid</p>
         </div>
       
        <div className="w-2/12 flex justify-end">
        <button 
            className="flex items-center justify-center gap-2 border border-[#0052CC] text-[#0052CC] 
               px-5 py-2 rounded-[3px] text-sm font-medium hover:bg-[#0052CC] hover:text-white 
               transition duration-200 shadow-md focus:ring-2 focus:ring-[#0052CC] 
               focus:ring-opacity-50"
            onClick={() => onRegister(event)}
        >
            <div className="flex justify-between items-center">
            Register
            </div>
             
        </button>
        </div>


       </div>
       
        ))}
      </div>
    );
  }
  
  export default EventList;
  