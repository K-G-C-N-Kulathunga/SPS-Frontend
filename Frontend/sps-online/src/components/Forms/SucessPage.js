import { useLocation } from "react-router-dom";
import "./SuccessPage.css";

const SuccessPage = () => {
  const location = useLocation();
  const stateNo = location.state?.applicationNo;
  const stateName = location.state?.customerName;

  const applicationNo = stateNo || sessionStorage.getItem("lastApplicationNo") || "—";
  const customerName = stateName || sessionStorage.getItem("lastCustomerName") || "Customer";

  return (
    <div className="success-container">
      <h2>Application Submitted Successfully!</h2>
      <p>Dear {customerName}, your application has been successfully submitted.</p>
      <p>Your reference number is: <strong>{applicationNo}</strong></p>
    </div>
  );
};

export default SuccessPage;
