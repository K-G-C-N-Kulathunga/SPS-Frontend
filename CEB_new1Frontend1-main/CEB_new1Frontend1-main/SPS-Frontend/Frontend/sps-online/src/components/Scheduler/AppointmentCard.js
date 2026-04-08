import React, { useState } from 'react';

const AppointmentCard = ({ app, onCancel, onShowDetails }) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div>
      <div
        style={{
          fontSize: '10px',
          backgroundColor: app.session === 'Evening' ? '#b33333' : '#4CAF50', // green for morning
          padding: '0.25rem', // p-1
          borderRadius: '0.25rem', // rounded
          marginBottom: '0.25rem', // mb-1
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          color: app.session === 'Evening' ? '#ffffff' : '#ffffff', // white text for both
        }}
        onMouseEnter={(e) => {
          if (app.session === 'Evening') e.currentTarget.style.backgroundColor = '#992d2d';
          else e.currentTarget.style.backgroundColor = '#45a049'; // darker green hover
        }}
        onMouseLeave={(e) => {
          if (app.session === 'Evening') e.currentTarget.style.backgroundColor = '#b33333';
          else e.currentTarget.style.backgroundColor = '#4CAF50';
        }}
        onClick={() => onShowDetails(app)}
      >
        {app.applicationId}
      </div>

      {showInfo && (
        <div className="bg-white shadow p-2 text-sm rounded">
          <div><strong>Address:</strong> {app.address}</div>
          <div><strong>Phone:</strong> {app.phone}</div>
          <button
            onClick={onCancel}
            className="mt-2 text-red-600 hover:underline text-sm"
          >
            Cancel Visiting
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
