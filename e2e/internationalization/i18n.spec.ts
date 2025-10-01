import { test, expect } from '@playwright/test';

/**
 * Test suite for internationalization support
 * 
 * Tests language switching, translated content, and locale-specific formatting
 */
test.describe('Internationalization', () => {
  // Expected translations for key UI elements in different languages
  const translations = {
    en: {
      createRule: 'Create Rule',
      editRule: 'Edit Rule',
      name: 'Name',
      description: 'Description',
      type: 'Type',
      save: 'Save',
      cancel: 'Cancel',
      ruleCreated: 'Rule created successfully',
      nameRequired: 'Name is required'
    },
    'pt-BR': {
      createRule: 'Criar Regra',
      editRule: 'Editar Regra',
      name: 'Nome',
      description: 'Descrição',
      type: 'Tipo',
      save: 'Salvar',
      cancel: 'Cancelar',
      ruleCreated: 'Regra criada com sucesso',
      nameRequired: 'Nome é obrigatório'
    },
    es: {
      createRule: 'Crear Regla',
      editRule: 'Editar Regla',
      name: 'Nombre',
      description: 'Descripción',
      type: 'Tipo',
      save: 'Guardar',
      cancel: 'Cancelar',
      ruleCreated: 'Regla creada exitosamente',
      nameRequired: 'El nombre es obligatorio'
    }
  };

  // Test each supported language
  for (const [locale, texts] of Object.entries(translations)) {
    test(`should display rule form correctly in ${locale}`, async ({ page }) => {
      // Navigate to create rule page with the language parameter
      await page.goto(`/admin/rules/new?locale=${locale}`);
      
      // Verify page title is properly translated
      await expect(page.locator('h1')).toContainText(texts.createRule);
      
      // Check form labels are translated
      await expect(page.getByText(texts.name)).toBeVisible();
      await expect(page.getByText(texts.description)).toBeVisible();
      await expect(page.getByText(texts.type)).toBeVisible();
      
      // Check buttons are translated
      await expect(page.getByRole('button', { name: texts.save })).toBeVisible();
      await expect(page.getByRole('button', { name: texts.cancel })).toBeVisible();
      
      // Check validation messages are translated
      await page.getByRole('button', { name: texts.save }).click();
      await expect(page.getByText(texts.nameRequired)).toBeVisible();
      
      // Test full form submission with translated success message
      await page.getByLabel(texts.name).fill('Test i18n');
      await page.getByLabel(texts.description).fill('Testing internationalization');
      await page.getByLabel(texts.type).selectOption('direct');
      await page.getByRole('button', { name: texts.save }).click();
      
      // Verify success message is properly translated
      await expect(page.getByText(texts.ruleCreated)).toBeVisible();
    });
    
    test(`should display rules list correctly in ${locale}`, async ({ page }) => {
      // Navigate to rules list with the language parameter
      await page.goto(`/admin/rules?locale=${locale}`);
      
      // Placeholder for checking translated table headers and buttons
      // You'll need to update these based on your actual UI text
      if (locale === 'en') {
        await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Type' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'New Rule' })).toBeVisible();
      } else if (locale === 'pt-BR') {
        await expect(page.getByRole('columnheader', { name: 'Nome' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Tipo' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Nova Regra' })).toBeVisible();
      } else if (locale === 'es') {
        await expect(page.getByRole('columnheader', { name: 'Nombre' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Tipo' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Nueva Regla' })).toBeVisible();
      }
    });
  }

  test('should respect browser language preferences', async ({ browser }) => {
    // Create context with specific language preference
    const context = await browser.newContext({
      locale: 'pt-BR',
      acceptLanguages: ['pt-BR']
    });
    
    const page = await context.newPage();
    
    // Navigate to create rule page without explicit locale parameter
    await page.goto('/admin/rules/new');
    
    // Verify page is displayed in Portuguese based on browser preferences
    await expect(page.locator('h1')).toContainText(translations['pt-BR'].createRule);
    
    // Check form labels are in Portuguese
    await expect(page.getByText(translations['pt-BR'].name)).toBeVisible();
    await expect(page.getByText(translations['pt-BR'].description)).toBeVisible();
    
    // Clean up
    await context.close();
  });

  test('should format dates according to locale', async ({ page }) => {
    // This test assumes your application displays dates somewhere in the UI
    // For example, in created/updated timestamps on rules
    
    // Test with English locale
    await page.goto('/admin/rules?locale=en');
    
    // Find a date element - you'll need to adjust this selector for your actual UI
    const dateElementEN = page.locator('time, [data-testid="date"], .date-field').first();
    
    if (await dateElementEN.count() > 0) {
      const dateTextEN = await dateElementEN.textContent() || '';
      
      // English format typically uses / or - (e.g., 04/20/2025 or 04-20-2025)
      // or month name (e.g., April 20, 2025)
      const englishDatePattern = /\d{1,2}[-/]\d{1,2}[-/]\d{4}|\w+ \d{1,2}, \d{4}/;
      expect(dateTextEN).toMatch(englishDatePattern);
    }
    
    // Test with Portuguese locale
    await page.goto('/admin/rules?locale=pt-BR');
    
    // Find a date element
    const dateElementPT = page.locator('time, [data-testid="date"], .date-field').first();
    
    if (await dateElementPT.count() > 0) {
      const dateTextPT = await dateElementPT.textContent() || '';
      
      // Portuguese format typically uses / (e.g., 20/04/2025)
      const portugueseDatePattern = /\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2} de \w+ de \d{4}/;
      expect(dateTextPT).toMatch(portugueseDatePattern);
    }
  });

  test('should handle right-to-left languages correctly', async ({ browser }) => {
    // This test is for future RTL language support
    // Skip this test if RTL languages are not yet supported
    test.skip(true, 'RTL language support not implemented yet');
    
    // Create context with Arabic language preference
    const context = await browser.newContext({
      locale: 'ar',
      acceptLanguages: ['ar']
    });
    
    const page = await context.newPage();
    
    // Navigate to create rule page
    await page.goto('/admin/rules/new?locale=ar');
    
    // Check that the page has RTL direction
    const dirAttribute = await page.evaluate(() => document.dir || document.documentElement.getAttribute('dir'));
    expect(dirAttribute).toBe('rtl');
    
    // Check for RTL-specific CSS properties on key elements
    const isRTLLayout = await page.evaluate(() => {
      const form = document.querySelector('form');
      if (!form) return false;
      
      const style = window.getComputedStyle(form);
      return style.direction === 'rtl' || style.textAlign === 'right';
    });
    
    expect(isRTLLayout).toBe(true);
    
    // Clean up
    await context.close();
  });

  test('should switch languages dynamically', async ({ page }) => {
    // Navigate to page in English first
    await page.goto('/admin/rules?locale=en');
    
    // Verify page is in English
    await expect(page.getByRole('link', { name: 'New Rule' })).toBeVisible();
    
    // Find and click language switcher
    // Adjust the selector based on your actual language switcher implementation
    await page.locator('[data-testid="language-switcher"], .language-switcher, button:has-text("EN")').click();
    
    // Select Portuguese
    await page.getByText('Português').click();
    
    // Verify page has switched to Portuguese
    await expect(page.getByRole('link', { name: 'Nova Regra' })).toBeVisible();
    
    // Switch back to English
    await page.locator('[data-testid="language-switcher"], .language-switcher, button:has-text("PT")').click();
    await page.getByText('English').click();
    
    // Verify page has switched back to English
    await expect(page.getByRole('link', { name: 'New Rule' })).toBeVisible();
  });

  test('should preserve state when switching languages', async ({ page }) => {
    // Navigate to create rule page in English
    await page.goto('/admin/rules/new?locale=en');
    
    // Fill in form fields
    await page.getByLabel('Name').fill('Language Switch Test');
    await page.getByLabel('Description').fill('Testing language switching');
    await page.getByLabel('Type').selectOption('points');
    
    // Switch to Portuguese
    await page.locator('[data-testid="language-switcher"], .language-switcher, button:has-text("EN")').click();
    await page.getByText('Português').click();
    
    // Verify form fields still have the same values despite language change
    await expect(page.getByLabel('Nome')).toHaveValue('Language Switch Test');
    await expect(page.getByLabel('Descrição')).toHaveValue('Testing language switching');
    
    // Verify the selected option is still the same
    expect(await page.getByLabel('Tipo').evaluate(select => (select as HTMLSelectElement).value)).toBe('points');
  });

  test('should handle unicode characters correctly', async ({ page }) => {
    // Navigate to create rule page
    await page.goto('/admin/rules/new');
    
    // Test with various non-ASCII characters
    const testName = 'Tést Ñåmé with Üñïçødé ふりがな 漢字 תירבע العربية';
    const testDesc = 'Déšçríptïøñ wíth spéçíål çhäräçtérß ふりがな 漢字 תירבע العربية';
    
    // Fill the form with unicode characters
    await page.getByLabel('Name').fill(testName);
    await page.getByLabel('Description').fill(testDesc);
    await page.getByLabel('Type').selectOption('direct');
    
    // Submit the form
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Navigate to the rules list
    await page.goto('/admin/rules');
    
    // Verify the unicode characters were stored and displayed correctly
    await expect(page.getByText(testName)).toBeVisible();
  });
});
