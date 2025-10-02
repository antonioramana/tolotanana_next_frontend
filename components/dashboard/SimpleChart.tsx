'use client';

import React from 'react';

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface SimpleChartProps {
  data: ChartDataPoint[];
  type: 'bar' | 'line' | 'pie';
  title?: string;
  height?: number;
  showValues?: boolean;
}

export default function SimpleChart({ 
  data, 
  type, 
  title, 
  height = 200, 
  showValues = true 
}: SimpleChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  if (type === 'bar') {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        {title && <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>}
        <div className="flex items-end justify-between space-x-2" style={{ height: `${height}px` }}>
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * (height - 40);
            const color = item.color || `hsl(${(index * 360) / data.length}, 70%, 50%)`;
            
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="flex flex-col items-center justify-end h-full">
                  {showValues && (
                    <span className="text-xs text-gray-600 mb-1">
                      {item.value.toLocaleString()}
                    </span>
                  )}
                  <div
                    className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                    style={{
                      height: `${barHeight}px`,
                      backgroundColor: color,
                      minHeight: '4px',
                    }}
                  />
                </div>
                <span className="text-xs text-gray-700 mt-2 text-center break-words">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === 'line') {
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (item.value / maxValue) * 80;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="bg-white p-4 rounded-lg shadow">
        {title && <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>}
        <div className="relative" style={{ height: `${height}px` }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" className="overflow-visible">
            <polyline
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              points={points}
            />
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - (item.value / maxValue) * 80;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3"
                  fill="#3B82F6"
                  className="hover:r-4 transition-all"
                />
              );
            })}
          </svg>
          <div className="flex justify-between mt-2">
            {data.map((item, index) => (
              <span key={index} className="text-xs text-gray-600 text-center">
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    return (
      <div className="bg-white p-4 rounded-lg shadow">
        {title && <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>}
        <div className="flex items-center justify-center">
          <div className="relative" style={{ width: `${height}px`, height: `${height}px` }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100;
                const angle = (item.value / total) * 360;
                const startAngle = currentAngle;
                const endAngle = currentAngle + angle;
                
                const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
                const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
                const x2 = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
                const y2 = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);
                
                const largeArcFlag = angle > 180 ? 1 : 0;
                const color = item.color || `hsl(${(index * 360) / data.length}, 70%, 50%)`;
                
                currentAngle += angle;
                
                return (
                  <path
                    key={index}
                    d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                    fill={color}
                    className="hover:opacity-80 transition-opacity"
                  />
                );
              })}
            </svg>
          </div>
          <div className="ml-6 space-y-2">
            {data.map((item, index) => {
              const color = item.color || `hsl(${(index * 360) / data.length}, 70%, 50%)`;
              const percentage = ((item.value / total) * 100).toFixed(1);
              
              return (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-gray-700">
                    {item.label}: {percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
