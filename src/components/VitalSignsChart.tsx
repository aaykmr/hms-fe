import React from "react";

interface VitalSignsChartProps {
  title: string;
  vitalSigns: any[];
  dataKey: "hr" | "abpSys" | "abpDia" | "spo2" | "resp";
  yAxisRange?: { min: number; max: number; step: number }; // Made optional
  colors: {
    primary: string;
    secondary?: string;
    gradient: string;
  };
  unit: string;
  showSecondaryLine?: boolean;
  secondaryDataKey?: "abpDia";
  secondaryLineStyle?: "dashed" | "solid";
  labelSize?: number;
  gridOpacity?: number;
  lineWidth?: number;
  pointRadius?: number;
  height?: number;
  width?: number;
  autoScale?: boolean; // New prop for auto-scaling
  padding?: number; // New prop for Y-axis padding
}

const VitalSignsChart: React.FC<VitalSignsChartProps> = ({
  title,
  vitalSigns,
  dataKey,
  yAxisRange,
  colors,
  unit,
  showSecondaryLine = false,
  secondaryDataKey,
  secondaryLineStyle = "dashed",
  labelSize = 5,
  gridOpacity = 0.15,
  lineWidth = 0.5,
  pointRadius = 0.8,
  height = 100,
  width = 400,
  autoScale = true, // Default to auto-scaling
  padding = 10, // Default 10% padding
}) => {
  // Use fixed sizes for consistent appearance across all screen sizes
  // This prevents labels from changing size when resizing, providing a professional look
  // Only minimal scaling for very small screens to prevent illegibility
  const responsiveLabelSize = Math.max(4.5, Math.min(5, width < 300 ? 4.5 : 5)); // Fixed at 5, minimum 4.5
  const responsivePointRadius = Math.max(
    0.8,
    Math.min(1.0, width < 250 ? 0.8 : 1.0)
  ); // Fixed at 1.0, minimum 0.8
  const responsiveLineWidth = Math.max(
    0.4,
    Math.min(0.6, width < 250 ? 0.4 : 0.6)
  ); // Fixed at 0.6, minimum 0.4

  // Calculate dynamic Y-axis range if autoScale is enabled
  const getDynamicYAxisRange = () => {
    if (!vitalSigns || vitalSigns.length === 0) {
      return yAxisRange || { min: 0, max: 100, step: 10 };
    }

    if (!autoScale && yAxisRange) {
      return yAxisRange;
    }

    // Get all values for this data key (including secondary if applicable)
    const allValues: number[] = [];
    vitalSigns.forEach(reading => {
      if (reading[dataKey] !== undefined && reading[dataKey] !== null) {
        allValues.push(reading[dataKey]);
      }
      if (
        showSecondaryLine &&
        secondaryDataKey &&
        reading[secondaryDataKey] !== undefined &&
        reading[secondaryDataKey] !== null
      ) {
        allValues.push(reading[secondaryDataKey]);
      }
    });

    if (allValues.length === 0) {
      return yAxisRange || { min: 0, max: 100, step: 10 };
    }

    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const range = maxValue - minValue;

    // Add padding to prevent lines from touching the edges
    const paddingAmount = (range * padding) / 100;
    const adjustedMin = Math.floor(minValue - paddingAmount);
    const adjustedMax = Math.ceil(maxValue + paddingAmount);

    // Calculate appropriate step size
    const step = Math.max(1, Math.ceil(range / 8)); // Aim for ~8-10 labels

    return { min: adjustedMin, max: adjustedMax, step };
  };

  const dynamicYAxisRange = getDynamicYAxisRange();

  // Generate Y-axis labels based on dynamic range
  const getYAxisLabels = () => {
    const labels = [];
    for (
      let i = dynamicYAxisRange.min;
      i <= dynamicYAxisRange.max;
      i += dynamicYAxisRange.step
    ) {
      labels.push(i);
    }
    return labels;
  };

  // Calculate Y position for a given value
  const getYPosition = (value: number) => {
    const range = dynamicYAxisRange.max - dynamicYAxisRange.min;
    return height - ((value - dynamicYAxisRange.min) / range) * height;
  };

  // Generate graph data points
  const getGraphData = () => {
    if (!vitalSigns || vitalSigns.length === 0) return [];

    return vitalSigns.map((reading, index) => {
      const x = 5 + (index / (vitalSigns.length - 1)) * (width - 5);
      const y = getYPosition(reading[dataKey]);
      return { x, y };
    });
  };

  // Generate secondary line data if needed
  const getSecondaryGraphData = () => {
    if (
      !showSecondaryLine ||
      !secondaryDataKey ||
      !vitalSigns ||
      vitalSigns.length === 0
    )
      return [];

    return vitalSigns.map((reading, index) => {
      const x = 5 + (index / (vitalSigns.length - 1)) * (width - 5);
      const y = getYPosition(reading[secondaryDataKey]);
      return { x, y };
    });
  };

  const yAxisLabels = getYAxisLabels();
  const graphData = getGraphData();
  const secondaryGraphData = getSecondaryGraphData();

  // Generate time labels for X-axis
  const getTimeLabels = () => {
    if (!vitalSigns || vitalSigns.length === 0) return [];

    const labels = [];
    const totalPoints = vitalSigns.length;

    // Show 5-6 time labels for readability
    const step = Math.max(1, Math.floor(totalPoints / 5));

    for (let i = 0; i < totalPoints; i += step) {
      if (i < totalPoints) {
        const reading = vitalSigns[i];
        if (reading && reading.timestamp) {
          const date = new Date(reading.timestamp * 1000);
          const timeString = date.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
          labels.push({
            index: i,
            time: timeString,
            x: 5 + (i / (totalPoints - 1)) * (width - 5),
          });
        }
      }
    }

    // Always include the last point
    if (totalPoints > 0 && vitalSigns[totalPoints - 1]?.timestamp) {
      const lastReading = vitalSigns[totalPoints - 1];
      const date = new Date(lastReading.timestamp * 1000);
      const timeString = date.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      labels.push({ index: totalPoints - 1, time: timeString, x: width - 1 });
    }

    return labels;
  };

  const timeLabels = getTimeLabels();

  return (
    <div className="chart-item full-width">
      <h4>
        {title} ({unit})
      </h4>
      <div className="chart-svg-container">
        <svg
          className="vital-chart"
          viewBox={`0 0 ${width} ${height + 35}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id={`${dataKey}Gradient`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor={colors.primary} stopOpacity="0.8" />
              <stop
                offset="100%"
                stopColor={colors.primary}
                stopOpacity="0.3"
              />
            </linearGradient>
          </defs>

          {/* Chart background rectangle - only covers the main chart area */}
          <rect
            x="5"
            y="0"
            width={width - 5}
            height={height}
            fill="white"
            stroke="#e9ecef"
            strokeWidth="1"
          />

          {/* Y-axis labels */}
          {yAxisLabels.map((label, index) => (
            <text
              key={index}
              x="0"
              y={
                height -
                (label - dynamicYAxisRange.min) *
                  (height / (dynamicYAxisRange.max - dynamicYAxisRange.min))
              }
              fontSize={responsiveLabelSize}
              fill="#333"
              textAnchor="end"
            >
              {label}
            </text>
          ))}

          {/* Grid lines */}
          {yAxisLabels.map((label, index) => (
            <line
              key={index}
              x1="5"
              y1={
                height -
                (label - dynamicYAxisRange.min) *
                  (height / (dynamicYAxisRange.max - dynamicYAxisRange.min))
              }
              x2={width}
              y2={
                height -
                (label - dynamicYAxisRange.min) *
                  (height / (dynamicYAxisRange.max - dynamicYAxisRange.min))
              }
              stroke="#e9ecef"
              strokeWidth="1"
            />
          ))}

          {/* Primary data line */}
          <polyline
            fill="none"
            stroke={`url(#${dataKey}Gradient)`}
            strokeWidth={responsiveLineWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            points={graphData.map(p => `${p.x},${p.y}`).join(" ")}
          />

          {/* Secondary data line (for BP diastolic) */}
          {showSecondaryLine && secondaryGraphData.length > 0 && (
            <polyline
              fill="none"
              stroke={colors.secondary || colors.primary}
              strokeWidth={responsiveLineWidth * 0.8}
              strokeDasharray={secondaryLineStyle === "dashed" ? "1,2" : "none"}
              strokeLinecap="round"
              points={secondaryGraphData.map(p => `${p.x},${p.y}`).join(" ")}
            />
          )}

          {/* Primary data points */}
          {graphData.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={responsivePointRadius}
              fill={colors.primary}
            />
          ))}

          {/* Secondary data points */}
          {showSecondaryLine &&
            secondaryGraphData.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r={responsivePointRadius}
                fill={colors.secondary || colors.primary}
              />
            ))}

          {/* Time labels on X-axis */}
          {timeLabels.map((label, index) => (
            <text
              key={index}
              x={label.x}
              y={height + 10}
              fontSize="4"
              fill="#333"
              textAnchor="middle"
            >
              {label.time}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default VitalSignsChart;
