// Debug helper for testing property visibility
// Run this in browser console to test property posting and viewing

// Function to add a test property
function addTestProperty() {
  const testProperty = {
    id: `TEST-${Date.now()}`,
    owner_id: 'test-user',
    title: 'Test Property in Punjab',
    type: 'villa',
    price: 5000000,
    location: 'Mohali, Punjab',
    area: 2000,
    image: null,
    description: 'This is a test property',
    details: '4 Bed, 3 Bath, 2000 sqft',
    beds: '4',
    baths: '3',
    owner: 'Test Owner',
    created_at: new Date().toISOString(),
    priceText: '₹50,00,000'
  };
  
  const existing = JSON.parse(localStorage.getItem("allProperties") || "[]");
  existing.push(testProperty);
  localStorage.setItem("allProperties", JSON.stringify(existing));
  
  console.log("✅ Test property added:", testProperty);
  console.log("📊 Total properties in localStorage:", existing.length);
  return testProperty;
}

// Function to view all properties
function viewAllProperties() {
  const properties = JSON.parse(localStorage.getItem("allProperties") || "[]");
  console.log("📋 All properties in localStorage:");
  properties.forEach((p, index) => {
    console.log(`${index + 1}. ${p.title} - ${p.location} (${p.type})`);
  });
  return properties;
}

// Function to clear all properties
function clearAllProperties() {
  localStorage.removeItem("allProperties");
  console.log("🗑️ All properties cleared");
}

// Function to check properties for a specific state
function checkPropertiesForState(stateName) {
  const properties = JSON.parse(localStorage.getItem("allProperties") || "[]");
  const matchingProperties = properties.filter(p => 
    (p.location || "").toLowerCase().includes(stateName.toLowerCase()) ||
    (p.state || "").toLowerCase().includes(stateName.toLowerCase())
  );
  
  console.log(`🔍 Properties in ${stateName}:`, matchingProperties.length);
  matchingProperties.forEach((p, index) => {
    console.log(`${index + 1}. ${p.title} - ${p.location}`);
  });
  
  return matchingProperties;
}

// Function to reload the current page
function refreshPage() {
  window.location.reload();
}

console.log("🛠️ Debug helpers loaded!");
console.log("Available functions:");
console.log("- addTestProperty() - Add a test property");
console.log("- viewAllProperties() - View all properties");
console.log("- checkPropertiesForState('punjab') - Check properties for a state");
console.log("- clearAllProperties() - Clear all properties");
console.log("- refreshPage() - Reload the page");

// Auto-run on load
console.log("📊 Current property count:", JSON.parse(localStorage.getItem("allProperties") || "[]").length);