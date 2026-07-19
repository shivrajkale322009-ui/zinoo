export function validatePropertyLocation(property) {
  const latitude = Number(property.latitude);
  const longitude = Number(property.longitude);

  if (
    property.latitude === undefined ||
    property.longitude === undefined ||
    Number.isNaN(latitude) ||
    Number.isNaN(longitude)
  ) {
    return {
      isValid: false,
      status: "missing",
      errorType: "exact_location_missing",
      message: "Exact latitude and longitude are missing."
    };
  }

  if (latitude === 0 && longitude === 0) {
    return {
      isValid: false,
      status: "invalid",
      errorType: "invalid_coordinates",
      message: "Default coordinates cannot be used as the project location."
    };
  }

  if (
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return {
      isValid: false,
      status: "invalid",
      errorType: "invalid_coordinates",
      message: "The saved latitude or longitude is invalid."
    };
  }

  // Check expected region (Chakan and surroundings: lat 18.0 to 19.5, lng 73.0 to 74.5)
  if (latitude < 18.0 || latitude > 19.5 || longitude < 73.0 || longitude > 74.5) {
    return {
      isValid: false,
      status: "needs_review",
      errorType: "invalid_coordinates",
      message: "Coordinates are outside the expected project region."
    };
  }

  if (!property.mapMarkerConfirmed) {
    return {
      isValid: false,
      status: "not_confirmed",
      errorType: "marker_not_confirmed",
      message: "The exact map marker has not been confirmed."
    };
  }

  return {
    isValid: true,
    status: "verified",
    errorType: null,
    message: null
  };
}

export function validateProperty(property) {
  const errors = [];

  // 1. Exact Map Location
  const locVal = validatePropertyLocation(property);
  if (!locVal.isValid) {
    errors.push({
      id: `err_loc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: locVal.errorType || "other",
      title: locVal.errorType === "exact_location_missing" ? "Exact Map Location Missing" : "Invalid Coordinates",
      description: locVal.message,
      severity: locVal.status === "missing" ? "critical" : "high",
      status: "open",
      detectedAt: new Date().toISOString()
    });
  }

  // 2. Missing Property Name
  if (!property.name || !property.name.trim()) {
    errors.push({
      id: `err_name_${Date.now()}`,
      type: "missing_name",
      title: "Missing Property Name",
      description: "The property does not have a valid name.",
      severity: "critical",
      status: "open",
      detectedAt: new Date().toISOString()
    });
  }

  // 3. Missing Price Information
  const startingPrice = Number(property.startingPrice ?? property.priceFrom);
  if (!startingPrice || Number.isNaN(startingPrice) || startingPrice <= 0) {
    errors.push({
      id: `err_price_${Date.now()}`,
      type: "missing_price",
      title: "Missing Price Information",
      description: "Starting price is required and must be greater than zero.",
      severity: "high",
      status: "open",
      detectedAt: new Date().toISOString()
    });
  }

  // 4. Missing Cover Image
  const coverImage = property.thumbnail || property.heroImage || property.coverImage;
  if (!coverImage || !coverImage.trim()) {
    errors.push({
      id: `err_cover_${Date.now()}`,
      type: "missing_cover_image",
      title: "Missing Cover Image",
      description: "Property must have a cover or hero image.",
      severity: "medium",
      status: "open",
      detectedAt: new Date().toISOString()
    });
  }

  // 5. Missing Required Legal Information (e.g. NA Status / Land Zone)
  if (!property.naStatus || !property.landZone) {
    errors.push({
      id: `err_legal_${Date.now()}`,
      type: "missing_legal_information",
      title: "Missing Required Legal Information",
      description: "Land zone and NA status are required legal fields.",
      severity: "medium",
      status: "open",
      detectedAt: new Date().toISOString()
    });
  }

  // 6. Incomplete Contact Information
  if (!property.contactNumber && !property.siteVisitContactNumber && !property.whatsappNumber) {
    errors.push({
      id: `err_contact_${Date.now()}`,
      type: "incomplete_contact",
      title: "Incomplete Contact Information",
      description: "At least one contact phone number or WhatsApp number is required.",
      severity: "medium",
      status: "open",
      detectedAt: new Date().toISOString()
    });
  }

  // 7. Invalid Property Status
  const validStatuses = ["active", "draft", "inactive", "Active", "Draft", "Inactive"];
  if (property.status && !validStatuses.includes(property.status)) {
    errors.push({
      id: `err_status_${Date.now()}`,
      type: "invalid_property_status",
      title: "Invalid Property Status",
      description: `Property status '${property.status}' is not recognized.`,
      severity: "low",
      status: "open",
      detectedAt: new Date().toISOString()
    });
  }

  return {
    hasErrors: errors.length > 0,
    errors,
    locationStatus: locVal.status,
    dataQualityStatus: errors.length === 0 ? "complete" : errors.some(e => e.severity === "critical" || e.severity === "high") ? "error" : "warning"
  };
}
