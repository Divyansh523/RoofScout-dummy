import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { supabase } from "../src/supabase";
import useDarkMode from "../src/hooks/useDarkMode";

// Define possible tabs for clarity
const TABS = {
    APPLIED_HOUSES: 'appliedHouses', // Buyer's applications/requests
    MY_PROPERTIES: 'properties',      // Owner's listed properties
    TOUR_REQUESTS_RECEIVED: 'tourRequestsReceived', // Owner's received tour requests
    EDIT_PROFILE: 'editProfile', // A virtual tab for navigation
};

function UserDashboard() {
    const [loggedUser, setLoggedUser] = useState('');
    // Initialize with a known tab constant
    const [activeTab, setActiveTab] = useState(TABS.APPLIED_HOUSES); 
    const [userProfile, setUserProfile] = useState(null);
    // Separate state for owner's received requests vs. buyer's sent requests (using local storage as before)
    const [receivedTourRequests, setReceivedTourRequests] = useState([]); 
    const [properties, setProperties] = useState([]);
    const [loadingProperties, setLoadingProperties] = useState(true);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [userId, setUserId] = useState(null);

    const navigate = useNavigate();
    const { theme, toggleTheme } = useDarkMode();

    const getStoredJSON = (key, defaultVal = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultVal;
        } catch (error) {
            console.error(`Error parsing JSON from localStorage key "${key}":`, error);
            return defaultVal;
        }
    };

    // Function to refresh properties from localStorage
    const refreshProperties = () => {
        if (!userId) return;
        
        setLoadingProperties(true);
        
        try {
            const allProperties = JSON.parse(localStorage.getItem("allProperties") || "[]");
            const userProperties = allProperties.filter(prop => 
                prop.owner_id === userId || 
                prop.owner_id === 'local-user' || 
                !prop.owner_id
            );
            
            console.log("Refreshed user properties:", userProperties);
            setProperties(userProperties);
        } catch (error) {
            console.error("Error refreshing properties:", error);
            setProperties([]);
        }
        
        setLoadingProperties(false);
    };

    // --- Initial User & Profile Load (localStorage fallback since Supabase not available) ---
    useEffect(() => {
        async function loadUser() {
            let session = null;
            let currentUserId = 'local-user';
            let fetchedUsername = 'Local User';

            // Try Supabase auth first
            try {
                const { data: sessionData } = await supabase.auth.getSession();
                session = sessionData.session;
                
                if (session?.user) {
                    currentUserId = session.user.id;
                    setUserId(currentUserId);

                    // Try to get username from Supabase
                    try {
                        const { data: usernameData } = await supabase
                            .from("username")
                            .select("username")
                            .eq("id", currentUserId)
                            .single();
                        fetchedUsername = usernameData?.username || session.user.email || "User";
                    } catch (err) {
                        console.log("Could not fetch username from Supabase:", err);
                        fetchedUsername = session.user.email || "User";
                    }
                }
            } catch (authErr) {
                console.log("Supabase auth not available, using localStorage:", authErr);
            }

            // If no Supabase session, use localStorage fallback
            if (!session?.user) {
                const localProfile = getStoredJSON("userProfile");
                if (localProfile?.name) {
                    currentUserId = 'local-user';
                    fetchedUsername = localProfile.name;
                    setUserId(currentUserId);
                } else {
                    // For testing: create a default local user if none exists
                    const defaultProfile = {
                        name: "Test User",
                        email: "test@example.com",
                        phone: "",
                        address: ""
                    };
                    localStorage.setItem("userProfile", JSON.stringify(defaultProfile));
                    currentUserId = 'local-user';
                    fetchedUsername = "Test User";
                    setUserId(currentUserId);
                    console.log("Created default test user for demo");
                }
            }

            const savedProfile = getStoredJSON("userProfile");
            const savedImage = localStorage.getItem("userProfileImage");

            const profileData = savedProfile ? {
                ...savedProfile,
                image: savedImage,
                name: savedProfile.name || fetchedUsername,
            } : {
                name: fetchedUsername,
                email: session?.user?.email || "user@example.com",
                phone: "",
                address: "",
                image: savedImage,
            };

            setUserProfile(profileData);
            setLoggedUser(fetchedUsername);
        }

        loadUser();
    }, []);

    // --- Load Properties when userId changes ---
    useEffect(() => {
        if (userId) {
            refreshProperties();
        }
    }, [userId]);

    // --- Load Tour Requests based on user's properties ---
    useEffect(() => {
        if (properties.length > 0) {
            setLoadingRequests(true);
            
            try {
                const allTourRequests = JSON.parse(localStorage.getItem("allTourRequests") || "[]");
                const propertyIds = properties.map(p => p.id);
                const userTourRequests = allTourRequests.filter(req => 
                    propertyIds.includes(req.property_id)
                );
                
                console.log("User's tour requests from localStorage:", userTourRequests);
                setReceivedTourRequests(userTourRequests);
            } catch (error) {
                console.error("Error loading tour requests:", error);
                setReceivedTourRequests([]);
            }
            
            setLoadingRequests(false);
        }
    }, [properties]);

    // Handle logout
    const handleLogout = () => {
        // Clear localStorage
        localStorage.clear();
        console.log("Logged out successfully (localStorage cleared)");
        navigate("/");
    };

    const handleTourRequestStatus = (requestId, newStatus) => {
        try {
            // 1. Update tour requests in localStorage
            const allTourRequests = JSON.parse(localStorage.getItem("allTourRequests") || "[]");
            const updatedRequests = allTourRequests.map(req =>
                req.id === requestId ? { ...req, status: newStatus } : req
            );
            localStorage.setItem("allTourRequests", JSON.stringify(updatedRequests));

            // 2. Find the corresponding tour request to get applicant info
            const tourRequest = allTourRequests.find(req => req.id === requestId);
            
            if (tourRequest) {
                // 3. Update corresponding property application status
                const applicantName = tourRequest.requester_name || tourRequest.applicant_name;
                const propertyId = tourRequest.property_id;
                
                if (applicantName && propertyId) {
                    // Update in user-specific applied properties
                    const userKey = `appliedProperties_${applicantName.replace(/\s+/g, '_')}`;
                    const userAppliedProperties = JSON.parse(localStorage.getItem(userKey) || "[]");
                    
                    const updatedUserAppliedProperties = userAppliedProperties.map(app => {
                        if (app.id === propertyId) {
                            const statusMapping = {
                                'accepted': 'Approved',
                                'rejected': 'Rejected',
                                'Approved': 'Approved',
                                'Rejected': 'Rejected'
                            };
                            return { ...app, status: statusMapping[newStatus] || newStatus };
                        }
                        return app;
                    });
                    
                    localStorage.setItem(userKey, JSON.stringify(updatedUserAppliedProperties));
                    
                    // Also update in allApplications if it exists
                    const allApplications = JSON.parse(localStorage.getItem("allApplications") || "[]");
                    const updatedAllApplications = allApplications.map(app => {
                        if (app.id === propertyId && app.applicant_name === applicantName) {
                            const statusMapping = {
                                'accepted': 'Approved',
                                'rejected': 'Rejected',
                                'Approved': 'Approved',
                                'Rejected': 'Rejected'
                            };
                            return { ...app, status: statusMapping[newStatus] || newStatus };
                        }
                        return app;
                    });
                    localStorage.setItem("allApplications", JSON.stringify(updatedAllApplications));
                    
                    console.log(`Updated property application status for ${applicantName} on property ${propertyId} to ${newStatus}`);
                }
            }

            // 4. Update local tour requests state
            setReceivedTourRequests(prevRequests => 
                prevRequests.map(req =>
                    req.id === requestId ? { ...req, status: newStatus } : req
                )
            );

            console.log(`Request ${requestId} status updated to ${newStatus}`);

        } catch (err) {
            console.error("Failed to update tour request status:", err);
        }
    };

    // --- RENDER FUNCTIONS ---

    // --- OWNER VIEW (Tour Requests I received) ---
    const displayOwnerTourRequests = () => {
        if (loadingRequests) {
            return (
                <p className="text-center text-gray-500 mt-4">
                    Loading tour requests for your properties...
                </p>
            );
        }

        if (!receivedTourRequests || receivedTourRequests.length === 0) {
            return (
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-red-50 mb-4">
                        <i className="ri-calendar-todo-line text-4xl text-red-400"></i>
                    </div>
                    <p className="text-gray-500 text-lg">You have no pending or past tour requests for your properties.</p>
                    <p className="text-gray-400 text-sm mt-2">Requests will appear here once buyers schedule a tour.</p>
                </div>
            );
        }

        return (
            <div>
                {/* Refresh Button for Tour Requests */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Tour Requests ({receivedTourRequests.length})
                    </h3>
                    <button
                        onClick={() => {
                            // Refresh tour requests from localStorage
                            if (properties.length > 0) {
                                const allTourRequests = JSON.parse(localStorage.getItem("allTourRequests") || "[]");
                                const propertyIds = properties.map(p => p.id);
                                const userTourRequests = allTourRequests.filter(req => 
                                    propertyIds.includes(req.property_id)
                                );
                                setReceivedTourRequests(userTourRequests);
                                console.log("Refreshed tour requests:", userTourRequests.length);
                            }
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                    >
                        <i className="ri-refresh-line"></i>
                        Refresh Requests
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {receivedTourRequests.map(req => {
                        // Normalize status display for case comparison (using 'Approved' and 'Rejected' in the dashboard, but saving 'accepted' and 'rejected' might be cleaner)
                        const normalizedStatus = req.status?.toLowerCase();
                        const statusDisplay = normalizedStatus === 'accepted' ? 'Approved' : normalizedStatus === 'rejected' ? 'Rejected' : 'Pending';

                        const statusColor = 
                            normalizedStatus === 'accepted' ? 'bg-green-500' :
                            normalizedStatus === 'rejected' ? 'bg-red-500' : 
                            'bg-yellow-500';

                        const isPending = normalizedStatus !== 'accepted' && normalizedStatus !== 'rejected';
                        
                        // Display date and time only for 'tour' requests, show message for 'enquiry' requests
                        const isTourRequest = req.request_type === 'tour';

                        return (
                            <div 
                                key={req.id} 
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                        {isTourRequest ? 'Tour Request' : 'General Enquiry'} for: {req.properties?.title || `Property ID: ${req.property_id}`}
                                    </h4>
                                    <span className={`px-3 py-1 text-xs font-bold text-white rounded-full ${statusColor}`}>
                                        {statusDisplay}
                                    </span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                                    Requested by: <span className="font-semibold text-gray-800 dark:text-gray-200">{req.requester_name}</span>
                                </p>
                                
                                {/* Payment Status Notification */}
                                {req.payment_status === 'Paid' && (
                                    <div className="mb-4 p-3 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <i className="ri-money-dollar-circle-fill text-green-600 text-xl"></i>
                                            <div>
                                                <p className="text-green-800 font-semibold text-sm">Payment Received!</p>
                                                <p className="text-green-700 text-xs">₹5,000 booking amount paid on {new Date(req.paymentDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {isTourRequest ? (
                                    <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
                                        <p className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                                            <i className="ri-calendar-line text-blue-500"></i>
                                            {req.requested_date}
                                        </p>
                                        <p className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                                            <i className="ri-time-line text-purple-500"></i>
                                            {req.requested_time}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-gray-700 dark:text-gray-200 text-sm italic mb-3">
                                        Message: "{req.requester_message || 'No message provided.'}"
                                    </p>
                                )}

                                {/* Action Buttons */}
                                {isPending && (
                                    <div className="mt-4 flex gap-3">
                                        <button
                                            // Update status to 'accepted' in the database
                                            onClick={() => handleTourRequestStatus(req.id, 'accepted')}
                                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
                                        >
                                            <i className="ri-check-line"></i>
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleTourRequestStatus(req.id, 'rejected')}
                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
                                        >
                                            <i className="ri-close-line"></i>
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // --- OWNER VIEW (My Properties) ---
    const displayUserProperties = () => {
        console.log("User's properties from localStorage:", properties);

        if (loadingProperties) {
            return (
                <p className="text-center text-gray-500 mt-4">
                    Loading your properties...
                </p>
            );
        }

        if (!properties || properties.length === 0) {
            return (
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 mb-4">
                        <i className="ri-home-3-line text-4xl text-blue-400"></i>
                    </div>
                    <p className="text-gray-500 text-lg">You haven't listed any properties yet.</p>
                    <p className="text-gray-400 text-sm mt-2">Start listing to manage your properties here</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 gap-6">
                {properties.map(property => {
                    const iconClass =
                        property.type === "PG"
                            ? "ri-hotel-bed-line"
                            : property.type === "Rent"
                                ? "ri-building-2-line"
                                : "ri-home-sale-line";

                    return (
                        <div
                            key={property.id}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className="p-6">
                                <div className="flex flex-col sm:flex-row gap-5 items-start">
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                                        <i className={`${iconClass} text-4xl`}></i>
                                    </div>

                                    <div className="flex-grow">
                                        <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100">{property.title}</h4>

                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                            <strong>Type:</strong> {property.type}
                                        </p>

                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                            <strong>Location:</strong> {property.location}
                                        </p>

                                        <p className="text-gray-700 dark:text-gray-200 font-semibold mt-2">
                                            Price: ₹{property.price}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // --- BUYER VIEW (My Requests & Applications) ---
    const displayAppliedProperties = () => {
        // Get applied properties - try multiple user identification methods
        let appliedProperties = [];
        
        // Method 1: Try current logged user key
        const currentUserKey = `appliedProperties_${loggedUser.replace(/\s+/g, '_')}`;
        appliedProperties = getStoredJSON(currentUserKey, []);
        
        // Method 2: If no properties found, look through all user-specific keys for this user's applications
        if (appliedProperties.length === 0) {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('appliedProperties_')) {
                    const userApps = getStoredJSON(key, []);
                    const userAppsForCurrentUser = userApps.filter(app => 
                        app.applicant_name === loggedUser
                    );
                    appliedProperties = appliedProperties.concat(userAppsForCurrentUser);
                }
            });
        }
        
        // Method 3: Also check old global applied properties as fallback
        if (appliedProperties.length === 0) {
            const globalApplied = getStoredJSON('appliedProperties', []);
            appliedProperties = globalApplied; // Show all if no user-specific found
        }
        
        // Get tour requests made by this user (filter by applicant/requester name)
        const allTourRequests = getStoredJSON('allTourRequests', []); 
        const myTourRequests = allTourRequests.filter(req => 
            req.requester_name === loggedUser || 
            req.applicant_name === loggedUser ||
            req.buyerName === loggedUser // Keep original logic for backward compatibility
        );
        
        console.log(`Applied properties for user ${loggedUser}:`, appliedProperties.length);
        console.log(`Tour requests by user ${loggedUser}:`, myTourRequests.length);
        console.log('Available localStorage keys:', Object.keys(localStorage).filter(k => k.includes('applied')));

        if (appliedProperties.length === 0 && myTourRequests.length === 0) {
            return (
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 mb-4">
                        <i className="ri-building-line text-4xl text-purple-400"></i>
                    </div>
                    <p className="text-gray-500 text-lg">You haven't applied for any houses or requested tours yet.</p>
                    <p className="text-gray-400 text-sm mt-2">Start exploring properties to see them here</p>
                </div>
            );
        }

        return (
            <div className="space-y-8">
                {/* 1. Show My Tour Requests */}
                {myTourRequests.length > 0 && (
                    <div>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                <i className="ri-walk-line text-white text-xl"></i>
                            </div>
                            <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100">My Tour Requests</h4>
                            <span className="ml-auto text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 px-3 py-1 rounded-full font-semibold">
                                {myTourRequests.length} {myTourRequests.length === 1 ? 'Request' : 'Requests'}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myTourRequests.map(req => (
                                <div key={req.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="flex gap-4 items-start">
                                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md">
                                            <i className="ri-calendar-event-line text-3xl"></i>
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">Tour Scheduled</h4>
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                                    <i className="ri-calendar-line text-purple-500"></i>
                                                    <span className="font-semibold">{req.tourDate}</span>
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                                    <i className="ri-time-line text-pink-500"></i>
                                                    <span className="font-semibold">{req.tourTime}</span>
                                                </p>
                                            </div>
                                            <div className="mt-3">
                                                <span className={`inline-block text-xs font-bold px-4 py-2 rounded-lg shadow-sm ${
                                                    req.status === 'Approved' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' :
                                                    req.status === 'Rejected' ? 'bg-gradient-to-r from-red-400 to-red-500 text-white' :
                                                    'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                                                }`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Show My Payment Applications */}
                {appliedProperties.length > 0 && (
                    <div>
                        {myTourRequests.length > 0 && (
                            <div className="flex items-center gap-3 mb-5 mt-8">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                                    <i className="ri-file-list-3-line text-white text-xl"></i>
                                </div>
                                <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100">Rental Applications</h4>
                                <span className="ml-auto text-sm text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full font-semibold">
                                    {appliedProperties.length} {appliedProperties.length === 1 ? 'Application' : 'Applications'}
                                </span>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {appliedProperties.map(application => (
                                <div key={application.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                                                <i className="ri-home-4-line text-3xl"></i>
                                            </div>
                                            <div className="flex-grow">
                                                <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2 leading-tight">{application.title}</h4>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">
                                                    <i className="ri-map-pin-line text-green-500 mr-1"></i>
                                                    {application.location}
                                                </p>
                                                <p className="text-gray-700 dark:text-gray-200 font-semibold text-sm">
                                                    <i className="ri-money-rupee-circle-line text-green-600 mr-1"></i>
                                                    {application.priceText}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className={`inline-block text-xs font-bold px-4 py-2 rounded-lg shadow-sm ${
                                                    application.status === 'Approved' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' :
                                                    application.status === 'Paid' ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white' :
                                                    application.status === 'Rejected' ? 'bg-gradient-to-r from-red-400 to-red-500 text-white' :
                                                    application.status === 'Viewed' ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white' :
                                                    'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                                                }`}>
                                                    {application.status || 'Pending'}
                                                </span>
                                                {application.status === 'Approved' && (
                                                    <Link 
                                                        to={`/payment/${application.id}`} 
                                                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                                                    >
                                                        <i className="ri-secure-payment-line"></i>
                                                        Pay Now
                                                    </Link>
                                                )}
                                                {application.status === 'Paid' && (
                                                    <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-50 to-blue-50 px-4 py-2 rounded-xl border border-cyan-200">
                                                        <i className="ri-checkbox-circle-fill text-cyan-600 text-lg"></i>
                                                        <span className="text-sm font-bold text-cyan-700">Payment Complete</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={theme === "dark" ? "dark" : ""}>
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 font-sans min-h-screen dark:from-gray-900 dark:via-gray-950 dark:to-black">
                <header className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50">
                    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div className="flex items-center text-xl font-bold">
                            <h1 className="font-extrabold text-3xl bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mr-1">
                                <Link to="/">Roof</Link>
                            </h1>
                            <h1 className="font-extrabold text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                <Link to="/">Scout</Link>
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={toggleTheme}
                                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                            >
                                {theme === "dark" ? (
                                    <i className="ri-sun-line text-2xl"></i>
                                ) : (
                                    <i className="ri-moon-line text-2xl"></i>
                                )}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </nav>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            Welcome back, {loggedUser}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            Manage your properties and rental applications from your dashboard
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="mb-8">
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="-mb-px flex space-x-8">
                                {[
                                    { id: TABS.APPLIED_HOUSES, label: "Applied Houses", icon: "ri-building-line" },
                                    { id: TABS.MY_PROPERTIES, label: "My Properties", icon: "ri-home-3-line" },
                                    { id: TABS.TOUR_REQUESTS_RECEIVED, label: "Tour Requests", icon: "ri-calendar-todo-line" },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                                            activeTab === tab.id
                                                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                                        }`}
                                    >
                                        <i className={`${tab.icon} text-lg`}></i>
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                        {activeTab === TABS.APPLIED_HOUSES && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Applied Houses</h2>
                                </div>
                                {displayAppliedProperties()}
                            </div>
                        )}

                        {activeTab === TABS.MY_PROPERTIES && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Properties</h2>
                                    <Link
                                        to="/sell"
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <i className="ri-add-line"></i>
                                        Add Property
                                    </Link>
                                </div>
                                {displayUserProperties()}
                            </div>
                        )}

                        {activeTab === TABS.TOUR_REQUESTS_RECEIVED && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tour Requests Received</h2>
                                </div>
                                {displayOwnerTourRequests()}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default UserDashboard;