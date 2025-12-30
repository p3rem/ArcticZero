// Mock data for ArcticZero Carbon Dashboard

export interface EmissionData {
  id: string;
  date: string;
  electricity: number;
  transport: number;
  waste: number;
  total: number;
}

export interface MonthlyData {
  month: string;
  electricity: number;
  transport: number;
  waste: number;
  total: number;
}

export interface CategoryBreakdown {
  name: string;
  value: number;
  color: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  estimatedReduction: number;
  icon: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  department: string;
  avatar?: string;
}

export interface Organization {
  id: string;
  name: string;
  industry: string;
}

// Monthly emissions data for the past 12 months
export const monthlyEmissions: MonthlyData[] = [
  { month: 'Jan', electricity: 1250, transport: 890, waste: 320, total: 2460 },
  { month: 'Feb', electricity: 1180, transport: 920, waste: 280, total: 2380 },
  { month: 'Mar', electricity: 1320, transport: 850, waste: 350, total: 2520 },
  { month: 'Apr', electricity: 1150, transport: 780, waste: 290, total: 2220 },
  { month: 'May', electricity: 1080, transport: 820, waste: 260, total: 2160 },
  { month: 'Jun', electricity: 1420, transport: 950, waste: 380, total: 2750 },
  { month: 'Jul', electricity: 1580, transport: 1020, waste: 420, total: 3020 },
  { month: 'Aug', electricity: 1520, transport: 980, waste: 400, total: 2900 },
  { month: 'Sep', electricity: 1280, transport: 890, waste: 340, total: 2510 },
  { month: 'Oct', electricity: 1150, transport: 820, waste: 300, total: 2270 },
  { month: 'Nov', electricity: 1220, transport: 860, waste: 320, total: 2400 },
  { month: 'Dec', electricity: 1380, transport: 920, waste: 360, total: 2660 },
];

// Category breakdown for pie chart
export const categoryBreakdown: CategoryBreakdown[] = [
  { name: 'Electricity', value: 45, color: 'hsl(158, 64%, 32%)' },
  { name: 'Transport', value: 35, color: 'hsl(200, 65%, 45%)' },
  { name: 'Waste', value: 12, color: 'hsl(174, 60%, 45%)' },
  { name: 'Other', value: 8, color: 'hsl(160, 20%, 70%)' },
];

// Daily emission entries
export const emissionEntries: EmissionData[] = [
  { id: '1', date: '2024-12-01', electricity: 42, transport: 28, waste: 12, total: 82 },
  { id: '2', date: '2024-12-02', electricity: 38, transport: 32, waste: 10, total: 80 },
  { id: '3', date: '2024-12-03', electricity: 45, transport: 25, waste: 14, total: 84 },
  { id: '4', date: '2024-12-04', electricity: 40, transport: 30, waste: 11, total: 81 },
  { id: '5', date: '2024-12-05', electricity: 48, transport: 35, waste: 15, total: 98 },
  { id: '6', date: '2024-12-06', electricity: 35, transport: 22, waste: 9, total: 66 },
  { id: '7', date: '2024-12-07', electricity: 32, transport: 18, waste: 8, total: 58 },
];

// KPI Summary
export const kpiData = {
  totalEmissions: 28450,
  electricityEmissions: 14820,
  transportEmissions: 10340,
  wasteEmissions: 3290,
  monthlyChange: -8.5,
  yearlyTarget: 25000,
  targetProgress: 72,
};

// Recommendations
export const recommendations: Recommendation[] = [
  {
    id: '1',
    title: 'Switch to LED Lighting',
    description: 'Replace traditional bulbs with LED alternatives across all facilities to reduce electricity consumption by up to 75%.',
    impact: 'high',
    category: 'Electricity',
    estimatedReduction: 1200,
    icon: 'Lightbulb',
  },
  {
    id: '2',
    title: 'Optimize HVAC Systems',
    description: 'Implement smart thermostat controls and regular maintenance to improve heating and cooling efficiency.',
    impact: 'high',
    category: 'Electricity',
    estimatedReduction: 1800,
    icon: 'Thermometer',
  },
  {
    id: '3',
    title: 'Electric Vehicle Fleet',
    description: 'Transition company vehicles to electric alternatives to significantly reduce transport emissions.',
    impact: 'high',
    category: 'Transport',
    estimatedReduction: 2500,
    icon: 'Car',
  },
  {
    id: '4',
    title: 'Remote Work Policy',
    description: 'Implement flexible remote work options to reduce daily commute emissions from employees.',
    impact: 'medium',
    category: 'Transport',
    estimatedReduction: 800,
    icon: 'Home',
  },
  {
    id: '5',
    title: 'Waste Recycling Program',
    description: 'Establish comprehensive recycling and composting programs to divert waste from landfills.',
    impact: 'medium',
    category: 'Waste',
    estimatedReduction: 450,
    icon: 'Recycle',
  },
  {
    id: '6',
    title: 'Solar Panel Installation',
    description: 'Install rooftop solar panels to generate clean, renewable energy on-site.',
    impact: 'high',
    category: 'Electricity',
    estimatedReduction: 3200,
    icon: 'Sun',
  },
  {
    id: '7',
    title: 'Paperless Operations',
    description: 'Transition to digital documentation and reduce paper consumption across departments.',
    impact: 'low',
    category: 'Waste',
    estimatedReduction: 150,
    icon: 'FileText',
  },
  {
    id: '8',
    title: 'Carbon Offset Program',
    description: 'Invest in verified carbon offset projects to neutralize unavoidable emissions.',
    impact: 'medium',
    category: 'Other',
    estimatedReduction: 1000,
    icon: 'TreePine',
  },
];

// Users
export const users: User[] = [
  { id: '1', name: 'Sarah Chen', email: 'sarah.chen@company.com', role: 'admin', department: 'Sustainability' },
  { id: '2', name: 'Michael Torres', email: 'm.torres@company.com', role: 'manager', department: 'Operations' },
  { id: '3', name: 'Emily Watson', email: 'e.watson@company.com', role: 'viewer', department: 'Finance' },
  { id: '4', name: 'David Kim', email: 'd.kim@company.com', role: 'manager', department: 'Facilities' },
  { id: '5', name: 'Lisa Johnson', email: 'l.johnson@company.com', role: 'viewer', department: 'HR' },
];

// Organizations
export const organizations: Organization[] = [
  { id: '1', name: 'GreenTech Corp', industry: 'Technology' },
  { id: '2', name: 'EcoSolutions Inc', industry: 'Consulting' },
  { id: '3', name: 'Sustainable Industries', industry: 'Manufacturing' },
];

// Year-over-year comparison
export const yearlyComparison = [
  { year: '2022', total: 32500 },
  { year: '2023', total: 30200 },
  { year: '2024', total: 28450 },
];

// Fuel types for transport
export const fuelTypes = [
  { value: 'petrol_car', label: 'Petrol Car' },
  { value: 'diesel_car', label: 'Diesel Car' },
  { value: 'two_wheeler', label: 'Two Wheeler' },
  { value: 'bus', label: 'Bus (Public Transport)' },
  { value: 'electric_vehicle', label: 'Electric Vehicle (EV)' },
  { value: 'air_travel_short_haul', label: 'Air Travel (Short Haul)' },
  { value: 'air_travel_long_haul', label: 'Air Travel (Long Haul)' },
];
