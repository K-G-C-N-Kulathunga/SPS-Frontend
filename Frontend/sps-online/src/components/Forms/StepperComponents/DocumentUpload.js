import React from 'react';

const DocumentUpload = ({ formData, handleChange }) => {
  return (
      <div className="form-box">
        
        {/* ID Copy */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <label className="form-label required w-1/2">ID Copy</label>
          <div className="w-1/2">
             <div className="file-upload-wrapper">
                <input
                    type="file"
                    id="idCopy"
                    name="idCopy"
                    accept=".pdf,.jpg"
                    onChange={handleChange}
                    className="hidden"
                />
                <label htmlFor="idCopy" className="file-choose-btn">
                    Choose File
                </label>
                <span className="file-name-text" title={formData.idCopy ? formData.idCopy.name : ""}>
                    {formData.idCopy ? formData.idCopy.name : "No file chosen"}
                </span>
             </div>
          </div>
        </div>

        {/* Ownership Certificate */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <label className="form-label required w-1/2">Ownership Certificate</label>
          <div className="w-1/2">
             <div className="file-upload-wrapper">
                <input
                    type="file"
                    id="ownershipCertificate"
                    name="ownershipCertificate"
                    accept=".pdf,.jpg"
                    onChange={handleChange}
                    className="hidden"
                />
                <label htmlFor="ownershipCertificate" className="file-choose-btn">
                    Choose File
                </label>
                <span className="file-name-text" title={formData.ownershipCertificate ? formData.ownershipCertificate.name : ""}>
                    {formData.ownershipCertificate ? formData.ownershipCertificate.name : "No file chosen"}
                </span>
             </div>
          </div>
        </div>

        {/* Grama Niladhari Certificate */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <label className="form-label required w-1/2">Grama Niladhari Certificate</label>
          <div className="w-1/2">
             <div className="file-upload-wrapper">
                <input
                    type="file"
                    id="gramaNiladhariCertificate"
                    name="gramaNiladhariCertificate"
                    accept=".pdf,.jpg"
                    onChange={handleChange}
                    className="hidden"
                />
                <label htmlFor="gramaNiladhariCertificate" className="file-choose-btn">
                    Choose File
                </label>
                <span className="file-name-text" title={formData.gramaNiladhariCertificate ? formData.gramaNiladhariCertificate.name : ""}>
                    {formData.gramaNiladhariCertificate ? formData.gramaNiladhariCertificate.name : "No file chosen"}
                </span>
             </div>
          </div>
        </div>

        {/* Charted Engineer Certificate */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <label className="form-label w-1/2">Charted Engineer Certificate</label>
          <div className="w-1/2">
             <div className="file-upload-wrapper">
                <input
                    type="file"
                    id="threephChartedEngineerCertificate"
                    name="threephChartedEngineerCertificate"
                    accept=".pdf,.jpg"
                    onChange={handleChange}
                    className="hidden"
                />
                <label htmlFor="threephChartedEngineerCertificate" className="file-choose-btn">
                    Choose File
                </label>
                <span className="file-name-text" title={formData.threephChartedEngineerCertificate ? formData.threephChartedEngineerCertificate.name : ""}>
                    {formData.threephChartedEngineerCertificate ? formData.threephChartedEngineerCertificate.name : "No file chosen"}
                </span>
             </div>
          </div>
        </div>
      </div>
  );
};

export default DocumentUpload;