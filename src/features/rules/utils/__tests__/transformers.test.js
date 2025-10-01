/**
 * Tests for data transformer utility functions
 * 
 * This file implements unit tests for the transformer utility functions used to convert
 * between form data and API data formats for different rule types.
 */

// Import transformer utilities
const { 
  transformFormToApiData,
  transformApiToFormData,
  transformPointsRuleData,
  transformDirectAssignmentData,
  transformEventCountData,
  transformRankingData
} = require('../transformers');

describe('Data Transformers', () => {
  // Tests for main transformers (form to API and API to form)
  describe('Form-API Transformers', () => {
    test('transformFormToApiData handles basic fields correctly', () => {
      // Arrange
      const formData = {
        name: 'Test Rule',
        description: 'Test Description',
        type: 'points',
        status: 'active',
        context: {
          type: 'course',
          items: ['1', '2']
        }
      };
      
      // Act
      const apiData = transformFormToApiData(formData);
      
      // Assert
      expect(apiData.name).toBe(formData.name);
      expect(apiData.description).toBe(formData.description);
      expect(apiData.type).toBe(formData.type);
      expect(apiData.status).toBe(formData.status);
      expect(apiData.context).toEqual(formData.context);
    });

    test('transformFormToApiData handles empty or null data', () => {
      // Act & Assert
      expect(transformFormToApiData(null)).toEqual({});
      expect(transformFormToApiData(undefined)).toEqual({});
      expect(transformFormToApiData({})).toEqual({});
    });

    test('transformApiToFormData handles basic fields correctly', () => {
      // Arrange
      const apiData = {
        uid: '123',
        name: 'Test Rule',
        description: 'Test Description',
        type: 'points',
        status: 'active',
        context: {
          type: 'course',
          items: ['1', '2']
        },
        created_at: '2025-04-01T12:00:00Z',
        updated_at: '2025-04-02T12:00:00Z'
      };
      
      // Act
      const formData = transformApiToFormData(apiData);
      
      // Assert
      expect(formData.name).toBe(apiData.name);
      expect(formData.description).toBe(apiData.description);
      expect(formData.type).toBe(apiData.type);
      expect(formData.status).toBe(apiData.status);
      expect(formData.context).toEqual(apiData.context);
      expect(formData.uid).toBe(apiData.uid);
      // Metadata fields should be excluded
      expect(formData.created_at).toBeUndefined();
      expect(formData.updated_at).toBeUndefined();
    });

    test('transformApiToFormData initializes all rule type configs', () => {
      // Arrange
      const apiData = {
        uid: '123',
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
          events: []
        }
      };
      
      // Act
      const formData = transformApiToFormData(apiData);
      
      // Assert
      expect(formData.points).toBeDefined();
      expect(formData.directAssignment).toBeDefined();
      expect(formData.eventCount).toBeDefined();
      expect(formData.ranking).toBeDefined();
    });

    test('transformApiToFormData handles empty or null data', () => {
      // Act & Assert
      expect(transformApiToFormData(null)).toEqual(expect.objectContaining({
        name: '',
        description: '',
        type: '',
        status: 'active',
        context: expect.any(Object),
        points: expect.any(Object),
        directAssignment: expect.any(Object),
        eventCount: expect.any(Object),
        ranking: expect.any(Object)
      }));
    });
  });

  // Tests for Points Rule transformers
  describe('Points Rule Transformers', () => {
    test('transformPointsRuleData transforms form data to API format', () => {
      // Arrange
      const formPointsData = {
        minPoints: 100,
        events: [
          { type: 'login', weight: 1 },
          { type: 'content_access', weight: 2 }
        ]
      };
      
      // Act
      const apiPointsData = transformPointsRuleData.toApi(formPointsData);
      
      // Assert
      expect(apiPointsData.minPoints).toBe(formPointsData.minPoints);
      expect(apiPointsData.events).toEqual(formPointsData.events);
    });

    test('transformPointsRuleData transforms API data to form format', () => {
      // Arrange
      const apiPointsData = {
        minPoints: 100,
        events: [
          { type: 'login', weight: 1 },
          { type: 'content_access', weight: 2 }
        ]
      };
      
      // Act
      const formPointsData = transformPointsRuleData.toForm(apiPointsData);
      
      // Assert
      expect(formPointsData.minPoints).toBe(apiPointsData.minPoints);
      expect(formPointsData.events).toEqual(apiPointsData.events);
    });

    test('transformPointsRuleData handles defaults for missing API data', () => {
      // Act
      const formPointsData = transformPointsRuleData.toForm(null);
      
      // Assert
      expect(formPointsData).toEqual({
        minPoints: 0,
        events: []
      });
    });
  });

  // Tests for Direct Assignment Rule transformers
  describe('Direct Assignment Rule Transformers', () => {
    test('transformDirectAssignmentData transforms form data to API format', () => {
      // Arrange
      const formDirectData = {
        assignerProfiles: ['professor', 'coordinator'],
        assignmentLimit: 5
      };
      
      // Act
      const apiDirectData = transformDirectAssignmentData.toApi(formDirectData);
      
      // Assert
      expect(apiDirectData.assignerProfiles).toEqual(formDirectData.assignerProfiles);
      expect(apiDirectData.assignmentLimit).toBe(formDirectData.assignmentLimit);
    });

    test('transformDirectAssignmentData transforms API data to form format', () => {
      // Arrange
      const apiDirectData = {
        assignerProfiles: ['professor', 'coordinator'],
        assignmentLimit: 5
      };
      
      // Act
      const formDirectData = transformDirectAssignmentData.toForm(apiDirectData);
      
      // Assert
      expect(formDirectData.assignerProfiles).toEqual(apiDirectData.assignerProfiles);
      expect(formDirectData.assignmentLimit).toBe(apiDirectData.assignmentLimit);
    });

    test('transformDirectAssignmentData handles defaults for missing API data', () => {
      // Act
      const formDirectData = transformDirectAssignmentData.toForm(null);
      
      // Assert
      expect(formDirectData).toEqual({
        assignerProfiles: [],
        assignmentLimit: 0
      });
    });
  });

  // Tests for Event Count Rule transformers
  describe('Event Count Rule Transformers', () => {
    test('transformEventCountData transforms form data to API format', () => {
      // Arrange
      const formEventData = {
        eventType: 'login',
        minOccurrences: 10,
        periodType: 'week',
        periodValue: 2,
        requiredStreak: 0
      };
      
      // Act
      const apiEventData = transformEventCountData.toApi(formEventData);
      
      // Assert
      expect(apiEventData.eventType).toBe(formEventData.eventType);
      expect(apiEventData.minOccurrences).toBe(formEventData.minOccurrences);
      expect(apiEventData.periodType).toBe(formEventData.periodType);
      expect(apiEventData.periodValue).toBe(formEventData.periodValue);
      expect(apiEventData.requiredStreak).toBe(formEventData.requiredStreak);
    });

    test('transformEventCountData transforms API data to form format', () => {
      // Arrange
      const apiEventData = {
        eventType: 'login',
        minOccurrences: 10,
        periodType: 'week',
        periodValue: 2,
        requiredStreak: 0
      };
      
      // Act
      const formEventData = transformEventCountData.toForm(apiEventData);
      
      // Assert
      expect(formEventData.eventType).toBe(apiEventData.eventType);
      expect(formEventData.minOccurrences).toBe(apiEventData.minOccurrences);
      expect(formEventData.periodType).toBe(apiEventData.periodType);
      expect(formEventData.periodValue).toBe(apiEventData.periodValue);
      expect(formEventData.requiredStreak).toBe(apiEventData.requiredStreak);
    });

    test('transformEventCountData handles defaults for missing API data', () => {
      // Act
      const formEventData = transformEventCountData.toForm(null);
      
      // Assert
      expect(formEventData).toEqual({
        eventType: '',
        minOccurrences: 1,
        periodType: 'week',
        periodValue: 1,
        requiredStreak: 0
      });
    });
  });

  // Tests for Ranking Rule transformers
  describe('Ranking Rule Transformers', () => {
    test('transformRankingData transforms form data to API format', () => {
      // Arrange
      const formRankingData = {
        rankingId: '1',
        requiredPosition: 3
      };
      
      // Act
      const apiRankingData = transformRankingData.toApi(formRankingData);
      
      // Assert
      expect(apiRankingData.rankingId).toBe(formRankingData.rankingId);
      expect(apiRankingData.requiredPosition).toBe(formRankingData.requiredPosition);
    });

    test('transformRankingData transforms API data to form format', () => {
      // Arrange
      const apiRankingData = {
        rankingId: '1',
        requiredPosition: 3
      };
      
      // Act
      const formRankingData = transformRankingData.toForm(apiRankingData);
      
      // Assert
      expect(formRankingData.rankingId).toBe(apiRankingData.rankingId);
      expect(formRankingData.requiredPosition).toBe(apiRankingData.requiredPosition);
    });

    test('transformRankingData handles defaults for missing API data', () => {
      // Act
      const formRankingData = transformRankingData.toForm(null);
      
      // Assert
      expect(formRankingData).toEqual({
        rankingId: '',
        requiredPosition: 1
      });
    });
  });

  // Integration tests for complete rule transformations
  describe('Complete Rule Transformations', () => {
    test('transforms a complete Points rule correctly', () => {
      // Arrange
      const formData = {
        name: 'Points Rule',
        description: 'Test points rule',
        type: 'points',
        status: 'active',
        context: {
          type: 'course',
          items: ['1', '2']
        },
        points: {
          minPoints: 100,
          events: [
            { type: 'login', weight: 1 },
            { type: 'content_access', weight: 2 }
          ]
        }
      };
      
      // Act
      const apiData = transformFormToApiData(formData);
      const roundTripData = transformApiToFormData(apiData);
      
      // Assert - Check that the type-specific data is preserved
      expect(apiData.points.minPoints).toBe(formData.points.minPoints);
      expect(apiData.points.events).toEqual(formData.points.events);
      expect(roundTripData.points.minPoints).toBe(formData.points.minPoints);
      expect(roundTripData.points.events).toEqual(formData.points.events);
    });

    test('transforms a complete Direct Assignment rule correctly', () => {
      // Arrange
      const formData = {
        name: 'Direct Assignment Rule',
        description: 'Test direct assignment rule',
        type: 'direct',
        status: 'active',
        context: {
          type: 'department',
          items: ['3']
        },
        directAssignment: {
          assignerProfiles: ['professor', 'coordinator'],
          assignmentLimit: 5
        }
      };
      
      // Act
      const apiData = transformFormToApiData(formData);
      const roundTripData = transformApiToFormData(apiData);
      
      // Assert - Check that the type-specific data is preserved
      expect(apiData.directAssignment.assignerProfiles).toEqual(formData.directAssignment.assignerProfiles);
      expect(apiData.directAssignment.assignmentLimit).toBe(formData.directAssignment.assignmentLimit);
      expect(roundTripData.directAssignment.assignerProfiles).toEqual(formData.directAssignment.assignerProfiles);
      expect(roundTripData.directAssignment.assignmentLimit).toBe(formData.directAssignment.assignmentLimit);
    });

    test('handles circular JSON references safely', () => {
      // Arrange
      const circularData = {
        name: 'Circular Rule',
        type: 'points'
      };
      
      // Create circular reference
      circularData.self = circularData;
      
      // Act & Assert
      expect(() => transformFormToApiData(circularData)).not.toThrow();
    });
  });
});
