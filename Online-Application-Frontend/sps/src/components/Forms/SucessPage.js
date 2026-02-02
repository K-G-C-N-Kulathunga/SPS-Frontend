import { useLocation, useHistory } from "react-router-dom";
import axios from "axios";
import "./SuccessPage.css";

const SuccessPage = () => {
  const location = useLocation();
  const history = useHistory();

  // Get application number and customer name from location state or session storage
  const stateNo = location.state?.applicationNo;
  const stateName = location.state?.customerName;

  const applicationNo =
    stateNo || sessionStorage.getItem("lastApplicationNo") || "—";
  const customerName =
    stateName || sessionStorage.getItem("lastCustomerName") || "Customer";

  // Handle PDF download
  const handleDownload = async () => {
    if (applicationNo === "—") {
      alert("No valid Application Number found to download.");
      return;
    }

    try {
      // 🔹 Replace 'sps' with your actual WildFly context path
      const response = await axios.get(
        "http://localhost:9090/sps/report/download-application",
        {
          params: { applicationNo },
          responseType: "blob", // Handle as binary file
        }
      );

      // Create a blob URL for the downloaded file
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link to trigger download
      const link = document.createElement("a");
      link.href = url;

      // Replace slashes in filename to avoid issues
      link.download = `Application_${applicationNo.replaceAll("/", "_")}.pdf`;

      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download the PDF. Please check your backend connection.");
    }
  };

  // Handle exit (clear session & local storage and redirect)
  const handleExit = () => {
    sessionStorage.removeItem("lastApplicationNo");
    sessionStorage.removeItem("lastCustomerName");
    localStorage.removeItem("tempId");
    localStorage.removeItem("passingTempId");

    history.replace("/"); // Redirect to homepage
  };

  return (
    <div className="success-container">
      <h2>Application Submitted Successfully!</h2>
      <p>
        Dear {customerName}, your application has been successfully submitted.
      </p>
      <p>
        Your reference number is: <strong>{applicationNo}</strong>
      </p>

      <div className="button-group">
        <button
          className="download-btn"
          onClick={handleDownload}
        >
          Download Application PDF
        </button>

        <button className="exit-btn" onClick={handleExit}>
          Exit
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
