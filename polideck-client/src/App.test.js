import React from 'react';
import { render, fireEvent } from '@testing-library/react';
//import App from './App';
import setEthRate, convertUsdToEth from './App';

describe('USD to Eth conversion Component', () => {

  test('ethrate is 0 so result is supposed to be 0', () => {
    // Arrange
    let usdAmount = 100;
    setEthRate(0);

    // Act
    const result = convertUsdToEth(usdAmount);

    // Assert
    expect(result).toBe(0);
  });

  test('a pass case for eth amount', () => {
    // Arrange
    const usdAmount = 100;
    const ethRate = 200; // Change this to your desired rate

    // Act
    const result = convertUsdToEth(usdAmount);

    // Assert
    expect(result).toBeCloseTo(usdAmount / ethRate, 5);
  });
});