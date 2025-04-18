'use client';

import { RulesList } from './RulesList';

interface RulesListProps {
  baseUrl?: string;
}

// Componente wrapper com o mesmo tipo de props do original
const LazyRulesList = (props: RulesListProps) => {
  return <RulesList {...props} />;
};

export default LazyRulesList;
