/* eslint-disable react/prop-types */

import SocialLinkCard from "./SocialLinkCard";


function SocialLinks({socialLinks}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {socialLinks.map((link, index) => (
        <SocialLinkCard key={index} {...link} />
      ))}
    </div>
  );
}

export default SocialLinks;
