'use client';

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import type { TrendPoint } from '@/lib/dashboard/di21-adapter';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

ChartJS.defaults.color = '#94a3b8';
ChartJS.defaults.borderColor = '#1e293b';
ChartJS.defaults.font.family = 'system-ui, -apple-system, sans-serif';

interface TrendsChartProps {
  trend: TrendPoint[];
}

export function SpendPurchasesChart({ trend }: TrendsChartProps) {
  if (trend.length <= 1) return <EmptyState />;

  const labels = trend.map(t => t.date);
  const data = {
    labels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Spend ($)',
        data: trend.map(t => t.spend),
        backgroundColor: 'rgba(59,130,246,0.6)',
        borderRadius: 4,
        yAxisID: 'y',
        order: 2,
      },
      {
        type: 'line' as const,
        label: 'Purchases',
        data: trend.map(t => t.purchases),
        borderColor: '#22c55e',
        backgroundColor: 'transparent',
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#22c55e',
        yAxisID: 'y1',
        order: 1,
      },
    ],
  } as unknown as ChartData<'bar'>;

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 12, padding: 16 } },
    },
    scales: {
      y: {
        position: 'left',
        grid: { color: '#1e293b' },
        title: { display: true, text: 'Spend ($)' },
      },
      y1: {
        position: 'right',
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Purchases' },
        beginAtZero: true,
      },
    },
  };

  return <Chart type="bar" data={data} options={options} />;
}

export function CtrCpmChart({ trend }: TrendsChartProps) {
  if (trend.length <= 1) return <EmptyState />;

  const labels = trend.map(t => t.date);
  const data: ChartData<'line'> = {
    labels,
    datasets: [
      {
        label: 'Link CTR (%)',
        data: trend.map(t => t.ctr),
        borderColor: '#22c55e',
        backgroundColor: 'transparent',
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#22c55e',
        yAxisID: 'y',
      },
      {
        label: 'CPM ($)',
        data: trend.map(t => t.cpm),
        borderColor: '#ef4444',
        backgroundColor: 'transparent',
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#ef4444',
        yAxisID: 'y1',
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 12, padding: 16 } },
    },
    scales: {
      y: {
        position: 'left',
        grid: { color: '#1e293b' },
        title: { display: true, text: 'CTR (%)' },
      },
      y1: {
        position: 'right',
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'CPM ($)' },
      },
    },
  };

  return <Chart type="line" data={data} options={options} />;
}

function EmptyState() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--color-text-secondary)',
        fontSize: '0.85rem',
      }}
    >
      Charts available after 2+ days of data
    </div>
  );
}
