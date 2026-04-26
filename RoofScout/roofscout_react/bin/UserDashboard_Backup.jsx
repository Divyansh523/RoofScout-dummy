import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { supabase } from "../src/supabase";
import useDarkMode from "../src/hooks/useDarkMode";

function UserDashboard() {
  const [loggedUser, setLoggedUser] = useState('');
  const [activeTab, setActiveTab] = useState('appliedHouses');
  const [userProfile, setUserProfile] = useState(null);
  const [tourRequests, setTourRequests] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [userId, setUserId] = useState(null);
  const [appliedProperties, setAppliedProperties] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [receivedTourRequests, setReceivedTourRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

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

  // Tab constants
  const TABS = {
    APPLIED_HOUSES: 'appliedHouses',
    MY_PROPERTIES: 'myProperties', 
    TOUR_REQUESTS_RECEIVED: 'tourRequestsReceived'
  };

//   useEffect(() => {
//     async function loadUser() {
//       // 1️⃣ Get Supabase session
//       const { data: sessionData } = await supabase.auth.getSession();
//       const session = sessionData.session;

//       if (!session?.user) {
//         navigate("/login");
//         return;
//       }

//       const userId = session.user.id;
//       setUserId(userId);

//       // 2️⃣ Fetch username from Supabase username table
//       const { data: usernameData } = await supabase
//         .from("username")
//         .select("username")
//         .eq("id", userId)
//         .single();

//       const fetchedUsername = usernameData?.username || "";

//       // 3️⃣ Load profile from localstorage (your original logic)
//       const savedProfile = getStoredJSON("userProfile");
//       const savedImage = localStorage.getItem("userProfileImage");

//       if (savedProfile) {
//         setUserProfile({
//           ...savedProfile,
//           image: savedImage,
//           name: savedProfile.name || fetchedUsername,
//         });
//       } else {
//         setUserProfile({
//           name: fetchedUsername,
//           email: session.user.email,
//           phone: "",
//           address: "",
//           image: savedImage,
//         });
//       }

//       setLoggedUser(fetchedUsername);
//     }

//     loadUser();
//   }, [navigate]);

//   useEffect(() => {
//     async function fetchProperties() {
//       if (!userId) return; // <-- guard with userId

//       const { data, error } = await supabase
//         .from("properties")
//         .select("*")
//         .eq("owner_id", userId);

//       if (error) {
//         console.log("Error fetching properties:", error);
//         setProperties([]);
//       } else {
//         setProperties(data || []);
//       }

//       setLoadingProperties(false);
//     }

//     fetchProperties();
//   }, [userId]); // <-- depend on userId (not loggedUser)

//   const handleLogout = async () => {
//     try {
//       const { error } = await supabase.auth.signOut();

//       if (error) {
//         console.log("Logout error:", error.message);
//         return;
//       }

//       // 🔥 Notify Navbar to clear username
//       window.dispatchEvent(new Event("usernameUpdated"));

//       console.log("Logged out successfully");
//       navigate("/login", { replace: true });

//     } catch (err) {
//       console.log("Unexpected logout error:", err);
//     }
//   };

//   const handleTourRequestStatus = (requestId, newStatus) => {
//     const updatedRequests = tourRequests.map(req =>
//       req.id === requestId ? { ...req, status: newStatus } : req
//     );
//     setTourRequests(updatedRequests);
//     localStorage.setItem('allTourRequests', JSON.stringify(updatedRequests));
//   };

//   // --- OWNER VIEW (Properties I listed) ---
//   const displayUserProperties = () => {
//     if (loadingProperties) {
//       return (
//         <p className="text-center text-gray-500 mt-4">
//           Loading your properties...
//         </p>
//       );
//     }

//     if (!properties || properties.length === 0) {
//       return (
//         <div className="text-center py-12">
//           <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 mb-4">
//             <i className="ri-home-3-line text-4xl text-blue-400"></i>
//           </div>
//           <p className="text-gray-500 text-lg">You haven't listed any properties yet.</p>
//           <p className="text-gray-400 text-sm mt-2">Start listing to manage your properties here</p>
//         </div>
//       );
//     }

//     return (
//       <div className="grid grid-cols-1 gap-6">
//         {properties.map(property => {
//           const iconClass =
//             property.type === "PG"
//               ? "ri-hotel-bed-line"
//               : property.type === "Rent"
//                 ? "ri-building-2-line"
//                 : "ri-home-sale-line";

//           return (
//             <div
//               key={property.id}
//               className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
//             >
//               <div className="p-6">
//                 <div className="flex flex-col sm:flex-row gap-5 items-start">
//                   <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
//                     <i className={`${iconClass} text-4xl`}></i>
//                   </div>

//                   <div className="flex-grow">
//                     <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100">{property.title}</h4>

//                     <p className="text-gray-600 dark:text-gray-300 mt-1">
//                       <strong>Type:</strong> {property.type}
//                     </p>

//                     <p className="text-gray-600 dark:text-gray-300 mt-1">
//                       <strong>Location:</strong> {property.location}
//                     </p>

//                     <p className="text-gray-700 dark:text-gray-200 font-semibold mt-2">
//                       Price: ₹{property.price}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     );
//   };


//   // --- BUYER VIEW (My Requests & Applications) ---
//   const displayAppliedProperties = () => {
//     const appliedProperties = getStoredJSON('appliedProperties', []);
//     const myTourRequests = tourRequests.filter(req => req.buyerName === loggedUser);

//     if (appliedProperties.length === 0 && myTourRequests.length === 0) {
//       return (
//         <div className="text-center py-12">
//           <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 mb-4">
//             <i className="ri-building-line text-4xl text-purple-400"></i>
//           </div>
//           <p className="text-gray-500 text-lg">You haven't applied for any houses or requested tours yet.</p>
//           <p className="text-gray-400 text-sm mt-2">Start exploring properties to see them here</p>
//         </div>
//       );
//     }

//     return (
//       <div className="space-y-8">
//         {/* 1. Show My Tour Requests */}
//         {myTourRequests.length > 0 && (
//           <div>
//             <div className="flex items-center gap-3 mb-5">
//               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
//                 <i className="ri-walk-line text-white text-xl"></i>
//               </div>
//               <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100">My Tour Requests</h4>
//               <span className="ml-auto text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 px-3 py-1 rounded-full font-semibold">
//                 {myTourRequests.length} {myTourRequests.length === 1 ? 'Request' : 'Requests'}
//               </span>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {myTourRequests.map(req => (
//                 <div key={req.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
//                   <div className="flex gap-4 items-start">
//                     <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md">
//                       <i className="ri-calendar-event-line text-3xl"></i>
//                     </div>
//                     <div className="flex-grow">
//                       <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">Tour Scheduled</h4>
//                       <div className="space-y-2">
//                         <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
//                           <i className="ri-calendar-line text-purple-500"></i>
//                           <span className="font-semibold">{req.tourDate}</span>
//                         </p>
//                         <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
//                           <i className="ri-time-line text-pink-500"></i>
//                           <span className="font-semibold">{req.tourTime}</span>
//                         </p>
//                       </div>
//                       <div className="mt-3">
//                         <span className={`inline-block text-xs font-bold px-4 py-2 rounded-lg shadow-sm ${
//                           req.status === 'Approved' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' :
//                           req.status === 'Rejected' ? 'bg-gradient-to-r from-red-400 to-red-500 text-white' :
//                           'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
//                         }`}>
//                           {req.status}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* 2. Show My Payment Applications */}
//         {appliedProperties.length > 0 && (
//           <div>
//             {myTourRequests.length > 0 && (
//               <div className="flex items-center gap-3 mb-5 mt-8">
//                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
//                   <i className="ri-file-list-3-line text-white text-xl"></i>
//                 </div>
//                 <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100">Rental Applications</h4>
//                 <span className="ml-auto text-sm text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full font-semibold">
//                   {appliedProperties.length} {appliedProperties.length === 1 ? 'Application' : 'Applications'}
//                 </span>
//               </div>
//             )}
//             <div className="grid grid-cols-1 gap-5">
//               {appliedProperties.map((application, index) => (
//                 <div key={application.id || index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
//                   <div className="p-6">
//                     <div className="flex flex-col sm:flex-row gap-5 items-start">
//                       <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg transform transition-transform duration-300 hover:scale-110 hover:rotate-3">
//                         <i className="ri-building-2-line text-4xl"></i>
//                       </div>
//                       <div className="flex-grow">
//                         <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-2">{application.title || 'Property Application'}</h4>
//                         <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-4">
//                           <i className="ri-calendar-check-line text-green-500"></i>
//                           Applied on: <span className="font-semibold">{application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : 'N/A'}</span>
//                         </p>
//                         <div className="flex flex-wrap items-center gap-3">
//                           <span className={`text-xs font-bold px-4 py-2 rounded-lg shadow-sm ${
//                             application.status === 'Approved' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' :
//                             application.status === 'Paid' ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white' :
//                             application.status === 'Rejected' ? 'bg-gradient-to-r from-red-400 to-red-500 text-white' :
//                             application.status === 'Viewed' ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white' :
//                             'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
//                           }`}>
//                             {application.status || 'Pending'}
//                           </span>
//                           {application.status === 'Approved' && (
//                             <Link 
//                               to={`/payment/${application.id}`} 
//                               className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
//                             >
//                               <i className="ri-secure-payment-line"></i>
//                               Pay Now
//                             </Link>
//                           )}
//                           {application.status === 'Paid' && (
//                             <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-50 to-blue-50 px-4 py-2 rounded-xl border border-cyan-200">
//                               <i className="ri-checkbox-circle-fill text-cyan-600 text-lg"></i>
//                               <span className="text-sm font-bold text-cyan-700">Payment Complete</span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className={theme === "dark" ? "dark" : ""}>
//       <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 font-sans min-h-screen dark:from-gray-900 dark:via-gray-950 dark:to-black">
//         <header className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50">
//           <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
//             <div className="flex items-center text-xl font-bold">
//               <h1 className="font-extrabold text-3xl bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mr-1">
//                 <Link to="/">Roof</Link>
//               </h1>
//               <h1 className="font-extrabold text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                 <Link to="/">Scout</Link>
//               </h1>
//             </div>
//             <div className="flex items-center space-x-4">

//               <button
//                 onClick={toggleTheme}
//                 className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-xl font-semibold transition"
//               >
//                 {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
//               </button>

//               <button
//                 type="button"
//                 onClick={handleLogout}
//                 className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2.5 rounded-xl text-sm transition-all duration-200 font-bold hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
//               >
//                 <i className="ri-logout-box-r-line"></i>
//                 Logout
//               </button>

//             </div>
//           </nav>
//         </header>

//         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           {/* User Profile Section */}
//           <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
//             <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
//               <div className="relative">
//                 <div className="w-36 h-36 md:w-52 md:h-52 rounded-2xl overflow-hidden border-4 border-white shadow-2xl flex-shrink-0 transition-transform duration-300 hover:scale-105 ring-4 ring-blue-100">
//                   <img
//                     src={userProfile?.image || `https://avatar.iran.liara.run/public/boy?username=${loggedUser}`}
//                     alt="User Profile"
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//                 <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
//                   <i className="ri-check-line text-white text-2xl font-bold"></i>
//                 </div>
//               </div>
//               <div className="flex-grow text-center md:text-left">
//                 <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">{userProfile?.name || loggedUser || 'User Name'}</h2>
//                 <p className="text-gray-500 dark:text-gray-400 text-base mb-6 flex items-center justify-center md:justify-start gap-2">
//                   <i className="ri-map-pin-line text-red-500"></i>
//                   {userProfile?.address || 'Address details will appear here.'}
//                 </p>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
//                   <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-all duration-200">
//                     <div className="flex items-center gap-3 mb-2">
//                       <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
//                         <i className="ri-phone-line text-white text-lg"></i>
//                       </div>
//                       <span className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">Phone</span>
//                     </div>
//                     <span className="text-gray-900 dark:text-gray-100 font-semibold text-base block pl-13">{userProfile?.phone || 'Not Available'}</span>
//                   </div>
//                   <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-all duration-200">
//                     <div className="flex items-center gap-3 mb-2">
//                       <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
//                         <i className="ri-smartphone-line text-white text-lg"></i>
//                       </div>
//                       <span className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">Mobile</span>
//                     </div>
//                     <span className="text-gray-900 dark:text-gray-100 font-semibold text-base block pl-13">{userProfile?.phone || 'Not Available'}</span>
//                   </div>
//                   <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-all duration-200">
//                     <div className="flex items-center gap-3 mb-2">
//                       <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
//                         <i className="ri-mail-line text-white text-lg"></i>
//                       </div>
//                       <span className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">Email</span>
//                     </div>
//                     <span className="text-gray-900 dark:text-gray-100 font-semibold text-base block pl-13 truncate">{userProfile?.email || 'Not Available'}</span>
//                   </div>
//                   <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-2xl border border-orange-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-all duration-200">
//                     <div className="flex items-center gap-3 mb-2">
//                       <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
//                         <i className="ri-lock-password-line text-white text-lg"></i>
//                       </div>
//                       <span className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">Password</span>
//                     </div>
//                     <span className="text-gray-900 dark:text-gray-100 font-semibold text-base block pl-13">••••••••</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
//             <div className="flex flex-wrap bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
//               <button
//                 onClick={() => setActiveTab('appliedHouses')}
//                 className={`flex-grow md:flex-none py-3 px-6 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-all duration-200 font-semibold text-sm ${
//                   activeTab === 'appliedHouses' 
//                     ? 'bg-white dark:bg-gray-900 text-blue-600 border-b-2 border-blue-600' 
//                     : ''
//                 }`}
//               >
//                 <span className="flex items-center justify-center gap-2">
//                   <i className="ri-home-heart-line"></i>
//                   Applied Houses
//                 </span>
//               </button>
//               <button
//                 onClick={() => setActiveTab('properties')}
//                 className={`flex-grow md:flex-none py-3 px-6 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-all duration-200 font-semibold text-sm ${
//                   activeTab === 'properties' 
//                     ? 'bg-white dark:bg-gray-900 text-blue-600 border-b-2 border-blue-600' 
//                     : ''
//                 }`}
//               >
//                 <span className="flex items-center justify-center gap-2">
//                   <i className="ri-building-4-line"></i>
//                   My Properties
//                 </span>
//               </button>
//               <Link
//                 to="/user-profile"
//                 className="flex-grow md:flex-none py-3 px-6 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2"
//               >
//                 <i className="ri-user-settings-line"></i>
//                 Edit Profile
//               </Link>
//             </div>

//             <div className="p-6">
//               {activeTab === 'appliedHouses' && (
//                 <div>
//                   <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Your Dashboard</h3>
//                   {displayAppliedProperties()}
//                 </div>
//               )}
//               {activeTab === 'properties' && (
//                 <div>
//                   <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Your Listed Properties</h3>
//                   {displayUserProperties()}
//                 </div>
//               )}
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

// export default UserDashboard;



// 2nd code
// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Link } from 'react-router-dom';
// import { supabase } from "../supabase";
// import useDarkMode from "../hooks/useDarkMode";

// // Define possible tabs for clarity
// const TABS = {
//     APPLIED_HOUSES: 'appliedHouses', // Buyer's applications/requests
//     MY_PROPERTIES: 'properties',      // Owner's listed properties
//     TOUR_REQUESTS_RECEIVED: 'tourRequestsReceived', // Owner's received tour requests
//     EDIT_PROFILE: 'editProfile', // A virtual tab for navigation
// };

// function UserDashboard() {
//   const [loggedUser, setLoggedUser] = useState('');
//   // Initialize with a known tab constant
//   const [activeTab, setActiveTab] = useState(TABS.APPLIED_HOUSES); 
//   const [userProfile, setUserProfile] = useState(null);
//   // Separate state for owner's received requests vs. buyer's sent requests (using local storage as before)
//   const [receivedTourRequests, setReceivedTourRequests] = useState([]); 
//   const [properties, setProperties] = useState([]);
//   const [loadingProperties, setLoadingProperties] = useState(true);
//   const [loadingRequests, setLoadingRequests] = useState(false);
//   const [userId, setUserId] = useState(null);

//   const navigate = useNavigate();
//   const { theme, toggleTheme } = useDarkMode();

//   const getStoredJSON = (key, defaultVal = null) => {
//     try {
//       const item = localStorage.getItem(key);
//       return item ? JSON.parse(item) : defaultVal;
//     } catch (error) {
//       console.error(`Error parsing JSON from localStorage key "${key}":`, error);
//       return defaultVal;
//     }
//   };

//   // --- Initial User & Profile Load (Supabase + LocalStorage) ---
//   useEffect(() => {
//     async function loadUser() {
//       const { data: sessionData } = await supabase.auth.getSession();
//       const session = sessionData.session;

//       if (!session?.user) {
//         navigate("/login");
//         return;
//       }

//       const currentUserId = session.user.id;
//       setUserId(currentUserId);

//       const { data: usernameData } = await supabase
//         .from("username")
//         .select("username")
//         .eq("id", currentUserId)
//         .single();

//       const fetchedUsername = usernameData?.username || "";
//       const savedProfile = getStoredJSON("userProfile");
//       const savedImage = localStorage.getItem("userProfileImage");

//       const profileData = savedProfile ? {
//           ...savedProfile,
//           image: savedImage,
//           name: savedProfile.name || fetchedUsername,
//         } : {
//           name: fetchedUsername,
//           email: session.user.email,
//           phone: "",
//           address: "",
//           image: savedImage,
//         };

//       setUserProfile(profileData);
//       setLoggedUser(fetchedUsername);
//     }

//     loadUser();
//   }, [navigate]);

//   // --- Fetch Properties for Owner (Depends on userId) ---
//   useEffect(() => {
//     async function fetchProperties() {
//       if (!userId) return;

//       setLoadingProperties(true);
//       const { data, error } = await supabase
//         .from("properties")
//         .select("id, title, type, location, price, owner_id") // Ensure necessary fields are selected
//         .eq("owner_id", userId);

//       if (error) {
//         console.error("Error fetching properties:", error);
//         setProperties([]);
//       } else {
//         setProperties(data || []);
//       }

//       setLoadingProperties(false);
//     }

//     fetchProperties();
//   }, [userId]);

//   // --- Fetch Tour Requests RECEIVED for Owner (Depends on properties) ---
//   useEffect(() => {
//     async function fetchTourRequests() {
//       // Only fetch if properties are loaded and we are not loading.
//       if (!properties.length || loadingProperties) return; 
      
//       setLoadingRequests(true);

//       // Get IDs of all listed properties
//       const propertyIds = properties.map(p => p.id);

//       // Fetch tour requests where property_id is one of the user's property IDs
//       const { data, error } = await supabase
//         .from("tour_requests")
//         .select(`
//           id, 
//           tourDate, 
//           tourTime, 
//           status, 
//           buyerName, 
//           property_id,
//           properties(title) // Join to get property title
//         `)
//         .in("property_id", propertyIds); // Filter by the owner's property IDs

//       if (error) {
//         console.error("Error fetching tour requests:", error);
//         setReceivedTourRequests([]);
//       } else {
//         setReceivedTourRequests(data || []);
//       }
//       setLoadingRequests(false);
//     }

//     // Only run this when properties change and userId is available (which implies properties fetch is done)
//     if(userId) {
//         fetchTourRequests();
//     }
//   }, [properties, userId, loadingProperties]);


//   // --- Logout Handler ---
//   const handleLogout = async () => {
//     try {
//       const { error } = await supabase.auth.signOut();

//       if (error) {
//         console.error("Logout error:", error.message);
//         return;
//       }

//       // Notify Navbar to clear username/state
//       window.dispatchEvent(new Event("usernameUpdated"));

//       console.log("Logged out successfully");
//       navigate("/login", { replace: true });

//     } catch (err) {
//       console.error("Unexpected logout error:", err);
//     }
//   };

//   // --- Tour Request Status Handler (Now also updates Supabase for owner requests) ---
//   const handleTourRequestStatus = async (requestId, newStatus) => {
//     try {
//         // 1. Update Supabase
//         const { error } = await supabase
//             .from('tour_requests')
//             .update({ status: newStatus })
//             .eq('id', requestId);

//         if (error) {
//             console.error("Error updating tour request status:", error);
//             return;
//         }

//         // 2. Update local state
//         setReceivedTourRequests(prevRequests => 
//             prevRequests.map(req =>
//                 req.id === requestId ? { ...req, status: newStatus } : req
//             )
//         );

//         console.log(`Request ${requestId} status updated to ${newStatus}`);

//     } catch (err) {
//         console.error("Failed to update tour request status:", err);
//     }
//   };


//   // --- RENDER FUNCTIONS ---

//   // --- OWNER VIEW (Tour Requests I received) ---
//   const displayOwnerTourRequests = () => {
//     if (loadingRequests) {
//         return (
//             <p className="text-center text-gray-500 mt-4">
//                 Loading tour requests for your properties...
//             </p>
//         );
//     }

//     if (!receivedTourRequests || receivedTourRequests.length === 0) {
//         return (
//             <div className="text-center py-12">
//                 <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-red-50 mb-4">
//                     <i className="ri-calendar-todo-line text-4xl text-red-400"></i>
//                 </div>
//                 <p className="text-gray-500 text-lg">You have no pending or past tour requests for your properties.</p>
//                 <p className="text-gray-400 text-sm mt-2">Requests will appear here once buyers schedule a tour.</p>
//             </div>
//         );
//     }

//     return (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {receivedTourRequests.map(req => {
//                 const statusColor = 
//                     req.status === 'Approved' ? 'bg-green-500' :
//                     req.status === 'Rejected' ? 'bg-red-500' : 
//                     'bg-yellow-500';

//                 return (
//                     <div 
//                         key={req.id} 
//                         className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
//                     >
//                         <div className="flex justify-between items-start mb-3">
//                             <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">
//                                 Tour for: {req.properties?.title || `Property ID: ${req.property_id}`}
//                             </h4>
//                             <span className={`px-3 py-1 text-xs font-bold text-white rounded-full ${statusColor}`}>
//                                 {req.status}
//                             </span>
//                         </div>
//                         <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
//                             Requested by: <span className="font-semibold text-gray-800 dark:text-gray-200">{req.buyerName}</span>
//                         </p>
//                         <div className="flex flex-wrap items-center gap-4 text-sm">
//                             <p className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
//                                 <i className="ri-calendar-line text-blue-500"></i>
//                                 {req.tourDate}
//                             </p>
//                             <p className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
//                                 <i className="ri-time-line text-purple-500"></i>
//                                 {req.tourTime}
//                             </p>
//                         </div>
                        
//                         {/* Action Buttons */}
//                         {req.status === 'Pending' && (
//                             <div className="mt-4 flex gap-3">
//                                 <button
//                                     onClick={() => handleTourRequestStatus(req.id, 'Approved')}
//                                     className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
//                                 >
//                                     Approve
//                                 </button>
//                                 <button
//                                     onClick={() => handleTourRequestStatus(req.id, 'Rejected')}
//                                     className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
//                                 >
//                                     Reject
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                 );
//             })}
//         </div>
//     );
//   };
  

//   // --- OWNER VIEW (Properties I listed) - No change to logic, just cleaner dependency removal ---
//   const displayUserProperties = () => {
//     if (loadingProperties) {
//       return (
//         <p className="text-center text-gray-500 mt-4">
//           Loading your properties...
//         </p>
//       );
//     }

//     if (!properties || properties.length === 0) {
//         return (
//             <div className="text-center py-12">
//                 <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 mb-4">
//                     <i className="ri-home-3-line text-4xl text-blue-400"></i>
//                 </div>
//                 <p className="text-gray-500 text-lg">You haven't listed any properties yet.</p>
//                 <p className="text-gray-400 text-sm mt-2">Start listing to manage your properties here</p>
//             </div>
//         );
//     }

//     return (
//       <div className="grid grid-cols-1 gap-6">
//         {properties.map(property => {
//           const iconClass =
//             property.type === "PG"
//               ? "ri-hotel-bed-line"
//               : property.type === "Rent"
//                 ? "ri-building-2-line"
//                 : "ri-home-sale-line";

//           return (
//             <div
//               key={property.id}
//               className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
//             >
//               <div className="p-6">
//                 <div className="flex flex-col sm:flex-row gap-5 items-start">
//                   <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
//                     <i className={`${iconClass} text-4xl`}></i>
//                   </div>

//                   <div className="flex-grow">
//                     <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100">{property.title}</h4>

//                     <p className="text-gray-600 dark:text-gray-300 mt-1">
//                       <strong>Type:</strong> {property.type}
//                     </p>

//                     <p className="text-gray-600 dark:text-gray-300 mt-1">
//                       <strong>Location:</strong> {property.location}
//                     </p>

//                     <p className="text-gray-700 dark:text-gray-200 font-semibold mt-2">
//                       Price: ₹{property.price}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     );
//   };


//   // --- BUYER VIEW (My Requests & Applications) - Using local storage 'allTourRequests' as per original code ---
//   const displayAppliedProperties = () => {
//     const appliedProperties = getStoredJSON('appliedProperties', []);
//     // Re-use the buyer's requests logic from the original implementation (still relying on localStorage)
//     const allTourRequests = getStoredJSON('allTourRequests', []); 
//     const myTourRequests = allTourRequests.filter(req => req.buyerName === loggedUser);

//     if (appliedProperties.length === 0 && myTourRequests.length === 0) {
//       return (
//         <div className="text-center py-12">
//           <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 mb-4">
//             <i className="ri-building-line text-4xl text-purple-400"></i>
//           </div>
//           <p className="text-gray-500 text-lg">You haven't applied for any houses or requested tours yet.</p>
//           <p className="text-gray-400 text-sm mt-2">Start exploring properties to see them here</p>
//         </div>
//       );
//     }

//     return (
//       <div className="space-y-8">
//         {/* 1. Show My Tour Requests */}
//         {myTourRequests.length > 0 && (
//           <div>
//             <div className="flex items-center gap-3 mb-5">
//               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
//                 <i className="ri-walk-line text-white text-xl"></i>
//               </div>
//               <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100">My Tour Requests</h4>
//               <span className="ml-auto text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 px-3 py-1 rounded-full font-semibold">
//                 {myTourRequests.length} {myTourRequests.length === 1 ? 'Request' : 'Requests'}
//               </span>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {myTourRequests.map(req => (
//                 <div key={req.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
//                   <div className="flex gap-4 items-start">
//                     <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md">
//                       <i className="ri-calendar-event-line text-3xl"></i>
//                     </div>
//                     <div className="flex-grow">
//                       <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">Tour Scheduled</h4>
//                       <div className="space-y-2">
//                         <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
//                           <i className="ri-calendar-line text-purple-500"></i>
//                           <span className="font-semibold">{req.tourDate}</span>
//                         </p>
//                         <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
//                           <i className="ri-time-line text-pink-500"></i>
//                           <span className="font-semibold">{req.tourTime}</span>
//                         </p>
//                       </div>
//                       <div className="mt-3">
//                         <span className={`inline-block text-xs font-bold px-4 py-2 rounded-lg shadow-sm ${
//                           req.status === 'Approved' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' :
//                           req.status === 'Rejected' ? 'bg-gradient-to-r from-red-400 to-red-500 text-white' :
//                           'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
//                         }`}>
//                           {req.status}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* 2. Show My Payment Applications (Unchanged) */}
//         {appliedProperties.length > 0 && (
//           <div>
//             {myTourRequests.length > 0 && (
//               <div className="flex items-center gap-3 mb-5 mt-8">
//                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
//                   <i className="ri-file-list-3-line text-white text-xl"></i>
//                 </div>
//                 <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100">Rental Applications</h4>
//                 <span className="ml-auto text-sm text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full font-semibold">
//                   {appliedProperties.length} {appliedProperties.length === 1 ? 'Application' : 'Applications'}
//                 </span>
//               </div>
//             )}
//             <div className="grid grid-cols-1 gap-5">
//               {appliedProperties.map((application, index) => (
//                 <div key={application.id || index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
//                   <div className="p-6">
//                     <div className="flex flex-col sm:flex-row gap-5 items-start">
//                       <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg transform transition-transform duration-300 hover:scale-110 hover:rotate-3">
//                         <i className="ri-building-2-line text-4xl"></i>
//                       </div>
//                       <div className="flex-grow">
//                         <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-2">{application.title || 'Property Application'}</h4>
//                         <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-4">
//                           <i className="ri-calendar-check-line text-green-500"></i>
//                           Applied on: <span className="font-semibold">{application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : 'N/A'}</span>
//                         </p>
//                         <div className="flex flex-wrap items-center gap-3">
//                           <span className={`text-xs font-bold px-4 py-2 rounded-lg shadow-sm ${
//                             application.status === 'Approved' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' :
//                             application.status === 'Paid' ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white' :
//                             application.status === 'Rejected' ? 'bg-gradient-to-r from-red-400 to-red-500 text-white' :
//                             application.status === 'Viewed' ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white' :
//                             'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
//                           }`}>
//                             {application.status || 'Pending'}
//                           </span>
//                           {application.status === 'Approved' && (
//                             <Link 
//                               to={`/payment/${application.id}`} 
//                               className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
//                             >
//                               <i className="ri-secure-payment-line"></i>
//                               Pay Now
//                             </Link>
//                           )}
//                           {application.status === 'Paid' && (
//                             <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-50 to-blue-50 px-4 py-2 rounded-xl border border-cyan-200">
//                               <i className="ri-checkbox-circle-fill text-cyan-600 text-lg"></i>
//                               <span className="text-sm font-bold text-cyan-700">Payment Complete</span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className={theme === "dark" ? "dark" : ""}>
//       <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 font-sans min-h-screen dark:from-gray-900 dark:via-gray-950 dark:to-black">
//         <header className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50">
//           <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
//             <div className="flex items-center text-xl font-bold">
//               <h1 className="font-extrabold text-3xl bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mr-1">
//                 <Link to="/">Roof</Link>
//               </h1>
//               <h1 className="font-extrabold text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                 <Link to="/">Scout</Link>
//               </h1>
//             </div>
//             <div className="flex items-center space-x-4">

//               <button
//                 onClick={toggleTheme}
//                 className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-xl font-semibold transition"
//               >
//                 {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
//               </button>

//               <button
//                 type="button"
//                 onClick={handleLogout}
//                 className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2.5 rounded-xl text-sm transition-all duration-200 font-bold hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
//               >
//                 <i className="ri-logout-box-r-line"></i>
//                 Logout
//               </button>

//             </div>
//           </nav>
//         </header>

//         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           {/* User Profile Section (Unchanged) */}
//           <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
//             <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
//               <div className="relative">
//                 <div className="w-36 h-36 md:w-52 md:h-52 rounded-2xl overflow-hidden border-4 border-white shadow-2xl flex-shrink-0 transition-transform duration-300 hover:scale-105 ring-4 ring-blue-100">
//                   <img
//                     src={userProfile?.image || `https://avatar.iran.liara.run/public/boy?username=${loggedUser}`}
//                     alt="User Profile"
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//                 <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
//                   <i className="ri-check-line text-white text-2xl font-bold"></i>
//                 </div>
//               </div>
//               <div className="flex-grow text-center md:text-left">
//                 <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">{userProfile?.name || loggedUser || 'User Name'}</h2>
//                 <p className="text-gray-500 dark:text-gray-400 text-base mb-6 flex items-center justify-center md:justify-start gap-2">
//                   <i className="ri-map-pin-line text-red-500"></i>
//                   {userProfile?.address || 'Address details will appear here.'}
//                 </p>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
//                   <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-all duration-200">
//                     <div className="flex items-center gap-3 mb-2">
//                       <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
//                         <i className="ri-phone-line text-white text-lg"></i>
//                       </div>
//                       <span className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">Phone</span>
//                     </div>
//                     <span className="text-gray-900 dark:text-gray-100 font-semibold text-base block pl-13">{userProfile?.phone || 'Not Available'}</span>
//                   </div>
//                   <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-all duration-200">
//                     <div className="flex items-center gap-3 mb-2">
//                       <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
//                         <i className="ri-smartphone-line text-white text-lg"></i>
//                       </div>
//                       <span className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">Mobile</span>
//                     </div>
//                     <span className="text-gray-900 dark:text-gray-100 font-semibold text-base block pl-13">{userProfile?.phone || 'Not Available'}</span>
//                   </div>
//                   <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-all duration-200">
//                     <div className="flex items-center gap-3 mb-2">
//                       <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
//                         <i className="ri-mail-line text-white text-lg"></i>
//                       </div>
//                       <span className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">Email</span>
//                     </div>
//                     <span className="text-gray-900 dark:text-gray-100 font-semibold text-base block pl-13 truncate">{userProfile?.email || 'Not Available'}</span>
//                   </div>
//                   <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-2xl border border-orange-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-all duration-200">
//                     <div className="flex items-center gap-3 mb-2">
//                       <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
//                         <i className="ri-lock-password-line text-white text-lg"></i>
//                       </div>
//                       <span className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">Password</span>
//                     </div>
//                     <span className="text-gray-900 dark:text-gray-100 font-semibold text-base block pl-13">••••••••</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
//             {/* Tabs Navigation */}
//             <div className="flex flex-wrap bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
//               <button
//                 onClick={() => setActiveTab(TABS.APPLIED_HOUSES)}
//                 className={`flex-grow md:flex-none py-3 px-6 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-all duration-200 font-semibold text-sm ${
//                   activeTab === TABS.APPLIED_HOUSES 
//                     ? 'bg-white dark:bg-gray-900 text-blue-600 border-b-2 border-blue-600' 
//                     : ''
//                 }`}
//               >
//                 <span className="flex items-center justify-center gap-2">
//                   <i className="ri-home-heart-line"></i>
//                   Applied Houses
//                 </span>
//               </button>
              
//               <button
//                 onClick={() => setActiveTab(TABS.MY_PROPERTIES)}
//                 className={`flex-grow md:flex-none py-3 px-6 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-all duration-200 font-semibold text-sm ${
//                   activeTab === TABS.MY_PROPERTIES 
//                     ? 'bg-white dark:bg-gray-900 text-blue-600 border-b-2 border-blue-600' 
//                     : ''
//                 }`}
//               >
//                 <span className="flex items-center justify-center gap-2">
//                   <i className="ri-building-4-line"></i>
//                   My Properties
//                 </span>
//               </button>
              
//               {/* NEW TAB: Tour Requests Received (Owner View) */}
//               <button
//                 onClick={() => setActiveTab(TABS.TOUR_REQUESTS_RECEIVED)}
//                 className={`flex-grow md:flex-none py-3 px-6 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-all duration-200 font-semibold text-sm ${
//                   activeTab === TABS.TOUR_REQUESTS_RECEIVED 
//                     ? 'bg-white dark:bg-gray-900 text-blue-600 border-b-2 border-blue-600' 
//                     : ''
//                 }`}
//               >
//                 <span className="flex items-center justify-center gap-2">
//                   <i className="ri-calendar-check-line"></i>
//                   Tour Requests ({receivedTourRequests.length})
//                 </span>
//               </button>

//               <Link
//                 to="/user-profile"
//                 className="flex-grow md:flex-none py-3 px-6 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2"
//               >
//                 <i className="ri-user-settings-line"></i>
//                 Edit Profile
//               </Link>
//             </div>
            
//             {/* Tab Content */}
//             <div className="p-6">
//               {activeTab === TABS.APPLIED_HOUSES && (
//                 <div>
//                   <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Your Applications & Sent Tours</h3>
//                   {displayAppliedProperties()}
//                 </div>
//               )}
              
//               {activeTab === TABS.MY_PROPERTIES && (
//                 <div>
//                   <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Your Listed Properties</h3>
//                   {displayUserProperties()}
//                 </div>
//               )}

//               {activeTab === TABS.TOUR_REQUESTS_RECEIVED && (
//                 <div>
//                   <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Tour Requests Received for Your Listings</h3>
//                   {displayOwnerTourRequests()}
//                 </div>
//               )}
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

// export default UserDashboard;


import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { supabase } from "../supabase";
import useDarkMode from "../hooks/useDarkMode";

// Define possible tabs for clarity
const TABS = {
    APPLIED_HOUSES: 'appliedHouses', // Buyer's applications/requests
    MY_PROPERTIES: 'properties',      // Owner's listed properties
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
    }, [navigate]);

    // --- Fetch Properties for Owner from localStorage (since Supabase not available) ---
    useEffect(() => {
        function fetchProperties() {
            if (!userId) return;

            setLoadingProperties(true);
            
            try {
                // Get all properties from localStorage
                const allProperties = JSON.parse(localStorage.getItem("allProperties") || "[]");
                
                // Filter properties where owner_id matches current user
                // Since we might not have proper user IDs in localStorage, also check for 'local-user'
                const userProperties = allProperties.filter(prop => 
                    prop.owner_id === userId || 
                    prop.owner_id === 'local-user' || 
                    !prop.owner_id // Handle properties without owner_id
                );
                
                console.log("User's properties from localStorage:", userProperties);
                setProperties(userProperties);
            } catch (error) {
                console.error("Error fetching properties from localStorage:", error);
                setProperties([]);
            }

            setLoadingProperties(false);
        }

        fetchProperties();
    }, [userId]);

    // --- Fetch Tour Requests from localStorage (since Supabase not available) ---
    useEffect(() => {
        function fetchTourRequests() {
            if (!userId || !properties.length) return;

            setLoadingRequests(true);

            try {
                // Get tour requests from localStorage
                const allTourRequests = JSON.parse(localStorage.getItem("allTourRequests") || "[]");
                
                // Use the array of property IDs for filtering
                const propertyIds = properties.map(p => p.id);
                
                // Filter requests for this user's properties
                const userTourRequests = allTourRequests.filter(req => 
                    propertyIds.includes(req.property_id)
                );
                
                console.log("User's tour requests from localStorage:", userTourRequests);
                setReceivedTourRequests(userTourRequests);
            } catch (error) {
                console.error("Error fetching tour requests from localStorage:", error);
                setReceivedTourRequests([]);
            }
            
            setLoadingRequests(false);
        }

        // Run fetchTourRequests whenever properties or userId changes
        fetchTourRequests();
    }, [properties, userId, loadingProperties]);


    // --- Logout Handler (localStorage fallback since Supabase not available) ---
    const handleLogout = async () => {
        try {
            // Try Supabase logout first
            try {
                const { error } = await supabase.auth.signOut();
                if (error) {
                    console.log("Supabase logout error (expected):", error.message);
                }
            } catch (supabaseErr) {
                console.log("Supabase not available for logout (expected):", supabaseErr.message);
            }

            // Clear local storage auth data
            localStorage.removeItem("userProfile");
            localStorage.removeItem("userProfileImage");
            localStorage.removeItem("currentUser");
            localStorage.removeItem("authToken");

            // Notify Navbar to clear username/state
            window.dispatchEvent(new Event("usernameUpdated"));

            console.log("Logged out successfully (localStorage cleared)");
            navigate("/login", { replace: true });

        } catch (err) {
            console.error("Unexpected logout error:", err);
            // Force logout even if there are errors
            navigate("/login", { replace: true });
        }
    };

    // --- Tour Request Status Handler (localStorage only) ---
    const handleTourRequestStatus = (requestId, newStatus) => {
        try {
            // 1. Update tour requests in localStorage
            const allTourRequests = JSON.parse(localStorage.getItem("allTourRequests") || "[]");
            const updatedRequests = allTourRequests.map(req =>
                req.id === requestId ? { 
                    ...req, 
                    status: newStatus,
                    updated_at: new Date().toISOString(),
                    updated_by: loggedUser || 'Property Owner'
                } : req
            );
            localStorage.setItem("allTourRequests", JSON.stringify(updatedRequests));

            // 2. Update applied properties status if this is a rental application
            if (requestId.startsWith('APP-')) {
                console.log(`🏠 Updating applied property status for ${requestId}`);
                
                // Find the request to get the applicant name
                const targetRequest = updatedRequests.find(req => req.id === requestId);
                console.log(`🔍 Target request found:`, targetRequest);
                
                if (targetRequest && targetRequest.requester_name) {
                    const applicantName = targetRequest.requester_name;
                    const userKey = `appliedProperties_${applicantName.replace(/\s+/g, '_')}`;
                    
                    console.log(`👤 Updating applied properties for user: ${applicantName}`);
                    console.log(`🔑 Using key: ${userKey}`);
                    
                    // Update user-specific applied properties
                    const userAppliedProperties = JSON.parse(localStorage.getItem(userKey) || "[]");
                    console.log(`📋 Current applied properties:`, userAppliedProperties);
                    
                    if (userAppliedProperties.length === 0) {
                        console.log(`⚠️ No applied properties found for ${applicantName}, checking all keys...`);
                        
                        // Check all possible keys for this user
                        Object.keys(localStorage).forEach(key => {
                            if (key.includes('appliedProperties') && key.includes(applicantName)) {
                                console.log(`🔍 Found potential key: ${key}`);
                                const apps = JSON.parse(localStorage.getItem(key) || "[]");
                                console.log(`📋 Apps in ${key}:`, apps);
                            }
                        });
                    }
                    
                    const displayStatus = newStatus === 'accepted' ? 'Approved' : 
                                        newStatus === 'rejected' ? 'Rejected' : 'Pending';
                    
                    // Update ALL applied properties for this user (since there might be only one)
                    const updatedAppliedProperties = userAppliedProperties.map(app => {
                        console.log(`🔄 Updating "${app.title}" from "${app.status}" to "${displayStatus}"`);
                        return {
                            ...app,
                            status: displayStatus,
                            updated_at: new Date().toISOString(),
                            updated_by: loggedUser || 'Property Owner'
                        };
                    });
                    
                    if (updatedAppliedProperties.length > 0) {
                        localStorage.setItem(userKey, JSON.stringify(updatedAppliedProperties));
                        console.log(`✅ Updated ${updatedAppliedProperties.length} applied properties for user ${applicantName}`);
                    } else {
                        console.log(`❌ No applied properties to update for ${applicantName}`);
                    }
                    
                    // Also update global applied properties as backup
                    const globalAppliedProperties = JSON.parse(localStorage.getItem('appliedProperties') || "[]");
                    const updatedGlobalAppliedProperties = globalAppliedProperties.map(app => {
                        if (app.applicant_name === applicantName) {
                            console.log(`🌐 Updating global property "${app.title}" for ${applicantName}`);
                            return {
                                ...app,
                                status: displayStatus,
                                updated_at: new Date().toISOString(),
                                updated_by: loggedUser || 'Property Owner'
                            };
                        }
                        return app;
                    });
                    localStorage.setItem('appliedProperties', JSON.stringify(updatedGlobalAppliedProperties));
                    console.log(`✅ Updated global applied properties`);
                }
            }

            // 3. Update local state
            setReceivedTourRequests(prevRequests => 
                prevRequests.map(req =>
                    req.id === requestId ? { 
                        ...req, 
                        status: newStatus,
                        updated_at: new Date().toISOString(),
                        updated_by: loggedUser || 'Property Owner'
                    } : req
                )
            );

            console.log(`Request ${requestId} status updated to ${newStatus}`);
            console.log(`Updated by: ${loggedUser || 'Property Owner'} at ${new Date().toLocaleString()}`);

            // Force page refresh to ensure UI updates
            setTimeout(() => {
                window.location.reload();
            }, 1000);

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
                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        // Update status to 'rejected' in the database
                                        onClick={() => handleTourRequestStatus(req.id, 'rejected')}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
                                    >
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
    

    // --- OWNER VIEW (Properties I listed) - No change to logic, just cleaner dependency removal ---
    const displayUserProperties = () => {
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
            <div>
                {/* Refresh Button */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        My Properties ({properties.length})
                    </h3>
                    <button
                        onClick={refreshProperties}
                        disabled={loadingProperties}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <i className="ri-refresh-line"></i>
                        {loadingProperties ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
                
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
            </div>
        );
    };
    // --- BUYER VIEW (My Requests & Applications) - Using local storage 'allTourRequests' as per original code ---
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
            appliedProperties = globalApplied.filter(app => app.applicant_name === loggedUser); // Filter by user
        }
        
        // Debug: Log applied properties status
        console.log(`📋 Applied Properties for ${loggedUser}:`);
        appliedProperties.forEach((app, index) => {
            console.log(`  ${index + 1}. ${app.title}: Status = "${app.status || 'Pending'}"`);
            console.log(`     Last updated: ${app.updated_at ? new Date(app.updated_at).toLocaleString() : 'Never'}`);
        });
        
        // Force refresh applied properties data to get latest status
        const refreshedCurrentUserKey = `appliedProperties_${loggedUser.replace(/\s+/g, '_')}`;
        const refreshedAppliedProperties = JSON.parse(localStorage.getItem(refreshedCurrentUserKey) || '[]');
        if (refreshedAppliedProperties.length > 0) {
            appliedProperties = refreshedAppliedProperties;
            console.log(`🔄 Refreshed applied properties: ${appliedProperties.length} items`);
        }
        
        // Get tour requests made by this user (filter by applicant/requester name)
        // Force fresh data fetch to ensure real-time status updates
        const allTourRequests = JSON.parse(localStorage.getItem('allTourRequests') || '[]'); 
        const myTourRequests = allTourRequests.filter(req => 
            req.requester_name === loggedUser || 
            req.applicant_name === loggedUser ||
            req.buyerName === loggedUser // Keep original logic for backward compatibility
        );
        
        // Debug: Log raw status values for troubleshooting
        myTourRequests.forEach((req, index) => {
            console.log(`Request ${index + 1} (${req.id}):`, {
                property: req.property_title || req.properties?.title,
                rawStatus: req.status,
                normalizedStatus: req.status?.toLowerCase(),
                updatedAt: req.updated_at,
                updatedBy: req.updated_by,
                fullRequest: req
            });
            
            // Alert if status mismatch detected
            if (req.updated_by && req.updated_at && req.status === 'pending') {
                console.warn(`⚠️ STATUS MISMATCH DETECTED for ${req.id}:`, {
                    status: req.status,
                    hasUpdateInfo: true,
                    updatedBy: req.updated_by
                });
            }
        });
        
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
                            <button 
                                onClick={() => window.location.reload()} 
                                className="ml-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm transition-all flex items-center gap-1"
                                title="Refresh status updates"
                            >
                                <i className="ri-refresh-line"></i>
                                Refresh
                            </button>
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
                                                {(() => {
                                                    const normalizedStatus = req.status?.toLowerCase();
                                                    const statusDisplay = normalizedStatus === 'accepted' ? 'Approved' : normalizedStatus === 'rejected' ? 'Rejected' : 'Pending';
                                                    const statusColor = 
                                                        normalizedStatus === 'accepted' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' :
                                                        normalizedStatus === 'rejected' ? 'bg-gradient-to-r from-red-400 to-red-500 text-white' :
                                                        'bg-gradient-to-r from-yellow-400 to-orange-400 text-white';
                                                    
                                                    return (
                                                        <div className="space-y-2">
                                                            <span className={`inline-block text-xs font-bold px-4 py-2 rounded-lg shadow-sm ${statusColor}`}>
                                                                {statusDisplay}
                                                            </span>
                                                            {req.updated_at && (
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Last updated: {new Date(req.updated_at).toLocaleString()}
                                                                    {req.updated_by && ` by ${req.updated_by}`}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Show My Payment Applications (Unchanged) */}
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
                        <div className="grid grid-cols-1 gap-5">
                            {appliedProperties.map((application, index) => (
                                <div key={application.id || index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="p-6">
                                        <div className="flex flex-col sm:flex-row gap-5 items-start">
                                            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg transform transition-transform duration-300 hover:scale-110 hover:rotate-3">
                                                <i className="ri-building-2-line text-4xl"></i>
                                            </div>
                                            <div className="flex-grow">
                                                <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-2">{application.title || 'Property Application'}</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-4">
                                                    <i className="ri-calendar-check-line text-green-500"></i>
                                                    Applied on: <span className="font-semibold">{application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : 'N/A'}</span>
                                                </p>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className={`text-xs font-bold px-4 py-2 rounded-lg shadow-sm ${
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
                                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-xl font-semibold transition"
                            >
                                {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
                            </button>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2.5 rounded-xl text-sm transition-all duration-200 font-bold hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                            >
                                <i className="ri-logout-box-r-line"></i>
                                Logout
                            </button>

                        </div>
                    </nav>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* User Profile Section (Unchanged) */}
                    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                            <div className="relative">
                                <div className="w-36 h-36 md:w-52 md:h-52 rounded-2xl overflow-hidden border-4 border-white shadow-2xl flex-shrink-0 transition-transform duration-300 hover:scale-105 ring-4 ring-blue-100">
                                    <img
                                        src={userProfile?.image || `https://avatar.iran.liara.run/public/boy?username=${loggedUser}`}
                                        alt="User Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <i className="ri-check-line text-white text-2xl font-bold"></i>
                                </div>
                            </div>
                            <div className="flex-grow text-center md:text-left">
                                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">{userProfile?.name || loggedUser || 'User Name'}</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-base mb-6 flex items-center justify-center md:justify-start gap-2">
                                    <i className="ri-map-pin-line text-red-500"></i>
                                    {userProfile?.address || 'Address details will appear here.'}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-all duration-200">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                                                <i className="ri-phone-line text-white text-lg"></i>
                                            </div>
                                            <span className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">Phone</span>
                                        </div>
                                        <span className="text-gray-900 dark:text-gray-100 font-semibold text-base block pl-13">{userProfile?.phone || 'Not Available'}</span>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-all duration-200">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                                                <i className="ri-smartphone-line text-white text-lg"></i>
                                            </div>
                                            <span className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">Mobile</span>
                                        </div>
                                        <span className="text-gray-900 dark:text-gray-100 font-semibold text-base block pl-13">{userProfile?.phone || 'Not Available'}</span>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-all duration-200">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                                                <i className="ri-mail-line text-white text-lg"></i>
                                            </div>
                                            <span className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">Email</span>
                                        </div>
                                        <span className="text-gray-900 dark:text-gray-100 font-semibold text-base block pl-13 truncate">{userProfile?.email || 'Not Available'}</span>
                                    </div>
                                    <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-2xl border border-orange-100 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-all duration-200">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                                                <i className="ri-lock-password-line text-white text-lg"></i>
                                            </div>
                                            <span className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">Password</span>
                                        </div>
                                        <span className="text-gray-900 dark:text-gray-100 font-semibold text-base block pl-13">••••••••</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                        {/* Tabs Navigation */}
                        <div className="flex flex-wrap bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setActiveTab(TABS.APPLIED_HOUSES)}
                                className={`flex-grow md:flex-none py-3 px-6 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-all duration-200 font-semibold text-sm ${
                                    activeTab === TABS.APPLIED_HOUSES 
                                        ? 'bg-white dark:bg-gray-900 text-blue-600 border-b-2 border-blue-600' 
                                        : ''
                                }`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <i className="ri-home-heart-line"></i>
                                    Applied Houses
                                </span>
                            </button>
                            
                            <button
                                onClick={() => setActiveTab(TABS.MY_PROPERTIES)}
                                className={`flex-grow md:flex-none py-3 px-6 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-all duration-200 font-semibold text-sm ${
                                    activeTab === TABS.MY_PROPERTIES 
                                        ? 'bg-white dark:bg-gray-900 text-blue-600 border-b-2 border-blue-600' 
                                        : ''
                                }`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <i className="ri-building-4-line"></i>
                                    My Properties
                                </span>
                            </button>
                            
                            {/* NEW TAB: Tour Requests Received (Owner View) */}
                            <button
                                onClick={() => setActiveTab(TABS.TOUR_REQUESTS_RECEIVED)}
                                className={`flex-grow md:flex-none py-3 px-6 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-all duration-200 font-semibold text-sm ${
                                    activeTab === TABS.TOUR_REQUESTS_RECEIVED 
                                        ? 'bg-white dark:bg-gray-900 text-blue-600 border-b-2 border-blue-600' 
                                        : ''
                                }`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <i className="ri-calendar-check-line"></i>
                                    Tour Requests ({receivedTourRequests.length})
                                </span>
                            </button>

                            <Link
                                to="/user-profile"
                                className="flex-grow md:flex-none py-3 px-6 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2"
                            >
                                <i className="ri-user-settings-line"></i>
                                Edit Profile
                            </Link>
                        </div>
                        
                        {/* Tab Content */}
                        <div className="p-6">
                            {activeTab === TABS.APPLIED_HOUSES && (
                                <div>
                                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Your Applications & Sent Tours</h3>
                                    {displayAppliedProperties()}
                                </div>
                            )}
                            
                            {activeTab === TABS.MY_PROPERTIES && (
                                <div>
                                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Your Listed Properties</h3>
                                    {displayUserProperties()}
                                </div>
                            )}

                            {activeTab === TABS.TOUR_REQUESTS_RECEIVED && (
                                <div>
                                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Tour Requests Received for Your Listings</h3>
                                    {displayOwnerTourRequests()}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default UserDashboard;