// Seed data and state persistence for PlotIt platform

export const calculatePlotItScore = (project) => {
  let score = 0;
  
  // 1. Legal & Verification (30 points max)
  if (project.naPlot) score += 15;
  if (project.bankLoan) score += 10;
  if (project.verified) score += 5;

  // 2. Infrastructure (30 points max)
  const infraScore = (project.amenities || []).length * 5;
  score += Math.min(infraScore, 30);

  // 3. Location & Proximity (20 points max)
  // Under 3 km distance = 20 points, under 6 km = 15 points, else 10 points
  if (project.distance <= 3) {
    score += 20;
  } else if (project.distance <= 6) {
    score += 15;
  } else {
    score += 10;
  }

  // 4. Value / Price Competitiveness (20 points max)
  // Average price per sqft around Chakan is roughly ₹1,200.
  // Lower price than average gives higher scores, higher price gives slightly less unless premium amenities.
  const avgPrice = 1200;
  if (project.pricePerSqFt <= avgPrice * 0.8) {
    score += 20;
  } else if (project.pricePerSqFt <= avgPrice) {
    score += 17;
  } else if (project.pricePerSqFt <= avgPrice * 1.3) {
    score += 12;
  } else {
    score += 8;
  }

  return Math.min(score, 100);
};

export const initialProjects = [
  {
    id: "proj-1",
    name: "Vrindavan Greens NA Plots",
    developer: "Shivraj Land Developers",
    village: "Nanekarwadi",
    area: "Chakan Industrial Zone",
    coords: [18.7825, 73.8420], // Near Chakan center
    startingPrice: 1200000,
    pricePerSqFt: 1000,
    distance: 1.8,
    remainingPlots: 14,
    totalPlots: 45,
    sizeMin: 1200,
    sizeMax: 3000,
    facing: ["East", "North", "East-West"],
    bankLoan: true,
    naPlot: true,
    verified: true,
    amenities: [
      "Water Supply Connection",
      "Electricity Line",
      "9m Tar Road",
      "Underground Drainage",
      "Street Lights",
      "Tree Plantation"
    ],
    nearby: {
      schools: "Podar International School (2.5 km)",
      hospitals: "Chakan Rural Hospital (1.9 km)",
      midc: "Chakan MIDC Phase I (1.0 km)",
      highway: "Pune-Nashik Highway (1.2 km)"
    },
    updated: "Today",
    status: "Active",
    heroImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
    description: "Vrindavan Greens offers premium collector NA sanctioned plots right next to the growing Chakan industrial belt. Ideal for residential construction or rental yielding rooms.",
    layoutPlanUrl: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "proj-2",
    name: "MIDC View Residency",
    developer: "Venkatesh Builders",
    village: "Mahalunge",
    area: "Talegaon Road",
    coords: [18.7660, 73.8210], // Towards Talegaon Rd
    startingPrice: 850000,
    pricePerSqFt: 850,
    distance: 4.5,
    remainingPlots: 8,
    totalPlots: 30,
    sizeMin: 1000,
    sizeMax: 2000,
    facing: ["East", "West"],
    bankLoan: true,
    naPlot: true,
    verified: true,
    amenities: [
      "Water Supply Connection",
      "Electricity Line",
      "12m Main Road",
      "Underground Drainage",
      "Street Lights"
    ],
    nearby: {
      schools: "Prerana English Medium School (3.0 km)",
      hospitals: "Core Hospital (4.0 km)",
      midc: "Mahalunge Industrial Area (0.8 km)",
      highway: "Chakan-Talegaon Road (0.2 km)"
    },
    updated: "Today",
    status: "Active",
    heroImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    description: "A completely gated community with direct access to the Talegaon-Chakan road link. Fast-growing zone with immediate appreciation potential due to expanding logistics hubs.",
    layoutPlanUrl: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "proj-3",
    name: "Golden Meadows Chakan",
    developer: "Pioneer Infra Group",
    village: "Kadachiwadi",
    area: "Shikrapur Road",
    coords: [18.7990, 73.8780], // Towards Shikrapur Rd
    startingPrice: 1800000,
    pricePerSqFt: 1500,
    distance: 3.2,
    remainingPlots: 26,
    totalPlots: 80,
    sizeMin: 1200,
    sizeMax: 4000,
    facing: ["East", "North", "South-East"],
    bankLoan: true,
    naPlot: true,
    verified: true,
    amenities: [
      "Water Supply Connection",
      "Electricity Line",
      "15m Cement Road",
      "Underground Drainage",
      "Street Lights",
      "Grand Entrance Gate",
      "Jogging Track",
      "Children's Play Area"
    ],
    nearby: {
      schools: "DPS Chakan (1.5 km)",
      hospitals: "Lotus Multi-speciality Hospital (2.8 km)",
      midc: "Chakan MIDC Phase II (2.0 km)",
      highway: "Pune-Nashik Highway (3.0 km)"
    },
    updated: "Yesterday",
    status: "Active",
    heroImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    description: "Premium NA bungalow plots equipped with state-of-the-art club amenities, located away from industrial pollution yet within a 5-minute drive from the Chakan main circle.",
    layoutPlanUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "proj-4",
    name: "Sainath Heritage City",
    developer: "Sainath Developers",
    village: "Biradwadi",
    area: "Chakan North",
    coords: [18.8250, 73.8610], // Further North
    startingPrice: 720000,
    pricePerSqFt: 600,
    distance: 5.9,
    remainingPlots: 0,
    totalPlots: 40,
    sizeMin: 1200,
    sizeMax: 2400,
    facing: ["East", "North-East"],
    bankLoan: false,
    naPlot: true,
    verified: false,
    amenities: [
      "Water Tank Connection",
      "9m Tar Road",
      "Street Lights"
    ],
    nearby: {
      schools: "ZP School Biradwadi (1.0 km)",
      hospitals: "Rural Clinic (1.5 km)",
      midc: "Chakan MIDC Phase III (3.5 km)",
      highway: "Pune-Nashik Highway (1.8 km)"
    },
    updated: "3 days ago",
    status: "Sold Out",
    heroImage: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80",
    description: "Affordable plotting options for budget-focused buyers. This project is fully sold out, demonstrating the high velocity of the Chakan micro-market.",
    layoutPlanUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "proj-5",
    name: "Hillview Premium Townships",
    developer: "Shivraj Land Developers",
    village: "Kharabwadi",
    area: "Chakan East",
    coords: [18.7750, 73.8820], // Near Kharabwadi
    startingPrice: 2200000,
    pricePerSqFt: 1800,
    distance: 4.1,
    remainingPlots: 3,
    totalPlots: 25,
    sizeMin: 1500,
    sizeMax: 3500,
    facing: ["East", "West", "North-West"],
    bankLoan: true,
    naPlot: true,
    verified: true,
    amenities: [
      "Water Supply Connection",
      "Electricity Line",
      "12m Concrete Road",
      "Underground Drainage",
      "Street Lights",
      "Security Cabin",
      "Landscaped Garden"
    ],
    nearby: {
      schools: "Vishweshwar School (2.0 km)",
      hospitals: "Anand Hospital (3.2 km)",
      midc: "Mercedes Benz Plant Chakan (2.5 km)",
      highway: "Pune-Nashik Highway (4.0 km)"
    },
    updated: "Today",
    status: "Active",
    heroImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    description: "Premium NA plots with scenic views of the surrounding hills, situated close to the high-profile manufacturing hub (including Mercedes Benz and major auto units).",
    layoutPlanUrl: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=800&q=80"
  }
].map(proj => ({ ...proj, plotItScore: calculatePlotItScore(proj) }));

export const initialLeads = [
  { id: "lead-1", name: "Ramesh Pawar", phone: "+91 9845012345", budget: "₹15–20 Lakh", stage: "Book Visit", date: "2026-07-08", project: "Vrindavan Greens NA Plots" },
  { id: "lead-2", name: "Anjali Kulkarni", phone: "+91 9912345678", budget: "₹8–12 Lakh", stage: "Visit Done", date: "2026-07-07", project: "MIDC View Residency" },
  { id: "lead-3", name: "Vikram Rane", phone: "+91 8802938475", budget: "₹20–30 Lakh", stage: "Negotiation", date: "2026-07-06", project: "Hillview Premium Townships" },
  { id: "lead-4", name: "Suresh Shinde", phone: "+91 9765432109", budget: "₹15–20 Lakh", stage: "Purchased", date: "2026-07-05", project: "Vrindavan Greens NA Plots" },
  { id: "lead-5", name: "Meena Deshmukh", phone: "+91 9011223344", budget: "₹15–25 Lakh", stage: "App Install", date: "2026-07-09", project: "Golden Meadows Chakan" }
];

export const initialVisits = [
  { id: "visit-1", buyerName: "Ramesh Pawar", buyerPhone: "+91 9845012345", date: "2026-07-12", time: "11:00 AM", project: "Vrindavan Greens NA Plots", status: "Scheduled" },
  { id: "visit-2", buyerName: "Anjali Kulkarni", buyerPhone: "+91 9912345678", date: "2026-07-10", time: "04:30 PM", project: "MIDC View Residency", status: "Scheduled" }
];

export const initialCashbacks = [
  {
    id: "cash-1",
    buyerName: "Suresh Shinde",
    buyerPhone: "+91 9765432109",
    project: "Vrindavan Greens NA Plots",
    purchasePrice: 1450000,
    cashbackAmount: 14500, // 1%
    commissionAmount: 14500, // 1% kept by PlotIt
    documentName: "agreement_suresh_shinde.pdf",
    submittedAt: "2026-07-08",
    status: "Pending Verification"
  }
];
