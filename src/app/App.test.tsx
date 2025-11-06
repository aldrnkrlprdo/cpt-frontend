import React from 'react';
import { render, screen } from '@testing-library/react';
import { App } from './App';

const { PUBLIC_URL } = process.env;

test('renders learn react link', () => {
  render(<App basename={PUBLIC_URL}/>);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
