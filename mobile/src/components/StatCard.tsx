import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: 'default' | 'success' | 'danger' | 'warning';
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, subtitle, variant = 'default', icon }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: '#14532d',
          borderColor: '#166534',
          textColor: '#dcfce7',
        };
      case 'danger':
        return {
          backgroundColor: '#7f1d1d',
          borderColor: '#991b1b',
          textColor: '#fee2e2',
        };
      case 'warning':
        return {
          backgroundColor: '#78350f',
          borderColor: '#92400e',
          textColor: '#fef3c7',
        };
      default:
        return {
          backgroundColor: '#334155',
          borderColor: '#475569',
          textColor: '#ffffff',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <View style={[cardStyles.container, { backgroundColor: styles.backgroundColor, borderColor: styles.borderColor }]}>
      <View style={cardStyles.content}>
        <View style={cardStyles.textContainer}>
          <Text style={cardStyles.label}>{label}</Text>
          <Text style={[cardStyles.value, { color: styles.textColor }]}>{value}</Text>
          {subtitle && <Text style={cardStyles.subtitle}>{subtitle}</Text>}
        </View>
        {icon && <View style={cardStyles.iconContainer}>{icon}</View>}
      </View>
    </View>
  );
};

const cardStyles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 24,
    marginBottom: 16,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
  },
  label: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 14,
  },
  iconContainer: {
    marginLeft: 12,
  },
});

