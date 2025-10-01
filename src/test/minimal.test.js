/**
 * Minimal test file with no dependencies
 */

describe('Minimal test', () => {
  console.log('Executing minimal test');
  
  it('should execute a basic test', () => {
    const value = 1 + 1;
    console.log('Test running, calculated value:', value);
    expect(value).toBe(2);
  });
});
