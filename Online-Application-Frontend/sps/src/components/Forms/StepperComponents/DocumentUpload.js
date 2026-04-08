import React, { useEffect, useMemo, useRef, useState } from "react";

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// PDF + JPEG only
const ACCEPT = ".pdf,.jpg,.jpeg";

const truncateFileName = (name = "", max = 28) => {
  if (!name) return "No file chosen";
  if (name.length <= max) return name;

  const dot = name.lastIndexOf(".");
  const ext = dot > 0 ? name.slice(dot) : "";
  const base = dot > 0 ? name.slice(0, dot) : name;

  const keep = Math.max(10, max - ext.length - 3);
  return `${base.slice(0, keep)}...${ext}`;
};

const getExt = (name = "") => {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
};

const isAllowedType = (file) => {
  if (!file) return false;

  const ext = getExt(file.name);
  const okExt = ["pdf", "jpg", "jpeg"].includes(ext);

  // Some browsers may give empty file.type, so ext check is main
  const okMime =
    file.type === "application/pdf" ||
    file.type === "image/jpeg" ||
    file.type === "image/jpg" ||
    file.type === "";

  return okExt && okMime;
};

const DocumentUpload = ({ formData, handleChange }) => {
  const [errors, setErrors] = useState({});
  const [fileUrls, setFileUrls] = useState({
    idCopy: null,
    ownershipCertificate: null,
    gramaNiladhariCertificate: null,
    threephChartedEngineerCertificate: null,
  });

  const inputRefs = useRef({
    idCopy: null,
    ownershipCertificate: null,
    gramaNiladhariCertificate: null,
    threephChartedEngineerCertificate: null,
  });

  // cleanup object urls
  useEffect(() => {
    return () => {
      Object.values(fileUrls).forEach((u) => {
        if (u) URL.revokeObjectURL(u);
      });
    };
  }, [fileUrls]);

  const setFileUrlForField = (field, file) => {
    setFileUrls((prev) => {
      if (prev[field]) URL.revokeObjectURL(prev[field]);
      return { ...prev, [field]: file ? URL.createObjectURL(file) : null };
    });
  };

  const onPick = (field) => {
    const el = inputRefs.current[field];
    if (el) el.click();
  };

  const downloadSelected = (field) => {
    const file = formData?.[field];
    const url = fileUrls?.[field];
    if (!file || !url) return;

    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0];
    if (!file) return;

    if (!isAllowedType(file)) {
      setErrors((prev) => ({ ...prev, [name]: "Only PDF or JPEG files are allowed." }));
      e.target.value = "";
      setFileUrlForField(name, null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrors((prev) => ({
        ...prev,
        [name]: `File size must not exceed ${MAX_FILE_SIZE_MB} MB`,
      }));
      e.target.value = "";
      setFileUrlForField(name, null);
      return;
    }

    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFileUrlForField(name, file);
    handleChange(e);
  };

  const DocLabel = ({ title, description, required }) => (
  <div style={{ lineHeight: "1.6" }}>
    <div
      style={{
        fontWeight: 600,
        fontSize: 14,
        color: "#111827",
        marginBottom: 4,
      }}
    >
      {title}
      {required && (
        <span style={{ color: "#dc2626", marginLeft: 2 }}>*</span>
      )}
    </div>

    <div
      style={{
        fontSize: 12.5,
        color: "#4b5563",
      }}
    >
      {description}
    </div>
  </div>
);



  const rows = useMemo(
  () => [
    {
      name: "idCopy",
      required: true,
      label: (
        <DocLabel
          title="Identity Document"
          required
          description="Copy of the National Identity Card / Passport / Driving License / Business Registration certificate of the New Tariff Customer or any other supporting document."
        />
      ),
    },
    {
      name: "ownershipCertificate",
      required: true,
      label: (
        <DocLabel
          title="Ownership / Occupancy Proof"
          required
          description="Deed / Assessment notice / Certificate of Ownership / Registered Lease / Rental Agreement"
        />
      ),
    },
    {
      name: "gramaNiladhariCertificate",
      required: true,
      label: (
        <DocLabel
          title="Residency Confirmation"
          required
          description="Grama Niladhari Certificate / Address on National Identity Card / Addressverification from a Water or Fixed Telephone bill"
        />
      ),
    },
    {
      name: "threephChartedEngineerCertificate",
      required: false,
      label: (
        <DocLabel
          title="Chartered Engineer Certificate"
          description="Required only for three-phase electricity connections"
        />
      ),
    },
  ],
  []
);

  return (
    <div className="form-box">
      <div style={{ 
        marginBottom: '24px', 
        padding: '12px 16px', 
        backgroundColor: '#eff6ff', // Light blue background
        border: '1px solid #dbeafe', // Soft blue border
        borderLeft: '4px solid #2563eb', // Strong blue accent
        borderRadius: '6px',
        fontSize: '13px',
        color: '#1e40af', // Dark blue text
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{ fontSize: '16px' }}>ℹ️</span>
        <span>
          <strong>Note:</strong> Please upload <strong>PDF or JPEG</strong> files only. 
          Maximum file size: <strong>2MB</strong>.
        </span>
      </div>
      {rows.map((r) => {
  const file = formData?.[r.name];
  const shownName = truncateFileName(file?.name || "", 30);

  return (
    // 1. Remove flex-items-center so error doesn't force label to the middle vertically
    <div key={r.name} className="mb-0.5 flex justify-between gap-4">
      
      {/* LEFT SIDE: Label */}
      <label className="form-label w-1/2">
        {r.label}
      </label>

      {/* RIGHT SIDE: Controls + Error Column */}
      <div className="w-1/2 flex flex-col items-end">
        
        {/* Input & Buttons Container */}
        <div style={{
          width: 420,
          display: "flex",
          alignItems: "center",
          gap: 10,
          justifyContent: "flex-end",
        }}>
          <input
            ref={(el) => (inputRefs.current[r.name] = el)}
            type="file"
            name={r.name}
            accept={ACCEPT}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          <button
            type="button"
            onClick={() => onPick(r.name)}
            style={{
              width: 110,
              border: "1px solid #aaa",
              background: "#f3f4f6",
              padding: "6px 10px",
              borderRadius: 4,
              cursor: "pointer",
              whiteSpace: "nowrap",
              textAlign: "center",
              flexShrink: 0,
            }}
          >
            Choose File
          </button>

          <button
            type="button"
            onClick={() => downloadSelected(r.name)}
            disabled={!file}
            title={file ? file.name : "No file chosen"}
            style={{
              width: 290,
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: file ? "pointer" : "default",
              color: file ? "#2563eb" : "#6b7280",
              textDecoration: file ? "underline" : "none",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              textAlign: "left",
              flexShrink: 0,
            }}
          >
            {shownName}
          </button>
        </div>

        {/* ERROR MESSAGE: Now correctly placed under the buttons */}
        {errors[r.name] && (
          <div style={{
            width: 420, // Match the button container width
            marginTop: 4,
            color: "#dc2626", // Professional red
            fontSize: "12px",
            textAlign: "left", // Aligns with the "No file chosen" text
            fontWeight: "500"
          }}>
            {errors[r.name]}
          </div>
        )}
      </div>
    </div>
  );
})}
    </div>
  );
};

export default DocumentUpload;