'use client';

import React, { useEffect } from 'react';
import { RuleForm } from '@/features/rules/components/RuleForm';
import { SafeTitle } from '@/components/ui/safe-title';

export default function NewRulePage() {
  // Tag para marcar que estamos na página de nova regra
  useEffect(() => {
    console.log('[V1.9.0] Página Nova Regra montada');
  }, []);

  return (
    <div className="container px-4 sm:px-6 lg:px-8 py-6">
      <SafeTitle>Nova Regra de Atribuição</SafeTitle>
      <div className="w-full max-w-full overflow-hidden">
        <RuleForm redirectUrl="/admin/rules" />
      </div>
    </div>
  );
}
