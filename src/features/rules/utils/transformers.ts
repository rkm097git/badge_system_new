/**
 * Data Transformer Utilities
 * 
 * This module contains utility functions for transforming data between
 * the form format and the API format for different rule types.
 */

import { Rule, RuleCreateInput, RuleUpdateInput } from '../types';

/**
 * Transforms form data to API format
 * @param formData Form data from the rule form
 * @returns Data formatted for API submission
 */
export const transformFormToApiData = (formData: any): RuleCreateInput | RuleUpdateInput => {
  if (!formData) return {};

  // Determine the configuration based on the rule type
  let configuration = {};
  
  switch (formData.type) {
    case 'points':
      configuration = transformPointsRuleData.toApi(formData.points);
      break;
    case 'direct':
      configuration = transformDirectAssignmentData.toApi(formData.directAssignment);
      break;
    case 'events':
      configuration = transformEventCountData.toApi(formData.eventCount);
      break;
    case 'ranking':
      configuration = transformRankingData.toApi(formData.ranking);
      break;
  }

  // Build the API object
  return {
    name: formData.name,
    description: formData.description,
    type: formData.type as any, // Type assertion required due to TypeScript constraints
    configuration,
    context: formData.context,
    status: formData.status || 'active'
  };
};

/**
 * Transforms API data to form format
 * @param apiData Data from the API
 * @returns Data formatted for the form
 */
export const transformApiToFormData = (apiData: Rule | null): any => {
  // Initialize default form data structure
  const formData: any = {
    uid: apiData?.uid || '',
    name: apiData?.name || '',
    description: apiData?.description || '',
    type: apiData?.type || '',
    context: apiData?.context || { type: '', items: [] },
    status: apiData?.status || 'active',
    
    // Initialize all rule type configurations to prevent null references
    points: transformPointsRuleData.toForm(null),
    directAssignment: transformDirectAssignmentData.toForm(null),
    eventCount: transformEventCountData.toForm(null),
    ranking: transformRankingData.toForm(null)
  };

  // If no API data, return default structure
  if (!apiData) return formData;

  // Get configuration for the specific rule type
  const config = apiData.configuration || {};

  // Update the specific rule type configuration based on the rule type
  switch (apiData.type) {
    case 'points':
      formData.points = transformPointsRuleData.toForm(config);
      break;
    case 'direct':
      formData.directAssignment = transformDirectAssignmentData.toForm(config);
      break;
    case 'events':
      formData.eventCount = transformEventCountData.toForm(config);
      break;
    case 'ranking':
      formData.ranking = transformRankingData.toForm(config);
      break;
  }

  return formData;
};

/**
 * Transform utilities for Points rule type
 */
export const transformPointsRuleData = {
  /**
   * Transforms form data to API format for Points rule
   * @param data Form data for Points rule
   * @returns API formatted data
   */
  toApi: (data: any = {}) => ({
    minPoints: data?.minPoints || 0,
    events: data?.events || []
  }),

  /**
   * Transforms API data to form format for Points rule
   * @param data API data for Points rule
   * @returns Form formatted data
   */
  toForm: (data: any = null) => ({
    minPoints: data?.minPoints || 0,
    events: data?.events || []
  })
};

/**
 * Transform utilities for Direct Assignment rule type
 */
export const transformDirectAssignmentData = {
  /**
   * Transforms form data to API format for Direct Assignment rule
   * @param data Form data for Direct Assignment rule
   * @returns API formatted data
   */
  toApi: (data: any = {}) => ({
    assignerProfiles: data?.assignerProfiles || [],
    assignmentLimit: data?.assignmentLimit || 0
  }),

  /**
   * Transforms API data to form format for Direct Assignment rule
   * @param data API data for Direct Assignment rule
   * @returns Form formatted data
   */
  toForm: (data: any = null) => ({
    assignerProfiles: data?.assignerProfiles || [],
    assignmentLimit: data?.assignmentLimit || 0
  })
};

/**
 * Transform utilities for Event Count rule type
 */
export const transformEventCountData = {
  /**
   * Transforms form data to API format for Event Count rule
   * @param data Form data for Event Count rule
   * @returns API formatted data
   */
  toApi: (data: any = {}) => ({
    eventType: data?.eventType || '',
    minOccurrences: data?.minOccurrences || 1,
    periodType: data?.periodType || 'week',
    periodValue: data?.periodValue || 1,
    requiredStreak: data?.requiredStreak || 0
  }),

  /**
   * Transforms API data to form format for Event Count rule
   * @param data API data for Event Count rule
   * @returns Form formatted data
   */
  toForm: (data: any = null) => ({
    eventType: data?.eventType || '',
    minOccurrences: data?.minOccurrences || 1,
    periodType: data?.periodType || 'week',
    periodValue: data?.periodValue || 1,
    requiredStreak: data?.requiredStreak || 0
  })
};

/**
 * Transform utilities for Ranking rule type
 */
export const transformRankingData = {
  /**
   * Transforms form data to API format for Ranking rule
   * @param data Form data for Ranking rule
   * @returns API formatted data
   */
  toApi: (data: any = {}) => ({
    rankingId: data?.rankingId || '',
    requiredPosition: data?.requiredPosition || 1
  }),

  /**
   * Transforms API data to form format for Ranking rule
   * @param data API data for Ranking rule
   * @returns Form formatted data
   */
  toForm: (data: any = null) => ({
    rankingId: data?.rankingId || '',
    requiredPosition: data?.requiredPosition || 1
  })
};
