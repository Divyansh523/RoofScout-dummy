// Test user-specific applied properties functionality
// Run this in browser console

console.log("🧪 Testing User-Specific Applied Properties");

// 1. Simulate applications from different users
function testUserSpecificApplications() {
  console.log("1. Creating test applications from different users...");
  
  // User 1 applications
  const user1Key = "appliedProperties_Test_User_1";
  const user1Applications = [
    {
      id: "PROP-001",
      title: "Villa in Punjab",
      priceText: "₹50,00,000",
      location: "Mohali, Punjab",
      applied_at: new Date().toISOString(),
      applicant_name: "Test User 1"
    }
  ];
  localStorage.setItem(user1Key, JSON.stringify(user1Applications));
  
  // User 2 applications
  const user2Key = "appliedProperties_Test_User_2";
  const user2Applications = [
    {
      id: "PROP-002",
      title: "Flat in Chandigarh",
      priceText: "₹30,00,000",
      location: "Sector 17, Chandigarh",
      applied_at: new Date().toISOString(),
      applicant_name: "Test User 2"
    }
  ];
  localStorage.setItem(user2Key, JSON.stringify(user2Applications));
  
  console.log("✅ Created test applications for 2 different users");
  
  return { user1Applications, user2Applications };
}

// 2. Test viewing user-specific data
function viewUserSpecificData() {
  console.log("2. Viewing user-specific applied properties:");
  
  const user1Data = JSON.parse(localStorage.getItem("appliedProperties_Test_User_1") || "[]");
  const user2Data = JSON.parse(localStorage.getItem("appliedProperties_Test_User_2") || "[]");
  
  console.log("User 1 applications:", user1Data.length);
  user1Data.forEach(app => console.log(`  - ${app.title} (${app.location})`));
  
  console.log("User 2 applications:", user2Data.length);
  user2Data.forEach(app => console.log(`  - ${app.title} (${app.location})`));
  
  return { user1Data, user2Data };
}

// 3. Test old global data cleanup
function testGlobalDataSeparation() {
  console.log("3. Testing global vs user-specific data:");
  
  const globalData = JSON.parse(localStorage.getItem("appliedProperties") || "[]");
  console.log(`Global applied properties: ${globalData.length} (should be 0 after cleanup)`);
  
  const userSpecificKeys = Object.keys(localStorage).filter(key => 
    key.startsWith("appliedProperties_")
  );
  console.log(`User-specific keys: ${userSpecificKeys.length}`);
  userSpecificKeys.forEach(key => {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    const userName = key.replace("appliedProperties_", "").replace(/_/g, " ");
    console.log(`  - ${userName}: ${data.length} applications`);
  });
}

// 4. Cleanup test data
function cleanupTestData() {
  localStorage.removeItem("appliedProperties_Test_User_1");
  localStorage.removeItem("appliedProperties_Test_User_2");
  console.log("🗑️ Cleaned up test data");
}

console.log("🛠️ User-Specific Applied Properties Test Suite");
console.log("Available test functions:");
console.log("- testUserSpecificApplications() - Create test data for different users");
console.log("- viewUserSpecificData() - View user-specific applied properties");
console.log("- testGlobalDataSeparation() - Check global vs user-specific separation");
console.log("- cleanupTestData() - Remove test data");

console.log("\n📋 TESTING INSTRUCTIONS:");
console.log("1. Run testUserSpecificApplications() to create test data");
console.log("2. Run viewUserSpecificData() to see user separation");
console.log("3. Go to UserDashboard and check 'Applied Properties' tab");
console.log("4. Should only see applications for the current logged-in user");
console.log("5. Run cleanupTestData() when done testing");

// Show current state
testGlobalDataSeparation();