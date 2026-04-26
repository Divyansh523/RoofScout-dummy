// Test script to verify tour request functionality
// Copy-paste this into browser console on ViewDetail page

console.log("🧪 Testing Tour Request Functionality");

// 1. Test if the form submission functions exist
console.log("1. Checking if tour request functions are available...");
if (typeof handleTourClick !== 'undefined') {
  console.log("✅ handleTourClick function exists");
} else {
  console.log("❌ handleTourClick function not found");
}

// 2. Add test data to localStorage
console.log("2. Adding test tour request data...");
const testTourRequest = {
  id: 'TOUR-TEST-123',
  property_id: 'TEST-PROP',
  property_title: 'Test Property',
  requester_name: 'Test User',
  requester_message: 'I want to see this property',
  requested_date: 'Tomorrow',
  requested_time: '2:00 PM',
  status: 'pending',
  request_type: 'tour',
  created_at: new Date().toISOString(),
  properties: { title: 'Test Property' }
};

const existing = JSON.parse(localStorage.getItem("allTourRequests") || "[]");
existing.push(testTourRequest);
localStorage.setItem("allTourRequests", JSON.stringify(existing));
console.log("✅ Test tour request added to localStorage");

// 3. Check if data was saved
const saved = JSON.parse(localStorage.getItem("allTourRequests") || "[]");
console.log(`📊 Total tour requests in storage: ${saved.length}`);

// 4. Show instructions
console.log("\n📋 TESTING INSTRUCTIONS:");
console.log("1. Fill out the form on ViewDetail page (Name + Message)");
console.log("2. Click 'Request a Tour' button");
console.log("3. Select a date and time");
console.log("4. Click 'Request Tour' button");
console.log("5. Check if alert shows success message");
console.log("6. Go to UserDashboard → Tour Requests tab");
console.log("7. Click 'Refresh Requests' to see new requests");

console.log("\n🔍 DEBUG COMMANDS:");
console.log("- viewAllTourRequests() - See all requests");
console.log("- clearAllRequests() - Clear all test data");