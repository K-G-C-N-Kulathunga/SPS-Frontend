import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AppointmentCard from './AppointmentCard';
import AppointmentForm from './AppointmentForm';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './calendar.css'; // Assuming you have some custom styles
import { api } from '../../api'; // Import the api instance

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarGrid = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [startDate, setStartDate] = useState(new Date(today));
  const [formVisible, setFormVisible] = useState(false);
  const [formDate, setFormDate] = useState(null);
  const [detailsAppointment, setDetailsAppointment] = useState(null);

  const [appointments, setAppointments] = useState([]);  // <-- appointments state here

  // Fetch appointments from backend API when component mounts
  // useEffect(() => {
  //    api.get('/scheduler/appointments')
  //     .then(res => setAppointments(res.data))
  //     .catch(err => {
  //       console.error('Error fetching appointments:', err);
  //       alert('Failed to fetch appointments from server.');
  //   });
  // }, []);

  const deptId = "423.00";
  useEffect(() => {
  api.get(`/scheduler/appointments?deptId=${deptId}`)
    .then(res => setAppointments(res.data))
    .catch(err => {
      console.error('Error fetching appointments:', err);
      alert('Failed to fetch appointments from server.');
    });
}, [deptId]);

  const getWeekDates = (start) => {
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates(startDate);

  // Helper to pad month and day with leading zero for consistent keys
  const pad = (n) => n.toString().padStart(2, '0');

  const formatDateKey = (date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  const handleCalendarSelect = (date) => {
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);
    if (selected >= today) {
      setFormDate(selected);
      setFormVisible(true);
      setStartDate(selected);
    }
  };

  const handleGridClick = ({ date, session }) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    if (d >= today) {
      setFormDate(d);
      setFormVisible(true);
    }
  };

  const handleAddAppointment = (newAppointment) => {
    setAppointments((prev) => [...prev, newAppointment]);
    setFormVisible(false);
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-[600px] px-[1px] gap-6">
      {/* Left Calendar */}
      <div className="inline-block p-4 rounded-xl bg-white shadow-md mx-[1px] lg:w-1/4">
      <h2 className="text-base font-semibold font-segoe text-gray-900 mb-4">Calendar</h2>
        <Calendar
  onChange={handleCalendarSelect}
  value={formDate || today}
  tileDisabled={({ date, view }) => {
    if (view === 'month') {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d < today; // disables past dates
    }
    return false;
  }}
  tileClassName={({ date, view }) => {
    if (view === 'month') {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      
      if (d < today) {
        return 'disabled-tile'; // past dates
      }

      if (formDate && d.getTime() === formDate.getTime()) {
        return 'selected-tile'; // selected date
      }
    }
    return null;
  }}
  minDate={today}
/>


      </div>

      {/* Weekly Table Grid */}
      <div
        className="w-full h-full lg:w-3/4 px-4 mx-[1px] ml-10 mr-1"
        style={{ marginLeft: '1px' }}
      >
        <div className="bg-white rounded-xl shadow-md p-4 w-full h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold font-segoe text-gray-900">Weekly Schedule</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const newDate = new Date(startDate);
                  newDate.setDate(startDate.getDate() - 5);
                  setStartDate(newDate);
                }}
                className="p-1 rounded hover:bg-gray-100"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => {
                  const newDate = new Date(startDate);
                  newDate.setDate(startDate.getDate() + 5);
                  setStartDate(newDate);
                }}
                className="p-1 rounded hover:bg-gray-100"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-auto border rounded-xl border-gray-300 flex-grow">
            <table className="w-full table-fixed text-sm text-center border-collapse">
              <thead style={{ backgroundColor: '#F9FAFB' }}>
                <tr>
                  <th className="w-[100px] px-4 py-2 border-r border-gray-300 text-center">
                    Session
                  </th>
                  {weekDates.map((date, i) => (
                    <th
                      key={i}
                      className="px-4 py-2 border-r border-gray-300 last:border-r-0"
                    >
                      <div className="text-xs font-semibold font-segoe text-gray-600">
                        {days[date.getDay()]}
                      </div>
                      <div className="text-lg font-bold font-segoe">{date.getDate()}</div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {['Morning', 'Evening'].map((session) => (
                  <tr key={session} className="border border-gray-300">
                    <td className="text-black font-semibold font-segoe text-sm tracking-wide border px-4 py-2 "
                    style={{ backgroundColor: '#F9FAFB' }}
                    >
                      {session}
                    </td>

                    {weekDates.map((date, i) => {
                      const dateKey = formatDateKey(date);
                      const sessionAppointments = appointments.filter(
                        (app) => app.date === dateKey && app.session === session
                      );

                      const isPast = date < today;

                      return (
                        <td
                          key={i}
                          className={`h-[100px] px-2 py-2 align-top border cursor-pointer hover:bg-gray-50 transition ${
                            isPast ? 'cursor-not-allowed opacity-50 hover:bg-transparent' : ''
                          }`}
                          onClick={() => !isPast && handleGridClick({ date, session })}
                        >
                          {sessionAppointments.map((app, idx) => (
                            <div
                              key={idx}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full text-left break-words whitespace-normal"
                              style={{ wordBreak: 'break-word' }}
                            >
                              <AppointmentCard
                                app={app}
                                onCancel={() =>
                                  setAppointments((prev) => prev.filter((a) => a !== app))
                                }
                                onShowDetails={() => setDetailsAppointment(app)}
                              />
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Appointment Form */}
      {formVisible && (
        <AppointmentForm
          selectedDate={formDate}
          onClose={() => setFormVisible(false)}
          onAdd={handleAddAppointment}
          appointments={appointments}
        />
      )}

      {/* Appointment Details Modal */}
      {/* ... your existing code ... */}

      {/* Appointment Details Modal */}
      {detailsAppointment && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
          onClick={() => setDetailsAppointment(null)}
        >
          <div
            className="bg-white p-6 rounded-md w-[800px] shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold font-segoe mb-4">Applicant Details</h3>

            <div className="space-y-2 text-sm">
              <div>
                <strong>Applicant Name:</strong> {detailsAppointment.name || 'N/A'}
              </div>
              <div>
                <strong>Application Number:</strong> {detailsAppointment.applicationId}
              </div>
              <div>
                <strong>Address:</strong> {detailsAppointment.address}
              </div>
              <div>
                <strong>Phone:</strong> {detailsAppointment.phone}
              </div>
              <div>
                <strong>Session:</strong> {detailsAppointment.session}
              </div>
              <div>
                <strong>Date:</strong> {detailsAppointment.date}
              </div>

              {/* Dropdown for Cancel Visit / Revisit */}
              <div className="mt-4">
                <label htmlFor="status" className="block text-sm font-medium font-segoe text-gray-700 mb-1">
                  Update Status
                </label>
                <select
                  id="status"
                  className="block w-full rounded-md border border-gray-300 p-2 text-sm"
                  value={detailsAppointment.status || ''}
                  onChange={(e) =>
                    setDetailsAppointment({
                      ...detailsAppointment,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="">Select status</option>
                  <option value="C">Cancel Visit</option>
                  <option value="R">Re visit</option>
                </select>
              </div>

              {/* Editable Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium font-segoe text-gray-700 mb-1">
                  Add Description
                </label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm resize-none"
                  value={detailsAppointment.description || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const byteLength = new TextEncoder().encode(val).length;
                    if (byteLength <= 100) {
                      setDetailsAppointment({ ...detailsAppointment, description: val });
                    }
                  }}
                  placeholder="Enter description"
                  style={{ backgroundColor: '#F9FAFB' }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {new TextEncoder().encode(detailsAppointment.description || '').length}/100 bytes
                </p>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button
                onClick={() => setDetailsAppointment(null)}
                className="px-2 py-2 border rounded hover:bg-gray-100"
                style={{ color: '#ffffff', backgroundColor: '#b33333', padding: "8px 24px" }} 
              >
                Close
              </button>

              {/* UPDATED Cancel Visiting button: calls API to update status and description */}
              <button
                onClick={() => {
                  if (!detailsAppointment.appointmentId || !detailsAppointment.deptId) {
                    alert('Missing appointment identifiers.');
                    return;
                  }

                  api.put(
                     `/scheduler/appointments/${detailsAppointment.appointmentId}/${detailsAppointment.deptId}`,
                      {
                        status: detailsAppointment.status,
                        description: detailsAppointment.description,
                        // Include other fields if your backend requires them
                      }
                    )
                    .then(() => {
                      // Update local appointments state to reflect the changes
                      setAppointments((prev) =>
                        prev.map((app) =>
                          app.appointmentId === detailsAppointment.appointmentId &&
                          app.deptId === detailsAppointment.deptId
                            ? {
                                ...app,
                                status: detailsAppointment.status,
                                description: detailsAppointment.description,
                              }
                            : app
                        )
                      );
                      setDetailsAppointment(null);
                    })
                    .catch((err) => {
                      console.error('Failed to update appointment:', err);
                      alert('Failed to update appointment.');
                    });
                }}
                className="px-2 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                style={{ color: '#ffffff', backgroundColor: '#4CAF50', padding: "8px 28px" }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CalendarGrid;
