// CalendarGrid.js

import React, { useState, useEffect, useMemo } from 'react';
import AppointmentCard from './AppointmentCard';
import AppointmentForm from './AppointmentForm';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './calendar.css';
import { api } from '../../api';

// Map imports
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default Leaflet marker icons (for CRA/Vite bundlers)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DEFAULT_CENTER = { lat: 6.9271, lng: 79.8612 }; // Colombo

const CalendarGrid = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [startDate, setStartDate] = useState(new Date(today));
  const [formVisible, setFormVisible] = useState(false);
  const [formDate, setFormDate] = useState(null);

  const [appointments, setAppointments] = useState([]);
  const [detailsAppointment, setDetailsAppointment] = useState(null);

  // ------------ Fetch appointments (with lat/lng from backend) ------------
  const deptId = '411.40'; // change if needed
  useEffect(() => {
    api
      .get(`/scheduler/appointments?deptId=${deptId}`)
      .then((res) => {
        console.log('Appointments from backend:', res.data);
        setAppointments(res.data);
      })
      .catch((err) => {
        console.error('Error fetching appointments:', err);
        alert('Failed to fetch appointments from server.');
      });
  }, [deptId]);

  // ------------ Helpers ------------
  const getWeekDates = (start) =>
    Array.from({ length: 5 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });

  const weekDates = getWeekDates(startDate);

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

  // ------- Read coordinates from appointment object (from backend) -------
  // Expecting: latitude, longitude (from AppointmentResponseDto)
  const getCoords = (obj) => {
    if (!obj) return null;

    const lat = parseFloat(
      obj.latitude ?? obj.lat ?? obj.serviceLatitude ?? obj?.location?.lat
    );
    const lng = parseFloat(
      obj.longitude ?? obj.lng ?? obj.serviceLongitude ?? obj?.location?.lng
    );

    console.log('getCoords input:', obj);
    console.log('parsed lat/lng:', lat, lng);

    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    return null;
  };

  // 🔹 All appointments that have valid coordinates
  const appointmentsWithCoords = useMemo(
    () =>
      appointments
        .map((a) => ({ ...a, coords: getCoords(a) }))
        .filter((a) => a.coords),
    [appointments]
  );

  const detailsCoords = getCoords(detailsAppointment);

  // Map center priority:
  // 1) detailsAppointment with coords
  // 2) first appointment with coords
  // 3) DEFAULT_CENTER
  const mapCenter = useMemo(() => {
    if (detailsCoords) return detailsCoords;
    if (appointmentsWithCoords.length > 0) {
      return appointmentsWithCoords[0].coords;
    }
    return DEFAULT_CENTER;
  }, [detailsCoords, appointmentsWithCoords]);

  // ------------ Render ------------
  return (
    <div className="flex flex-col w-full px-[1px]">
      {/* Top row: Calendar (left) + Weekly table (right) + Map below them INSIDE this div */}
      <div className="flex flex-col lg:flex-row lg:flex-wrap w-full h-[600px] gap-6">
        {/* Left Calendar */}
        <div className="inline-block p-4 rounded-xl bg-white shadow-md lg:w-1/4">
          <h2 className="text-base font-semibold font-segoe text-gray-900 mb-4">
            Calendar
          </h2>
          <Calendar
            onChange={handleCalendarSelect}
            value={formDate || today}
            tileDisabled={({ date, view }) => {
              if (view === 'month') {
                const d = new Date(date);
                d.setHours(0, 0, 0, 0);
                return d < today; // disable past dates
              }
              return false;
            }}
            tileClassName={({ date, view }) => {
              if (view === 'month') {
                const d = new Date(date);
                d.setHours(0, 0, 0, 0);

                if (d < today) return 'disabled-tile';
                if (formDate && d.getTime() === formDate.getTime())
                  return 'selected-tile';
              }
              return null;
            }}
            minDate={today}
          />
        </div>

        {/* Weekly Table */}
        <div className="w-full h-full lg:flex-1 px-1">
          <div className="bg-white rounded-xl shadow-md p-4 w-full h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold font-segoe text-gray-900">
                Weekly Schedule
              </h2>
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
                        <div className="text-lg font-bold font-segoe">
                          {date.getDate()}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {['Morning', 'Evening'].map((session) => (
                    <tr key={session} className="border border-gray-300">
                      <td
                        className="text-black font-semibold font-segoe text-sm tracking-wide border px-4 py-2"
                        style={{ backgroundColor: '#F9FAFB' }}
                      >
                        {session}
                      </td>

                      {weekDates.map((date, i) => {
                        const dateKey = formatDateKey(date);
                        const sessionAppointments = appointments.filter(
                          (app) => app.date === dateKey && app.session === session
                        );

                        const d = new Date(date);
                        d.setHours(0, 0, 0, 0);
                        const isPast = d < today;

                        return (
                          <td
                            key={i}
                            className={`h-[100px] px-2 py-2 align-top border cursor-pointer hover:bg-gray-50 transition ${
                              isPast
                                ? 'cursor-not-allowed opacity-50 hover:bg-transparent'
                                : ''
                            }`}
                            onClick={() =>
                              !isPast && handleGridClick({ date, session })
                            }
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
                                    setAppointments((prev) =>
                                      prev.filter((a) => a !== app)
                                    )
                                  }
                                  onShowDetails={() =>
                                    setDetailsAppointment(app)
                                  }
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

        {/* ALWAYS-VISIBLE MAP (under calendar + weekly table, INSIDE this div) */}
        <div
          className="bg-white rounded-xl shadow-md p-4 w-full lg:w-full mt-4 flex flex-col gap-3"
          style={{ zIndex: 10, height: '700px' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold font-segoe text-gray-900">
              Location Map
            </h3>
            <span className="text-xs text-gray-500">
              {detailsCoords
                ? `Centered on: ${detailsAppointment.applicationId}`
                : appointmentsWithCoords.length > 0
                ? `Showing ${appointmentsWithCoords.length} appointments`
                : `Default view (Colombo)`}
            </span>
          </div>

          <div
            style={{
              width: '100%',
              height: 700,
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <MapContainer
              center={mapCenter}
              zoom={16}
              scrollWheelZoom
              style={{ width: '100%', height: '100%' }}
              key={`${mapCenter.lat}-${mapCenter.lng}`}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* 🔹 Marker for ALL appointments that have coords */}
              {appointmentsWithCoords.map((app) => (
                <Marker key={app.appointmentId} position={app.coords}>
                  <Popup>
                    <div style={{ fontSize: '15px', height: '150px', width: '300px' }}>
                      <div>
                        <strong>{app.name || 'Applicant'}</strong>
                      </div>
                      <div>App ID: {app.appointmentId}</div>
                      <div>Date: {app.date}</div>
                      <div>Session: {app.session}</div>
                      <div className='font-bold mt-1'>Mobile: {app.phone}</div>
                      <div style={{ marginTop: '4px' }}>
                        {app.address || 'No address'}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
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
            <h3 className="text-lg font-semibold font-segoe mb-4">
              Applicant Details
            </h3>

            <div className="space-y-2 text-sm">
              <div>
                <strong>Applicant Name:</strong>{' '}
                {detailsAppointment.name || 'N/A'}
              </div>
              <div>
                <strong>Application Number:</strong>{' '}
                {detailsAppointment.applicationId}
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

              <div className="mt-4">
                <label
                  htmlFor="status"
                  className="block text-sm font-medium font-segoe text-gray-700 mb-1"
                >
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

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium font-segoe text-gray-700 mb-1"
                >
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
                      setDetailsAppointment({
                        ...detailsAppointment,
                        description: val,
                      });
                    }
                  }}
                  placeholder="Enter description"
                  style={{ backgroundColor: '#F9FAFB' }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {new TextEncoder().encode(
                    detailsAppointment.description || ''
                  ).length}
                  /100 bytes
                </p>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button
                onClick={() => setDetailsAppointment(null)}
                className="px-2 py-2 border rounded hover:bg-gray-100"
                style={{
                  color: '#ffffff',
                  backgroundColor: '#b33333',
                  padding: '8px 24px',
                }}
              >
                Close
              </button>

              <button
                onClick={() => {
                  if (
                    !detailsAppointment.appointmentId ||
                    !detailsAppointment.deptId
                  ) {
                    alert('Missing appointment identifiers.');
                    return;
                  }

                  api
                    .put(
                      `/scheduler/appointments`,
                      {
                        status: detailsAppointment.status,
                        description: detailsAppointment.description,
                      },
                      {
                        params: {
                          appointmentId: detailsAppointment.appointmentId,
                          deptId: detailsAppointment.deptId,
                        },
                      }
                    )
                    .then(() => {
                      setAppointments((prev) =>
                        prev.map((app) =>
                          app.appointmentId ===
                            detailsAppointment.appointmentId &&
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
                className="px-2 py-2 text-white rounded hover:opacity-90"
                style={{ backgroundColor: '#4CAF50', padding: '8px 28px' }}
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
