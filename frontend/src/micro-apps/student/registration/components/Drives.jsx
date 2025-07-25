import PlacementCard from "./DriveCard"; // Importing PlacementCard component

const drivesData = [
  {
    company: "Google",
    role: "Software Development Engineer",
    package: "25-30 LPA",
    lastDate: "March 25, 2024",
    branches: ["CSE", "IT"],
    skills: ["DSA", "Python", "Java"],
    status: "Upcoming",
  },
  {
    company: "Microsoft",
    role: "Software Engineer",
    package: "22-28 LPA",
    lastDate: "April 10, 2024",
    branches: ["CSE", "IT", "ECE"],
    skills: ["C++", "React", "System Design"],
    status: "Open",
  },
  {
    company: "Amazon",
    role: "Backend Developer",
    package: "20-25 LPA",
    lastDate: "March 30, 2024",
    branches: ["CSE", "IT"],
    skills: ["Node.js", "AWS", "MongoDB"],
    status: "Upcoming",
  },
  {
    company: "Tesla",
    role: "AI Engineer",
    package: "30-40 LPA",
    lastDate: "April 5, 2024",
    branches: ["CSE", "AI & ML"],
    skills: ["Python", "TensorFlow", "AI Ethics"],
    status: "Closed",
  },
  {
    company: "Meta",
    role: "Frontend Engineer",
    package: "28-32 LPA",
    lastDate: "April 15, 2024",
    branches: ["CSE", "IT"],
    skills: ["React", "JavaScript", "Next.js"],
    status: "Open",
  },
  {
    company: "Meta",
    role: "Frontend Engineer",
    package: "28-32 LPA",
    lastDate: "April 15, 2024",
    branches: ["CSE", "IT"],
    skills: ["React", "JavaScript", "Next.js"],
    status: "Open",
  },
  {
    company: "Meta",
    role: "Frontend Engineer",
    package: "28-32 LPA",
    lastDate: "April 15, 2024",
    branches: ["CSE", "IT"],
    skills: ["React", "JavaScript", "Next.js"],
    status: "Open",
  },
  {
    company: "Meta",
    role: "Frontend Engineer",
    package: "28-32 LPA",
    lastDate: "April 15, 2024",
    branches: ["CSE", "IT"],
    skills: ["React", "JavaScript", "Next.js"],
    status: "Open",
  },
  {
    company: "Meta",
    role: "Frontend Engineer",
    package: "28-32 LPA",
    lastDate: "April 15, 2024",
    branches: ["CSE", "IT"],
    skills: ["React", "JavaScript", "Next.js"],
    status: "Open",
  },
];

function Drives() {
  return (
    <div className="p-1">
      {/* <h2 className="text-2xl font-semibold mb-4">Upcoming Drives</h2> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {drivesData.map((drive, index) => (
          <PlacementCard key={index} {...drive} />
        ))}
      </div>
    </div>
  );
}

export default Drives;
