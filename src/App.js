  import React from 'react';
  import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Import Navigate for redirection
  import ManagerPage from './components/ManagerPage';
  import CustomerPage from './components/CustomerPage';
  import RoomDetailPage from './components/RoomDetailPage';
  import Nav from './components/Nav';
  import { useState, useEffect } from 'react';
  import { ethers } from 'ethers';
  import './App.css';
  import contractABI from './constants/contractABI';
  import MyBookingsPage from './components/MyBookingsPage'; // Import MyBookingsPage

  const CONTRACT_ADDRESS = "0x9981a0d29c2D02483C5DE88754eE2DF40e914C16";
  const MANAGER_ADDRESS = "0xA5f8CB40B12B582844F4d7FD7B554F911bF35bDc";

  function App() {
    const [rooms, setRooms] = useState([]);
    const [provider, setProvider] = useState(null);
    const [contract, setContract] = useState(null);
    const [userAddress, setUserAddress] = useState("");
    const [price, setPrice] = useState("");
    const [roomNum, setRoomNum] = useState("");
    const [category, setCategory] = useState("");
    const [isManager, setIsManager] = useState(false);

    const loadBlockchainData = async (provider) => {
      try {
        const signer = await provider.getSigner();
        const hotelBookingContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
        
        const rooms = await hotelBookingContract.getRooms();
        setRooms(rooms);

        const userAddress = await signer.getAddress();
        setUserAddress(userAddress);

        setIsManager(userAddress.toLowerCase() === MANAGER_ADDRESS.toLowerCase());

        setProvider(provider);
        setContract(hotelBookingContract);
      } catch (error) {
        console.error("Error loading blockchain data:", error);
      }
    };

    useEffect(() => {
      const initialize = async () => {
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          await loadBlockchainData(provider);

          window.ethereum.on('accountsChanged', async (accounts) => {
            await loadBlockchainData(provider);
          });
        }
      };

      initialize();
    }, []);

    return (
      <Router>
        <div className="App">
          <Nav userAddress={userAddress} provider={provider} isManager={isManager} />
          <Routes>
            {/* Default Route - Manager or Customer Homepage */}
            <Route 
              path="/" 
              element={isManager ? (
                <ManagerPage 
                  rooms={rooms} 
                  setPrice={setPrice} 
                  price={price} 
                  setRoomNum={setRoomNum} 
                  roomNum={roomNum} 
                  setCategory={setCategory} 
                  category={category} 
                  contract={contract}
                />
              ) : (
                <CustomerPage />
              )} 
            />

            {/* Route to display My Bookings for customers only */}
            <Route 
              path="/my-bookings" 
              element={isManager ? <Navigate to="/" /> : <MyBookingsPage contract={contract} userAddress={userAddress}/>} 
            />

            {/* Route to display all rooms */}
            <Route 
              path="/rooms" 
              element={isManager ? <Navigate to="/" /> : <RoomDetailPage contract={contract} userAddress={userAddress} />} 
            />

            {/* Redirect all other routes to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    );
  }

  export default App;
