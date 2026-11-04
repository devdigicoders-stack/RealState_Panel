import React, { useRef, useEffect } from 'react';
import Highcharts from 'highcharts';

/**
 * Robust Highcharts React Wrapper component
 * Avoids ESM/CJS default interop issues with highcharts-react-official in Vite
 */
export const HighchartsWrapper = ({ options, highcharts = Highcharts, constructorType = 'chart', callback }) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !options) return;

    // Create chart with accessibility disabled to suppress console warnings
    const sanitizedOptions = {
      accessibility: { enabled: false },
      ...options
    };

    const hc = highcharts || Highcharts;
    const cType = constructorType || 'chart';

    if (hc && hc[cType]) {
      chartRef.current = hc[cType](containerRef.current, sanitizedOptions, callback);
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [options]);

  return <div ref={containerRef} className="w-full" />;
};

export default HighchartsWrapper;

