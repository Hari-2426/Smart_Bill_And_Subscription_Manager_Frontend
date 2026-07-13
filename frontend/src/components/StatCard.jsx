import React, { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, isCurrency = false, color = 'brand' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;

    const controls = animate(0, numericValue, {
      duration: 0.8,
      ease: 'easeOut',
      onUpdate: (latest) => {
        setDisplayValue(latest);
      },
    });

    return () => controls.stop();
  }, [value]);

  const colorVariants = {
    brand: 'text-c-accent bg-c-success-bg border-c-border',
    success: 'text-c-success-text bg-c-success-bg border-c-success-bg/20',
    warning: 'text-c-warning-text bg-c-warning-bg border-c-warning-bg/20',
    danger: 'text-c-danger-text bg-c-danger-bg border-c-danger-bg/20',
  };

  const formatValue = (val) => {
    if (isCurrency) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(val);
    }
    return Math.round(val).toLocaleString();
  };

  return (
    <div className="bg-c-card p-6 rounded-xl border border-c-border hover-lift flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-sm font-sans font-medium text-c-text-secondary">{title}</p>
        <h4 className="text-2xl font-serif font-medium text-c-text-primary">
          {formatValue(displayValue)}
        </h4>
      </div>
      {Icon && (
        <div
          className={`w-12 h-12 rounded-xl border flex items-center justify-center ${
            colorVariants[color] || colorVariants.brand
          }`}
        >
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
