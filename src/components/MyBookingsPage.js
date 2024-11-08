import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers'; // Ensure ethers is imported
import './MyBookingsPage.css'

const MyBookingsPage = ({ contract, userAddress }) => {
  const [myBookings, setMyBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const rooms = await contract.getRooms();
        console.log("Fetched rooms:", rooms); // Debug log for fetched rooms
        const bookings = rooms.filter(room => room.bookedBy === userAddress);
        setMyBookings(bookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    if (contract && userAddress) {
      fetchBookings();
    }
  }, [contract, userAddress]);

  const cancelBooking = async (roomId) => {
    try {
      const tx = await contract.cancelBooking(roomId);
      await tx.wait();
      alert("Booking cancelled and refund processed.");

      // Update local state to remove the canceled booking
      setMyBookings((prevBookings) => prevBookings.filter(room => room.id !== roomId));
      
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
  };

  const calculateTotalPrice = (room) => {
    if (!room.checkInTimestamp || !room.checkOutTimestamp || room.price === 0) {
      return 0; // Return 0 if check-in/check-out timestamps or price are not valid
    }

    const checkInDate = new Date(Number(room.checkInTimestamp) * 1000); // Convert to milliseconds
    const checkOutDate = new Date(Number(room.checkOutTimestamp) * 1000); // Convert to milliseconds
    const differenceInTime = checkOutDate - checkInDate; // Difference in milliseconds
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24)); // Convert milliseconds to days

    const roomPrice = ethers.formatEther(room.price.toString()); // Format price to ETH
    const totalPrice = (differenceInDays * parseFloat(roomPrice)).toFixed(4); // Calculate total price

    return totalPrice; // Return formatted total price
  };

  return (
    <div className="booking-container">
      <h1 className="mybookings-header">My Bookings</h1>
      {myBookings.length > 0 ? (
        myBookings.map(room => (
          <div key={room.id} className="booking-card">
            <div className="book-text-container">
              <p className="label">Room</p>
              <p className="book-inputs">Room {room?.roomNum?.toString()}</p>
            </div>

            <div className="book-text-container">
              <p className="label">Category</p>
              <p className="book-inputs">{room.category}</p>
            </div>

            <div className="book-text-container">
              <p className="label">Price</p>
              <p className="book-inputs">{room.price ? ethers.formatEther(room.price.toString()) : "N/A"} ETH</p>
            </div>

            <div className="book-text-container">
              <p className="label">Status</p>
              <p className="book-inputs">{room.checkedIn ? "Checked In" : "Booked"}</p>
            </div>

            <div className="book-text-container">
              <p className="label">Check-In Date</p>
              <p className="book-inputs">{room.checkInTimestamp ? new Date(Number(room.checkInTimestamp) * 1000).toLocaleDateString() : "N/A"}</p>
            </div>

            <div className="book-text-container">
              <p className="label">Check-Out Date</p>
              <p className="book-inputs">{room.checkOutTimestamp ? new Date(Number(room.checkOutTimestamp) * 1000).toLocaleDateString() : "N/A"}</p>
            </div>

            <div className="book-text-container">
              <p className="label">Total Price</p>
              <p className="book-inputs">{calculateTotalPrice(room)} ETH</p>
            </div>
            
            {!room.checkedIn && (
              <button className="cancel-button" onClick={() => cancelBooking(room.id)}>Cancel</button> // Cancel button only if not checked in
            )}
          </div>
        ))
      ) : (
        <p>No current bookings.</p>
      )}
    </div>
  );
};

export default MyBookingsPage;
