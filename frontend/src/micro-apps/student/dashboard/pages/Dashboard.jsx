/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
// import data from '../../../store/data.json'; // Fallback for students
import DashboardHeader from '../components/DashboardHeader';
import PlacementSection from '../components/PlacementSection';
import Drives from '../components/DrivesSection';
import NoticesSections from '../components/NoticesSections';
import { DashboardServices } from '../services/dashboard-services';
import Loader from '../../../../components/loader/Loader';
function Dashboard() {
  const [drivesData, setDrivesData] = useState([]);
  const [noticesData, setNoticesData] = useState([]);
  const [placedStudentsData, setPlacedStudentsData] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({ drives: null, notices: null, placedStudents: null, allStudents: null, general: null });

  useEffect(() => {
    const abortController = new AbortController();

    const fetchDashboardData = async () => {
      setLoading(true);
      setErrors({ drives: null, notices: null, placedStudents: null, allStudents: null, general: null });

      try {
        // Fetch Drives
        let drives = [];
        try {
          drives = await DashboardServices.getDrives({ signal: abortController.signal });
        } catch (err) {
          if (err.name !== 'AbortError') {
            setErrors((prev) => ({ ...prev, drives: 'Failed to load drives' }));
          }
        }

        // Fetch Notices (only after drives completes)
        let notices = [];
        try {
          notices = await DashboardServices.getNotices({ signal: abortController.signal });
        } catch (err) {
          if (err.name !== 'AbortError') {
            setErrors((prev) => ({ ...prev, notices: 'Failed to load notices' }));
          }
        }

        // Fetch Placed Students (only after notices completes)
        let placedStudents = [];
        try {
          placedStudents = await DashboardServices.getPlacedStudents({ signal: abortController.signal });
        } catch (err) {
          if (err.name !== 'AbortError') {
            setErrors((prev) => ({ ...prev, placedStudents: 'Failed to load placed students' }));
          }
        }

        // Fetch All Students (only after placed students completes)
        let allStudents = [];
        try {
          allStudents = await DashboardServices.getAllStudents({ signal: abortController.signal });
        } catch (err) {
          if (err.name !== 'AbortError') {
            setErrors((prev) => ({ ...prev, allStudents: 'Failed to load all students' }));
          }
        }

        // Transform data only if fetched successfully
        const transformedDrives = drives.map((drive) => ({
          id: drive.id || 0,
          company: drive.company || 'Unknown',
          date: drive.date || 'N/A',
          status: drive.status || 'Unknown',
          description: Array.isArray(drive.roles) ? drive.roles.join(', ') : 'No roles specified',
          link: drive.link || '#',
        }));

        const transformedNotices = notices.map((notice) => ({
          id: notice.id || 0,
          title: notice.title || 'Untitled',
          date: notice.date || 'N/A',
          description: notice.description || 'No description',
          read: notice.read === 'true',
          type: notice.type || 'general',
        }));

        const transformedPlacedStudents = placedStudents.map((student) => ({
          id: student.id || 0,
          name: student.name || 'Unknown',
          company: student.company || 'Unknown',
          position: student.position || 'N/A',
          img_url: student.img_url || 'https://via.placeholder.com/150',
        }));

        setDrivesData(transformedDrives);
        setNoticesData(transformedNotices);
        setPlacedStudentsData(transformedPlacedStudents);
        setAllStudents(allStudents);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Unexpected error fetching dashboard data:', err);
          setErrors((prev) => ({ ...prev, general: 'Unexpected error occurred' }));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      abortController.abort();
    };
  }, []);

  if (loading) {
    return <Loader/>
  }

  return (
    <div id="dashboard" className="min-h-screen p-2 space-y-4">
      <DashboardHeader
        totalStudents={allStudents?.length || 0}
        totalPlaced={placedStudentsData.length}
        runningDrives={drivesData.length}
        totalNotice={noticesData.length}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {errors.placedStudents ? (
          <div className="text-red-500">{errors.placedStudents}</div>
        ) : (
          <PlacementSection students={placedStudentsData} />
        )}
        {errors.drives ? (
          <div className="text-red-500">{errors.drives}</div>
        ) : (
          <Drives allDrives={drivesData} />
        )}
      </div>
      {errors.notices ? (
        <div className="text-red-500">{errors.notices}</div>
      ) : (
        <NoticesSections notices={noticesData} />
      )}
      {errors.general && <div className="text-red-500">{errors.general}</div>}
    </div>
  );
}

export default Dashboard;