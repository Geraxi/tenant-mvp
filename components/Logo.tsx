import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export default function Logo({ size = 'medium', showText = false }: LogoProps) {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 40;
      case 'medium':
        return 60;
      case 'large':
        return 80;
      default:
        return 60;
    }
  };

  const logoSize = getSize();
  const strokeWidth = logoSize * 0.075; // 0.075 as per SwiftUI
  const iconSize = logoSize * 0.16; // 0.16 for X
  const heartSize = logoSize * 0.18; // 0.18 for heart
  const spacing = logoSize * 0.10; // 0.10 as per SwiftUI

  // Final house outline with sharp bottom corners matching SwiftUI HousePath
  const housePath = `
    M ${logoSize * 0.16} ${logoSize * 0.82}
    L ${logoSize * 0.16} ${logoSize * 0.52}
    L ${logoSize * 0.5} ${logoSize * 0.18}
    L ${logoSize * 0.84} ${logoSize * 0.52}
    L ${logoSize * 0.84} ${logoSize * 0.82}
    L ${logoSize * 0.16} ${logoSize * 0.82}
    Z
  `;

  // Final X mark matching SwiftUI XMarkPath (thick rounded cross)
  const xThickness = iconSize * 0.28;
  const xRadius = xThickness * 0.5;

  // Updated heart shape matching SwiftUI HeartPath
  const heartPath = `
    M ${heartSize * 0.5} ${heartSize * 0.92}
    C ${heartSize * 0.5} ${heartSize * 0.75} ${heartSize * 0.92} ${heartSize * 0.62} ${heartSize * 0.92} ${heartSize * 0.35}
    C ${heartSize * 0.92} ${heartSize * 0.15} ${heartSize * 0.7} ${heartSize * 0.08} ${heartSize * 0.5} ${heartSize * 0.15}
    C ${heartSize * 0.3} ${heartSize * 0.08} ${heartSize * 0.08} ${heartSize * 0.15} ${heartSize * 0.08} ${heartSize * 0.35}
    C ${heartSize * 0.08} ${heartSize * 0.62} ${heartSize * 0.5} ${heartSize * 0.75} ${heartSize * 0.5} ${heartSize * 0.92}
    Z
  `;

  return (
    <View style={[styles.container, { width: logoSize, height: logoSize }]}>
      <Svg width={logoSize} height={logoSize} viewBox={`0 0 ${logoSize} ${logoSize}`}>
        {/* House outline with updated SwiftUI colors and rounded styling */}
        <Path
          d={housePath}
          stroke="rgb(36, 97, 186)" // Color(red: 0.14, green: 0.38, blue: 0.73)
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* X and Heart inside with final positioning */}
        <G transform={`translate(${(logoSize - iconSize - heartSize - spacing) / 2}, ${logoSize * 0.53})`}>
          {/* X symbol with thick rounded cross matching SwiftUI XMarkPath */}
          <Path
            d={`M ${xRadius} ${xRadius} L ${iconSize - xRadius} ${iconSize - xRadius}`}
            stroke="rgb(23, 33, 56)" // Color(red: 0.09, green: 0.13, blue: 0.22)
            strokeWidth={xThickness}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d={`M ${iconSize - xRadius} ${xRadius} L ${xRadius} ${iconSize - xRadius}`}
            stroke="rgb(23, 33, 56)"
            strokeWidth={xThickness}
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Heart symbol with updated SwiftUI color */}
          <G transform={`translate(${iconSize + spacing}, 0)`}>
            <Path
              d={heartPath}
              fill="rgb(245, 97, 97)" // Color(red: 0.96, green: 0.38, blue: 0.38)
            />
          </G>
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});