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

  // Add more test cases for different input scenarios...
});