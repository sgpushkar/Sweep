import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

describe('App Root Component', () => {
  it('renders root application successfully', async () => {
    let renderer: any;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<App />);
    });
    expect(renderer).toBeDefined();
  }, 15000);
});
