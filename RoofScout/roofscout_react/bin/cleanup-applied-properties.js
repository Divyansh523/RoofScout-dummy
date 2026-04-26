// Clean up script to fix applied properties data structure
// Run this in browser console to clean up old global applied properties

function cleanupAppliedProperties() {
  console.log("🧹 Cleaning up applied properties data structure...");
  
  // Get old global applied properties
  const oldAppliedProperties = JSON.parse(localStorage.getItem("appliedProperties") || "[]");
  console.log(`Found ${oldAppliedProperties.length} old global applied properties`);
  
  if (oldAppliedProperties.length > 0) {
    // Since we don't know which user applied for what, we'll clear the global data
    // Users will need to re-apply for properties
    localStorage.removeItem("appliedProperties");
    console.log("✅ Removed old global applied properties data");
    console.log("ℹ️ Users may need to re-apply for properties");
  }
  
  // List all user-specific applied properties
  console.log("🔍 Current user-specific applied properties:");
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("appliedProperties_")) {
      const userName = key.replace("appliedProperties_", "").replace(/_/g, " ");
      const userApplied = JSON.parse(localStorage.getItem(key) || "[]");
      console.log(`- ${userName}: ${userApplied.length} applied properties`);
    }
  });
}

function viewUserAppliedProperties(userName) {
  const userKey = `appliedProperties_${userName.replace(/\s+/g, '_')}`;
  const userApplied = JSON.parse(localStorage.getItem(userKey) || "[]");
  console.log(`📋 Applied properties for ${userName}:`, userApplied);
  return userApplied;
}

function clearUserAppliedProperties(userName) {
  const userKey = `appliedProperties_${userName.replace(/\s+/g, '_')}`;
  localStorage.removeItem(userKey);
  console.log(`🗑️ Cleared applied properties for ${userName}`);
}

function viewAllUserData() {
  console.log("👥 All user-specific data:");
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("appliedProperties_")) {
      const userName = key.replace("appliedProperties_", "").replace(/_/g, " ");
      const data = JSON.parse(localStorage.getItem(key) || "[]");
      console.log(`${userName}: ${data.length} applied properties`);
    }
  });
}

console.log("🛠️ Applied Properties Cleanup Tools Loaded!");
console.log("Available functions:");
console.log("- cleanupAppliedProperties() - Clean up old global data");
console.log("- viewUserAppliedProperties('User Name') - View specific user's applications");
console.log("- clearUserAppliedProperties('User Name') - Clear specific user's applications");
console.log("- viewAllUserData() - View all user-specific data");

// Auto-run cleanup
cleanupAppliedProperties();