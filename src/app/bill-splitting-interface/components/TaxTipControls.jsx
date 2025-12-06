'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const TaxTipControls = ({ onUpdate }) => {
  const [values, setValues] = useState({
    tax: 0,
    tip: 0,
    splitMethod: 'proportional'
  });

  const handleChange = (field, value) => {
    const newValues = {
      ...values,
      [field]: value
    };
    setValues(newValues);
    onUpdate(newValues);
  };

  const tipPresets = [15, 18, 20, 25];

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center">
        <Icon name="CurrencyDollarIcon" size={20} variant="outline" className="mr-2" />
        Tax & Tip
      </h3>
      <div>
        <label htmlFor="tax" className="block text-sm font-medium text-foreground mb-2">
          Tax Amount ($)
        </label>
        <input
          type="number"
          id="tax"
          value={values?.tax}
          onChange={(e) => handleChange('tax', parseFloat(e?.target?.value) || 0)}
          min="0"
          step="0.01"
          placeholder="0.00"
          className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Tip Amount ($)
        </label>
        <div className="flex gap-2 mb-2">
          {tipPresets?.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleChange('tip', (values?.tax > 0 ? values?.tax : 50) * (preset / 100))}
              className="flex-1 px-3 py-2 bg-muted text-muted-foreground rounded-md text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-quick"
            >
              {preset}%
            </button>
          ))}
        </div>
        <input
          type="number"
          value={values?.tip}
          onChange={(e) => handleChange('tip', parseFloat(e?.target?.value) || 0)}
          min="0"
          step="0.01"
          placeholder="0.00"
          className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Split Method
        </label>
        <div className="space-y-2">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="splitMethod"
              value="proportional"
              checked={values?.splitMethod === 'proportional'}
              onChange={(e) => handleChange('splitMethod', e?.target?.value)}
              className="w-4 h-4 text-primary focus:ring-2 focus:ring-ring"
            />
            <span className="text-sm text-foreground">Proportional (based on items)</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="splitMethod"
              value="equal"
              checked={values?.splitMethod === 'equal'}
              onChange={(e) => handleChange('splitMethod', e?.target?.value)}
              className="w-4 h-4 text-primary focus:ring-2 focus:ring-ring"
            />
            <span className="text-sm text-foreground">Equal Split</span>
          </label>
        </div>
      </div>
    </div>
  );
};

TaxTipControls.propTypes = {
  onUpdate: PropTypes?.func?.isRequired
};

export default TaxTipControls;