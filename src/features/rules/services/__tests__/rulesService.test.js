/**
 * Tests for Rules API Service
 * 
 * This file implements unit tests for the Rules API service, which is responsible
 * for handling the communication with the API endpoints related to rules.
 */

// Mock fetch globally
global.fetch = jest.fn();

// Import the service to test
const { 
  getRule, 
  getRules, 
  createRule, 
  updateRule, 
  deleteRule,
  transformFormToApiData,
  transformApiToFormData
} = require('../rulesService');

describe('Rules API Service', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    
    // Setup default mock responses
    fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({})
    });
  });

  // Tests for getRule
  describe('getRule', () => {
    test('calls the correct API endpoint with GET method', async () => {
      // Arrange
      const uid = '123';
      
      // Act
      await getRule(uid);
      
      // Assert
      expect(fetch).toHaveBeenCalledWith(`/api/rules/${uid}`, expect.objectContaining({
        method: 'GET'
      }));
    });

    test('returns the rule data on successful response', async () => {
      // Arrange
      const uid = '123';
      const mockRule = { uid: '123', name: 'Test Rule' };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockRule)
      });
      
      // Act
      const result = await getRule(uid);
      
      // Assert
      expect(result).toEqual(mockRule);
    });

    test('throws an error on failed response', async () => {
      // Arrange
      const uid = '123';
      
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });
      
      // Act & Assert
      await expect(getRule(uid)).rejects.toThrow('Failed to fetch rule');
    });
  });

  // Tests for getRules
  describe('getRules', () => {
    test('calls the correct API endpoint with GET method', async () => {
      // Act
      await getRules();
      
      // Assert
      expect(fetch).toHaveBeenCalledWith('/api/rules', expect.objectContaining({
        method: 'GET'
      }));
    });

    test('passes query parameters if provided', async () => {
      // Arrange
      const params = { search: 'test', limit: 10 };
      
      // Act
      await getRules(params);
      
      // Assert
      expect(fetch).toHaveBeenCalledWith('/api/rules?search=test&limit=10', expect.any(Object));
    });

    test('returns the rules array on successful response', async () => {
      // Arrange
      const mockRules = [
        { uid: '1', name: 'Rule 1' },
        { uid: '2', name: 'Rule 2' }
      ];
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockRules)
      });
      
      // Act
      const result = await getRules();
      
      // Assert
      expect(result).toEqual(mockRules);
    });

    test('throws an error on failed response', async () => {
      // Arrange
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });
      
      // Act & Assert
      await expect(getRules()).rejects.toThrow('Failed to fetch rules');
    });
  });

  // Tests for createRule
  describe('createRule', () => {
    test('calls the correct API endpoint with POST method', async () => {
      // Arrange
      const ruleData = { name: 'New Rule', type: 'points' };
      
      // Act
      await createRule(ruleData);
      
      // Assert
      expect(fetch).toHaveBeenCalledWith('/api/rules', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(ruleData)
      }));
    });

    test('returns the created rule data on successful response', async () => {
      // Arrange
      const ruleData = { name: 'New Rule', type: 'points' };
      const createdRule = { uid: '123', ...ruleData };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(createdRule)
      });
      
      // Act
      const result = await createRule(ruleData);
      
      // Assert
      expect(result).toEqual(createdRule);
    });

    test('throws an error on failed response', async () => {
      // Arrange
      const ruleData = { name: 'New Rule', type: 'points' };
      
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue({ 
          message: 'Validation error', 
          errors: { name: 'Name is required' } 
        })
      });
      
      // Act & Assert
      await expect(createRule(ruleData)).rejects.toThrow('Failed to create rule');
    });
  });

  // Tests for updateRule
  describe('updateRule', () => {
    test('calls the correct API endpoint with PUT method', async () => {
      // Arrange
      const uid = '123';
      const ruleData = { name: 'Updated Rule', type: 'points' };
      
      // Act
      await updateRule(uid, ruleData);
      
      // Assert
      expect(fetch).toHaveBeenCalledWith(`/api/rules/${uid}`, expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(ruleData)
      }));
    });

    test('returns the updated rule data on successful response', async () => {
      // Arrange
      const uid = '123';
      const ruleData = { name: 'Updated Rule', type: 'points' };
      const updatedRule = { uid, ...ruleData };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(updatedRule)
      });
      
      // Act
      const result = await updateRule(uid, ruleData);
      
      // Assert
      expect(result).toEqual(updatedRule);
    });

    test('throws an error on failed response', async () => {
      // Arrange
      const uid = '123';
      const ruleData = { name: 'Updated Rule', type: 'points' };
      
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });
      
      // Act & Assert
      await expect(updateRule(uid, ruleData)).rejects.toThrow('Failed to update rule');
    });
  });

  // Tests for deleteRule
  describe('deleteRule', () => {
    test('calls the correct API endpoint with DELETE method', async () => {
      // Arrange
      const uid = '123';
      
      // Act
      await deleteRule(uid);
      
      // Assert
      expect(fetch).toHaveBeenCalledWith(`/api/rules/${uid}`, expect.objectContaining({
        method: 'DELETE'
      }));
    });

    test('returns true on successful response', async () => {
      // Arrange
      const uid = '123';
      
      fetch.mockResolvedValueOnce({
        ok: true
      });
      
      // Act
      const result = await deleteRule(uid);
      
      // Assert
      expect(result).toBe(true);
    });

    test('throws an error on failed response', async () => {
      // Arrange
      const uid = '123';
      
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });
      
      // Act & Assert
      await expect(deleteRule(uid)).rejects.toThrow('Failed to delete rule');
    });
  });

  // Tests for data transformation functions
  describe('Data transformations', () => {
    test('transformFormToApiData converts form data to API format', () => {
      // Arrange
      const formData = {
        name: 'Test Rule',
        description: 'Test Description',
        type: 'points',
        status: 'active',
        context: {
          type: 'course',
          items: ['1', '2']
        },
        points: {
          minPoints: 100,
          events: [
            { type: 'login', weight: 1 }
          ]
        }
      };
      
      // Act
      const apiData = transformFormToApiData(formData);
      
      // Assert
      expect(apiData).toEqual({
        name: 'Test Rule',
        description: 'Test Description',
        type: 'points',
        status: 'active',
        context: {
          type: 'course',
          items: ['1', '2']
        },
        points: {
          minPoints: 100,
          events: [
            { type: 'login', weight: 1 }
          ]
        }
      });
    });

    test('transformApiToFormData converts API data to form format', () => {
      // Arrange
      const apiData = {
        uid: '123',
        name: 'Test Rule',
        description: 'Test Description',
        type: 'direct',
        status: 'active',
        context: {
          type: 'department',
          items: ['3']
        },
        directAssignment: {
          assignerProfiles: ['professor'],
          assignmentLimit: 5
        },
        created_at: '2025-04-01T12:00:00Z'
      };
      
      // Act
      const formData = transformApiToFormData(apiData);
      
      // Assert
      expect(formData).toHaveProperty('name', 'Test Rule');
      expect(formData).toHaveProperty('directAssignment.assignerProfiles', ['professor']);
      expect(formData).not.toHaveProperty('created_at');
    });

    test('handles empty or null data gracefully', () => {
      // Arrange & Act & Assert
      expect(() => transformFormToApiData(null)).not.toThrow();
      expect(() => transformApiToFormData(null)).not.toThrow();
      
      expect(transformFormToApiData(null)).toEqual({});
      expect(transformApiToFormData(null)).toEqual({});
    });
  });
});
