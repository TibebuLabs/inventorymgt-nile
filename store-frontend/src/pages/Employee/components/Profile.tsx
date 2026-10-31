import React, { useState } from "react";
import DashboardLayout from "../EmployeeDashboard/DashboardLayout";

interface ProfileProps {
  photo: string;
  name: string;
  role: string;
  phone: string;
  email: string;
}

const Profile: React.FC<ProfileProps> = ({ photo, name, role, phone, email }) => {
  const [profilePhoto, setProfilePhoto] = useState(photo);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setProfilePhoto(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        {/* Profile Header */}
        <div className="flex items-center space-x-6">
          {/* Profile Picture and Upload Button */}
          <div className="relative">
            {/* Upload Button with Plus Sign */}
            <label
              htmlFor="photo-upload"
              className="absolute right-0 bottom-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {/* Hidden file input */}
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </label>

            {/* Profile Picture */}
            <img
              src={profilePhoto}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-indigo-600 shadow-xl"
            />
          </div>

          {/* User Info */}
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">{name}</h1>
            <p className="text-lg text-gray-600">{role}</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8">
          <div className="flex items-center space-x-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 10l4 4-4 4m12-8l4 4-4 4"
              />
            </svg>
            <p className="text-lg font-medium text-gray-900">{phone}</p>
          </div>

          <div className="mt-4 flex items-center space-x-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 12h4M12 16v4M12 4v4M4 12h4"
              />
            </svg>
            <p className="text-lg font-medium text-gray-900">{email}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
