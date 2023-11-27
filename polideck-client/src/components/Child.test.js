import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Child from './Child';

describe('Child Component', () => {
  // Mocking window.parent.postMessage
  const mockPostMessage = jest.fn();
  beforeAll(() => {
    window.parent.postMessage = mockPostMessage;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should call postMessage with valid input of 2 digits after the decimal', () => {
    const { getByPlaceholderText, getByText } = render(<Child />);
    fireEvent.change(getByPlaceholderText('0.00'), { target: { value: '10.00' } });
    fireEvent.click(getByText('PURCHASE'));
    expect(mockPostMessage).toHaveBeenCalledWith(
      { type: 'button-click', message: '10.00' },
      '*'
    );
  });

  test('a non numerical input', () => {
    const { getByPlaceholderText, getByText } = render(<Child />);
    fireEvent.change(getByPlaceholderText('0.00'), { target: { value: 'abc' } });
    fireEvent.click(getByText('PURCHASE'));
    expect(mockPostMessage).not.toHaveBeenCalled();
  });

  test('should not call postMessage with less than 2 numbers after the decimal', () => {
    const { getByPlaceholderText, getByText } = render(<Child />);
    fireEvent.change(getByPlaceholderText('0.00'), { target: { value: '10.0' } });
    fireEvent.click(getByText('PURCHASE'));
    expect(mockPostMessage).not.toHaveBeenCalled();
  });

  test('should not call postMessage with more than 2 numbers after the decimal', () => {
    const { getByPlaceholderText, getByText } = render(<Child />);
    fireEvent.change(getByPlaceholderText('0.00'), { target: { value: '10.000' } });
    fireEvent.click(getByText('PURCHASE'));
    expect(mockPostMessage).not.toHaveBeenCalled();
  });

  test('should not call postMessage with a negative number', () => {
    const { getByPlaceholderText, getByText } = render(<Child />);
    fireEvent.change(getByPlaceholderText('0.00'), { target: { value: '-10.00' } });
    fireEvent.click(getByText('PURCHASE'));
    expect(mockPostMessage).not.toHaveBeenCalled();
  });

  test('should not call postMessage with a number without decimals', () => {
    const { getByPlaceholderText, getByText } = render(<Child />);
    fireEvent.change(getByPlaceholderText('0.00'), { target: { value: '10' } });
    fireEvent.click(getByText('PURCHASE'));
    expect(mockPostMessage).not.toHaveBeenCalled();
  });

  test('a symbol', () => {
    const { getByPlaceholderText, getByText } = render(<Child />);
    fireEvent.change(getByPlaceholderText('0.00'), { target: { value: '#' } });
    fireEvent.click(getByText('PURCHASE'));
    expect(mockPostMessage).not.toHaveBeenCalled();
  });

  test('Gas Fee Calculation', () => {   
    const mockEthRate = 200;
  
    jest.mock('axios');
    jest.spyOn(require('axios'), 'get').mockResolvedValue({ data: { ethereum: { usd: mockEthRate } } });
    const { container } = render(<Child />);
    const gasFeeElement = container.querySelector('p span'); 
    const gasFeeValue = parseFloat(gasFeeElement.textContent.slice(1)); 
    const expectedGasFee = (20 / 1e9) * mockEthRate;
    expect(gasFeeValue).toBeCloseTo(expectedGasFee, 2); 
  });
});
