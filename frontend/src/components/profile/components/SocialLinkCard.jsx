/* eslint-disable react/prop-types */
import { FaArrowRight } from "react-icons/fa";
import { FaHackerrank, FaLinkedin, FaGithub } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";

const iconMap = {
  "hackerrank": <FaHackerrank />,
  "leetcode": <SiLeetcode />,
  "linkedin": <FaLinkedin />,
  "github": <FaGithub />
};
function SocialLinkCard({ name, username, url }) {
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center justify-between bg-white shadow-md rounded-lg px-4 py-2  
                 hover:bg-gray-100 transition duration-200"
    >
      {/* Left - Logo */}
      <div className="w-15 h-20 flex items-center">
      <div className="text-6xl ">{iconMap[name]} </div>
        {/* <img src={logo} alt={name} className="w-full h-full rounded-md" /> */}
      </div>

      {/* Center - Name & Username */}
      <div className="flex flex-col flex-grow ml-3">
        <span className="text-sm font-medium text-gray-900">{name}</span>
        <span className="text-xs text-gray-500">{username}</span>
      </div>

      {/* Right - Arrow Icon */}
      <FaArrowRight className="text-gray-400 text-sm" />
    </a>
  );
}

export default SocialLinkCard;
