import { Page } from '@playwright/test';

/**
 * Helper utilities for testing rule-related functionality
 */
export class RuleUtils {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Fill in the basic rule information
   * 
   * @param name - Rule name
   * @param description - Rule description
   * @param type - Rule type (points, direct, events, ranking)
   */
  async fillBasicRuleInfo(name: string, description: string, type: string) {
    await this.page.getByLabel('Name').fill(name);
    await this.page.getByLabel('Description').fill(description);
    await this.page.getByLabel('Type').selectOption(type);
  }

  /**
   * Create a points rule with the given parameters
   * 
   * @param name - Rule name
   * @param description - Rule description
   * @param minPoints - Minimum points required
   * @param events - Array of events with their point values
   */
  async createPointsRule(
    name: string, 
    description: string, 
    minPoints: number, 
    events: Array<{type: string, points: number}>
  ) {
    // Fill basic info
    await this.fillBasicRuleInfo(name, description, 'points');
    
    // Fill in minimum points
    await this.page.getByLabel('Minimum Points').fill(minPoints.toString());
    
    // Add events
    for (let i = 0; i < events.length; i++) {
      if (i > 0) {
        // Add event button - only needed after the first event
        await this.page.getByRole('button', { name: 'Add Event' }).click();
      }
      
      // Fill in event details
      await this.page.getByLabel('Event Type').nth(i).fill(events[i].type);
      await this.page.getByLabel('Points').nth(i).fill(events[i].points.toString());
    }
    
    // Save the rule
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  /**
   * Create a direct assignment rule
   * 
   * @param name - Rule name
   * @param description - Rule description
   * @param profiles - Array of profile types
   */
  async createDirectRule(
    name: string, 
    description: string, 
    profiles: string[]
  ) {
    // Fill basic info
    await this.fillBasicRuleInfo(name, description, 'direct');
    
    // Add profiles (assuming the profiles are in a multi-select or similar)
    for (const profile of profiles) {
      await this.page.getByText(profile).click();
    }
    
    // Save the rule
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  /**
   * Create an events count rule
   * 
   * @param name - Rule name
   * @param description - Rule description
   * @param eventType - Type of event
   * @param minCount - Minimum count required
   */
  async createEventsRule(
    name: string, 
    description: string, 
    eventType: string, 
    minCount: number
  ) {
    // Fill basic info
    await this.fillBasicRuleInfo(name, description, 'events');
    
    // Fill in event type and minimum count
    await this.page.getByLabel('Event Type').fill(eventType);
    await this.page.getByLabel('Minimum Count').fill(minCount.toString());
    
    // Save the rule
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  /**
   * Create a ranking rule
   * 
   * @param name - Rule name
   * @param description - Rule description
   * @param ranking - Ranking name
   * @param position - Position in ranking
   */
  async createRankingRule(
    name: string, 
    description: string, 
    ranking: string, 
    position: number
  ) {
    // Fill basic info
    await this.fillBasicRuleInfo(name, description, 'ranking');
    
    // Fill in ranking and position
    await this.page.getByLabel('Ranking').selectOption(ranking);
    await this.page.getByLabel('Position').fill(position.toString());
    
    // Save the rule
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  /**
   * Delete a rule by name from the rules list
   * 
   * @param ruleName - Name of the rule to delete
   */
  async deleteRule(ruleName: string) {
    // Navigate to rules list
    await this.page.goto('/admin/rules');
    
    // Find the row with the rule
    const rows = await this.page.locator('tbody tr').all();
    for (const row of rows) {
      const name = await row.locator('td').nth(0).textContent();
      if (name === ruleName) {
        // Click the delete button
        await row.getByRole('button', { name: 'Delete' }).click();
        
        // Confirm deletion in the modal
        await this.page.getByRole('button', { name: 'Confirm' }).click();
        break;
      }
    }
  }
}
