import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('rendered without errors', () => {
  const { getByText } = render(<App />);
  const resetElement = getByText(/reset/i);
  expect(resetElement).toBeInTheDocument();
});
