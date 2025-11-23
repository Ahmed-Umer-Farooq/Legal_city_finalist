import React from 'react';
import { useLocation } from 'react-router-dom';

const RouteTest = () => {
  const location = useLocation();
  
  const testRoutes = [
    '/lawyer/dashboard',
    '/lawyer/dashboard/cases', 
    '/lawyer/dashboard/clients',
    '/lawyer/dashboard/messages',
    '/lawyer/dashboard/calendar',
    '/lawyer/dashboard/contacts',
    '/lawyer/dashboard/reports',
    '/lawyer/dashboard/tasks',
    '/lawyer/dashboard/documents',
    '/lawyer/dashboard/blogs'
  ];

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="font-bold text-yellow-800 mb-2">Route Connection Test</h3>
      <p className="text-sm text-yellow-700 mb-2">Current: {location.pathname}</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {testRoutes.map(route => (
          <a 
            key={route} 
            href={route}
            className={`p-2 rounded ${location.pathname === route ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {route.split('/').pop() || 'dashboard'}
          </a>
        ))}
      </div>
    </div>
  );
};

export default RouteTest;