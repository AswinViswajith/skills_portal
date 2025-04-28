import React from 'react';
import { useSelector } from 'react-redux';

function Profile() {
  const user = useSelector((state) => state.persisted.user.user);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center -mt-20">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <div className="text-center mb-4">
          <img
            src={user?.picture || 'https://via.placeholder.com/96'}
            alt="Profile"
            className="w-24 h-24 rounded-full mx-auto border-2 border-gray-200"
          />
          <h2 className="text-2xl font-semibold mt-2">{user?.name || 'N/A'}</h2>
          <p className="text-gray-500">{user?.userType?.charAt(0).toUpperCase() + user?.userType?.slice(1) || 'N/A'}</p>
        </div>
        <div className="border-t border-gray-200 mt-4 pt-4">
          <div className="mb-3">
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-lg font-medium text-gray-700">{user?.email || 'N/A'}</p>
          </div>
          {/* <div className="mb-3">
            <p className="text-sm text-gray-500">Department</p>
            <p className="text-lg font-medium text-gray-700">{user?.email || 'N/A'}</p>
          </div>
          <div className="mb-3">
            <p className="text-sm text-gray-500">Roll No</p>
            <p className="text-lg font-medium text-gray-700">{user?.email || 'N/A'}</p>
          </div> */}
          <div className="mb-3">
            <p className="text-sm text-gray-500">User Role</p>
            <p className="text-lg font-medium text-gray-700">{user?.userType?.charAt(0).toUpperCase() + user?.userType?.slice(1) || 'N/A'}</p>
          </div>
          <div className="mb-3">
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="text-lg font-medium text-gray-700">
              {new Date(user?.createdAt).toDateString() || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;