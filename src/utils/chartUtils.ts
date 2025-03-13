
// Format currency values for display in charts
export const formatCurrency = (value: number): string => {
  return `${value.toFixed(2)} €`;
};

// Standard tooltip styling for charts
export const getTooltipStyle = () => ({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  border: '1px solid #f0f0f0',
  borderRadius: '4px',
  padding: '10px'
});

// Color palette for charts
export const CHART_COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#d0ed57'
];
