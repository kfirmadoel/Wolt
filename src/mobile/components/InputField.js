import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

export default function InputField({ error, children, style, ...props }) {
  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor="#888"
        {...props}
      />
      {children && <View style={styles.childrenContainer}>{children}</View>}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    marginBottom: 15 
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: { 
    borderColor: 'red' 
  },
  childrenContainer: { 
    marginTop: 5, 
    paddingLeft: 5 
  },
  errorText: { 
    color: 'red', 
    fontSize: 12, 
    marginTop: 5, 
    paddingLeft: 5 
  }
});