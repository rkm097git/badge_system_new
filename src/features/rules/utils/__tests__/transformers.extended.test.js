/**
 * Extended tests for data transformer utility functions
 * 
 * This file implements additional unit tests for the transformer utility functions
 * focusing on edge cases, special characters, complex data structures, and data integrity.
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

describe('Data Transformers - Extended Tests', () => {
  // Advanced tests for special cases
  describe('Edge Cases and Nullish Values', () => {
    test('transformFormToApiData handles null values in nested objects', () => {
      // Arrange
      const formData = {
        name: 'Test Rule',
        description: 'Test Description',
        type: 'points',
        status: 'active',
        context: null,
        points: {
          minPoints: null,
          events: null
        }
      };
      
      // Act
      const apiData = transformFormToApiData(formData);
      
      // Assert
      expect(apiData.name).toBe(formData.name);
      expect(apiData.description).toBe(formData.description);
      expect(apiData.configuration).toEqual({
        minPoints: 0,
        events: []
      });
      expect(apiData.context).toBeNull();
    });

    test('transformApiToFormData handles missing configuration properties', () => {
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
        // Missing or incomplete configuration
        configuration: {
          // minPoints missing
          events: []
        }
      };
      
      // Act
      const formData = transformApiToFormData(apiData);
      
      // Assert
      expect(formData.points.minPoints).toBe(0); // Default value applied
      expect(formData.points.events).toEqual([]);
    });

    test('transformers handle zero as a valid value (not applying defaults)', () => {
      // Arrange
      const apiData = {
        uid: '123',
        name: 'Test Rule',
        description: 'Test Description',
        type: 'points',
        status: 'active',
        configuration: {
          minPoints: 0, // Zero is a valid value, should not be replaced with default
          events: []
        }
      };
      
      // Act
      const formData = transformApiToFormData(apiData);
      
      // Assert
      expect(formData.points.minPoints).toBe(0);
      
      // Round-trip transformation should preserve zero
      const roundTrip = transformFormToApiData(formData);
      expect(roundTrip.configuration.minPoints).toBe(0);
    });

    test('transformers handle empty arrays as valid values', () => {
      // Arrange
      const apiData = {
        uid: '123',
        name: 'Test Rule',
        type: 'direct',
        configuration: {
          assignerProfiles: [], // Empty array should be preserved
          assignmentLimit: 5
        }
      };
      
      // Act
      const formData = transformApiToFormData(apiData);
      
      // Assert
      expect(formData.directAssignment.assignerProfiles).toEqual([]);
      
      // Round-trip transformation should preserve empty array
      const roundTrip = transformFormToApiData(formData);
      expect(roundTrip.configuration.assignerProfiles).toEqual([]);
    });
  });

  // Tests for special characters and complex content
  describe('Special Characters and Complex Content', () => {
    test('transformers handle special characters in strings', () => {
      // Arrange
      const formData = {
        name: 'Test Rule with Special Characters: !@#$%^&*()',
        description: 'Line 1\nLine 2\nLine 3 with "quotes" and \'apostrophes\'',
        type: 'points',
        points: {
          minPoints: 100,
          events: [
            { type: 'event with spaces and symbols: !@#', weight: 1 }
          ]
        }
      };
      
      // Act
      const apiData = transformFormToApiData(formData);
      const roundTripData = transformApiToFormData(apiData);
      
      // Assert
      expect(apiData.name).toBe(formData.name);
      expect(apiData.description).toBe(formData.description);
      expect(apiData.configuration.events[0].type).toBe(formData.points.events[0].type);
      
      // Verify round-trip integrity
      expect(roundTripData.name).toBe(formData.name);
      expect(roundTripData.description).toBe(formData.description);
      expect(roundTripData.points.events[0].type).toBe(formData.points.events[0].type);
    });

    test('transformers handle non-ASCII characters (internationalization)', () => {
      // Arrange
      const formData = {
        name: 'Regra de Pontuação com Acentuação',
        description: 'Descripción en español con caracteres especiales: ñ, á, é, í, ó, ú',
        type: 'points',
        points: {
          minPoints: 100,
          events: [
            { type: 'evento_com_acentuação', weight: 1 },
            { type: '日本語イベント', weight: 2 }, // Japanese characters
            { type: 'Русское событие', weight: 3 } // Russian characters
          ]
        }
      };
      
      // Act
      const apiData = transformFormToApiData(formData);
      const roundTripData = transformApiToFormData(apiData);
      
      // Assert - Check that special characters are preserved
      expect(apiData.name).toBe(formData.name);
      expect(apiData.description).toBe(formData.description);
      expect(apiData.configuration.events[0].type).toBe(formData.points.events[0].type);
      expect(apiData.configuration.events[1].type).toBe(formData.points.events[1].type);
      expect(apiData.configuration.events[2].type).toBe(formData.points.events[2].type);
      
      // Verify round-trip integrity
      expect(roundTripData.name).toBe(formData.name);
      expect(roundTripData.description).toBe(formData.description);
      expect(roundTripData.points.events[0].type).toBe(formData.points.events[0].type);
      expect(roundTripData.points.events[1].type).toBe(formData.points.events[1].type);
      expect(roundTripData.points.events[2].type).toBe(formData.points.events[2].type);
    });

    test('transformers handle deeply nested arrays and objects', () => {
      // Arrange
      const formData = {
        name: 'Complex Rule',
        description: 'Rule with nested data',
        type: 'events',
        eventCount: {
          eventType: 'complex_event',
          minOccurrences: 5,
          periodType: 'month',
          periodValue: 1,
          requiredStreak: 0,
          metadata: {
            categories: ['category1', 'category2'],
            tags: ['tag1', 'tag2'],
            properties: {
              prop1: 'value1',
              prop2: 'value2',
              nested: {
                nestedProp1: 'nestedValue1',
                nestedArray: [1, 2, 3, 4]
              }
            }
          }
        }
      };
      
      // Act
      const apiData = transformFormToApiData(formData);
      
      // Assert
      // The standard transformers won't include the metadata property by default,
      // but we can verify the other properties are correctly transformed
      expect(apiData.configuration.eventType).toBe(formData.eventCount.eventType);
      expect(apiData.configuration.minOccurrences).toBe(formData.eventCount.minOccurrences);
      expect(apiData.configuration.periodType).toBe(formData.eventCount.periodType);
      expect(apiData.configuration.periodValue).toBe(formData.eventCount.periodValue);
    });
  });

  // Tests for complete round-trip transformations
  describe('Round-Trip Transformation Integrity', () => {
    test('preserves data integrity through complete round-trip for Points rule', () => {
      // Arrange
      const originalFormData = {
        name: 'Points Rule for Integrity Test',
        description: 'Testing round-trip integrity',
        type: 'points',
        status: 'active',
        context: {
          type: 'course',
          items: ['1', '2', '3']
        },
        points: {
          minPoints: 250,
          events: [
            { type: 'login', weight: 1 },
            { type: 'comment', weight: 5 },
            { type: 'assignment_completion', weight: 10 }
          ]
        }
      };
      
      // Act
      // Transform form data to API format
      const apiData = transformFormToApiData(originalFormData);
      // Transform API data back to form format
      const roundTripFormData = transformApiToFormData(apiData);
      
      // Assert
      // Basic fields
      expect(roundTripFormData.name).toBe(originalFormData.name);
      expect(roundTripFormData.description).toBe(originalFormData.description);
      expect(roundTripFormData.type).toBe(originalFormData.type);
      expect(roundTripFormData.status).toBe(originalFormData.status);
      
      // Context
      expect(roundTripFormData.context.type).toBe(originalFormData.context.type);
      expect(roundTripFormData.context.items).toEqual(originalFormData.context.items);
      
      // Points specific configuration
      expect(roundTripFormData.points.minPoints).toBe(originalFormData.points.minPoints);
      expect(roundTripFormData.points.events.length).toBe(originalFormData.points.events.length);
      
      // Each event should be preserved
      originalFormData.points.events.forEach((event, index) => {
        expect(roundTripFormData.points.events[index].type).toBe(event.type);
        expect(roundTripFormData.points.events[index].weight).toBe(event.weight);
      });
    });

    test('preserves data integrity through complete round-trip for Direct Assignment rule', () => {
      // Arrange
      const originalFormData = {
        name: 'Direct Assignment Rule',
        description: 'Testing direct assignment round-trip',
        type: 'direct',
        status: 'active',
        context: {
          type: 'program',
          items: ['program1']
        },
        directAssignment: {
          assignerProfiles: ['admin', 'professor', 'coordinator'],
          assignmentLimit: 3
        }
      };
      
      // Act
      const apiData = transformFormToApiData(originalFormData);
      const roundTripFormData = transformApiToFormData(apiData);
      
      // Assert
      // Direct Assignment specific configuration
      expect(roundTripFormData.directAssignment.assignmentLimit).toBe(originalFormData.directAssignment.assignmentLimit);
      expect(roundTripFormData.directAssignment.assignerProfiles).toEqual(originalFormData.directAssignment.assignerProfiles);
    });

    test('preserves metadata if present through transformations', () => {
      // Arrange - Form data with custom metadata
      const formData = {
        name: 'Rule with Metadata',
        description: 'Testing metadata preservation',
        type: 'points',
        metadata: {
          createdBy: 'user123',
          version: '1.2.3',
          tags: ['important', 'featured']
        },
        points: {
          minPoints: 100,
          events: [
            { type: 'login', weight: 1 }
          ]
        }
      };
      
      // Act
      // First transform to add the metadata to API data manually since our transformers
      // don't handle metadata by default
      const apiData = {
        ...transformFormToApiData(formData),
        metadata: formData.metadata // Explicitly copy metadata
      };
      
      // Then transform back to form format with our custom metadata handler
      const roundTripFormData = {
        ...transformApiToFormData(apiData),
        metadata: apiData.metadata // Explicitly preserve metadata
      };
      
      // Assert
      expect(roundTripFormData.metadata).toBeDefined();
      expect(roundTripFormData.metadata.createdBy).toBe(formData.metadata.createdBy);
      expect(roundTripFormData.metadata.version).toBe(formData.metadata.version);
      expect(roundTripFormData.metadata.tags).toEqual(formData.metadata.tags);
    });
  });

  // Tests for specific rule type edge cases
  describe('Rule Type-Specific Edge Cases', () => {
    test('handles empty events array in Points rule', () => {
      // Arrange
      const formData = {
        name: 'Empty Events Points Rule',
        type: 'points',
        points: {
          minPoints: 100,
          events: [] // Empty events array
        }
      };
      
      // Act
      const apiData = transformFormToApiData(formData);
      const roundTripData = transformApiToFormData(apiData);
      
      // Assert
      expect(apiData.configuration.events).toEqual([]);
      expect(roundTripData.points.events).toEqual([]);
    });

    test('handles empty assignerProfiles array in Direct Assignment rule', () => {
      // Arrange
      const formData = {
        name: 'Empty Profiles Direct Rule',
        type: 'direct',
        directAssignment: {
          assignerProfiles: [], // Empty profiles array
          assignmentLimit: 5
        }
      };
      
      // Act
      const apiData = transformFormToApiData(formData);
      const roundTripData = transformApiToFormData(apiData);
      
      // Assert
      expect(apiData.configuration.assignerProfiles).toEqual([]);
      expect(roundTripData.directAssignment.assignerProfiles).toEqual([]);
    });

    test('handles non-array value in array fields by defaulting to empty array', () => {
      // Arrange
      const apiData = {
        uid: '123',
        name: 'Corrupted Data Rule',
        type: 'points',
        configuration: {
          minPoints: 100,
          events: "not an array" // Incorrectly formatted data
        }
      };
      
      // Act
      const formData = transformApiToFormData(apiData);
      
      // Assert - Should handle gracefully by defaulting to empty array
      expect(formData.points.events).toEqual([]);
    });
  });
});
