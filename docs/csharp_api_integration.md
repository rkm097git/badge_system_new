# C# API Integration Documentation

## Overview

This document provides information about the C# API interfaces that can be used to integrate with the Badge System. The API is defined in the `Api.DigitalPages.Interfaces` namespace and provides a comprehensive set of interfaces for managing educational content, badges, courses, and user interactions.

## Key Components

### Badge Management

The badge management interfaces in the C# API provide functionality for creating, managing, and assigning badges to users based on various criteria. The main interfaces include:

#### IBadge

The `IBadge` interface represents a badge in the system and includes the following key properties:

- `Name`: The name of the badge
- `Description`: A description of the badge
- `IsEnabled`: Indicates if the badge is currently enabled
- `IsHidden`: Indicates if the badge is hidden from users
- `RegisterConfig`: Configuration for badge registration
- `Entities`: Entities related to the badge
- `Rules`: Rules that determine when the badge should be awarded
- `UserRegisters`: Users who have been awarded the badge
- `RequiredForRegister`: Prerequisites for registering this badge

#### IBadgeRule

The `IBadgeRule` interface defines rules for badge awards:

- `MinimumPoints`: Minimum points required to earn the badge
- `Limitation`: Time-based limitations (None, Daily, Weekly, Monthly, Yearly)
- `Conditions`: List of conditions that must be met

#### IBadgeCondition

The `IBadgeCondition` interface defines specific conditions for earning badges:

- `ReferenceType`: Type of object this condition refers to
- `ReferenceUid`: Unique identifier for the reference object
- `ConditionType`: Type of condition (All, Any)

#### IBadgeRegisterConfig

The `IBadgeRegisterConfig` interface handles badge registration configuration:

- `AuthorizeRegisterType`: Type of registration authorized (ByUser, ByManager, ByPoints)
- `ExpireAfterAt`: Time period after which the badge expires
- `ExpireAt`: Explicit expiration date
- `MaxUsers`: Maximum number of users who can earn this badge
- `RequiredPoints`: Points needed to earn the badge
- `RequiredBadges`: Other badges that must be earned first

### Course Management

The course management interfaces provide functionality for creating and managing educational courses:

#### ICourse

The `ICourse` interface represents a course in the system:

- `Title`: The title of the course
- `Description`: A description of the course
- `ThumbUrl`: URL to the course thumbnail image
- `InternalName`: Internal name for administrative purposes
- `Entities`: Related entities
- `NodeProperties`: Structure properties for course nodes
- `CourseProperties`: Additional course properties
- `Nodes`: Course nodes forming the learning path
- `Authorizations`: Users/entities permitted to view the course
- `Registers`: Time periods when the course is accessible
- `Tags`: Tags for the course
- `Type`: Course type (Content, Interaction, EvaluativeContent)
- `TypeFormulaScore`: Formula for score calculation

### User Management

The user management interfaces provide functionality for authentication and user information:

#### IOAuthService

The `IOAuthService` interface provides OAuth authentication functionality:

- `AccessCodeUrl`: Generates URLs for OAuth authentication
- `UserInfo`: Retrieves user information after authentication
- `AccessCodeFromCallback`: Processes OAuth callbacks
- `AccessToken`: Obtains access tokens after authentication

#### IOAuthUser

The `IOAuthUser` interface represents a user authenticated via OAuth:

- `Id`: User identifier
- `Name`: User's name
- `Email`: User's email address
- `Photo`: URL to user's profile photo

## Integration Points with Badge System

The Badge System front-end can integrate with this C# API to handle various badge-related functionalities:

### Badge Rules Integration

The badge rules in the front-end application should align with the IBadgeRule structure from the C# API. The key integration points are:

1. **Rule Types**: The rule types in the front-end (points, direct, events, ranking) correspond to different combinations of `IBadgeRule` and `IBadgeCondition` configurations:
   - **Points Rules**: Map to `IBadgeRule` with specific `MinimumPoints` values
   - **Direct Assignment Rules**: Map to `IBadgeRule` with specific `Conditions`
   - **Events Count Rules**: Map to `IBadgeRule` with `Conditions` that track event occurrences
   - **Ranking Rules**: Map to `IBadgeRule` with `Conditions` that reference ranking positions

2. **Rule Creation**: When creating rules in the front-end, the data should be structured to match the C# API model, ensuring:
   - Proper validation of required fields
   - Correct type conversion
   - Appropriate error handling

3. **Data Transfer Objects**: The front-end should include data transfer objects (DTOs) that map to the C# API interfaces, enabling seamless data exchange.

## API Authentication

API authentication is handled through the OAuth interfaces:

1. The front-end application should implement OAuth authentication using the `IOAuthService` interface
2. After authentication, the application can retrieve user information using the `UserInfo` method
3. The application should handle token management and renewal as needed

## Implementation Recommendations

When implementing the Badge System front-end to integrate with this C# API, consider the following recommendations:

1. **API Client**: Create a dedicated API client service to handle all communication with the C# API
2. **Data Mapping**: Implement robust data mapping between the front-end models and the C# API interfaces
3. **Error Handling**: Ensure comprehensive error handling for API requests and responses
4. **Authentication**: Implement secure authentication using the OAuth interfaces
5. **Caching**: Consider implementing caching for frequently accessed data to improve performance
6. **Validation**: Implement client-side validation that mirrors the server-side validation rules

## Example Integration Code

Below is an example of how the Badge System front-end might create a new badge rule through the C# API:

```typescript
// Example API client method for creating a badge rule
async function createBadgeRule(badgeId: string, ruleData: RuleFormData): Promise<IBadgeRule> {
  // Map front-end data to C# API model
  const apiRuleData = {
    badgeUid: badgeId,
    minimumPoints: ruleData.type === 'points' ? ruleData.minPoints : null,
    limitation: ruleData.limitation || 'None',
    conditions: mapConditions(ruleData)
  };
  
  // Send API request
  const response = await apiClient.post('/api/badges/rules', apiRuleData);
  
  // Handle response
  if (response.ok) {
    return response.data;
  } else {
    throw new Error(`Failed to create badge rule: ${response.status}`);
  }
}

// Helper function to map conditions
function mapConditions(ruleData: RuleFormData): IBadgeCondition[] {
  switch (ruleData.type) {
    case 'direct':
      return ruleData.profiles.map(profile => ({
        referenceType: 'User',
        referenceUid: profile.id,
        conditionType: 'Any'
      }));
    case 'events':
      return [{
        referenceType: 'Event',
        referenceUid: ruleData.eventType,
        conditionType: 'All'
      }];
    case 'ranking':
      return [{
        referenceType: 'Ranking',
        referenceUid: ruleData.ranking,
        conditionType: 'All'
      }];
    default:
      return [];
  }
}
```

## Conclusion

The C# API provides a comprehensive set of interfaces for integrating with the Badge System, offering functionality for badge management, course management, and user authentication. By aligning the front-end implementation with these interfaces, the Badge System can provide a seamless experience for users while leveraging the robust backend capabilities.
