'use client';

import PropTypes from 'prop-types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const CategorySpendingChart = ({ data }) => {
  const COLORS = ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED', '#EC4899'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-foreground">{payload?.[0]?.name}</p>
          <p className="text-xs text-muted-foreground mt-1">
            ${payload?.[0]?.value?.toLocaleString()} ({payload?.[0]?.payload?.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  CustomTooltip.propTypes = {
    active: PropTypes?.bool,
    payload: PropTypes?.arrayOf(PropTypes?.shape({
      name: PropTypes?.string,
      value: PropTypes?.number,
      payload: PropTypes?.shape({
        percentage: PropTypes?.number
      })
    }))
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="grid grid-cols-2 gap-2 mt-4">
        {payload?.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry?.color }}
            ></div>
            <span className="text-xs text-foreground truncate">{entry?.value}</span>
          </div>
        ))}
      </div>
    );
  };

  CustomLegend.propTypes = {
    payload: PropTypes?.arrayOf(PropTypes?.shape({
      value: PropTypes?.string,
      color: PropTypes?.string
    }))
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Category Breakdown</h2>
        <p className="text-sm text-muted-foreground mt-1">Monthly spending by category</p>
      </div>
      <div className="w-full h-64" aria-label="Donut chart showing spending breakdown by category">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS?.[index % COLORS?.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

CategorySpendingChart.propTypes = {
  data: PropTypes?.arrayOf(PropTypes?.shape({
    name: PropTypes?.string?.isRequired,
    value: PropTypes?.number?.isRequired,
    percentage: PropTypes?.number?.isRequired
  }))?.isRequired
};

export default CategorySpendingChart;