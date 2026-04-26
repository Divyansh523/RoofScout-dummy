import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../src/supabase';

const TABS = {
  APPLIED_PROPERTIES: 'appliedProperties',
  POSTED_PROPERTIES: 'postedProperties',
  APPROVED_TOUR_REQUESTS: 'approvedTourRequests',
  PAYMENT_STATUS: 'paymentStatus'
};

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [appliedProperties, setAppliedProperties] = useState([]);
  const [postedProperties, setPostedProperties] = useState([]);
  const [approvedTourRequests, setApprovedTourRequests] = useState([]);
  const [paymentStatusData, setPaymentStatusData] = useState([]);
  const [activeTab, setActiveTab] = useState(TABS.APPLIED_PROPERTIES);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // Try to get user from Supabase first
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        let currentUser = null;
        
        if (supabaseUser) {
          currentUser = {
            id: supabaseUser.id,
            email: supabaseUser.email,
            name: supabaseUser.user_metadata?.name || supabaseUser.email
          };
        } else {
          // Fallback to localStorage
          const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
          if (storedUser) {
            currentUser = storedUser;
          } else {
            navigate('/login');
            return;
          }
        }
        
        setUser(currentUser);
        
        if (currentUser) {
          await loadUserApplications(currentUser);
          await loadPostedProperties(currentUser);
          await loadApprovedTourRequests(currentUser);
          await loadPaymentStatus(currentUser);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const loadUserApplications = async (currentUser) => {
    try {
      // Get all properties first
      const allProperties = JSON.parse(localStorage.getItem('properties') || '[]');
      
      // Get applied properties using multiple methods to ensure we find them
      let userAppliedProperties = [];
      
      // Method 1: Direct userId match
      const appliedByUserId = JSON.parse(localStorage.getItem(`appliedProperties_${currentUser.id}`) || '[]');
      userAppliedProperties = [...appliedByUserId];
      
      // Method 2: Email-based lookup (fallback)
      if (userAppliedProperties.length === 0) {
        const appliedByEmail = JSON.parse(localStorage.getItem(`appliedProperties_${currentUser.email}`) || '[]');
        userAppliedProperties = [...appliedByEmail];
      }
      
      // Method 3: Name-based lookup (additional fallback)
      if (userAppliedProperties.length === 0 && currentUser.name) {
        const appliedByName = JSON.parse(localStorage.getItem(`appliedProperties_${currentUser.name}`) || '[]');
        userAppliedProperties = [...appliedByName];
      }
      
      // Combine with property details
      const detailedApplications = userAppliedProperties.map(applied => {
        const propertyDetails = allProperties.find(prop => prop.id === applied.propertyId);
        return {
          ...applied,
          property: propertyDetails
        };
      });
      
      console.log('Loaded applied properties:', detailedApplications);
      setAppliedProperties(detailedApplications);
    } catch (error) {
      console.error('Error loading applied properties:', error);
      setAppliedProperties([]);
    }
  };

  const loadPostedProperties = async (currentUser) => {
    try {
      const allProperties = JSON.parse(localStorage.getItem('properties') || '[]');
      const userProperties = allProperties.filter(property => 
        property.ownerEmail === currentUser.email || 
        property.ownerId === currentUser.id
      );
      setPostedProperties(userProperties);
    } catch (error) {
      console.error('Error loading posted properties:', error);
      setPostedProperties([]);
    }
  };

  const loadApprovedTourRequests = async (currentUser) => {
    try {
      const allTourRequests = JSON.parse(localStorage.getItem('tourRequests') || '[]');
      const approvedRequests = allTourRequests.filter(request => 
        (request.ownerEmail === currentUser.email || request.ownerId === currentUser.id) && 
        request.status === 'approved'
      );
      setApprovedTourRequests(approvedRequests);
    } catch (error) {
      console.error('Error loading approved tour requests:', error);
      setApprovedTourRequests([]);
    }
  };

  const loadPaymentStatus = async (currentUser) => {
    try {
      const payments = JSON.parse(localStorage.getItem('payments') || '[]');
      const userPayments = payments.filter(payment => 
        payment.userId === currentUser.id || payment.userEmail === currentUser.email
      );
      setPaymentStatusData(userPayments);
    } catch (error) {
      console.error('Error loading payment status:', error);
      setPaymentStatusData([]);
    }
  };

  const handleTourRequestStatus = async (requestId, newStatus, requesterEmail) => {
    try {
      // Update tour request status
      const allTourRequests = JSON.parse(localStorage.getItem('tourRequests') || '[]');
      const updatedRequests = allTourRequests.map(request => 
        request.id === requestId 
          ? { ...request, status: newStatus }
          : request
      );
      localStorage.setItem('tourRequests', JSON.stringify(updatedRequests));
      
      // If approving, also update the corresponding property application status
      if (newStatus === 'approved') {
        // Find the tour request to get property ID
        const tourRequest = allTourRequests.find(req => req.id === requestId);
        if (tourRequest) {
          // Update applied properties for this user and property
          const userAppliedKey = `appliedProperties_${requesterEmail}`;
          const userApplied = JSON.parse(localStorage.getItem(userAppliedKey) || '[]');
          
          const updatedApplied = userApplied.map(applied => 
            applied.propertyId === tourRequest.propertyId
              ? { ...applied, status: 'approved' }
              : applied
          );
          
          localStorage.setItem(userAppliedKey, JSON.stringify(updatedApplied));
          
          // Also try to update by other identifiers if available
          if (tourRequest.userId) {
            const userAppliedByIdKey = `appliedProperties_${tourRequest.userId}`;
            const userAppliedById = JSON.parse(localStorage.getItem(userAppliedByIdKey) || '[]');
            const updatedAppliedById = userAppliedById.map(applied => 
              applied.propertyId === tourRequest.propertyId
                ? { ...applied, status: 'approved' }
                : applied
            );
            localStorage.setItem(userAppliedByIdKey, JSON.stringify(updatedAppliedById));
          }
        }
      }
      
      // Reload data
      if (user) {
        await loadApprovedTourRequests(user);
        await loadUserApplications(user);
      }
    } catch (error) {
      console.error('Error updating tour request status:', error);
    }
  };

  const handleDeleteProperty = (propertyId) => {
    try {
      const allProperties = JSON.parse(localStorage.getItem('properties') || '[]');
      const updatedProperties = allProperties.filter(property => property.id !== propertyId);
      localStorage.setItem('properties', JSON.stringify(updatedProperties));
      setPostedProperties(prev => prev.filter(property => property.id !== propertyId));
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  const handlePayNow = (applicationId) => {
    navigate(`/payment/${applicationId}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case TABS.APPLIED_PROPERTIES:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Applied Properties</h3>
            {appliedProperties.length === 0 ? (
              <p className="text-gray-500">No applied properties found.</p>
            ) : (
              appliedProperties.map((application) => (
                <div key={application.id} className="bg-white p-6 rounded-lg shadow-md border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-2">
                        {application.property ? application.property.title : 'Property Details Not Available'}
                      </h4>
                      {application.property && (
                        <>
                          <p className="text-gray-600 mb-2">{application.property.location}</p>
                          <p className="text-lg font-bold text-green-600 mb-2">
                            ${application.property.price}
                          </p>
                          <p className="text-sm text-gray-500 mb-2">
                            Applied on: {new Date(application.appliedAt).toLocaleDateString()}
                          </p>
                        </>
                      )}
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          application.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : application.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {application.status || 'pending'}
                        </span>
                        {application.status === 'approved' && (
                          <button
                            onClick={() => handlePayNow(application.id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case TABS.POSTED_PROPERTIES:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Posted Properties</h3>
            {postedProperties.length === 0 ? (
              <p className="text-gray-500">No properties posted yet.</p>
            ) : (
              postedProperties.map((property) => (
                <div key={property.id} className="bg-white p-6 rounded-lg shadow-md border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-2">{property.title}</h4>
                      <p className="text-gray-600 mb-2">{property.location}</p>
                      <p className="text-lg font-bold text-green-600 mb-2">${property.price}</p>
                      <p className="text-sm text-gray-500">
                        Posted on: {new Date(property.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDeleteProperty(property.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case TABS.APPROVED_TOUR_REQUESTS:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Tour Requests</h3>
            {approvedTourRequests.length === 0 ? (
              <p className="text-gray-500">No approved tour requests.</p>
            ) : (
              approvedTourRequests.map((request) => (
                <div key={request.id} className="bg-white p-6 rounded-lg shadow-md border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-2">{request.propertyTitle}</h4>
                      <p className="text-gray-600 mb-2">Requester: {request.requesterName}</p>
                      <p className="text-gray-600 mb-2">Email: {request.requesterEmail}</p>
                      <p className="text-gray-600 mb-2">Phone: {request.requesterPhone}</p>
                      <p className="text-sm text-gray-500 mb-2">
                        Requested on: {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {request.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case TABS.PAYMENT_STATUS:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Payment Status</h3>
            {paymentStatusData.length === 0 ? (
              <p className="text-gray-500">No payment records found.</p>
            ) : (
              paymentStatusData.map((payment) => (
                <div key={payment.id} className="bg-white p-6 rounded-lg shadow-md border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-2">Payment #{payment.id}</h4>
                      <p className="text-gray-600 mb-2">Amount: ${payment.amount}</p>
                      <p className="text-gray-600 mb-2">Property: {payment.propertyTitle}</p>
                      <p className="text-sm text-gray-500 mb-2">
                        Payment Date: {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        payment.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : payment.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access your dashboard.</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user.name}!</h1>
          <p className="text-gray-600">Manage your properties and applications from your dashboard.</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {Object.entries(TABS).map(([key, value]) => (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === value
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {key.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default UserDashboard;