import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom'; // Use NavLink for active state
import { ethers } from 'ethers';
import icon from '../assets/metamask-icon.png';
import './Nav.css';

const Nav = ({ userAddress, provider, isManager }) => {
  const [balance, setBalance] = useState('');

  useEffect(() => {
    const getBalance = async () => {
      if (provider && userAddress) {
        const balance = await provider.getBalance(userAddress);
        const ethBalance = ethers.formatEther(balance);
        setBalance(parseFloat(ethBalance).toFixed(4));
      }
    };

    getBalance();
  }, [provider, userAddress]);

  return (
    <div className="nav-container">
      <nav className="navbar">
        <div className="nav-left-section">
          <div className="logo-container">
            <h3>Hotel dApp</h3>
          </div>

          <div className="nav-links">
            {isManager ? (
              <NavLink to="/manager" className={({ isActive }) => isActive ? 'active-link' : ''}>
                Dashboard
              </NavLink>
            ) : (
              <>
                <NavLink to="/" className={({ isActive }) => isActive ? 'active-link' : ''}>
                  Home
                </NavLink>
                
                <NavLink to="/rooms" className={({ isActive }) => isActive ? 'active-link' : ''}>
                  Accommodations
                </NavLink>

                <NavLink to="/my-bookings" className={({ isActive }) => isActive ? 'active-link' : ''}>
                  My Bookings
                </NavLink>
              </>
            )}
          </div>
        </div>

        <div className="user-info">
          <div className="user-avatar">
            <span className="user-address">0x{userAddress.slice(2, 6)}...{userAddress.slice(-4)}</span>
            <p className="eth-balance">{balance} ETH</p>
          </div>
          
          <img className="metamask-icon" src={icon} alt="Metamask Icon" />
        </div>
      </nav>
    </div>
  );
};

export default Nav;
