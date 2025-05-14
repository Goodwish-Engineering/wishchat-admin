import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useTheme } from '../../contexts/ThemeContext';
import { Organization } from '../../types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface OrganizationPieChartProps {
  organizations: Organization[];
  height?: number;
  title?: string;
}

// Generate unique colors for pie chart segments
const generateColors = (count: number, theme: 'light' | 'dark'): string[] => {
  const opacity = theme === 'dark' ? '0.8' : '0.7';
  const baseColors = [
    `rgba(59, 130, 246, ${opacity})`, // blue
    `rgba(16, 185, 129, ${opacity})`, // green
    `rgba(245, 158, 11, ${opacity})`, // amber
    `rgba(239, 68, 68, ${opacity})`,  // red
    `rgba(168, 85, 247, ${opacity})`, // purple
    `rgba(236, 72, 153, ${opacity})`, // pink
    `rgba(20, 184, 166, ${opacity})`, // teal
    `rgba(139, 92, 246, ${opacity})`, // violet
  ];

  // If we need more colors than our base set, generate them
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  } else {
    const extraColors = Array.from({ length: count - baseColors.length }, (_, i) => {
      // Generate random pastel-ish colors
      const h = Math.floor(Math.random() * 360);
      const s = Math.floor(50 + Math.random() * 30);
      const l = theme === 'dark' 
        ? Math.floor(60 + Math.random() * 20) 
        : Math.floor(50 + Math.random() * 20);
      return `hsla(${h}, ${s}%, ${l}%, ${opacity})`;
    });
    return [...baseColors, ...extraColors];
  }
};

const OrganizationPieChart: React.FC<OrganizationPieChartProps> = ({
  organizations,
  height = 300,
  title = 'Token Usage by Organization',
}) => {
  const { theme } = useTheme();
  
  // Filter out organizations with zero tokens
  const orgsWithTokens = organizations.filter(org => org.organization_token_count > 0);
  
  // Sort by token count descending
  const sortedOrgs = [...orgsWithTokens].sort(
    (a, b) => b.organization_token_count - a.organization_token_count
  );
  
  // Take top 7 orgs and group the rest as "Others"
  const topOrgs = sortedOrgs.slice(0, 7);
  const otherOrgs = sortedOrgs.slice(7);
  
  const otherTokens = otherOrgs.reduce((sum, org) => sum + org.organization_token_count, 0);
  
  const labels = [
    ...topOrgs.map(org => org.name),
    ...(otherOrgs.length > 0 ? ['Others'] : [])
  ];
  
  const data = [
    ...topOrgs.map(org => org.organization_token_count),
    ...(otherOrgs.length > 0 ? [otherTokens] : [])
  ];
  
  const backgroundColor = generateColors(labels.length, theme);
  const borderColor = backgroundColor.map(color => color.replace(/[\d.]+\)$/, '1)'));
  
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
        borderColor,
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
          font: {
            size: 12,
          },
          boxWidth: 15,
          padding: 10,
        },
      },
      title: {
        display: !!title,
        text: title,
        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        font: {
          size: 16,
        },
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        bodyColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
        borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw as number;
            const percentage = ((value / data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
            return `${label}: ${value.toLocaleString()} (${percentage}%)`;
          }
        }
      },
    },
  };

  return (
    <div style={{ height }}>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default OrganizationPieChart;