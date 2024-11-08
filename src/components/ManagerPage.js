import React from 'react';
import { formatEther } from 'ethers';
import './ManagerPage.css';

const ManagerPage = ({ rooms, contract }) => {
  const handleCheckIn = async (roomId) => {
    if (!contract) {
      alert("Contract is not available");
      return;
    }

    try {
      const tx = await contract.checkIn(roomId);
      await tx.wait();
      alert("Room checked in successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Check-in failed", error);
      alert("Check-in failed. Please try again.");
    }
  };

  const handleCheckout = async (roomId) => {
    if (!contract) {
      alert("Contract is not available");
      return;
    }

    try {
      const tx = await contract.checkoutRoom(roomId);
      await tx.wait();
      alert("Room checked out successfully!");
      window.location.reload(); // After checkout, this will automatically update customer booking status.
    } catch (error) {
      console.error("Checkout failed", error);
      alert("Checkout failed. Please try again.");
    }
  };

  return (
    <div className="manager-page-container">
      <div className='room-container'>
        <h2 className="room-list-header">Room List</h2>
        <table>
          <thead>
            <tr className="columns">
              <th>Room</th>
              <th>Price (ETH)</th>
              <th>Status</th>
              <th>Category</th>
              <th>User Address</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rooms && rooms.length > 0 ? rooms.map((room, index) => (
              <tr key={index} className="room-item">
                <td>{room?.roomNum?.toString() || 'N/A'}</td>
                <td>{room?.price ? formatEther(room.price.toString()) : 'N/A'}</td>
                <td>{room?.checkedIn ? "Checked In" : room?.isBooked ? "Booked (Waiting for check-in)" : "Not Booked"}</td>
                <td>{room?.category || 'N/A'}</td>
                <td>{room?.isBooked ? room.bookedBy : 'TBD'}</td>
                <td>
                  {room?.isBooked && !room?.checkedIn && (
                    <button onClick={() => handleCheckIn(index)} className="check-in-button">
                      Check In
                    </button>
                  )}
                  {room?.checkedIn && (
                    <button onClick={() => handleCheckout(index)} className="checkout-button">
                      Checkout
                    </button> // Checkout handled by manager, room will disappear from customer's bookings
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6">No rooms available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagerPage;
