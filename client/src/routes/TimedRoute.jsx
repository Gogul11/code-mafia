import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

// ProtectedRoute checks if the timer is active before allowing access
const ProtectedRoute = ({ children }) => {
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [loading, setLoading] = useState(true);  // Added loading state

  const checkTimer = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const startTime = 17 * 60; // 5:00 PM in minutes
    const endTime = 24 * 60;   // 8:00 PM in minutes
    console.log(currentTimeInMinutes);

    if (currentTimeInMinutes >= startTime && currentTimeInMinutes <= endTime) {
      console.log("active");
      setIsTimerActive(true);  // Timer is active
    } else {
      console.log("not active");
      setIsTimerActive(false); // Timer is not active
    }

    // Once the timer check is complete, we set loading to false
    setLoading(false);
  };

  useEffect(() => {
    checkTimer();  // Check the timer immediately on mount
    const timerInterval = setInterval(checkTimer, 60000); // Check every minute

    return () => clearInterval(timerInterval); // Cleanup the interval when the component unmounts
  }, []);  // Empty dependency array so this runs only once on mount

  console.log(isTimerActive);  // To check the value of the timer

  // If the component is loading, we can show a loading message or spinner
  if (loading) {
    return <div>Loading...</div>;  // You can replace this with a loading spinner if needed
  }

  // If the timer is not active, redirect to the home page
  if (!isTimerActive) {
    return <Navigate to="/" />;
  }

  return children;  // Render the protected content if the timer is active
};

export default ProtectedRoute;
