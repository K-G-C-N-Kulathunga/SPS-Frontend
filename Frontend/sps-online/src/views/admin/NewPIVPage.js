import { useState } from "react";
import Header from "components/Headers/Header.js";

export default function NewPIVPage() {

  const defaultItems = [
    { code: "L5610", description: "CONSUMER DEPOSITS - CAPITAL JOBS", amount: 0 },
    { code: "L5228", description: "NATION BUILDING TAX PAYABLE", amount: 0 },
    { code: "L5221", description: "SSCL PAYABLE ON OTHER SERVICES", amount: 0 },
    { code: "L5600", description: "CONSUMER DEPOSITS - CONSUMP ELECTRICITY", amount: 0 },
    { code: "L5625", description: "CONSUMER DEPOSIT AGAINST ADDITIONAL MV NETWORK DEVELOPMENT F", amount: 0 },
    { code: "L5626", description: "CONSUMER DEPOSIT AGAINST SYA WORKS(MORE THAN RS400,000)", amount: 0 }
  ];

  const [estimationNo, setEstimationNo] = useState("");
  const [pivType, setPivType] = useState("");
  const [bankRef, setBankRef] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [telephone, setTelephone] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [customerVatReg, setCustomerVatReg] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [lineItems, setLineItems] = useState(defaultItems);
  const [loading, setLoading] = useState(false);

  const costCenter = "423.10";
  const pivDate = new Date().toLocaleDateString();

  const total = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);

  const numberToWords = (num) => {
    if (!num) return "Zero Rupees Only";

    const a = ["","One","Two","Three","Four","Five","Six","Seven",
      "Eight","Nine","Ten","Eleven","Twelve","Thirteen",
      "Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];

    const b = ["","","Twenty","Thirty","Forty","Fifty",
      "Sixty","Seventy","Eighty","Ninety"];

    const inWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100)
        return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
      if (n < 1000)
        return a[Math.floor(n / 100)] + " Hundred" +
          (n % 100 ? " " + inWords(n % 100) : "");
      if (n < 1000000)
        return inWords(Math.floor(n / 1000)) + " Thousand" +
          (n % 1000 ? " " + inWords(n % 1000) : "");
      if (n < 1000000000)
        return inWords(Math.floor(n / 1000000)) + " Million" +
          (n % 1000000 ? " " + inWords(n % 1000000) : "");
      return "";
    };

    return inWords(Math.floor(num)) + " Rupees Only";
  };

  const handleFind = async () => {

    if (!estimationNo) {
      alert("Please enter Estimation Number");
      return;
    }

    // reset amounts to zero before loading
    setLineItems(defaultItems);

    try {

      setLoading(true);

      const basicAuth = 'Basic ' + btoa('admin:admin123');

      const customerUrl =
        `http://localhost:9090/sps/api/piv/customer-details?estimateNo=${encodeURIComponent(estimationNo)}`;

      const customerRes = await fetch(customerUrl,{
        method:'GET',
        headers:{
          'Authorization':basicAuth,
          'Content-Type':'application/json'
        }
      });

      if(!customerRes.ok) throw new Error("Customer not found");

      const c = await customerRes.json();

      setCustomerId(c.customerId || "");
      setCustomerName(c.customerName || "");
      setAddress(c.address || "");
      setTelephone(c.telephone || "");
      setMobile(c.mobile || "");
      setEmail(c.email || "");
      setCustomerVatReg(c.customerVatReg || "");
      setJobDescription(c.jobDescription || "");

      const pivTypeVal = c.pivType ?? 'PIV_SVC';
      const titleCd = pivTypeVal.replace('_','-');

      const pivTypeUrl =
        `http://localhost:9090/sps/api/piv/piv-type?titleCd=${titleCd}`;

      const pivTypeRes = await fetch(pivTypeUrl,{
        method:'GET',
        headers:{
          'Authorization':basicAuth,
          'Content-Type':'application/json'
        }
      });

      if(pivTypeRes.ok){
        const pivTypeData = await pivTypeRes.json();
        setPivType(pivTypeData.pivTypeName || "");
      }

      const chargeUrl =
        `http://localhost:9090/sps/api/piv/charges?titleCd=${titleCd}&pivType=${encodeURIComponent(pivTypeVal)}&estimateNo=${encodeURIComponent(estimationNo)}`;

      const chargeRes = await fetch(chargeUrl,{
        method:'GET',
        headers:{
          'Authorization':basicAuth,
          'Content-Type':'application/json'
        }
      });

      if(!chargeRes.ok) throw new Error("Charges not found");

      const chargeData = await chargeRes.json();

      setLineItems(
        (chargeData.charges || []).map(x => ({
          code: x.codeNo,
          description: x.description,
          amount: Number(x.amount || 0)
        }))
      );

    } catch(error){

      console.error(error);
      alert("Estimation not found or error fetching data!");

    } finally{

      setLoading(false);

    }

  };

  const handleClear = () => {

    setEstimationNo("");
    setPivType("");
    setBankRef("");
    setCustomerId("");
    setCustomerName("");
    setAddress("");
    setTelephone("");
    setMobile("");
    setEmail("");
    setCustomerVatReg("");
    setJobDescription("");
    setLineItems(defaultItems);
    setLoading(false);

  };

  const container = { minHeight: "50vh", backgroundColor: "#b33333", padding: "30px", fontFamily: "Arial, sans-serif" };
  const card = { backgroundColor: "white", borderRadius: "8px", border: "1px solid #e5e7eb", padding: "30px", maxWidth: "1300px", margin: "auto" };
  const label = { fontSize: "14px", fontWeight: "600", marginBottom: "6px", color: "#374151", display: "block" };
  const input = { width: "70%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px", backgroundColor: "#f9fafb", fontSize: "12px" };
  const findButton = { padding: "8px 20px", backgroundColor: "#0891b2", color: "white", borderRadius: "6px", fontWeight: "500", height: "35px", cursor: "pointer", border: "none" };
  const table = { width: "100%", borderCollapse: "collapse", backgroundColor: "#f9fafb", borderRadius: "8px", overflow: "hidden" };
  const th = { textAlign: "left", padding: "12px 16px", fontWeight: "600", borderBottom: "1px solid #d1d5db", backgroundColor: "#f3f4f6", color: "#374151" };
  const td = { padding: "12px 16px", borderBottom: "1px solid #e5e7eb", color: "#374151", fontSize: "14px" };
  const totalRow = { backgroundColor: "#f3f4f6", fontWeight: "700" };
  const button = { padding: "10px 22px", backgroundColor: "#e5e7eb", color: "#1f2937", borderRadius: "6px", fontWeight: "600", cursor: "pointer", border: "none" };

  const row = { display: "flex", marginBottom: "15px" };
  const leftLabel = { flex: 1, fontWeight: 600, color: "#374151" };
  const rightValue = { flex: 1, color: "#374151" };

  return (
    <div>
      <Header />

      <div style={container}>
        <div style={card}>

          <h5 style={{ fontSize: "1.1rem", fontWeight: 700, textAlign: "center", color: "#111827", marginBottom: "2rem" }}>
            Paying in Voucher - Estimation
          </h5>

          <div style={{ fontSize: "0.8rem", display: "flex", gap: "40px" }}>

            <div style={{ flex: 1 }}>

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

                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button style={findButton} onClick={handleFind}>
                    {loading ? "Finding..." : "Find"}
                  </button>
                </div>
              </div>

              <div style={row}><div style={{ ...leftLabel, flex: 0.6 }}>PIV Type *</div><div style={rightValue}>: {pivType}</div></div>
              <div style={row}><div style={{ ...leftLabel, flex: 0.6 }}>Customer ID *</div><div style={rightValue}>: {customerId}</div></div>
              <div style={row}><div style={{ ...leftLabel, flex: 0.6 }}>Customer Name *</div><div style={rightValue}>: {customerName}</div></div>
              <div style={row}><div style={{ ...leftLabel, flex: 0.6 }}>Address</div><div style={rightValue}>: {address}</div></div>
              <div style={row}><div style={{ ...leftLabel, flex: 0.6 }}>Telephone</div><div style={rightValue}>: {telephone}</div></div>
              <div style={row}><div style={{ ...leftLabel, flex: 0.6 }}>Mobile No *</div><div style={rightValue}>: {mobile}</div></div>
              <div style={row}><div style={{ ...leftLabel, flex: 0.6 }}>Email</div><div style={rightValue}>: {email}</div></div>

              <div style={{ marginBottom: "15px" }}>
                <label style={label}>Customer VAT Reg. No *</label>
                <input
                  type="text"
                  value={customerVatReg}
                  onChange={(e) => setCustomerVatReg(e.target.value)}
                  style={input}
                />
              </div>

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

            <div style={{ flex: 1 }}>

              <div style={row}><div style={{ ...leftLabel, flex: 0.2 }}>PIV Date</div><div style={rightValue}>: {pivDate}</div></div>

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
                        {(item.amount || 0).toFixed(2)}
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

              <div style={{ marginTop: "20px", backgroundColor: "#f3f4f6", padding: "12px", borderRadius: "6px" }}>
                <p style={{ fontSize: "12px", color: "#374151" }}>
                  <strong>Amount in Words: </strong>{numberToWords(total)}
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "30px", paddingTop: "20px", borderTop: "1px solid #e5e7eb" }}>
                <button style={button}>Save & Print</button>
                <button style={button} onClick={handleClear}>Clear</button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}