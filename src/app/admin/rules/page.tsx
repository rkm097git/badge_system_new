'use client';

import React, { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SafeTitle } from '@/components/ui/safe-title';

// Importação dinâmica para code splitting
const RulesList = React.lazy(() => import('@/features/rules/components/LazyRulesList'));

export default function RulesPage() {
  return (
    <div className="container px-4 sm:px-6 lg:px-8 py-6">
      <SafeTitle>Regras de Atribuição</SafeTitle>
      <div className="w-full max-w-full overflow-hidden">
        <Suspense fallback={
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Carregando regras...</p>
              </div>
            </CardContent>
          </Card>
        }>
          <RulesList baseUrl="/admin/rules" />
        </Suspense>
      </div>
      <div className="fixed bottom-2 right-4 text-xs text-muted-foreground">
        V1.0.0
      </div>
    </div>
  );
}
