import { useState } from "react";
import Header from "components/Headers/Header.js";

export default function NewPIVPage() {
  const [estimationNo, setEstimationNo] = useState("423.10/ENC/25/1369");
  const [pivType, setPivType] = useState("SERVICE CONNECTION");
  const [bankRef, setBankRef] = useState("");
  const [customerId, setCustomerId] = useState("723163781v");
  const [customerName, setCustomerName] = useState("S M RATHNASIRI");
  const [address, setAddress] = useState(
    "INFRONT OF KUMARA VIDYALAYA, ALUTHWEWA, SHRAWASTHIPURA"
  );
  const [telephone, setTelephone] = useState("0703480518");
  const [mobileNo, setMobileNo] = useState("0703480518");
  const [email, setEmail] = useState("nuwanchanuka123@gmail.com");
  const [customerVatReg, setCustomerVatReg] = useState("");
  const [jobDescription, setJobDescription] = useState(
    "SERVICE CONNECTION - New Connection"
  );

  const costCenter = "423.10";
  const pivDate = "24/11/2025";

  const lineItems = [
    { code: "L5610", description: "CONSUMER DEPOSITS - CAPITAL JOBS", amount: 37500.0 },
    { code: "L5228", description: "NATION BUILDING TAX PAYABLE", amount: 0.0 },
    { code: "L5221", description: "SSCL PAYABLE ON OTHER SERVICES", amount: 961.54 },
    {
      code: "L5600",
      description: "ORDINARY SUPPLY CONSUMER SECURITY DEPOSITS-CONSUMP. OF ELEC.",
      amount: 0.0,
    },
    {
      code: "L5625",
      description: "CONSUMER DEPOSIT AGAINST ADDITIONAL MV NETWORK DEVELOPMENT F",
      amount: 0.0,
    },
  ];

  const total = lineItems.reduce((sum, item) => sum + item.amount, 0);

  const container = {
    minHeight: "50vh",
    backgroundColor: "#f8fafc",
    padding: "30px",
    fontFamily: "Arial, sans-serif",
  };

  const card = {
    backgroundColor: "white",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    padding: "30px",
    maxWidth: "1300px",
    margin: "auto",
    
  };

  const label = {
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "6px",
    color: "#374151",
    display: "block",
  };

  const input = {
    width: "70%",
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    backgroundColor: "#f9fafb",
    fontSize: "12px",
  };

  const findButton = {
    padding: "8px 20px",
    backgroundColor: "#0891b2",
    color: "white",
    borderRadius: "6px",
    fontWeight: "500",
    height: "35px",
    cursor: "pointer",
    border: "none",
  };

  const table = {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    overflow: "hidden",
  };

  const th = {
    textAlign: "left",
    padding: "12px 16px",
    fontWeight: "600",
    borderBottom: "1px solid #d1d5db",
    backgroundColor: "#f3f4f6",
    color: "#374151",
  };

  const td = {
    padding: "12px 16px",
    borderBottom: "1px solid #e5e7eb",
    color: "#374151",
    fontSize: "14px",
  };

  const totalRow = { backgroundColor: "#f3f4f6", fontWeight: "700" };

  const button = {
    padding: "10px 22px",
    backgroundColor: "#e5e7eb",
    color: "#1f2937",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
  };

  const nextButton = { ...button, backgroundColor: "#0891b2", color: "white" };

  const row = {
    display: "flex",
    marginBottom: "15px",
  };

  const leftLabel = {
    flex: 1,
    fontWeight: 600,
    color: "#374151",
  };

  const rightValue = {
    flex: 1,
    color: "#374151",
  };

  return (
    <div>
    <Header />
    {(container.backgroundColor = "#b33333") && null}
    <div style={container}>
      

      <div style={card}>
        <h5 style={{ fontSize: "1.1rem", fontWeight: 700, textAlign: "center", color: "#111827", marginBottom: "2rem", marginTop: "0.1rem" }}>Paying in Voucher - Estimation</h5>

        <div style={{ fontSize: "0.8rem",display: "flex", gap: "40px" }}>
          {/* LEFT SIDE */}

          <div style={{ flex: 1,width: "100%" }}>
            {/* Estimation No + Find */}
            <div style={{ display: "flex", width: "90%", gap: "2px", marginBottom: "25px" }}>
              <div style={{ flex: 0.6 }}>
                <label style={label}>Estimation No *</label>
                <input
                  type="text"
                  value={estimationNo}
                  onChange={(e) => setEstimationNo(e.target.value)}
                  style={input}
                />
              </div>

              <div style={{  display: "flex", alignItems: "flex-end" }}>
                <button style={findButton}>Find</button>
              </div>
            </div>
             <div></div>
            {/* PIV Type */}
            <div style={row}  >
                <div style={{ ...leftLabel, flex: 0.6 }}>PIV Type *</div>
              <div style={rightValue}>: {pivType}</div>
            </div>

            

            

            {/* Customer ID */}
            <div style={row}>
              <div style={{ ...leftLabel, flex: 0.6 }}>Customer ID *</div>
              <div style={rightValue}>: {customerId}</div>
            </div>

            {/* Customer Name */}
            <div style={row}>
 <div style={{ ...leftLabel, flex: 0.6 }}>Customer Name *</div>
              <div style={rightValue}>: {customerName}</div>
            </div>

            {/* Address */}
            <div style={row}>
              <div style={{ ...leftLabel, flex: 0.6 }}>Address</div>
              <div style={rightValue}>: {address}</div>
            </div>

            {/* Telephone */}
            <div style={row}>
              <div style={{ ...leftLabel, flex: 0.6 }}>Telephone</div>
              <div style={rightValue}>: {telephone}</div>
            </div>

            {/* Mobile */}
            <div style={row}>
              <div style={{ ...leftLabel, flex: 0.6 }}>Mobile No *</div>
              <div style={rightValue}>: {mobileNo}</div>
            </div>

            {/* Email */}
            <div style={row}>
              <div style={{ ...leftLabel, flex: 0.6 }}>Email</div>
              <div style={rightValue}>: {email}</div>
            </div>

            {/* VAT (INPUT BOX IN SAME ROW) */}
            <div style={row}>
                <div style={{ ...leftLabel, flex: 0.6 }}>Customer VAT Reg. No *</div>
                <div style={{ ...rightValue, display: "flex", alignItems: "center" }}>
                    :&nbsp;
                    <input
                        type="text"
                        value={customerVatReg}
                        onChange={(e) => setCustomerVatReg(e.target.value)}
                        style={{ ...input, width: "85%", marginLeft: "8px" }}
                    />
                </div>
            </div>

            {/* Job Description (INPUT BOX REMAINS) */}
            <div style={{ marginBottom: "30px" }}>
              <label style={label}>Job Description</label>
              <textarea
                rows="3"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                style={{ ...input, resize: "none", height: "80px" }}
              />
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div style={{ flex: 1 }}>
            <div style={row}>
              <div style={{ ...leftLabel, flex: 0.2 }}> PIVDate</div>
              <div style={rightValue}>: {pivDate}</div>
            </div>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Code No</th>
                  <th style={th}>Description</th>
                  <th style={{ ...th, textAlign: "right" }}>Amount</th>
                </tr>
              </thead>

              <tbody>
                {lineItems.map((item, index) => (
                  <tr key={index}>
                    <td style={td}>{item.code}</td>
                    <td style={td}>{item.description}</td>
                    <td style={{ ...td, textAlign: "right", fontWeight: "600" }}>
                      {item.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}

                <tr style={totalRow}>
                  <td style={td}></td>
                  <td style={{ ...td, fontWeight: "700" }}>Total</td>
                  <td style={{ ...td, textAlign: "right", fontWeight: "800" }}>
                    {total.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Amount in words */}
            <div
              style={{
                marginTop: "20px",
                backgroundColor: "#f3f4f6",
                padding: "12px",
                borderRadius: "6px",
              }}
            >
              <p style={{ fontSize: "12px", color: "#374151" }}>
                <strong>Amount in Words: </strong>
                Thirty Eight Thousand Four Hundred Sixty One Rupees and Fifty Four
                Cents Only.
              </p>
            </div>

            {/* Bottom Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "30px",
                paddingTop: "20px",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <button style={button}>Save & Print</button>
              <button style={button}>Print</button>
              <button style={button}>Clear</button>
              <button style={nextButton}>NEXT</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
