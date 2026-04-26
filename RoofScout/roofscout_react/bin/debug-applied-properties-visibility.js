// Debug helper to test applied properties visibility
// Run this in browser console to test the fixed functionality

console.log("🛠️ Applied Properties Visibility Debug Helper");

// Function to simulate a user applying for a property
function simulateUserApplication(userName, propertyData) {
  console.log(`👤 Simulating application by: ${userName}`);
  
  const userKey = `appliedProperties_${userName.replace(/\s+/g, '_')}`;
  const existingApplications = JSON.parse(localStorage.getItem(userKey) || "[]");
  
  const newApplication = {
    id: propertyData.id || `PROP-${Date.now()}`,
    title: propertyData.title || "Test Property",
    priceText: propertyData.price || "₹50,00,000",
    location: propertyData.location || "Test Location",
    applied_at: new Date().toISOString(),
    applicant_name: userName
  };
  
  // Check for duplicates
  if (!existingApplications.some(app => app.id === newApplication.id)) {
    existingApplications.push(newApplication);
    localStorage.setItem(userKey, JSON.stringify(existingApplications));
    
    // Also save to allApplications
    const allApplications = JSON.parse(localStorage.getItem("allApplications") || "[]");
    allApplications.push({
      ...newApplication,
      user_key: userKey
    });
    localStorage.setItem("allApplications", JSON.stringify(allApplications));
    
    console.log(`✅ Application saved for ${userName}`);
    return newApplication;
  } else {
    console.log(`ℹ️ ${userName} already applied for this property`);
    return null;
  }
}

// Function to test what a user can see in their dashboard
function testUserDashboardView(userName) {
  console.log(`🔍 Testing dashboard view for: ${userName}`);
  
  // Method 1: User-specific key
  const userKey = `appliedProperties_${userName.replace(/\s+/g, '_')}`;
  const userSpecificApps = JSON.parse(localStorage.getItem(userKey) || "[]");
  console.log(`Method 1 (user key): ${userSpecificApps.length} applications`);
  
  // Method 2: Search all user keys
  let foundApps = [];
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('appliedProperties_')) {
      const apps = JSON.parse(localStorage.getItem(key) || "[]");
      const userApps = apps.filter(app => app.applicant_name === userName);
      foundApps = foundApps.concat(userApps);
    }
  });
  console.log(`Method 2 (search all): ${foundApps.length} applications`);
  
  // Method 3: allApplications lookup
  const allApplications = JSON.parse(localStorage.getItem("allApplications") || "[]");
  const userAppsFromAll = allApplications.filter(app => app.applicant_name === userName);
  console.log(`Method 3 (allApplications): ${userAppsFromAll.length} applications`);
  
  return {
    userSpecific: userSpecificApps,
    searchAll: foundApps,
    fromAllApps: userAppsFromAll
  };
}

// Function to show all applied properties data
function showAllAppliedPropertiesData() {
  console.log("📊 All Applied Properties Data:");
  
  // Show user-specific keys
  const userKeys = Object.keys(localStorage).filter(key => key.startsWith('appliedProperties_'));
  console.log(`\n👥 User-specific keys (${userKeys.length}):`);
  userKeys.forEach(key => {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    const userName = key.replace('appliedProperties_', '').replace(/_/g, ' ');
    console.log(`  - ${userName}: ${data.length} applications`);
    data.forEach(app => console.log(`    • ${app.title} (${app.location})`));
  });
  
  // Show allApplications
  const allApps = JSON.parse(localStorage.getItem("allApplications") || "[]");
  console.log(`\n📋 All Applications (${allApps.length}):`);
  allApps.forEach(app => {
    console.log(`  - ${app.applicant_name}: ${app.title} (${app.location})`);
  });
  
  // Show old global data if exists
  const globalApps = JSON.parse(localStorage.getItem("appliedProperties") || "[]");
  if (globalApps.length > 0) {
    console.log(`\n⚠️ Old Global Applications (${globalApps.length}):`);
    globalApps.forEach(app => console.log(`  - ${app.title} (${app.location})`));
  }
}

// Function to test the complete flow
function testCompleteFlow() {
  console.log("🧪 Testing Complete Application Flow");
  
  // Clear test data first
  clearTestData();
  
  // 1. User A applies for Property 1
  simulateUserApplication("John Doe", {
    id: "PROP-001",
    title: "Villa in Punjab",
    price: "₹75,00,000",
    location: "Mohali, Punjab"
  });
  
  // 2. User B applies for Property 2  
  simulateUserApplication("Jane Smith", {
    id: "PROP-002", 
    title: "Flat in Chandigarh",
    price: "₹45,00,000",
    location: "Sector 17, Chandigarh"
  });
  
  // 3. User A applies for Property 2 (different property)
  simulateUserApplication("John Doe", {
    id: "PROP-002",
    title: "Flat in Chandigarh", 
    price: "₹45,00,000",
    location: "Sector 17, Chandigarh"
  });
  
  console.log("\n📊 Results:");
  console.log("John Doe should see 2 applications:");
  testUserDashboardView("John Doe");
  
  console.log("\nJane Smith should see 1 application:");
  testUserDashboardView("Jane Smith");
  
  console.log("\nOverall data:");
  showAllAppliedPropertiesData();
}

// Function to clear test data
function clearTestData() {
  const keysToRemove = [];
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('appliedProperties_') || key === 'allApplications') {
      keysToRemove.push(key);
    }
  });
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log(`🗑️ Cleared ${keysToRemove.length} test data keys`);
}

console.log("\n📋 Available functions:");
console.log("- simulateUserApplication(userName, propertyData) - Simulate user applying");
console.log("- testUserDashboardView(userName) - Test what user sees in dashboard");
console.log("- showAllAppliedPropertiesData() - Show all stored data");
console.log("- testCompleteFlow() - Run complete test scenario");
console.log("- clearTestData() - Clear all test data");

console.log("\n🎯 Quick Test:");
console.log("Run: testCompleteFlow()");

// Show current state
showAllAppliedPropertiesData();