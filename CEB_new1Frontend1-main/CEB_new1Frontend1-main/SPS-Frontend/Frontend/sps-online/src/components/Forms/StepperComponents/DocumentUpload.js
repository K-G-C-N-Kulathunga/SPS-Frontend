import React, { useState } from 'react';

const DocumentUpload = ({ formData, handleChange }) => {
  return (
      <div className="form-box">
        <div className="mb-4 flex items-center justify-between gap-4">
          <label className="form-label required w-1/2">ID Copy</label>
          <input
              type="file"
              name="idCopy"
              accept=".pdf,.jpg"
              onChange={handleChange}
              className="w-1/2"
          />
        </div>
        <div className="mb-4 flex items-center justify-between gap-4">
          <label className="form-label required w-1/2">Ownership Certificate</label>
          <input
              type="file"
              name="ownershipCertificate"
              accept=".pdf,.jpg"
              onChange={handleChange}
              className="w-1/2"
          />
        </div>
        <div className="mb-4 flex items-center justify-between gap-4">
          <label className="form-label required w-1/2">Grama Niladhari Certificate</label>
          <input
              type="file"
              name="gramaNiladhariCertificate"
              accept=".pdf,.jpg"
              onChange={handleChange}
              className="w-1/2"
          />
        </div>
        <div className="mb-4 flex items-center justify-between gap-4">
          <label className="form-label w-1/2">Charted Engineer Certificate</label>
          <input
              type="file"
              name="threephChartedEngineerCertificate"
              accept=".pdf,.jpg"
              onChange={handleChange}
              className="w-1/2"
          />
        </div>
      </div>
  );
};

export default DocumentUpload;