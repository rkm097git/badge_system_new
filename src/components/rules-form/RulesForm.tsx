"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Plus, X, HelpCircle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface RuleFormData {
  name: string
  description: string
  type: "" | "points" | "direct" | "events" | "ranking"
  points: {
    minPoints: number
    events: Array<{
      type: string
      weight: number
    }>
  }
  directAssignment: {
    assignerProfiles: string[]
    assignmentLimit: number
  }
  eventCount: {
    eventType: string
    minOccurrences: number
    periodType: "day" | "week" | "month"
    periodValue: number
    requiredStreak: number
  }
  ranking: {
    rankingId: string
    requiredPosition: number
  }
  context: {
    type: "" | "course" | "department" | "campus"
    items: string[]
  }
}

export function RulesForm() {
  const [formData, setFormData] = useState<RuleFormData>({
    name: "",
    description: "",
    type: "",
    points: {
      minPoints: 0,
      events: []
    },
    directAssignment: {
      assignerProfiles: [],
      assignmentLimit: 0
    },
    eventCount: {
      eventType: "",
      minOccurrences: 0,
      periodType: "day",
      periodValue: 1,
      requiredStreak: 0
    },
    ranking: {
      rankingId: "",
      requiredPosition: 1
    },
    context: {
      type: "",
      items: []
    }
  })

  const [errors, setErrors] = useState<{
    [K in keyof RuleFormData]?: string
  }>({})

  // Validação
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.name.trim()) {
      newErrors.name = "O nome da regra é obrigatório"
    }

    if (!formData.description.trim()) {
      newErrors.description = "A descrição da regra é obrigatória"
    }

    if (!formData.type) {
      newErrors.type = "O tipo de regra é obrigatório"
    }

    // Validações específicas por tipo
    switch (formData.type) {
      case "points":
        if (formData.points?.minPoints <= 0) {
          newErrors.points = "A pontuação mínima deve ser maior que zero"
        }
        if (formData.points?.events.length === 0) {
          newErrors.points = "Adicione pelo menos um tipo de evento"
        }
        break

      case "direct":
        if (formData.directAssignment?.assignerProfiles.length === 0) {
          newErrors.directAssignment = "Selecione pelo menos um perfil de atribuidor"
        }
        if (formData.directAssignment?.assignmentLimit <= 0) {
          newErrors.directAssignment = "O limite de atribuições deve ser maior que zero"
        }
        break

      case "events":
        if (!formData.eventCount?.eventType) {
          newErrors.eventCount = "Selecione um tipo de evento"
        }
        if (formData.eventCount?.minOccurrences <= 0) {
          newErrors.eventCount = "O número mínimo de ocorrências deve ser maior que zero"
        }
        break

      case "ranking":
        if (!formData.ranking?.rankingId) {
          newErrors.ranking = "Selecione um ranking"
        }
        if (formData.ranking?.requiredPosition <= 0) {
          newErrors.ranking = "A posição necessária deve ser maior que zero"
        }
        break
    }

    // Validação de contexto
    if (formData.context?.type && formData.context.items.length === 0) {
      newErrors.context = "Selecione pelo menos um item do contexto"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handler de submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      // TODO: Implementar a chamada à API
      console.log("Dados do formulário:", formData)
    } catch (error) {
      console.error("Erro ao salvar a regra:", error)
    }
  }

  // Opções para os selects
  const contextOptions = {
    course: [
      { id: "1", name: "Engenharia de Software" },
      { id: "2", name: "Ciência da Computação" },
      { id: "3", name: "Sistemas de Informação" }
    ],
    department: [
      { id: "1", name: "Departamento de Computação" },
      { id: "2", name: "Departamento de Engenharia" }
    ],
    campus: [
      { id: "1", name: "Campus Central" },
      { id: "2", name: "Campus Norte" },
      { id: "3", name: "Campus Sul" }
    ]
  }

  const availableRankings = [
    { id: "1", name: "Alunos mais assíduos" },
    { id: "2", name: "Melhores notas" },
    { id: "3", name: "Participação em fóruns" }
  ]

  const eventTypes = [
    { value: "login", label: "Login na Plataforma" },
    { value: "content_access", label: "Acesso a Conteúdo" },
    { value: "forum_post", label: "Postagem em Fórum" },
    { value: "quiz_completion", label: "Conclusão de Quiz" }
  ]

  const assignerProfiles = [
    { value: "professor", label: "Professor" },
    { value: "coordinator", label: "Coordenador" },
    { value: "supervisor", label: "Supervisor" }
  ]

  // Handlers
  const addEvent = () => {
    if (formData.points) {
      setFormData(prev => ({
        ...prev,
        points: {
          ...prev.points!,
          events: [
            ...prev.points!.events,
            { type: "", weight: 1 }
          ]
        }
      }))
    }
  }

  const removeEvent = (index: number) => {
    if (formData.points) {
      setFormData(prev => ({
        ...prev,
        points: {
          ...prev.points!,
          events: prev.points!.events.filter((_, i) => i !== index)
        }
      }))
    }
  }

  const handleContextItemToggle = (itemId: string) => {
    if (formData.context) {
      setFormData(prev => ({
        ...prev,
        context: {
          ...prev.context!,
          items: prev.context!.items.includes(itemId)
            ? prev.context!.items.filter(id => id !== itemId)
            : [...prev.context!.items, itemId]
        }
      }))
    }
  }

  const renderTooltip = (content: string) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent>
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            Nova Regra de Atribuição
            {renderTooltip("Configure os critérios para atribuição automática de badges")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nome da Regra */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="name">Nome da Regra</Label>
              {renderTooltip("Nome único que identifica esta regra")}
            </div>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite um nome para a regra..."
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Descrição da Regra */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="description">Descrição da Regra</Label>
              {renderTooltip("Descreva o objetivo e funcionamento desta regra")}
            </div>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o propósito desta regra..."
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Tipo de Regra */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="type">Tipo de Regra</Label>
              {renderTooltip("Selecione como esta regra irá atribuir badges")}
            </div>
            <Select
              value={formData.type}
              onValueChange={(value: RuleFormData["type"]) => 
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger className={`bg-white dark:bg-gray-800 ${errors.type ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Selecione o tipo de regra" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800">
                <SelectItem value="points">
                  <div className="flex flex-col">
                    <span>Pontuação</span>
                    <span className="text-sm text-muted-foreground">Atribui com base em pontos acumulados</span>
                  </div>
                </SelectItem>
                <SelectItem value="direct">
                  <div className="flex flex-col">
                    <span>Atribuição Direta</span>
                    <span className="text-sm text-muted-foreground">Permite que perfis específicos atribuam manualmente</span>
                  </div>
                </SelectItem>
                <SelectItem value="events">
                  <div className="flex flex-col">
                    <span>Contagem de Eventos</span>
                    <span className="text-sm text-muted-foreground">Atribui baseado na frequência de eventos</span>
                  </div>
                </SelectItem>
                <SelectItem value="ranking">
                  <div className="flex flex-col">
                    <span>Posição em Ranking</span>
                    <span className="text-sm text-muted-foreground">Atribui com base na posição em rankings</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type}</p>
            )}
          </div>

          {/* Configurações específicas por tipo */}
          {formData.type === "points" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="minPoints">Pontuação Mínima Total</Label>
                  {renderTooltip("Quantidade mínima de pontos necessária para receber o badge")}
                </div>
                <Input
                  id="minPoints"
                  type="number"
                  value={formData.points?.minPoints}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    points: {
                      ...prev.points!,
                      minPoints: parseInt(e.target.value) || 0
                    }
                  }))}
                  className={errors.points ? "border-red-500" : ""}
                />
                {errors.points && (
                  <p className="text-sm text-red-500">{errors.points}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Label>Tipos de Eventos Considerados</Label>
                    {renderTooltip("Eventos que contribuem para a pontuação total")}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addEvent}
                    className="flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Evento
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.points?.events.map((event, index) => (
                    <div key={index} className="flex items-start gap-2 p-4 border rounded-md bg-muted">
                      <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                          <Label>Tipo de Evento</Label>
                          <Select
                            value={event.type}
                            onValueChange={(value) => {
                              const newEvents = [...formData.points!.events]
                              newEvents[index] = { ...event, type: value }
                              setFormData(prev => ({
                                ...prev,
                                points: {
                                  ...prev.points!,
                                  events: newEvents
                                }
                              }))
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo de evento" />
                            </SelectTrigger>
                            <SelectContent>
                              {eventTypes.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex flex-col">
                                    <span>{type.label}</span>
                                    <span className="text-sm text-muted-foreground">
                                      {type.value === "login" && "Registra cada acesso à plataforma"}
                                      {type.value === "content_access" && "Registra visualizações de conteúdo"}
                                      {type.value === "forum_post" && "Registra participações em fóruns"}
                                      {type.value === "quiz_completion" && "Registra conclusões de questionários"}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Label>Peso do Evento</Label>
                            {renderTooltip("Multiplicador de pontos para este tipo de evento")}
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={event.weight}
                              onChange={(e) => {
                                const newEvents = [...formData.points!.events]
                                newEvents[index] = { ...event, weight: parseFloat(e.target.value) || 0 }
                                setFormData(prev => ({
                                  ...prev,
                                  points: {
                                    ...prev.points!,
                                    events: newEvents
                                  }
                                }))
                              }}
                              className="w-24"
                              min="0.1"
                              step="0.1"
                            />
                            <span className="text-sm text-muted-foreground">
                              pontos por ocorrência
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeEvent(index)}
                        className="mt-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {formData.points?.events.length === 0 && (
                    <div className="text-center p-4 border border-dashed rounded-md text-muted-foreground">
                      Nenhum evento configurado. Clique em "Adicionar Evento" para começar.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {formData.type === "direct" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label>Perfis que Podem Atribuir</Label>
                  {renderTooltip("Selecione quais perfis de usuário podem atribuir este badge manualmente")}
                </div>
                <div className="space-y-2">
                  {assignerProfiles.map(profile => (
                    <div key={profile.value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`profile-${profile.value}`}
                        checked={formData.directAssignment?.assignerProfiles.includes(profile.value)}
                        onChange={(e) => {
                          const newProfiles = e.target.checked
                            ? [...(formData.directAssignment?.assignerProfiles || []), profile.value]
                            : formData.directAssignment?.assignerProfiles.filter(p => p !== profile.value) || []
                          
                          setFormData(prev => ({
                            ...prev,
                            directAssignment: {
                              ...prev.directAssignment!,
                              assignerProfiles: newProfiles
                            }
                          }))
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label
                        htmlFor={`profile-${profile.value}`}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <span>{profile.label}</span>
                        <span className="text-sm text-muted-foreground">
                          {profile.value === "professor" && "(Professores das disciplinas)"}
                          {profile.value === "coordinator" && "(Coordenadores de curso)"}
                          {profile.value === "supervisor" && "(Supervisores de departamento)"}
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.directAssignment && (
                  <p className="text-sm text-red-500">{errors.directAssignment}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="assignmentLimit">Limite de Atribuições por Atribuidor</Label>
                  {renderTooltip("Número máximo de vezes que cada atribuidor pode conceder este badge")}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="assignmentLimit"
                    type="number"
                    value={formData.directAssignment?.assignmentLimit}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      directAssignment: {
                        ...prev.directAssignment!,
                        assignmentLimit: parseInt(e.target.value) || 0
                      }
                    }))}
                    min="0"
                    className={`w-24 ${errors.directAssignment ? "border-red-500" : ""}`}
                  />
                  <span className="text-sm text-muted-foreground">
                    badges por atribuidor
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Use 0 para permitir atribuições ilimitadas
                </p>
              </div>
            </div>
          )}

          {formData.type === "events" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label>Tipo de Evento</Label>
                  {renderTooltip("Selecione qual tipo de evento será monitorado")}
                </div>
                <Select
                  value={formData.eventCount?.eventType}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    eventCount: {
                      ...prev.eventCount!,
                      eventType: value
                    }
                  }))}
                >
                  <SelectTrigger className={errors.eventCount ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecione o tipo de evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex flex-col">
                          <span>{type.label}</span>
                          <span className="text-sm text-muted-foreground">
                            {type.value === "login" && "Registra cada acesso à plataforma"}
                            {type.value === "content_access" && "Registra visualizações de conteúdo"}
                            {type.value === "forum_post" && "Registra participações em fóruns"}
                            {type.value === "quiz_completion" && "Registra conclusões de questionários"}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.eventCount && (
                  <p className="text-sm text-red-500">{errors.eventCount}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="minOccurrences">Número Mínimo de Ocorrências</Label>
                    {renderTooltip("Quantidade mínima de vezes que o evento deve ocorrer")}
                  </div>
                  <Input
                    id="minOccurrences"
                    type="number"
                    value={formData.eventCount?.minOccurrences}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      eventCount: {
                        ...prev.eventCount!,
                        minOccurrences: parseInt(e.target.value) || 0
                      }
                    }))}
                    min="1"
                    className={errors.eventCount ? "border-red-500" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="requiredStreak">Streak Necessário</Label>
                    {renderTooltip("Número de ocorrências consecutivas necessárias (0 para ignorar)")}
                  </div>
                  <Input
                    id="requiredStreak"
                    type="number"
                    value={formData.eventCount?.requiredStreak}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      eventCount: {
                        ...prev.eventCount!,
                        requiredStreak: parseInt(e.target.value) || 0
                      }
                    }))}
                    min="0"
                    className={errors.eventCount ? "border-red-500" : ""}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label>Tipo de Período</Label>
                    {renderTooltip("Intervalo de tempo para contagem dos eventos")}
                  </div>
                  <Select
                    value={formData.eventCount?.periodType}
                    onValueChange={(value: "day" | "week" | "month") => setFormData(prev => ({
                      ...prev,
                      eventCount: {
                        ...prev.eventCount!,
                        periodType: value
                      }
                    }))}
                  >
                    <SelectTrigger className={errors.eventCount ? "border-red-500" : ""}>
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Diário</SelectItem>
                      <SelectItem value="week">Semanal</SelectItem>
                      <SelectItem value="month">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="periodValue">Quantidade de Períodos</Label>
                    {renderTooltip("Número de períodos consecutivos para contagem")}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      id="periodValue"
                      type="number"
                      value={formData.eventCount?.periodValue}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        eventCount: {
                          ...prev.eventCount!,
                          periodValue: parseInt(e.target.value) || 1
                        }
                      }))}
                      min="1"
                      className={`w-24 ${errors.eventCount ? "border-red-500" : ""}`}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.eventCount?.periodType === "day" && "dias"}
                      {formData.eventCount?.periodType === "week" && "semanas"}
                      {formData.eventCount?.periodType === "month" && "meses"}
                    </span>
                  </div>
                </div>
              </div>

              {formData.eventCount?.periodType && (
                <p className="text-sm text-muted-foreground">
                  O badge será atribuído quando o evento ocorrer pelo menos{" "}
                  {formData.eventCount.minOccurrences} vez(es) em{" "}
                  {formData.eventCount.periodValue}{" "}
                  {formData.eventCount.periodType === "day" && "dia(s)"}
                  {formData.eventCount.periodType === "week" && "semana(s)"}
                  {formData.eventCount.periodType === "month" && "mês(es)"}{" "}
                  {formData.eventCount.requiredStreak > 0 && `consecutivos (streak de ${formData.eventCount.requiredStreak})`}
                </p>
              )}
            </div>
          )}

          {formData.type === "ranking" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label>Ranking</Label>
                  {renderTooltip("Selecione o ranking que será usado como base para atribuição")}
                </div>
                <Select
                  value={formData.ranking?.rankingId}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    ranking: {
                      ...prev.ranking!,
                      rankingId: value
                    }
                  }))}
                >
                  <SelectTrigger className={errors.ranking ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecione o ranking" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRankings.map(ranking => (
                      <SelectItem key={ranking.id} value={ranking.id}>
                        <div className="flex flex-col">
                          <span>{ranking.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {ranking.id === "1" && "Classifica alunos por frequência de acesso"}
                            {ranking.id === "2" && "Classifica alunos por desempenho acadêmico"}
                            {ranking.id === "3" && "Classifica alunos por engajamento em discussões"}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.ranking && (
                  <p className="text-sm text-red-500">{errors.ranking}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="requiredPosition">Posição Necessária</Label>
                  {renderTooltip("Posição mínima no ranking para receber o badge")}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="requiredPosition"
                    type="number"
                    value={formData.ranking?.requiredPosition}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      ranking: {
                        ...prev.ranking!,
                        requiredPosition: parseInt(e.target.value) || 1
                      }
                    }))}
                    min="1"
                    className={`w-24 ${errors.ranking ? "border-red-500" : ""}`}
                  />
                  <span className="text-sm text-muted-foreground">
                    lugar ou melhor
                  </span>
                </div>
              </div>

              {formData.ranking?.rankingId && formData.ranking.requiredPosition > 0 && (
                <p className="text-sm text-muted-foreground">
                  O badge será atribuído aos alunos que alcançarem a {formData.ranking.requiredPosition}ª posição ou melhor no ranking de {availableRankings.find(r => r.id === formData.ranking?.rankingId)?.name.toLowerCase()}
                </p>
              )}
            </div>
          )}

          {/* Contexto */}
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Label>Contexto de Aplicação</Label>
                  {renderTooltip("Define em quais contextos esta regra será aplicada")}
                </div>
                {formData.context.type && (
                  <p className="text-sm text-muted-foreground">
                    {formData.context.items.length} {formData.context.type === "course" ? "curso(s)" : formData.context.type === "department" ? "departamento(s)" : "campus"} selecionado(s)
                  </p>
                )}
              </div>
              <Select
                value={formData.context.type}
                onValueChange={(value: RuleFormData["context"]["type"]) => 
                  setFormData(prev => ({
                    ...prev,
                    context: {
                      type: value,
                      items: []
                    }
                  }))
                }
              >
                <SelectTrigger className={errors.context ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecione o tipo de contexto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="course">
                    <div className="flex flex-col">
                      <span>Cursos</span>
                      <span className="text-sm text-muted-foreground">Aplicar em cursos específicos</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="department">
                    <div className="flex flex-col">
                      <span>Departamentos</span>
                      <span className="text-sm text-muted-foreground">Aplicar em departamentos específicos</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="campus">
                    <div className="flex flex-col">
                      <span>Campus</span>
                      <span className="text-sm text-muted-foreground">Aplicar em campus específicos</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.context && (
                <p className="text-sm text-red-500">{errors.context}</p>
              )}
            </div>

            {formData.context.type && (
              <div className="space-y-2">
                <Label>Selecione os itens do contexto</Label>
                <div className="grid grid-cols-2 gap-2">
                  {contextOptions[formData.context.type]?.map(item => (
                    <div
                      key={item.id}
                      className={`
                        flex items-center gap-2 p-3 border rounded-md cursor-pointer transition-colors
                        ${formData.context.items.includes(item.id)
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-muted"}
                      `}
                      onClick={() => handleContextItemToggle(item.id)}
                    >
                      <input
                        type="checkbox"
                        id={`context-${item.id}`}
                        checked={formData.context.items.includes(item.id)}
                        onChange={() => {}} // Handled by onClick above
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label
                        htmlFor={`context-${item.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        {item.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (Object.keys(formData).some(key => formData[key as keyof RuleFormData] !== "")) {
                  if (window.confirm("Tem certeza que deseja cancelar? Todas as alterações serão perdidas.")) {
                    // TODO: Implementar navegação de volta
                    console.log("Cancelar")
                  }
                } else {
                  // TODO: Implementar navegação de volta
                  console.log("Cancelar")
                }
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
} 