import React, { useState } from "react";
import { useEffect } from "react";
import { QrReader } from "react-qr-reader";
import "./App.css";

const App = () => {
  const [qrData, setQrData] = useState(null);
  const [calorieData, setCalorieData] = useState({});
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (qrData) {
      fetchCalorieData(qrData.items);
    }
  }, [qrData]);

  const handleScan = (data) => {
    if (data) {
      try {
        const parsedData = JSON.parse(data.text);
        setQrData(parsedData);
      } catch (error) {
        console.error("Error parsing QR code data:", error);
      }
    }
  };

  const handleError = (error) => {
    console.error("QR Scan Error:", error);
  };

  const fetchCalorieData = async (items) => {
    try {
      const response = await fetch("http://localhost:5000/api/calories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();
      setCalorieData(data);
      setItems(data.items.map(item => ({
        ...item,
        totalCalories: item.quantity * item.calorie
      })));
    } catch (error) {
      console.error("Error fetching calorie data:", error);
    }
  };

  const handleQuantityChange = (index, change) => {
    const updatedItems = [...items];
    const item = updatedItems[index];

    item.quantity = Math.max(0, item.quantity + change);

    // Recalculate calories dynamically
    item.totalCalories = item.quantity * item.calorie;

    setItems(updatedItems);
  };

  const calculateTotalCalories = () => {
    return items.reduce((total, item) => total + item.totalCalories, 0);
  };

  return (
    <div className="App">
      <h1 className="text-2xl font-bold text-center my-4">Calorie Tracker</h1>
      <div className="qr-reader-container p-4 border rounded-md shadow-md max-w-md mx-auto">
        <h3 className="text-lg font-semibold mb-2">Scan QR Code</h3>
        <QrReader
          delay={300}
          onResult={handleScan}
          onError={handleError}
          style={{ width: "100%" }}
        />
      </div>

      {qrData && (
        <div className="dish-details mt-6 p-4 border rounded-md shadow-md max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4">{qrData.dishName}</h2>
          <div className="calorie-breakdown">
            {items.map((item, index) => (
              <div
                key={index}
                className="calorie-item flex justify-between items-center mb-2"
              >
                <div>
                  <span className="block font-medium">{item.name}</span>
                  <span className="block text-sm text-gray-500">
                    {item.calorie} cal per unit
                  </span>
                </div>
                <div className="quantity-controls flex items-center">
                  <button
                    className="px-2 py-1 bg-green-500 text-white rounded-md mr-2"
                    onClick={() => handleQuantityChange(index, 1)}
                  >
                    +
                  </button>
                  <span className="mx-2">{item.quantity}</span>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded-md"
                    onClick={() => handleQuantityChange(index, -1)}
                  >
                    -
                  </button>
                </div>
                <span className="font-medium">
                  Total: {item.totalCalories} cal
                </span>
              </div>
            ))}
          </div>
          <h3 className="text-lg font-semibold mt-4">
            Total Calories: {calculateTotalCalories()} cal
          </h3>
        </div>
      )}
    </div>
  );
};

export default App;
