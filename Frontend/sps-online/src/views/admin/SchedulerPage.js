import React, { useState } from 'react';
import CalendarGrid from "components/Scheduler/CalendarGrid";
import AppointmentForm from "components/Scheduler/AppointmentForm";

const SchedulerPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleDateClick = ({ date, session }) => {
    setSelectedSlot({ date, session });
    setShowForm(true);
  };

  const handleAddAppointment = (appointment) => {
    setAppointments((prev) => [...prev, appointment]);
    setShowForm(false);
  };

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: "#b33333",
        minHeight: "100%", // full height to fit screen
        width: "100%",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* <h1 className="text-3xl font-bold mb-6 text-white text-center"
      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
        Calendar
      </h1> */}

      <div className="bg-white p-6 rounded-lg h-full"
      style={{ backgroundColor: '#F9FAFB', marginTop: '30px', borderRadius: '10px', height: '500px' }}>
        <CalendarGrid
          appointments={appointments}
          setAppointments={setAppointments}
          onDateClick={handleDateClick}
        />
      </div>

      {showForm && (
        <AppointmentForm
          selectedDate={selectedSlot.date}
          onAdd={handleAddAppointment}
          onClose={() => setShowForm(false)}
          appointments={appointments}
        />
      )}
    </div>
  );
};

export default SchedulerPage;
