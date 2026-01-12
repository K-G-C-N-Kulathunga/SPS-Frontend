import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { api } from '../../../api';

//const baseUrl = process.env.REACT_APP_BASE_URL;

// Fix default marker icon issues in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const LocationMarker = ({ position, onPositionChange }) => {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng);
    },
  });

  return (
      <Marker
          position={position}
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const { lat, lng } = e.target.getLatLng();
              onPositionChange({ lat, lng });
            },
          }}
      />
  );
};

const ServiceLocationDetails = ({
                                  formData,
                                  handleChange,
                                  setFormData, // This prop needs to be properly passed from the parent component
                                  customerData,
                                }) => {
  const [areas, setAreas] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [error, setError] = useState(null);
  const [cscs, setCscs] = useState([]);
  const [loadingCscs, setLoadingCscs] = useState(false);

  const [markerPosition, setMarkerPosition] = useState({
    lat: formData?.latitude || 6.9271, // Default: Colombo
    lng: formData?.longitude || 79.8612,
  });

  const [isSelected, setIsSelected] = useState(false);

  // Create state to manage manually entered data
  const [manualData, setManualData] = useState({
    serviceStreetAddress: formData.serviceStreetAddress || "",
    serviceSuburb: formData.serviceSuburb || "",
    serviceCity: formData.serviceCity || "",
    servicePostalCode: formData.servicePostalCode || "",
  });

  // Create local state to track form values
  // const [localFormData, setLocalFormData] = useState({
  //   serviceStreetAddress: formData?.serviceStreetAddress || "",
  //   serviceSuburb: formData?.serviceSuburb || "",
  //   serviceCity: formData?.serviceCity || "",
  //   servicePostalCode: formData?.servicePostalCode || "",
  // });

  // Update local state when props change
// useEffect(() => {
//   if (
//     formData?.serviceStreetAddress !== localFormData.serviceStreetAddress ||
//     formData?.serviceSuburb !== localFormData.serviceSuburb ||
//     formData?.serviceCity !== localFormData.serviceCity ||
//     formData?.servicePostalCode !== localFormData.servicePostalCode
//   ) {
//     setLocalFormData({
//       serviceStreetAddress: formData?.serviceStreetAddress || "",
//       serviceSuburb: formData?.serviceSuburb || "",
//       serviceCity: formData?.serviceCity || "",
//       servicePostalCode: formData?.servicePostalCode || "",
//     });
//   }
// }, [formData]);

  // Handles the checkbox selection to copy customer data
//   const handleSameAsCustomerChange = async () => {
//     const newSelected = !isSelected;
//     setIsSelected(newSelected);
//
//     const tempId = localStorage.getItem("tempId");
//     console.log("tempId", tempId);
//
//     if (newSelected && tempId) {
//       try {
//         // Fetch address data from the API
//         const response = await fetch(
//           `http://localhost:9090/sps-3.3.5/api/online-applications/${tempId}/address`
//         );
//
//         if (!response.ok) {
//           throw new Error("Failed to fetch address data");
//         }
//
//         const addressData = await response.json();
//         console.log("Address data received:", addressData);
//
//         // Create the updated data object
//         const updatedData = {
//           serviceStreetAddress: addressData.streetName || "",
//           serviceSuburb: addressData.houseOrBuildingNo || "",
//           serviceCity: addressData.city || "",
//           servicePostalCode: addressData.postalCode || "",
//         };
//
//         console.log("Updated data to be applied:", updatedData);
//
//         // Update local state first
// setLocalFormData(updatedData);
// setFormData({...formData, ...updatedData});
//
//
//         // Update parent state based on available methods
//         if (typeof setFormData === 'function') {
//           setFormData({
//             ...formData,
//             ...updatedData
//           });
//         } else if (typeof handleChange === 'function') {
//           // Simulate change events for each field
//           Object.entries(updatedData).forEach(([name, value]) => {
//             handleChange({ target: { name, value } });
//           });
//         }
//       } catch (error) {
//         console.error("Error auto-filling address fields:", error);
//         alert("Failed to auto-fill address fields.");
//       }
//     } else {
//       // Checkbox unselected — clear the fields
//       const clearedData = {
//         serviceStreetAddress: "",
//         serviceSuburb: "",
//         serviceCity: "",
//         servicePostalCode: "",
//       };
//
//       // Update local state first
//       setLocalFormData(clearedData);
//
//       // Update parent state based on available methods
//       if (typeof setFormData === 'function') {
//         setFormData({
//           ...formData,
//           ...clearedData
//         });
//       } else if (typeof handleChange === 'function') {
//         // Simulate change events for each field
//         Object.entries(clearedData).forEach(([name, value]) => {
//           handleChange({ target: { name, value } });
//         });
//       }
//     }
//   };


  const handleSameAsCustomerChange = () => {
    setIsSelected((prevState) => {
      const newState = !prevState;

      if (newState) {
        // When checkbox is selected, copy customer details to form data
        setFormData({
          ...formData,
          serviceStreetAddress: customerData.streetAddress, // Use customerData prop
          serviceSuburb: customerData.suburb,
          serviceCity: customerData.city,
          servicePostalCode: customerData.postalCode,
        });
        setManualData({
          serviceStreetAddress: customerData.streetAddress,
          serviceSuburb: customerData.suburb,
          serviceCity: customerData.city,
          servicePostalCode: customerData.postalCode,
        });
      } else {
        // When checkbox is unselected, clear both form data and manual data
        setFormData({
          ...formData,
          serviceStreetAddress: "",
          serviceSuburb: "",
          serviceCity: "",
          servicePostalCode: "",
        });
        setManualData({
          serviceStreetAddress: "",
          serviceSuburb: "",
          serviceCity: "",
          servicePostalCode: "",
        });
      }

      return newState;
    });
  };


  useEffect(() => {
    const fetchAreas = async () => {
      setLoadingAreas(true);
      try {
        const response = await api.get(`/cscNo/areas`);
        setAreas(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching areas:", err);
        setError("Unable to load areas.");
      } finally {
        setLoadingAreas(false);
      }
    };

    fetchAreas();
  }, []);


// Add effect to fetch CSCs when area changes
  useEffect(() => {
    if (formData?.area) {
      const fetchCscs = async () => {
        setLoadingCscs(true);
        try {
          const response = await api.get(`/cscNo/cscs?area=${formData.area}`);
          // Axios already gives parsed JSON in response.data
          setCscs(response.data);
        } catch (err) {
          console.error("Error fetching CSCs:", err);
          setError("Unable to load CSCs.");
        } finally {
          setLoadingCscs(false);
        }
      };

      fetchCscs();
    } else {
      setCscs([]); // Reset CSCs when no area is selected
    }
  }, [formData?.area]);


  const handleMapPositionChange = (latlng) => {
    console.log("Map position changed:", latlng);
    setMarkerPosition(latlng);

    // Update both latitude and longitude
    if (typeof setFormData === 'function') {
      setFormData({
        ...formData,
        latitude: latlng.lat.toFixed(6),
        longitude: latlng.lng.toFixed(6)
      });
    } else if (typeof handleChange === 'function') {
      // Use handleChange as fallback
      handleChange({
        target: {
          name: 'latitude',
          value: latlng.lat.toFixed(6)
        }
      });
      handleChange({
        target: {
          name: 'longitude',
          value: latlng.lng.toFixed(6)
        }
      });
    }
  };

  // // Function to handle local field changes
  // const handleLocalFieldChange = (e) => {
  //   const { name, value } = e.target;
  //
  //   // Update local state
  //   setLocalFormData({
  //     ...localFormData,
  //     [name]: value
  //   });
  //
  //   // Update parent form data
  //   if (typeof setFormData === 'function') {
  //     setFormData({
  //       ...formData,
  //       [name]: value
  //     });
  //   } else if (typeof handleChange === 'function') {
  //     handleChange(e);
  //   }
  // };

  return (
      <div className="form-box">
        {error && <div className="error-message">{error}</div>}

        {/* CSC Dropdown */}
        <div className="form-box-inner">
          {/* <div className="form-group">
            <label className="form-label required" title="Nearet Counsumer Service Center">
              Nearest CSC
            </label>
            <select
                id="csc"
                name="deptId"
                className="form-select"
                value={formData?.deptId || ""}
                onChange={handleChange}
                disabled={loadingCscs || !formData?.area}
                required
            >
              <option value="">Select CSC</option>
              {cscs.map((csc) => (
                  <option key={csc.deptId} value={csc.deptId}>
                    {csc.deptFullName}
                  </option>
              ))}
            </select>
            {loadingCscs && <div>Loading CSCs...</div>}
          </div> */}
          <div className="form-group">
            <label className="form-label">Neighbour's Acc No:</label>
            <input
                type="text"
                id="neighboursAccNo"
                name="neighboursAccNo"
                className="form-input"
                value={formData.neighboursAccNo || ""}
                onChange={handleChange}
                maxLength={10}
                inputMode="numeric"
            />
          </div>
          <div className="form-group">
          </div>
        </div>

        <div className="form-box">
          {/* Address Inputs + Checkbox */}
          <div className="form-box-inner">
            <div className="checkbox-label">
              <label style={{ fontSize: "16px" }}>
                <input
                    type="checkbox"
                    className="checkbox-input"
                    style={{ paddingLeft: "5px" }}
                    checked={isSelected}
                    onChange={handleSameAsCustomerChange}
                />
                <span>Same as Customer Details</span>
              </label>
            </div>
          </div>

          {/* street name and house/building no */}
          <div className="form-box-inner">
            <div className="form-group">
              <label className="form-label required">Street Name:</label>
              <input
                  type="text"
                  id="serviceStreetAddress"
                  name="serviceStreetAddress"
                  className="form-input"
                  // value={localFormData.serviceStreetAddress}
                  // onChange={handleLocalFieldChange}
                  // required
                  value={manualData.serviceStreetAddress}
                  onChange={(e) =>
                      setManualData({ ...manualData, serviceStreetAddress: e.target.value })
                  }
              />
            </div>
            <div className="form-group">
              <label className="form-label required">House/Building No:</label>
              <input
                  type="text"
                  id="serviceSuburb"
                  name="serviceSuburb"
                  className="form-input"


                  // value={localFormData.serviceSuburb}
                  // onChange={handleLocalFieldChange}
                  // required
                  value={manualData.serviceSuburb}
                  onChange={(e) =>
                      setManualData({ ...manualData, serviceSuburb: e.target.value })
                  }
              />
            </div>
          </div>

          <div className="form-box-inner">
            {/* City + Postal Code */}
            <div className="form-group">
              <label className="form-label required">City:</label>
              <input
                  type="text"
                  id="serviceCity"
                  name="serviceCity"
                  className="form-input"
                  // value={localFormData.serviceCity}
                  // onChange={handleLocalFieldChange}
                  // required
                  value={manualData.serviceCity}
                  onChange={(e) =>
                      setManualData({ ...manualData, serviceCity: e.target.value })
                  }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Postal Code:</label>
              <input
                  type="text"
                  id="servicePostalCode"
                  name="servicePostalCode"
                  className="form-input"
                  // value={localFormData.servicePostalCode}
                  // onChange={handleLocalFieldChange}
                  // required
                  value={manualData.servicePostalCode}
                  onChange={(e) =>
                      setManualData({ ...manualData, servicePostalCode: e.target.value })
                  }
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          {/* Optional fields */}
          <div className="form-box-inner mt-5">
            <div className="form-group">
              <label className="form-label">Assessment No:</label>
              <input
                  type="text"
                  id="assessmentNo"
                  name="assessmentNo"
                  className="form-input"
                  value={formData?.assessmentNo || ""}
                  onChange={handleChange}
                  maxLength={10}
                  inputMode="numeric"
              />
            </div>
          </div>

          {/* Ownership */}
          <div className="form-row">
            <label className="form-label required">Ownership:</label>
            <div className="radio-group">
              <input
                  type="radio"
                  id="Occupy"
                  name="ownership"
                  value="Occupy"
                  checked={formData?.ownership === "Occupy"}
                  onChange={handleChange}
              />
              <label htmlFor="Occupy" className="radio-label">Owner</label>
              <input
                  type="radio"
                  id="Rent"
                  name="ownership"
                  value="Rent"
                  checked={formData?.ownership === "Rent"}
                  onChange={handleChange}
              />
              <label htmlFor="Rent" className="radio-label">Tenant</label>
            </div>
          </div>
        </div>

        {/* Latitude / Longitude and Map Container */}
        <div className="form-devide-map" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          marginTop: '20px'
        }}>
          {/* Right Column - Map */}
          <div style={{
            flex: 2,
            minWidth: '300px',
            height: '610px',
            maxWidth: '610px'
          }}>
            <MapContainer
                center={markerPosition}
                zoom={15}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker
                  position={markerPosition}
                  onPositionChange={handleMapPositionChange}
              />
            </MapContainer>
          </div>

          {/* Left Column - Latitude/Longitude Inputs */}
          <div style={{
            flex: 1,
            minWidth: '200px',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <div className="form-group">
              <label className="form-label">Latitude:</label>
              <input
                  type="text"
                  id="latitude"
                  name="latitude"
                  className="form-input-half"
                  value={formData?.latitude || ""}
                  onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Longitude:</label>
              <input
                  type="text"
                  id="longitude"
                  name="longitude"
                  className="form-input-half"
                  value={formData?.longitude || ""}
                  onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </div>
  );
};

export { ServiceLocationDetails };