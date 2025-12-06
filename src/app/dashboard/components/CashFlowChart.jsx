'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '@/components/ui/AppIcon';

const CashFlowChart = ({ data }) => {
  const [chartType, setChartType] = useState('line');

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-foreground mb-2">{payload?.[0]?.payload?.month}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between space-x-4">
              <span className="text-xs text-success flex items-center">
                <span className="w-3 h-3 bg-success rounded-full mr-2"></span>
                Income
              </span>
              <span className="text-xs font-semibold text-foreground">${payload?.[0]?.value?.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <span className="text-xs text-destructive flex items-center">
                <span className="w-3 h-3 bg-destructive rounded-full mr-2"></span>
                Expenses
              </span>
              <span className="text-xs font-semibold text-foreground">${payload?.[1]?.value?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  CustomTooltip.propTypes = {
    active: PropTypes?.bool,
    payload: PropTypes?.arrayOf(PropTypes?.shape({
      value: PropTypes?.number,
      payload: PropTypes?.shape({
        month: PropTypes?.string
      })
    }))
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Cash Flow Trends</h2>
          <p className="text-sm text-muted-foreground mt-1">6-month income vs expenses analysis</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setChartType('line')}
            className={`p-2 rounded-md transition-quick ${
              chartType === 'line' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            aria-label="Line chart view"
          >
            <Icon name="ChartBarIcon" size={20} variant="outline" />
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`p-2 rounded-md transition-quick ${
              chartType === 'bar' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            aria-label="Bar chart view"
          >
            <Icon name="Squares2X2Icon" size={20} variant="outline" />
          </button>
        </div>
      </div>

      <div className="w-full h-80" aria-label="Cash flow chart showing income and expenses over 6 months">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey="month" 
                stroke="#64748B"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#64748B"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
                iconType="circle"
              />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#059669" 
                strokeWidth={3}
                dot={{ fill: '#059669', r: 4 }}
                activeDot={{ r: 6 }}
                name="Income"
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#DC2626" 
                strokeWidth={3}
                dot={{ fill: '#DC2626', r: 4 }}
                activeDot={{ r: 6 }}
                name="Expenses"
              />
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey="month" 
                stroke="#64748B"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#64748B"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
                iconType="circle"
              />
              <Bar dataKey="income" fill="#059669" radius={[8, 8, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="#DC2626" radius={[8, 8, 0, 0]} name="Expenses" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

CashFlowChart.propTypes = {
  data: PropTypes?.arrayOf(PropTypes?.shape({
    month: PropTypes?.string?.isRequired,
    income: PropTypes?.number?.isRequired,
    expenses: PropTypes?.number?.isRequired
  }))?.isRequired
};

export default CashFlowChart;