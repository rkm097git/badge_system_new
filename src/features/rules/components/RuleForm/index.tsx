/**
 * Principal componente de formulário para criação e edição de regras.
 * Este arquivo serve como ponto de entrada, compondo os subcomponentes
 * necessários para o formulário completo.
 */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRuleForm } from "../../hooks/useRuleForm";
import { RuleBasicInfo } from "./RuleBasicInfo";
import { RuleTypeSelection } from "./RuleTypeSelection";
import { RuleContextSelection } from "./RuleContextSelection";
import { RuleTypeConfig } from "./RuleTypeConfig";
import { useRouter } from "next/navigation";
import { Rule } from "../../types";
import { useEffect } from "react";

interface RuleFormProps {
  uid?: string;
  redirectUrl?: string;
  afterSuccess?: (rule: Rule) => void;
}

export function RuleForm({ uid, redirectUrl = "/admin/rules", afterSuccess }: RuleFormProps) {
  const router = useRouter();
  
  // Instalar redirecionamento global como fallback
  useEffect(() => {
    // Flag para controlar se o redirecionamento já ocorreu
    let redirected = false;
    
    // Função para executar o redirecionamento forçado
    const forceRedirect = () => {
      if (!redirected) {
        redirected = true;
        window.location.href = redirectUrl;
      }
    };
    
    // Se houver sucesso, configurar um redirecionamento de segurança após 5 segundos
    const globalRedirectTimeout = setTimeout(() => {
      // Verificamos se o usuário ainda está na mesma página após o salvamento bem-sucedido
      if (window.__lastSuccessfulSave && (Date.now() - window.__lastSuccessfulSave) < 10000) {
        console.log('Executando redirecionamento de segurança após 5 segundos...');
        forceRedirect();
      }
    }, 5000);
    
    // Definir a variável global e o método de redirecionamento
    window.__lastSuccessfulSave = null;
    window.__forceRedirectToRules = forceRedirect;
    
    return () => {
      // Limpeza ao desmontar
      clearTimeout(globalRedirectTimeout);
    };
  }, [redirectUrl]);
  
  console.log('[V1.2.0] RuleForm montado, redirectUrl =', redirectUrl);
  
  // Handler de sucesso para redirecionamento após salvar
  const handleSuccess = (rule: Rule) => {
    console.log('[V1.3.0] Regra salva com sucesso:', rule);
    console.log('[V1.3.0] Callback executado, redirecionando para:', redirectUrl);
    
    // Usar o callback depois do sucesso, se fornecido
    if (afterSuccess) {
      console.log('[V1.3.0] Executando afterSuccess do componente pai');
      afterSuccess(rule);
    } else {
      console.log('[V1.3.0] Sem afterSuccess, fazendo redirecionamento padrão');
      // Redirecionamento padrão caso não haja callback
      window.location.href = redirectUrl;
    }
  };
  
  const { 
    formData, 
    errors, 
    handleInputChange,
    handleSubmit,
    validateForm,
    isLoading,
    isSubmitting,
    formSubmitted
  } = useRuleForm({
    uid,
    onSuccess: handleSuccess
  });

  // Se estiver carregando dados para edição, mostra um indicador de carregamento
  if (uid && isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando dados da regra...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <Card className="border-0 bg-white/60 shadow-lg backdrop-blur-sm relative w-full overflow-hidden">
        {/* Indicador de versão para testes */}
        <div className="fixed bottom-2 left-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded-md shadow-sm z-50">
          Versão 1.9.0
        </div>
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="flex items-center text-xl font-semibold text-gray-800">
          <div className="flex items-center justify-between w-full">
            {uid ? 'Editar Regra de Atribuição' : 'Nova Regra de Atribuição'}
          </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 overflow-hidden">
          {/* Informações básicas (nome, descrição) */}
          <RuleBasicInfo 
            formData={formData} 
            errors={errors} 
            onChange={handleInputChange} 
          />

          {/* Contexto de aplicação */}
          <RuleContextSelection
            context={formData.context}
            error={errors.context}
            onChange={(context) => handleInputChange("context", context)}
          />

          {/* Separação mais destacada */}
          <div className="my-8 pt-6">
            <h3 className="text-lg font-semibold mb-6 text-gray-800 pb-2 border-b border-gray-100">Configuração da Regra</h3>
          
            {/* Seleção de tipo de regra */}
            <div className="mb-8">
              <RuleTypeSelection 
                value={formData.type} 
                error={errors.type}
                onChange={(type) => handleInputChange("type", type)} 
              />
            </div>

            {/* Configuração específica baseada no tipo */}
            {formData.type && (
              <RuleTypeConfig 
                type={formData.type}
                formData={formData}
                errors={errors}
                onChange={handleInputChange}
                validateForm={validateForm}
                formSubmitted={formSubmitted}
              />
            )}
          </div>

          {/* Botões de ação responsivos */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-6 border-t border-gray-100">
            <Button 
              type="button" 
              variant="outline"
              className="w-full sm:w-auto font-medium transition-all duration-200 hover:bg-gray-100 mb-2 sm:mb-0"
              onClick={() => {
                if (Object.keys(formData).some(key => {
                  const value = formData[key as keyof typeof formData];
                  // Verifica se há alterações relevantes
                  return typeof value === 'string' && value !== "" && key !== 'type';
                })) {
                  if (window.confirm("Tem certeza que deseja cancelar? Todas as alterações serão perdidas.")) {
                    router.push(redirectUrl);
                  }
                } else {
                  router.push(redirectUrl);
                }
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 font-medium shadow-md hover:shadow-lg transition-all duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
