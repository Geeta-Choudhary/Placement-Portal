/* eslint-disable react/prop-types */
function Drives({allDrives}) {

  return (
    <div className="bg-white rounded-lg border border-gray-200 ">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Drives</h2>
      </div>
      <div className="p-4 h-72 overflow-auto">
        <div className="space-y-4">
            {allDrives && allDrives.length>0 && allDrives.map((drive)=>(
                <div className="flex items-center justify-between" key={drive.id}>
                <div>
                    <h3 className="text-sm font-medium text-gray-800">
                    {drive.company}
                    </h3>
                    <p className="text-sm text-gray-500">{drive.role}</p>
                    <p className="text-xs text-gray-400">Date: {drive.date}</p>
                </div>
                <a href={drive.link} className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
                    Details
                </a>
                </div>
            ))}
        
        </div>
      </div>
    </div>
  );
}

export default Drives;
