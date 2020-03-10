import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  spinner: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(1,1,1,.5)',
  },
});

export const LoadingIndicator: React.FC<{
  isLoading: boolean;
  size?: number | 'small' | 'large';
}> = ({ isLoading, size = 'large' }) =>
  isLoading ? (
    <View style={styles.spinner}>
      <ActivityIndicator size={size} color={'white'} animating={isLoading} />
    </View>
  ) : null;
