// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const AppointmentForm = ({ selectedDate, onClose, onAdd, appointments }) => {
//   const [appId, setAppId] = useState('');
//   const [session, setSession] = useState('Morning');
//   const [inspector, setInspector] = useState('');
//   const [description, setDescription] = useState('');
//   const [descError, setDescError] = useState('');
//   const [applications, setApplications] = useState([]);

//   const fakeInspectors = ['User A', 'User B'];

//   useEffect(() => {
//     axios.get('http://localhost:9090/sps/api/scheduler/applications')
//       .then((res) => setApplications(res.data))
//       .catch((error) => {
//         console.error('Failed to fetch applications', error);
//         alert('Failed to load applications. Please refresh the page.');
//       });
//   }, []);

//   const getByteLength = (str) => new TextEncoder().encode(str).length;

//   // Get all applicationIds that are already booked
//   const bookedAppIds = new Set(appointments.map((app) => app.applicationId));

//   // Filter applications to exclude those already booked
//   const availableApplications = applications.filter(
//     (app) => !bookedAppIds.has(app.applicationId)
//   );

//   const handleSubmit = () => {
//     if (!selectedDate) {
//       alert('Please select a date.');
//       return;
//     }
//     if (!appId) {
//       alert('Please select an application number.');
//       return;
//     }
//     if (!inspector) {
//       alert('Please select an inspector.');
//       return;
//     }
//     if (!description.trim()) {
//       setDescError('Description is required.');
//       return;
//     }
//     if (getByteLength(description) > 100) {
//       setDescError('Description must be less than or equal to 100 bytes.');
//       return;
//     }

//     const appData = applications.find((app) => app.applicationId === appId);
//     if (!appData) {
//       alert('Selected application data not found.');
//       return;
//     }

//     const pad = (n) => n.toString().padStart(2, '0');
//     const formattedDate = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;

//     const appointment = {
//       applicationId: appId,
//       name: appData.applicantName || 'N/A',
//       session,
//       inspector,
//       date: formattedDate,
//       address: appData.serviceAddress || 'N/A',
//       phone: appData.contactNumber || '',
//       deptId: appData.deptId || '',
//       description,
//     };

//     // POST request to backend
//     axios.post('http://localhost:9090/sps/api/scheduler/appointments', appointment, {
//       headers: { 'Content-Type': 'application/json' }
//     })
//       .then(() => {
//         alert('Application added successfully!');
//         onAdd(appointment);  // pass new appointment to parent component if needed
//         onClose();
//       })
//       .catch((error) => {
//         console.error('Failed to add application', error.response || error);
//         alert(`Failed to add application: ${error.response?.data?.message || 'Please try again.'}`);
//       });
//   };

//   return (
//     <div
//       style={{
//         position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//         backgroundColor: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(4px)',
//         zIndex: 50,
//       }}
//       onClick={onClose}
//     >
//       <div
//         className="bg-white rounded-xl shadow-xl p-6"
//         style={{ width: '400px' }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-lg font-semibold font-segoe text-gray-900">Add New Application</h3>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-sm">×</button>
//         </div>

//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium font-segoe text-gray-700 mb-1">Application Number</label>
//             <select
//               className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
//               value={appId}
//               onChange={(e) => setAppId(e.target.value)}
//             >
//               <option value="">Select application number</option>
//               {availableApplications.map((app) => (
//                 <option key={app.applicationId} value={app.applicationId}>
//                   {app.applicationId}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium font-segoe text-gray-700 mb-1">Session</label>
//             <select
//               className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
//               value={session}
//               onChange={(e) => setSession(e.target.value)}
//             >
//               <option value="Morning">Morning</option>
//               <option value="Evening">Evening</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium font-segoe text-gray-700 mb-1">Inspector</label>
//             <select
//               className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
//               value={inspector}
//               onChange={(e) => setInspector(e.target.value)}
//             >
//               <option value="">Select inspector</option>
//               {fakeInspectors.map((user, idx) => (
//                 <option key={idx} value={user}>{user}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium font-segoe text-gray-700 mb-1">Description</label>
//             <textarea
//               className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
//               rows={3}
//               value={description}
//               onChange={(e) => {
//                 const newVal = e.target.value;
//                 if (getByteLength(newVal) <= 100) {
//                   setDescription(newVal);
//                   setDescError('');
//                 } else {
//                   setDescError('Description must be ≤ 100 bytes.');
//                 }
//               }}
//             />
//             {descError && (
//               <p className="text-red-500 text-xs mt-1">{descError}</p>
//             )}
//           </div>
//         </div>

//         <div className="flex justify-between items-center gap-3 mt-6">
//           <button
//             onClick={onClose}
//             className="px-6 py-2 rounded border border-gray-300 text-sm hover:bg-gray-100"
//             style={{
//               color: '#ffffff',
//               backgroundColor: '#b33333',
//               padding: "8px 28px"
//             }}
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             className="px-6 py-2 rounded text-white bg-black hover:bg-gray-800 text-sm font-medium font-segoe"
//             style={{
//               color: '#ffffff',
//               backgroundColor: '#4CAF50',
//               padding: "8px 28px"
//             }}
//           >
//             Add Application
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AppointmentForm;

import React, { useState, useEffect } from 'react';
import { api } from '../../api'; // import our Axios instance

const AppointmentForm = ({ selectedDate, onClose, onAdd, appointments }) => {
  const [appId, setAppId] = useState('');
  const [session, setSession] = useState('Morning');
  const [inspector, setInspector] = useState('');
  const [description, setDescription] = useState('');
  const [descError, setDescError] = useState('');
  const [applications, setApplications] = useState([]);

  const fakeInspectors = ['User A', 'User B'];

  // useEffect(() => {
  //   api.get('/scheduler/applications')
  //     .then((res) => setApplications(res.data))
  //     .catch((error) => {
  //       console.error('Failed to fetch applications', error);
  //       alert('Failed to load applications. Please refresh the page.');
  //     });
  // }, []);

  useEffect(() => {
  const deptId = '411.40'; // Replace with actual deptId from login or context
  const applicationType = 'NC'; // Or let user select

  api.get('/scheduler/applications', {
    params: {
      deptId,
      applicationType,
    },
  })
  .then((res) => setApplications(res.data))
  .catch((error) => {
    console.error('Failed to fetch applications', error);
    alert('Failed to load applications. Please refresh the page.');
  });
}, []);

  const getByteLength = (str) => new TextEncoder().encode(str).length;

  const bookedAppIds = new Set(appointments.map((app) => app.applicationId));
  const availableApplications = applications.filter(
    (app) => !bookedAppIds.has(app.applicationId)
  );

  const handleSubmit = () => {
    if (!selectedDate) {
      alert('Please select a date.');
      return;
    }
    if (!appId) {
      alert('Please select an application number.');
      return;
    }
    if (!inspector) {
      alert('Please select an inspector.');
      return;
    }
    if (!description.trim()) {
      setDescError('Description is required.');
      return;
    }
    if (getByteLength(description) > 100) {
      setDescError('Description must be ≤ 100 bytes.');
      return;
    }

    const appData = applications.find((app) => app.applicationId === appId);
    if (!appData) {
      alert('Selected application data not found.');
      return;
    }

    const pad = (n) => n.toString().padStart(2, '0');
    const formattedDate = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;

    const appointment = {
      applicationId: appId,
      name: appData.applicantName || 'N/A',
      session,
      inspector,
      date: formattedDate,
      address: appData.serviceAddress || 'N/A',
      phone: appData.contactNumber || '',
      deptId: appData.deptId || '',
      description,
    };

    api.post('/scheduler/appointments', appointment)
      .then(() => {
        alert('Application added successfully!');
        onAdd(appointment);
        onClose();
      })
      .catch((error) => {
        console.error('Failed to add application', error.response || error);
        alert(`Failed to add application: ${error.response?.data?.message || 'Please try again.'}`);
      });
  };

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(4px)',
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl p-6"
        style={{ width: '400px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold font-segoe text-gray-900">Add New Appointment</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-sm">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium font-segoe text-gray-700 mb-1">Application Number</label>
            <select
              className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
            >
              <option value="">Select application number</option>
              {availableApplications.map((app) => (
                <option key={app.applicationId} value={app.applicationId}>
                  {app.applicationId}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium font-segoe text-gray-700 mb-1">Session</label>
            <select
              className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              value={session}
              onChange={(e) => setSession(e.target.value)}
            >
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium font-segoe text-gray-700 mb-1">Inspector</label>
            <select
              className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              value={inspector}
              onChange={(e) => setInspector(e.target.value)}
            >
              <option value="">Select inspector</option>
              {fakeInspectors.map((user, idx) => (
                <option key={idx} value={user}>{user}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium font-segoe text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
              rows={3}
              value={description}
              onChange={(e) => {
                const newVal = e.target.value;
                if (getByteLength(newVal) <= 100) {
                  setDescription(newVal);
                  setDescError('');
                } else {
                  setDescError('Description must be ≤ 100 bytes.');
                }
              }}
            />
            {descError && (
              <p className="text-red-500 text-xs mt-1">{descError}</p>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded border border-gray-300 text-sm hover:bg-gray-100"
            style={{
              color: '#ffffff',
              backgroundColor: '#b33333',
              padding: "8px 28px"
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded text-white bg-black hover:bg-gray-800 text-sm font-medium font-segoe"
            style={{
              color: '#ffffff',
              backgroundColor: '#4CAF50',
              padding: "8px 28px"
            }}
          >
            Add Application
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;
