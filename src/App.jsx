import React, { useState, useEffect } from "react";

const MilkDiary = () => {
  const [milkPrices, setMilkPrices] = useState({ FCM: 34, CTM: 30 });
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

  // Real-time date and time update
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save data to localStorage whenever allMonths is updated
  useEffect(() => {
    localStorage.setItem("milkDiaryData", JSON.stringify(allMonths));
  }, [allMonths]);

  const getFormattedDate = (date) => {
    const options = { weekday: "long" };
    const day = date.toLocaleDateString(undefined, options);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}, ${day}`;
  };

  const handleMilkPriceChange = (type, value) => {
    setMilkPrices({ ...milkPrices, [type]: parseInt(value, 10) || 0 });
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
    calculateBill(currentMonth); // Update current bill
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
      calculateBill(currentMonth); // Calculate previous month's bill
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
    if (previousMonth) {
      calculateBill(previousMonth);
    }
  }, [allMonths, milkPrices]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Milk Diary</h2>

      {/* Milk Prices Section */}
      <div style={styles.section}>
        <h3>Milk Prices</h3>
        <div style={styles.priceContainer}>
          <label>
            FCM:{" "}
            <input
              type="number"
              value={milkPrices.FCM}
              onChange={(e) => handleMilkPriceChange("FCM", e.target.value)}
              style={styles.input}
            />
          </label>
          <label>
            CTM:{" "}
            <input
              type="number"
              value={milkPrices.CTM}
              onChange={(e) => handleMilkPriceChange("CTM", e.target.value)}
              style={styles.input}
            />
          </label>
        </div>
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
            FCM:
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
            CTM:
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

      {/* Orders and Bills */}
      <div style={styles.section}>
        <h3>Orders for {currentMonth}</h3>
        {allMonths[currentMonth]?.map((order, index) => (
          <p key={index}>
            {order.date}: {order.FCM} FCM, {order.CTM} CTM
          </p>
        ))}
        <h4>
          Current Month Bill: ₹{currentBill.total} (FCM: {currentBill.FCM}, CTM: {currentBill.CTM}, Total Milk:{" "}
          {currentBill.FCM + currentBill.CTM})
        </h4>
      </div>

      {previousMonth && (
        <div style={styles.section}>
          <h3>Orders for {previousMonth}</h3>
          {allMonths[previousMonth]?.map((order, index) => (
            <p key={index}>
              {order.date}: {order.FCM} FCM, {order.CTM} CTM
            </p>
          ))}
          <h4>
            Previous Month Bill: ₹{previousBill.total} (FCM: {previousBill.FCM}, CTM: {previousBill.CTM}, Total Milk:{" "}
            {previousBill.FCM + previousBill.CTM})
          </h4>
        </div>
      )}
    </div>
  );
};

// Styling remains the same
const styles = {
  container: {
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    width: "90%",
    maxWidth: "500px",
    margin: "10px auto",
    fontFamily: "Arial, sans-serif",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#f9f9f9",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#333",
  },
  section: {
    marginBottom: "20px",
  },
  priceContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
  input: {
    padding: "5px",
    marginLeft: "10px",
    width: "60px",
  },
  button: {
    padding: "8px 12px",
    margin: "10px 0",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
  },
  monthItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "5px",
  },
  orderContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
};

export default MilkDiary;
