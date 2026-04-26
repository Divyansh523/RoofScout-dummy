// Debug helper for testing tour requests and applications
// Run this in browser console

// Function to view all tour requests
function viewAllTourRequests() {
  const requests = JSON.parse(localStorage.getItem("allTourRequests") || "[]");
  console.log("📋 All tour requests/applications:", requests.length);
  requests.forEach((req, index) => {
    console.log(`${index + 1}. ${req.request_type} for "${req.property_title}" by ${req.requester_name || req.applicant_name} - Status: ${req.status}`);
  });
  return requests;
}

// Function to view applied properties
function viewAppliedProperties() {
  const applied = JSON.parse(localStorage.getItem("appliedProperties") || "[]");
  console.log("📋 Applied properties:", applied.length);
  applied.forEach((prop, index) => {
    console.log(`${index + 1}. ${prop.title} - ${prop.location}`);
  });
  return applied;
}

// Function to create a test tour request
function addTestTourRequest() {
  const testRequest = {
    id: `TOUR-${Date.now()}`,
    property_id: 'TEST-PROP-1',
    property_title: 'Test Property for Tour',
    requester_name: 'Test Buyer',
    requester_message: 'I am interested in viewing this property',
    requester_email: 'buyer@example.com',
    requested_date: 'Tomorrow',
    requested_time: '11:00 AM',
    status: 'pending',
    request_type: 'tour',
    created_at: new Date().toISOString(),
    properties: {
      title: 'Test Property for Tour'
    }
  };

  const existing = JSON.parse(localStorage.getItem("allTourRequests") || "[]");
  existing.push(testRequest);
  localStorage.setItem("allTourRequests", JSON.stringify(existing));
  
  console.log("✅ Test tour request added:", testRequest);
  return testRequest;
}

// Function to create a test application
function addTestApplication() {
  const testApp = {
    id: `APP-${Date.now()}`,
    property_id: 'TEST-PROP-2',
    property_title: 'Test Property for Buy',
    applicant_name: 'Test Applicant',
    applicant_message: 'I want to buy this property',
    applicant_email: 'applicant@example.com',
    user_type: 'buyer',
    reason_to_buy: 'investment',
    status: 'pending',
    request_type: 'inquiry',
    created_at: new Date().toISOString(),
    properties: {
      title: 'Test Property for Buy'
    }
  };

  const existing = JSON.parse(localStorage.getItem("allTourRequests") || "[]");
  existing.push(testApp);
  localStorage.setItem("allTourRequests", JSON.stringify(existing));
  
  console.log("✅ Test application added:", testApp);
  return testApp;
}

// Function to clear all requests
function clearAllRequests() {
  localStorage.removeItem("allTourRequests");
  localStorage.removeItem("appliedProperties");
  console.log("🗑️ All requests cleared");
}

// Function to simulate status update
function updateRequestStatus(requestId, newStatus) {
  const requests = JSON.parse(localStorage.getItem("allTourRequests") || "[]");
  const updatedRequests = requests.map(req => 
    req.id === requestId ? { ...req, status: newStatus } : req
  );
  localStorage.setItem("allTourRequests", JSON.stringify(updatedRequests));
  console.log(`✅ Request ${requestId} status updated to: ${newStatus}`);
  return updatedRequests;
}

// Function to get requests for a specific property
function getRequestsForProperty(propertyId) {
  const requests = JSON.parse(localStorage.getItem("allTourRequests") || "[]");
  const propertyRequests = requests.filter(req => req.property_id === propertyId);
  console.log(`🔍 Requests for property ${propertyId}:`, propertyRequests.length);
  propertyRequests.forEach((req, index) => {
    console.log(`${index + 1}. ${req.request_type} by ${req.requester_name || req.applicant_name} - ${req.status}`);
  });
  return propertyRequests;
}

console.log("🛠️ Tour Request Debug helpers loaded!");
console.log("Available functions:");
console.log("- viewAllTourRequests() - View all tour requests");
console.log("- viewAppliedProperties() - View applied properties");
console.log("- addTestTourRequest() - Add test tour request");
console.log("- addTestApplication() - Add test application");
console.log("- clearAllRequests() - Clear all requests");
console.log("- updateRequestStatus(id, status) - Update request status");
console.log("- getRequestsForProperty(propertyId) - Get requests for property");

// Auto-run on load
console.log("📊 Current tour requests:", JSON.parse(localStorage.getItem("allTourRequests") || "[]").length);
console.log("📊 Current applied properties:", JSON.parse(localStorage.getItem("appliedProperties") || "[]").length);