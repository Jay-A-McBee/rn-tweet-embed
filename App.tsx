import React from 'react';
import { SafeAreaView, StyleSheet, Text, StatusBar } from 'react-native';

import Example from './src';

const App = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.main}>
        <Text style={styles.title}>RN-Tweet-Embed</Text>
        <Example />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(11, 32, 89,.85)',
  },
  title: {
    fontSize: 32,
    color: 'orange',
    paddingVertical: 10,
    textAlign: 'center',
  },
});

export default App;
