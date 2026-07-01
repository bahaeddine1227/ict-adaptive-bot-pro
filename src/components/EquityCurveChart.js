import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polyline, Line, Circle, Text as SvgText } from 'react-native-svg';
import { colors, radius, spacing, typography } from '../theme/colors';

const screenWidth = Dimensions.get('window').width;

export default function EquityCurveChart({ points, height = 200 }) {
  const width = screenWidth - spacing.lg * 2 - spacing.md * 2;

  if (!points || points.length < 2) {
    return (
      <View style={[styles.emptyWrap, { height }]}>
        <Text style={styles.emptyText}>Add trades to build your equity curve</Text>
      </View>
    );
  }

  const ys = points.map((p) => p.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const range = maxY - minY || 1;
  const padding = 16;

  const scaleX = (i) => (i / (points.length - 1)) * (width - padding * 2) + padding;
  const scaleY = (y) => height - padding - ((y - minY) / range) * (height - padding * 2);

  const polyPoints = points.map((p, i) => `${scaleX(i)},${scaleY(p.y)}`).join(' ');
  const last = points[points.length - 1];
  const isUp = last.y >= points[0].y;
  const lineColor = isUp ? colors.win : colors.loss;

  const zeroY = scaleY(Math.min(Math.max(0, minY), maxY));

  return (
    <View style={styles.wrap}>
      <Svg width={width} height={height}>
        <Line
          x1={padding}
          y1={scaleY(0)}
          x2={width - padding}
          y2={scaleY(0)}
          stroke={colors.border}
          strokeDasharray="4,4"
          strokeWidth={1}
        />
        <Polyline
          points={polyPoints}
          fill="none"
          stroke={lineColor}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p, i) => (
          <Circle
            key={i}
            cx={scaleX(i)}
            cy={scaleY(p.y)}
            r={i === points.length - 1 ? 4 : 0}
            fill={lineColor}
          />
        ))}
        <SvgText x={padding} y={14} fill={colors.textMuted} fontSize="10">
          ${maxY.toFixed(0)}
        </SvgText>
        <SvgText x={padding} y={height - 4} fill={colors.textMuted} fontSize="10">
          ${minY.toFixed(0)}
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  emptyText: {
    ...typography.small,
    color: colors.textMuted,
  },
});
