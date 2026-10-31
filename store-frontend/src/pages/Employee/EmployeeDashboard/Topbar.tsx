import React, { useState } from "react";
import { IconButton, Menu, MenuItem, Badge } from "@mui/material";
import { Menu as MenuIcon, AccountCircle, Notifications } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const handleLogout = (navigate: ReturnType<typeof useNavigate>) => {
  localStorage.clear();
  navigate("/login");
};

interface TopbarProps {
  onToggleSidebar: () => void;
}

const Topbar = ({ onToggleSidebar }: TopbarProps) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);

  // Example: Set the number of unread messages
  const unreadMessages = 5; // You can replace this with dynamic data from your app

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate("/Profile");
  };

  const handleChangePasswordClick = () => {
    handleMenuClose();
    navigate("/change-password");
  };

  const handleLogoutClick = () => {
    handleMenuClose();
    handleLogout(navigate);
  };

  return (
    
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        {/* Toggle Sidebar Button */}
        <IconButton onClick={onToggleSidebar} aria-label="Toggle Sidebar">
          <MenuIcon />
        </IconButton>
        <h1 className="text-xl font-bold">Employee Dashboard</h1>
      </div>
      <span className="text-gray-600">Welcome Employee</span>
      <div className="flex items-center gap-4">
        {/* Notification Icon with Badge displaying unread message count */}
        <IconButton onClick={handleNotificationClick} aria-label="Notifications">
          <Badge badgeContent={unreadMessages} color="error">
            <Notifications />
          </Badge>
        </IconButton>

        {/* Notification Menu */}
        <Menu
          anchorEl={notificationAnchorEl}
          open={Boolean(notificationAnchorEl)}
          onClose={handleNotificationClose}
        >
          <MenuItem onClick={handleNotificationClose}>New Notification 1</MenuItem>
          <MenuItem onClick={handleNotificationClose}>New Notification 2</MenuItem>
          <MenuItem onClick={handleNotificationClose}>New Notification 3</MenuItem>
        </Menu>

        
        <IconButton onClick={handleMenuOpen} aria-label="Account">
          <AccountCircle />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleProfileClick}>My Profile</MenuItem>
          <MenuItem onClick={handleChangePasswordClick}>Change Password</MenuItem>
          <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
        </Menu>
      </div>
    </header>
   
  );
};

export default Topbar;  
