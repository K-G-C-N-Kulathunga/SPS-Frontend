import { useState } from "react";

export default function NewPIVPage() {
    const [estimationNo, setEstimationNo] = useState("");
    const [customerVatReg, setCustomerVatReg] = useState("");
    const [jobDescription, setJobDescription] = useState("SERVICE CONNECTION - New Connection");
    const [pivType, setPivType] = useState("SERVICE CONNECTION");
    const [customerId, setCustomerId] = useState("723163781v");
    const [customerName, setCustomerName] = useState("S M RATHNASIRI");
    const [address, setAddress] = useState("INFRONT OF KUMARA VIDYALAYA, ALUTHWEWA, SHRAWASTHIPURA");
    const [telephone, setTelephone] = useState("0703480518");
    const [mobileNo, setMobileNo] = useState("0703480518");
    const [email, setEmail] = useState("");
    const [costCenter] = useState("423.10");
    const [pivDate] = useState("24/11/2025");

    const lineItems = [
        { code: "L5610", description: "CONSUMER DEPOSITS - CAPITAL JOBS", amount: 37500.0 },
        { code: "L5228", description: "NATION BUILDING TAX PAYABLE", amount: 0.0 },
        { code: "L5221", description: "SSCL PAYABLE ON OTHER SERVICES", amount: 961.54 },
        { code: "L5600", description: "ORDINARY SUPPLY CONSUMER SECURITY DEPOSITS-CONSUMP. OF ELEC.", amount: 0.0 },
        { code: "L5625", description: "CONSUMER DEPOSIT AGAINST ADDITIONAL MV NETWORK DEVELOPMENT F", amount: 0.0 },
    ];

    const total = lineItems.reduce((sum, item) => sum + item.amount, 0);

    // Inline styles
    const styles = {
        container: { minHeight: "100vh", background: "#f9fafb", padding: "40px 20px" },
        card: {
            maxWidth: "1200px",
            margin: "0 auto",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "40px",
        },
        title: {
            textAlign: "center",
            fontSize: "30px",
            fontWeight: "700",
            color: "#111827",
            marginBottom: "30px",
        },
        label: { fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" },
        input: {
            width: "100%",
            padding: "10px 14px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            background: "#f3f4f6",
            marginBottom: "18px",
        },
        textarea: {
            width: "100%",
            padding: "10px 14px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            background: "#f3f4f6",
            resize: "none",
            marginBottom: "18px",
        },
        button: {
            padding: "10px 22px",
            fontWeight: "600",
            borderRadius: "6px",
            cursor: "pointer",
            border: "none",
        },
        btnGray: { background: "#e5e7eb", color: "#111827" },
        btnCyan: { background: "#06b6d4", color: "#ffffff" },
        formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
        table: { width: "100%", borderCollapse: "collapse", marginTop: "20px" },
        th: {
            textAlign: "left",
            padding: "12px",
            background: "#f3f4f6",
            fontWeight: "600",
            color: "#374151",
            borderBottom: "1px solid #e5e7eb",
        },
        td: { padding: "12px", borderBottom: "1px solid #e5e7eb", color: "#374151" },
        totalRow: { background: "#f3f4f6", fontWeight: "700" },
        amountWords: {
            marginTop: "20px",
            background: "#f3f4f6",
            padding: "14px",
            borderRadius: "8px",
            fontSize: "14px",
        },
        footerBtns: {
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "30px",
            paddingTop: "20px",
            borderTop: "1px solid #e5e7eb",
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.card} >
                <h1 style={{ ...styles.title, marginTop: "40px" }}>Paying in Voucher - Estimation</h1>

                {/* Estimation Number */}
                <div style={styles.formRow}>
                    <div>
                        <label style={styles.label}>
                            Estimation No <span style={{ color: "red" }}>*</span>
                        </label>
                        
                        <input
                            type="text"
                            value={estimationNo}
                            onChange={(e) => setEstimationNo(e.target.value)}
                            style={styles.input}
                        />
                        
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-end", marginBottom: "20px" }}>
                        <button style={{ ...styles.button, ...styles.btnCyan }}>FIND</button>
                    </div>
                </div>

                {/* PIV Type & Cost Center */}
                <div style={styles.formRow}>
                    <div>
                        <label style={styles.label}>PIV Type *</label>
                        <input
                            type="text"
                            value={pivType}
                            onChange={(e) => setPivType(e.target.value)}
                            style={styles.input}
                        />
                    </div>

                    <div>
                        <label style={styles.label}>Cost Center No</label>
                        <input type="text" value={costCenter} disabled style={styles.input} />
                    </div>
                </div>

                {/* Customer ID & PIV Date */}
                <div style={styles.formRow}>
                    <div>
                        <label style={styles.label}>Customer's ID *</label>
                        <input
                            type="text"
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div>
                        <label style={styles.label}>PIV Date</label>
                        <input type="text" value={pivDate} disabled style={styles.input} />
                    </div>
                </div>

                {/* Name */}
                <label style={styles.label}>Customer's Name *</label>
                <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={styles.input}
                />

                {/* Address */}
                <label style={styles.label}>Address</label>
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={styles.input}
                />

                {/* Telephone + Mobile */}
                <div style={styles.formRow}>
                    <div>
                        <label style={styles.label}>Telephone</label>
                        <input
                            type="text"
                            value={telephone}
                            onChange={(e) => setTelephone(e.target.value)}
                            style={styles.input}
                        />
                    </div>

                    <div>
                        <label style={styles.label}>
                            Mobile No <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                            type="text"
                            value={mobileNo}
                            onChange={(e) => setMobileNo(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                </div>

                {/* Email */}
                <label style={styles.label}>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                />

                {/* VAT Reg */}
                <label style={styles.label}>Customer VAT Reg. No. *</label>
                <input
                    type="text"
                    value={customerVatReg}
                    onChange={(e) => setCustomerVatReg(e.target.value)}
                    style={styles.input}
                />

                {/* Job Description */}
                <label style={styles.label}>Job Description</label>
                <textarea
                    rows={3}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    style={styles.textarea}
                />

                {/* TABLE */}
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Code No</th>
                            <th style={styles.th}>Description</th>
                            <th style={{ ...styles.th, textAlign: "right" }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lineItems.map((item, index) => (
                            <tr key={index}>
                                <td style={styles.td}>{item.code}</td>
                                <td style={styles.td}>{item.description}</td>
                                <td style={{ ...styles.td, textAlign: "right" }}>
                                    {item.amount.toFixed(2)}
                                </td>
                            </tr>
                        ))}

                        <tr style={styles.totalRow}>
                            <td style={styles.td}></td>
                            <td style={styles.td}>Total</td>
                            <td style={{ ...styles.td, textAlign: "right" }}>{total.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>

                <div style={styles.amountWords}>
                    <strong>Amount in Words: </strong>
                    Thirty Eight Thousand Four Hundred Sixty One Rupees and Fifty Four Cents Only.
                </div>

                {/* Footer Buttons */}
                <div style={styles.footerBtns}>
                    <button style={{ ...styles.button, ...styles.btnGray }}>Save & Print</button>
                    <button style={{ ...styles.button, ...styles.btnGray }}>Clear</button>
                    <button style={{ ...styles.button, ...styles.btnCyan }}>NEXT</button>
                </div>
            </div>
        </div>
    );
}