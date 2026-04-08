// // components/map/AppointmentMap.jsx
// import React from "react";
// import { MapContainer, TileLayer, Marker } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";

// // Fix default marker icon in Leaflet (Vite/Create React App quirk)
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   iconRetinaUrl:
//     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
// });

// /**
//  * AppointmentMap
//  * Props:
//  *  - center: { lat, lng }    (map center; default Colombo)
//  *  - marker: { lat, lng }    (marker position; optional)
//  *  - onClose: () => void     (close handler)
//  */
// const AppointmentMap = ({
//   center = { lat: 6.9271, lng: 79.8612 },
//   marker = null,
//   onClose,
// }) => {
//   return (
//     <div
//       style={{
//         position: "fixed",
//         inset: 0,
//         zIndex: 60,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         background: "rgba(0,0,0,0.35)",
//         backdropFilter: "blur(2px)",
//       }}
//       onClick={onClose}
//     >
//       <div
//         className="bg-white rounded-xl shadow-xl"
//         style={{ width: 900, maxWidth: "92vw", padding: 16 }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="flex items-center justify-between mb-3">
//           <h3 className="text-base font-semibold">Location</h3>
//           <button
//             onClick={onClose}
//             className="px-3 py-1 border rounded hover:bg-gray-100"
//           >
//             Close
//           </button>
//         </div>

//         <div style={{ width: "100%", height: 520, borderRadius: 12, overflow: "hidden" }}>
//           <MapContainer
//             center={center}
//             zoom={16}
//             scrollWheelZoom
//             style={{ width: "100%", height: "100%" }}
//           >
//             <TileLayer
//               attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
//               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             />
//             {marker && <Marker position={marker} />}
//           </MapContainer>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AppointmentMap;
