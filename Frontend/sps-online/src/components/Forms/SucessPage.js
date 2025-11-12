import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom"; // For navigation button
import './SuccessPage.css'; // Import the CSS file

const SuccessPage = () => {
  const location = useLocation();
  const { applicationNo, customerName } = location.state || {};

  return (
    <div className="success-container">
    <h2>Application Submitted Successfully!</h2>
      <p>
        Dear {customerName}, your application has been successfully submitted.
      </p>
      <p>
        ✅ Your reference number is: <strong>{applicationNo}</strong>
      </p>
     {/*  <Link to="/landing">Go to Landing Page</Link> */}
    </div>
  );
};

export default SuccessPage;
