
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, ShoppingBag, Users } from 'lucide-react';

const AdminDashboard = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {t('admin.dashboard')}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-500 text-sm">
              {t('admin.totalSales')}
            </h3>
            <DollarSign
              size={20}
              strokeWidth={1.7}
              className="text-gray-500"
            />
          </div>
          <p className="text-2xl font-bold">$12,345</p>
        </div>

        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-500 text-sm">
              {t('admin.totalOrders')}
            </h3>
            <ShoppingBag
              size={20}
              strokeWidth={1.7}
              className="text-gray-500"
            />
          </div>
          <p className="text-2xl font-bold">156</p>
        </div>

        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-500 text-sm">
              {t('admin.totalUsers')}
            </h3>
            <Users
              size={20}
              strokeWidth={1.7}
              className="text-gray-500"
            />
          </div>
          <p className="text-2xl font-bold">1,024</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
