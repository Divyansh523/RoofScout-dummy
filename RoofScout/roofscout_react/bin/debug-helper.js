// Debug helper for RoofScout PropertyFinder
// Open browser console and run these commands to test localStorage

// 1. Check what properties are currently saved
console.log("=== ALL PROPERTIES IN LOCALSTORAGE ===");
console.log(JSON.parse(localStorage.getItem("allProperties") || "[]"));

// 2. Check current user ID (if logged in)
console.log("=== CURRENT USER INFO ===");
console.log("User ID:", localStorage.getItem("currentUserId") || "not set");

// 3. Add a test property
function addTestProperty() {
    const testProperty = {
        id: `TEST-${Date.now()}`,
        owner_id: 'local-user',
        title: 'Debug Test Property',
        type: 'villa',
        price: 1000000,
        priceText: '₹10,00,000',
        location: 'Test City, Test State',
        area: 1500,
        image: null,
        description: 'This is a test property for debugging',
        beds: '3',
        baths: '2', 
        owner: 'Test Owner',
        created_at: new Date().toISOString()
    };
    
    const existing = JSON.parse(localStorage.getItem("allProperties") || "[]");
    existing.push(testProperty);
    localStorage.setItem("allProperties", JSON.stringify(existing));
    
    console.log("✅ Test property added:", testProperty);
    return testProperty;
}

// 4. Clear all properties
function clearAllProperties() {
    localStorage.removeItem("allProperties");
    console.log("🗑️ All properties cleared");
}

// 5. Refresh current page
function refreshPage() {
    window.location.reload();
}

console.log("=== DEBUG FUNCTIONS AVAILABLE ===");
console.log("addTestProperty() - Add a test property");
console.log("clearAllProperties() - Clear all properties");  
console.log("refreshPage() - Refresh the page");