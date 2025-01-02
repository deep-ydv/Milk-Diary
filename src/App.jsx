import React, { useState, useEffect } from "react";

const MilkDiary = () => {
  const [milkPrices, setMilkPrices] = useState({ FCM: 34, CTM: 30 });
  const [updatedMilkPrices, setUpdatedMilkPrices] = useState({ FCM: 34, CTM: 30 });
  const [currentMonth, setCurrentMonth] = useState("January");
  const [allMonths, setAllMonths] = useState(() => {
    const savedData = localStorage.getItem("milkDiaryData");
    return savedData ? JSON.parse(savedData) : { January: [] };
  });
  const [currentOrders, setCurrentOrders] = useState({ FCM: 0, CTM: 0 });
  const [currentBill, setCurrentBill] = useState({ total: 0, FCM: 0, CTM: 0 });
  const [previousMonth, setPreviousMonth] = useState("");
  const [previousBill, setPreviousBill] = useState({ total: 0, FCM: 0, CTM: 0 });
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("milkDiaryData", JSON.stringify(allMonths));
  }, [allMonths]);

  const getFormattedDate = (date) => {
    const options = { weekday: "long" };
    const day = date.toLocaleDateString(undefined, options);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}, ${day}`;
  };

  const handleMilkPriceChange = (type, value) => {
    setUpdatedMilkPrices({ ...updatedMilkPrices, [type]: parseInt(value, 10) || 0 });
  };

  const submitMilkPrices = () => {
    setMilkPrices(updatedMilkPrices);
    calculateBill(currentMonth);
    if (previousMonth) calculateBill(previousMonth);
  };

  const addOrder = () => {
    if (currentOrders.FCM === 0 && currentOrders.CTM === 0) return;

    const ordersForMonth = allMonths[currentMonth] || [];
    ordersForMonth.push({
      date: getFormattedDate(currentDate),
      ...currentOrders,
    });
    setAllMonths({ ...allMonths, [currentMonth]: ordersForMonth });
    setCurrentOrders({ FCM: 0, CTM: 0 });
    calculateBill(currentMonth);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      addOrder();
    }
  };

  const addNewMonth = () => {
    const newMonth = prompt("Enter new month name:");
    if (newMonth) {
      setAllMonths({ ...allMonths, [newMonth]: [] });
      setPreviousMonth(currentMonth);
      setCurrentMonth(newMonth);
      calculateBill(currentMonth);
    }
  };

  const deleteMonth = (month) => {
    const updatedMonths = { ...allMonths };
    delete updatedMonths[month];
    setAllMonths(updatedMonths);
    if (month === currentMonth) {
      setCurrentMonth(Object.keys(updatedMonths)[0] || "");
    }
  };

  const calculateBill = (month) => {
    const ordersForMonth = allMonths[month] || [];
    const totals = ordersForMonth.reduce(
      (acc, order) => {
        acc.total += order.FCM * milkPrices.FCM + order.CTM * milkPrices.CTM;
        acc.FCM += order.FCM;
        acc.CTM += order.CTM;
        return acc;
      },
      { total: 0, FCM: 0, CTM: 0 }
    );

    if (month === currentMonth) {
      setCurrentBill(totals);
    } else if (month === previousMonth) {
      setPreviousBill(totals);
    }
  };

  useEffect(() => {
    calculateBill(currentMonth);
    if (previousMonth) calculateBill(previousMonth);
  }, [allMonths, milkPrices]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Milk Diary</h2>

      {/* Milk Prices Section */}
      <div style={styles.section}>
        <h3>Milk Prices</h3>
        <div style={styles.priceContainer}>
          <label>
            Full Cream Milk (FCM):{" "}
            <input
              type="number"
              value={updatedMilkPrices.FCM}
              onChange={(e) => handleMilkPriceChange("FCM", e.target.value)}
              style={styles.input}
            />
          </label>
          <label>
            Cow Milk (CTM):{" "}
            <input
              type="number"
              value={updatedMilkPrices.CTM}
              onChange={(e) => handleMilkPriceChange("CTM", e.target.value)}
              style={styles.input}
            />
          </label>
        </div>
        <button onClick={submitMilkPrices} style={styles.button}>
          Submit Prices
        </button>
      </div>

      {/* Month Section */}
      <div style={styles.section}>
        <h3>Current Month: {currentMonth}</h3>
        <button onClick={addNewMonth} style={styles.button}>
          Add Month
        </button>
        <div>
          {Object.keys(allMonths).map((month, index) => (
            <div key={index} style={styles.monthItem}>
              <span
                style={{
                  fontWeight: month === currentMonth ? "bold" : "normal",
                }}
              >
                {month}
              </span>
              <button
                onClick={() => deleteMonth(month)}
                style={{ ...styles.button, backgroundColor: "#ff4d4d" }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Current Date and Orders */}
      <div style={styles.section}>
        <h3>Date: {getFormattedDate(currentDate)}</h3>
        <div style={styles.orderContainer}>
          <label>
            Full Cream Milk (FCM):
            <input
              type="number"
              value={currentOrders.FCM}
              onChange={(e) =>
                setCurrentOrders({ ...currentOrders, FCM: parseInt(e.target.value, 10) || 0 })
              }
              onKeyDown={handleKeyDown}
              style={styles.input}
            />
          </label>
          <label>
            Cow Milk (CTM):
            <input
              type="number"
              value={currentOrders.CTM}
              onChange={(e) =>
                setCurrentOrders({ ...currentOrders, CTM: parseInt(e.target.value, 10) || 0 })
              }
              onKeyDown={handleKeyDown}
              style={styles.input}
            />
          </label>
        </div>
        <button onClick={addOrder} style={styles.button}>
          Add Order
        </button>
      </div>

      {/* Orders Table */}
      <div style={styles.section}>
        <h3>Orders for {currentMonth}</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHead}>Date</th>
              <th style={styles.tableHead}>Full Cream Milk (FCM)</th>
              <th style={styles.tableHead}>Cow Milk (CTM)</th>
            </tr>
          </thead>
          <tbody>
            {allMonths[currentMonth]?.map((order, index) => (
              <tr key={index}>
                <td style={styles.tableCell}>{order.date}</td>
                <td style={styles.tableCell}>{order.FCM}</td>
                <td style={styles.tableCell}>{order.CTM}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h4>
          Current Month Bill: ₹{currentBill.total} (FCM: {currentBill.FCM}, CTM: {currentBill.CTM}, Total Milk: {" "}
          {currentBill.FCM + currentBill.CTM})
        </h4>
      </div>

      {previousMonth && (
        <div style={styles.section}>
          <h3>Orders for {previousMonth}</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHead}>Date</th>
                <th style={styles.tableHead}>Full Cream Milk (FCM)</th>
                <th style={styles.tableHead}>Cow Milk (CTM)</th>
              </tr>
            </thead>
            <tbody>
              {allMonths[previousMonth]?.map((order, index) => (
                <tr key={index}>
                  <td style={styles.tableCell}>{order.date}</td>
                  <td style={styles.tableCell}>{order.FCM}</td>
                  <td style={styles.tableCell}>{order.CTM}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h4>
            Previous Month Bill: ₹{previousBill.total} (FCM: {previousBill.FCM}, CTM: {previousBill.CTM}, Total Milk: {" "}
            {previousBill.FCM + previousBill.CTM})
          </h4>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    maxWidth: "100%",
    margin: "0 auto",
    boxSizing: "border-box",
  },
  title: {
    textAlign: "center",
  },
  section: {
    marginBottom: "20px",
    padding: "15px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  },
  priceContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    margin: "0 10px",
    padding: "5px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    marginTop: "10px",
    padding: "8px 12px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#007BFF",
    color: "white",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
    tableLayout: "fixed",  // Ensures uniform column width
  },
  tableHead: {
    backgroundColor: "#f2f2f2",
    textAlign: "left",  // Align headers to the left
    padding: "10px",  // Add padding for better readability
  },
  tableCell: {
    padding: "10px",  // Add padding for better alignment
    border: "1px solid #ddd",  // Border around each cell
    textAlign: "center",  // Center text in cells
  },
  monthItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "5px 0",
  },
  orderContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
};

export default MilkDiary;
