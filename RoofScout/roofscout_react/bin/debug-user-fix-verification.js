// Applied Properties User Fix Verification
// Run this in browser console to test the fix

console.log("🔧 Testing Applied Properties User Fix");

// Helper function to simulate localStorage user profile
function setupTestUser(username) {
    const userProfile = {
        name: username,
        email: `${username.toLowerCase()}@example.com`,
        phone: "",
        address: ""
    };
    localStorage.setItem("userProfile", JSON.stringify(userProfile));
    console.log(`✅ Set up test user: ${username}`);
}

// Function to check what user ViewDetail would detect
function getViewDetailUser() {
    const getStoredJSON = (key, defaultVal = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultVal;
        } catch (error) {
            console.error(`Error parsing JSON from localStorage key "${key}":`, error);
            return defaultVal;
        }
    };

    let fetchedUsername = '';
    const localProfile = getStoredJSON("userProfile");
    
    if (localProfile?.name) {
        fetchedUsername = localProfile.name;
    } else {
        fetchedUsername = "Guest User";
    }
    
    return fetchedUsername;
}

// Function to simulate application process
function simulateApplication(propertyData, formName) {
    const loggedUser = getViewDetailUser(); // This is what ViewDetail.jsx will use
    
    console.log(`👤 Logged User: ${loggedUser}`);
    console.log(`📝 Form Name: ${formName}`);
    
    // This matches the logic in the fixed ViewDetail.jsx
    const currentUser = loggedUser || formName || 'Anonymous User';
    const userAppliedKey = `appliedProperties_${currentUser.replace(/\s+/g, '_')}`;
    
    console.log(`🗝️ Will save to key: ${userAppliedKey}`);
    
    // Get existing applications
    const getStoredJSON = (key, defaultVal = []) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultVal;
        } catch (error) {
            console.error(`Error parsing JSON from localStorage key "${key}":`, error);
            return defaultVal;
        }
    };
    
    const appliedProperties = getStoredJSON(userAppliedKey, []);
    
    const propertyApplication = {
        id: propertyData.id,
        title: propertyData.title,
        priceText: propertyData.price,
        location: propertyData.location,
        applied_at: new Date().toISOString(),
        applicant_name: currentUser
    };
    
    // Check if already applied
    const alreadyApplied = appliedProperties.some(app => app.id === propertyData.id);
    if (!alreadyApplied) {
        appliedProperties.push(propertyApplication);
        localStorage.setItem(userAppliedKey, JSON.stringify(appliedProperties));
        
        // Also save to allApplications
        const allApplications = getStoredJSON('allApplications', []);
        allApplications.push({
            ...propertyApplication,
            user_key: userAppliedKey
        });
        localStorage.setItem('allApplications', JSON.stringify(allApplications));
        
        console.log(`✅ Application saved successfully!`);
        return true;
    } else {
        console.log(`ℹ️ Already applied for this property`);
        return false;
    }
}

// Function to check if user can see their applications (UserDashboard logic)
function checkUserDashboardView(username) {
    const getStoredJSON = (key, defaultVal = []) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultVal;
        } catch (error) {
            console.error(`Error parsing JSON from localStorage key "${key}":`, error);
            return defaultVal;
        }
    };

    let appliedProperties = [];
    
    // Method 1: Try current logged user key (matching UserDashboard logic)
    const currentUserKey = `appliedProperties_${username.replace(/\s+/g, '_')}`;
    appliedProperties = getStoredJSON(currentUserKey, []);
    
    // Method 2: If no properties found, look through all user-specific keys
    if (appliedProperties.length === 0) {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('appliedProperties_')) {
                const userApps = getStoredJSON(key, []);
                const userAppsForCurrentUser = userApps.filter(app => 
                    app.applicant_name === username
                );
                appliedProperties = appliedProperties.concat(userAppsForCurrentUser);
            }
        });
    }
    
    console.log(`🔍 ${username} can see ${appliedProperties.length} applications:`);
    appliedProperties.forEach(app => {
        console.log(`   • ${app.title} (${app.location}) - Applied: ${new Date(app.applied_at).toLocaleDateString()}`);
    });
    
    return appliedProperties;
}

// Test scenario function
function runTestScenario() {
    console.log("\n🧪 Running Test Scenario:");
    console.log("Scenario: Divyansh posted property, Aadi applies for it");
    
    // 1. Clear test data
    Object.keys(localStorage).forEach(key => {
        if (key.includes('applied') || key.includes('Properties')) {
            localStorage.removeItem(key);
        }
    });
    console.log("🗑️ Cleared test data");
    
    // 2. Setup Aadi as logged-in user
    setupTestUser("Aadi");
    
    // 3. Simulate Aadi applying for Divyansh's property
    const property = {
        id: "PROP-DIV-001",
        title: "Villa by Divyansh",
        price: "₹75,00,000",
        location: "Punjab"
    };
    
    console.log("\n📝 Aadi applies for property...");
    simulateApplication(property, "Aadi Form Name"); // Form name could be different
    
    // 4. Check if Aadi can see the application in dashboard
    console.log("\n🔍 Checking Aadi's dashboard view...");
    const aadisApps = checkUserDashboardView("Aadi");
    
    // 5. Results
    if (aadisApps.length > 0) {
        console.log("\n✅ SUCCESS: Aadi can see their applied property!");
        console.log("🎯 The fix is working correctly!");
    } else {
        console.log("\n❌ FAILURE: Aadi cannot see their applied property");
        console.log("⚠️ There may still be an issue");
    }
    
    // 6. Show localStorage state
    console.log("\n📊 Final localStorage state:");
    Object.keys(localStorage).forEach(key => {
        if (key.includes('applied')) {
            const data = JSON.parse(localStorage.getItem(key) || "[]");
            console.log(`   ${key}: ${Array.isArray(data) ? data.length : 'N/A'} items`);
        }
    });
}

console.log("\n📋 Available functions:");
console.log("- setupTestUser(username) - Set up test user profile");
console.log("- getViewDetailUser() - Check what user ViewDetail would detect");
console.log("- simulateApplication(propertyData, formName) - Simulate applying for property");
console.log("- checkUserDashboardView(username) - Check dashboard view");
console.log("- runTestScenario() - Run complete test");

console.log("\n🎯 Quick Test:");
console.log("Run: runTestScenario()");