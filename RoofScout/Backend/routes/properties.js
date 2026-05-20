const express = require("express");
const Property = require("../models/property");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * Helper: state -> common city aliases
 * Extend this map with more states and cities as needed.
 */
const STATE_MAP = {
  punjab: ["punjab", "mohali", "ludhiana", "amritsar", "jalandhar", "patiala", "bathinda", "barnala"],
  haryana: ["haryana", "gurgaon", "gurugram", "faridabad", "panipat", "ambala", "hisar", "karnal", "rohtak", "sonipat"],
  delhi: ["delhi", "new delhi", "noida", "gurgaon", "faridabad"],
  rajasthan: ["rajasthan", "jaipur", "udaipur", "jodhpur", "ajmer", "alwar", "kota", "bikaner"],
  uttarpradesh: ["uttar pradesh", "up", "lucknow", "kanpur", "agra", "varanasi", "noida", "ghaziabad"],
  // add more states and common cities here
};

/**
 * GET /api/properties
 * Public: list properties with optional filters:
 *  - state (case-insensitive)
 *  - type (plot, flat, villa, rent, pg, etc.)
 *  - minPrice, maxPrice
 *
 * Behavior:
 *  - Prefer matching `state` field.
 *  - Also match `location` (city/locality) so older docs without `state` still match.
 *  - If state provided and no results, try alias-based fallback using STATE_MAP.
 */
router.get("/", async (req, res) => {
  try {
    const { state, type, minPrice, maxPrice } = req.query;
    let filter = {};

    // Type filter
    if (type && type !== "all") filter.type = type;

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // If state provided, build an OR that checks state and location fields
    if (state) {
      const stateRegex = new RegExp(state, "i");
      filter.$or = [
        { state: stateRegex },      // match state field
        { location: stateRegex }    // fallback: match location/city text
      ];
    }

    // Query DB
    let properties = await Property.find(filter).populate("user", "name email");

    // If state was provided but no results, try alias fallback using STATE_MAP
    if (state && properties.length === 0) {
      const key = state.toLowerCase();
      const aliases = STATE_MAP[key] || [];

      if (aliases.length > 0) {
        const aliasOr = aliases.map((a) => ({ location: new RegExp(a, "i") }));
        // keep other filters (type, price) by merging
        const aliasFilter = { ...filter, $or: aliasOr };
        properties = await Property.find(aliasFilter).populate("user", "name email");
      }
    }

    return res.json({ success: true, properties });
  } catch (err) {
    console.error("GET /properties error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/properties/user
 * Protected: list properties created by the logged-in user
 */
router.get("/user", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const properties = await Property.find({ user: userId }).sort({ createdAt: -1 });
    return res.json({ success: true, properties });
  } catch (err) {
    console.error("GET /properties/user error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/properties/:id/view
 * Public: view single property by id (JSON API)
 */
router.get("/:id/view", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("user", "name email");
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }
    return res.json({ success: true, property });
  } catch (err) {
    console.error("GET /properties/:id/view error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /properties/:id/ssr
 * SSR: Server-Side Rendered property view using EJS
 */
router.get("/:id/ssr", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("user", "name email");
    if (!property) {
      return res.status(404).render("error", { message: "Property not found" });
    }
    
    // Render EJS template with property data
    res.render("property", {
      property: {
        title: property.title,
        address: property.location,
        state: property.state,
        price: property.price.toLocaleString("en-IN"),
        type: property.type,
        status: "Available",
        description: property.description,
        area: property.area,
        beds: property.beds,
        baths: property.baths,
        ownerName: property.ownerName || property.user?.name || "Owner"
      }
    });
  } catch (err) {
    console.error("GET /properties/:id/ssr error:", err);
    return res.status(500).render("error", { message: "Server error" });
  }
});

/**
 * POST /api/properties/add
 * Protected: add a new property
 * Expects JSON body with fields:
 *  title, description, price, location, state, district, type, image, area, beds, baths, garages
 */
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      location,
      state,
      district,
      type,
      image,
      area,
      beds,
      baths,
      garages,
      ownerName
    } = req.body;

    if (!title || !price) {
      return res.status(400).json({ success: false, message: "Title and price are required" });
    }

    const newProperty = new Property({
      title,
      description: description || "",
      price: Number(price),
      location: location || "",
      state: state || "",
      district: district || "",
      type: type || "plot",
      image: image || "",         // base64 or URL
      area: area ? Number(area) : undefined,
      beds: beds ? Number(beds) : undefined,
      baths: baths ? Number(baths) : undefined,
      garages: garages ? Number(garages) : undefined,
      ownerName: ownerName || "", // store owner display name
      user: req.user.id
    });

    await newProperty.save();
    
    // Emit socket event for new property
    const io = req.app.get("io");
    if (io) {
      io.emit("propertyAdded", {
        type: "propertyAdded",
        title: newProperty.title,
        ownerName: newProperty.ownerName,
        property: newProperty,
      });
    }
    
    return res.json({ success: true, property: newProperty });
  } catch (err) {
    console.error("POST /properties/add error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * PUT /api/properties/:id
 * Protected (Admin only): Edit a property
 */
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const property = await Property.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // Emit socket event for property update
    const io = req.app.get("io");
    if (io) {
      io.emit("propertyUpdated", {
        type: "propertyUpdated",
        title: property.title,
        property: property,
      });
    }

    return res.json({ success: true, property });
  } catch (err) {
    console.error("PUT /properties/:id error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * DELETE /api/properties/:id
 * Protected (Admin only): Delete a property
 */
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findByIdAndDelete(id);

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // Emit socket event for property deletion
    const io = req.app.get("io");
    if (io) {
      io.emit("propertyDeleted", {
        type: "propertyDeleted",
        title: property.title,
        property: property,
      });
    }

    return res.json({ success: true, message: "Property deleted successfully" });
  } catch (err) {
    console.error("DELETE /properties/:id error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
