import React from 'react';
import { Outlet } from 'react-router-dom';
import UserNavbar from '../components/UserNavbar';
import UserFooter from '../components/UserFooter';

const UserLayout = () => {
  return (
    // Dark Mode အတွက် နောက်ခံအရောင် ပြောင်းပေးထားတယ်
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
      
      <UserNavbar />

      <main className="flex-grow">
        <Outlet />
      </main>

      <UserFooter />
      
    </div>
  );
};

export default UserLayout;