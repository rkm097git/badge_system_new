/**
 * RankingConfig - Componente para configuração de regras baseadas em posição em ranking.
 * 
 * Permite configurar regras que atribuem badges com base na posição do aluno em um
 * ranking específico do sistema, como assiduidade, notas ou participação.
 * 
 * @component
 */
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Tooltip } from "../../ui/Tooltip";
import { ErrorMessage } from "../../ui/ErrorMessage";
import { 
  RankingConfig as RankingConfigType,
  RuleTypeConfigComponentProps
} from "../../../../types/rule-form-types";

/**
 * Lista de rankings disponíveis no sistema
 * Extraído como constante para facilitar manutenção e reutilização
 */
const AVAILABLE_RANKINGS = [
  { 
    id: "1", 
    name: "Alunos mais assíduos",
    description: "Classifica alunos por frequência de acesso"
  },
  { 
    id: "2", 
    name: "Melhores notas",
    description: "Classifica alunos por desempenho acadêmico"
  },
  { 
    id: "3", 
    name: "Participação em fóruns",
    description: "Classifica alunos por engajamento em discussões"
  }
];

/**
 * Componente de configuração para regras baseadas em ranking
 * 
 * @param data - Dados da configuração
 * @param error - Mensagem de erro (legacy)
 * @param errors - Mapa de erros específicos
 * @param onChange - Função para atualizar os dados
 * @param onValidate - Função para validar o formulário
 */
export function RankingConfig({ 
  data, 
  error, 
  errors, 
  onChange,
  onValidate 
}: RuleTypeConfigComponentProps<RankingConfigType>) {
  /**
   * Atualiza o ranking selecionado
   * @param rankingId - ID do ranking selecionado
   */
  const handleRankingChange = (rankingId: string) => {
    onChange({
      ...data,
      rankingId
    });
    
    // Se a validação for fornecida e houver correção de um erro, validar
    if (onValidate && error && rankingId) {
      setTimeout(() => onValidate(), 0);
    }
  };
  
  /**
   * Atualiza a posição mínima necessária no ranking
   * @param value - Nova posição mínima
   */
  const handlePositionChange = (value: string) => {
    const position = parseInt(value) || 1;
    
    onChange({
      ...data,
      requiredPosition: position < 1 ? 1 : position
    });
    
    // Se a validação for fornecida e houver correção de um erro, validar
    if (onValidate && error) {
      setTimeout(() => onValidate(), 0);
    }
  };

  /**
   * Obtém o nome do ranking com base no ID
   * @param id - ID do ranking
   * @returns Nome do ranking ou undefined se não encontrado
   */
  const getRankingName = (id: string) => {
    const ranking = AVAILABLE_RANKINGS.find(r => r.id === id);
    return ranking ? ranking.name.toLowerCase() : undefined;
  };

  /**
   * Gera uma descrição em linguagem natural da regra configurada
   * @returns String com a descrição da regra ou null se dados incompletos
   */
  const getRuleDescription = () => {
    if (!data.rankingId || data.requiredPosition <= 0) return null;
    
    const rankingName = getRankingName(data.rankingId);
    if (!rankingName) return null;
    
    return `O badge será atribuído aos alunos que alcançarem a ${data.requiredPosition}ª posição ou melhor no ranking de ${rankingName}`;
  };

  // Obter descrição da regra para exibição
  const ruleDescription = getRuleDescription();

  return (
    <div className="space-y-4">
      {/* Seção de Seleção de Ranking */}
      <div className="space-y-2">
        <div className="flex items-center">
          <Label 
            id="ranking-label"
            className="text-sm font-medium text-gray-700"
          >
            Ranking
          </Label>
          <Tooltip content="Selecione o ranking que será usado como base para atribuição" />
        </div>
        <Select
          value={data.rankingId}
          onValueChange={handleRankingChange}
          aria-labelledby="ranking-label"
          aria-invalid={!!error}
          aria-describedby={error ? "ranking-error" : undefined}
        >
          <SelectTrigger className={`bg-white dark:bg-gray-800 text-left rounded-md shadow-sm transition-all duration-150 focus:ring-2 focus:ring-offset-0 focus:ring-blue-300 ${
            error ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
          }`}>
            <SelectValue placeholder="Selecione o ranking">
              {data.rankingId && AVAILABLE_RANKINGS.find(r => r.id === data.rankingId)?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 p-2">
            {AVAILABLE_RANKINGS.map(ranking => (
              <SelectItem key={ranking.id} value={ranking.id} className="rounded-md p-3 focus:bg-blue-50 cursor-pointer">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800">{ranking.name}</span>
                  <span className="text-sm text-gray-500 mt-1">{ranking.description}</span>
                </div>
              </SelectItem>
            ))}
            
            {/* Caso não existam rankings disponíveis */}
            {AVAILABLE_RANKINGS.length === 0 && (
              <div className="p-3 text-center text-gray-500">
                Nenhum ranking disponível
              </div>
            )}
          </SelectContent>
        </Select>
        <ErrorMessage message={error} id="ranking-error" />
      </div>

      {/* Seção de Configuração de Posição */}
      <div className="space-y-2">
        <div className="flex items-center">
          <Label 
            htmlFor="requiredPosition"
            className="text-sm font-medium text-gray-700"
          >
            Posição Necessária
          </Label>
          <Tooltip content="Posição mínima no ranking para receber o badge" />
        </div>
        <div className="flex items-center gap-2">
          <Input
            id="requiredPosition"
            type="number"
            value={data.requiredPosition}
            onChange={(e) => handlePositionChange(e.target.value)}
            min="1"
            className={`w-24 rounded-md shadow-sm transition-all duration-150 focus:ring-2 focus:ring-offset-0 focus:ring-blue-300 ${
              error ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
            }`}
            aria-invalid={!!error}
          />
          <span className="text-sm text-gray-500 font-medium">
            lugar ou melhor
          </span>
        </div>
        <p className="text-xs text-gray-500">
          Ex: Valor 3 significa que alunos em 1º, 2º ou 3º lugar receberão o badge
        </p>
      </div>

      {/* Resumo da Regra */}
      {ruleDescription && (
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-md mt-4">
          <h4 className="text-sm font-medium text-blue-800 mb-1">Resumo da Regra:</h4>
          <p className="text-sm text-blue-700">
            {ruleDescription}
          </p>
        </div>
      )}
    </div>
  );
}
