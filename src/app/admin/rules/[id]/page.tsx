'use client';

import React, { useEffect } from 'react';
import { RuleForm } from '@/features/rules/components/RuleForm';
import { useParams } from 'next/navigation';
import { SafeTitle } from '@/components/ui/safe-title';

export default function EditRulePage() {
  const params = useParams();
  const ruleId = params.id as string;
  
  // Tag para marcar que estamos na página de edição de regra
  useEffect(() => {
    console.log('[V1.9.0] Página Editar Regra montada, id =', ruleId);
  }, [ruleId]);

  return (
    <div className="container px-4 sm:px-6 lg:px-8 py-6">
      <SafeTitle>Editar Regra de Atribuição</SafeTitle>
      <div className="w-full max-w-full overflow-hidden">
        <RuleForm uid={ruleId} redirectUrl="/admin/rules" />
      </div>
    </div>
  );
}
