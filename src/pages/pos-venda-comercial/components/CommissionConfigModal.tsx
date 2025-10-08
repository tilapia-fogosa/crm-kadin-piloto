/**
 * LOG: Modal de configuração de fórmula de comissão
 * DESCRIÇÃO: Interface completa para criar/editar fórmulas de cálculo de comissão
 * Suporta: variáveis, operadores matemáticos, condições IF
 */

import { useState, useEffect } from "react";
import { useCommissionFormula, useSaveCommissionFormula } from "@/hooks/useCommissionFormula";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, DollarSign, Hash, TrendingUp, AlertCircle, Check, Info } from "lucide-react";

interface CommissionConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitId: string | null;
}

// Definição das variáveis disponíveis
const AVAILABLE_VARIABLES = [
  {
    name: "Matricula",
    description: "Valor da matrícula confirmada",
    icon: DollarSign,
    example: "500.00",
  },
  {
    name: "Material",
    description: "Valor do material confirmado",
    icon: DollarSign,
    example: "300.00",
  },
  {
    name: "Mensalidade",
    description: "Valor da mensalidade",
    icon: DollarSign,
    example: "150.00",
  },
  {
    name: "Vendas",
    description: "Número total de vendas no mês",
    icon: Hash,
    example: "5",
  },
  {
    name: "Meta",
    description: "Meta de vendas definida",
    icon: TrendingUp,
    example: "10",
  },
];

// Exemplos de fórmulas
const FORMULA_EXAMPLES = [
  {
    name: "Comissão Simples",
    formula: "(Matricula * 0.1) + (Material * 0.05) + (Mensalidade * 0.1)",
    description: "10% matrícula + 5% material + 10% mensalidade",
  },
  {
    name: "Comissão com Meta",
    formula: "IF(Vendas >= Meta, (Matricula * 0.15), (Matricula * 0.1))",
    description: "15% se atingir meta, senão 10%",
  },
  {
    name: "Comissão Progressiva",
    formula: "IF(Vendas >= 10, (Matricula * 0.2) + 500, IF(Vendas >= 5, (Matricula * 0.15), (Matricula * 0.1)))",
    description: "Escalonada por volume de vendas",
  },
];

export function CommissionConfigModal({ 
  open, 
  onOpenChange, 
  unitId 
}: CommissionConfigModalProps) {
  console.log("LOG: CommissionConfigModal renderizado", { open, unitId });

  // Estados do formulário
  const [formulaName, setFormulaName] = useState("");
  const [formulaExpression, setFormulaExpression] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewResult, setPreviewResult] = useState<number | null>(null);

  // Hooks
  const { data: currentFormula, isLoading } = useCommissionFormula(unitId || undefined);
  const saveFormula = useSaveCommissionFormula(unitId || "");

  // Carregar fórmula atual quando o modal abre
  useEffect(() => {
    console.log("LOG: Carregando fórmula atual", currentFormula);
    if (currentFormula) {
      setFormulaName(currentFormula.formula_name);
      setFormulaExpression(currentFormula.formula_expression);
    } else {
      setFormulaName("");
      setFormulaExpression("");
    }
  }, [currentFormula, open]);

  /**
   * Valida a sintaxe da fórmula
   * Suporta: variáveis, operadores (+, -, *, /, %), parênteses, números, IF
   */
  const validateFormula = (formula: string): boolean => {
    console.log("LOG: Validando fórmula", formula);
    
    if (!formula.trim()) {
      setValidationError("Fórmula não pode estar vazia");
      return false;
    }

    // Verificar parênteses balanceados
    const openParens = (formula.match(/\(/g) || []).length;
    const closeParens = (formula.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      setValidationError("Parênteses desbalanceados");
      return false;
    }

    // Verificar sintaxe básica de IF
    const ifMatches = formula.match(/IF\s*\(/g);
    if (ifMatches) {
      // Cada IF deve ter pelo menos 3 argumentos separados por vírgula
      const ifPattern = /IF\s*\([^)]+\)/g;
      const ifs = formula.match(ifPattern);
      if (ifs) {
        for (const ifExpr of ifs) {
          const argsCount = (ifExpr.match(/,/g) || []).length;
          if (argsCount < 2) {
            setValidationError("Sintaxe IF incorreta. Use: IF(condição, valor_se_verdadeiro, valor_se_falso)");
            return false;
          }
        }
      }
    }

    // Verificar se todas as variáveis usadas são válidas
    const variablePattern = /\b(Matricula|Material|Mensalidade|Vendas|Meta)\b/g;
    const usedVariables = formula.match(variablePattern) || [];
    const validVariables = AVAILABLE_VARIABLES.map(v => v.name);
    
    for (const variable of usedVariables) {
      if (!validVariables.includes(variable)) {
        setValidationError(`Variável inválida: ${variable}`);
        return false;
      }
    }

    setValidationError(null);
    console.log("LOG: Fórmula válida");
    return true;
  };

  /**
   * Calcula preview da fórmula com valores de exemplo
   */
  const calculatePreview = (formula: string): number | null => {
    console.log("LOG: Calculando preview da fórmula");
    
    if (!validateFormula(formula)) {
      return null;
    }

    try {
      // Substituir variáveis por valores de exemplo
      let expression = formula
        .replace(/Matricula/g, "500")
        .replace(/Material/g, "300")
        .replace(/Mensalidade/g, "150")
        .replace(/Vendas/g, "5")
        .replace(/Meta/g, "10");

      // Processar condições IF
      // IF(condição, valor_true, valor_false)
      const ifPattern = /IF\s*\(([^,]+),([^,]+),([^)]+)\)/g;
      expression = expression.replace(ifPattern, (match, condition, trueValue, falseValue) => {
        // Avaliar condição
        const conditionResult = eval(condition.trim());
        return conditionResult ? trueValue.trim() : falseValue.trim();
      });

      // Avaliar expressão final
      const result = eval(expression);
      console.log("LOG: Resultado do preview", result);
      return Number(result.toFixed(2));
    } catch (error) {
      console.error("LOG: Erro ao calcular preview", error);
      setValidationError("Erro ao avaliar fórmula. Verifique a sintaxe.");
      return null;
    }
  };

  // Atualizar preview quando a fórmula muda
  useEffect(() => {
    if (formulaExpression.trim()) {
      const result = calculatePreview(formulaExpression);
      setPreviewResult(result);
    } else {
      setPreviewResult(null);
    }
  }, [formulaExpression]);

  /**
   * Inserir variável na posição do cursor
   */
  const insertVariable = (variableName: string) => {
    console.log("LOG: Inserindo variável", variableName);
    setFormulaExpression((prev) => prev + variableName);
  };

  /**
   * Inserir exemplo de fórmula
   */
  const insertExample = (example: string) => {
    console.log("LOG: Inserindo exemplo", example);
    setFormulaExpression(example);
  };

  /**
   * Salvar fórmula
   */
  const handleSave = async () => {
    console.log("LOG: Salvando fórmula", { formulaName, formulaExpression });

    if (!formulaName.trim()) {
      setValidationError("Nome da fórmula é obrigatório");
      return;
    }

    if (!validateFormula(formulaExpression)) {
      return;
    }

    await saveFormula.mutateAsync({
      formula_name: formulaName,
      formula_expression: formulaExpression,
      variables_config: {}, // Configuração adicional pode ser adicionada aqui
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Configurar Fórmula de Comissão
          </DialogTitle>
          <DialogDescription>
            Defina a fórmula de cálculo para as comissões desta unidade. Use variáveis, operadores matemáticos e condições IF.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Fórmula Atual */}
          {currentFormula && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Fórmula Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Nome:</span>
                    <span className="text-sm ml-2">{currentFormula.formula_name}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Expressão:</span>
                    <code className="text-sm ml-2 bg-muted px-2 py-1 rounded">
                      {currentFormula.formula_expression}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna 1: Editor de Fórmula */}
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="formula-name">Nome da Fórmula</Label>
                <Input
                  id="formula-name"
                  placeholder="Ex: Comissão Padrão 2024"
                  value={formulaName}
                  onChange={(e) => setFormulaName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="formula-expression">Expressão da Fórmula</Label>
                <Textarea
                  id="formula-expression"
                  placeholder="Ex: (Matricula * 0.1) + (Material * 0.05)"
                  className="font-mono min-h-[150px]"
                  value={formulaExpression}
                  onChange={(e) => setFormulaExpression(e.target.value)}
                />
                {validationError && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{validationError}</span>
                  </div>
                )}
                {!validationError && formulaExpression && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <Check className="h-4 w-4" />
                    <span>Fórmula válida</span>
                  </div>
                )}
              </div>

              {/* Preview de Cálculo */}
              {previewResult !== null && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Preview de Cálculo</CardTitle>
                    <CardDescription className="text-xs">
                      Usando valores de exemplo: Matrícula=R$500, Material=R$300, Mensalidade=R$150, Vendas=5, Meta=10
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-700">
                      R$ {previewResult.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Exemplos */}
              <div className="space-y-2">
                <Label>Exemplos de Fórmulas</Label>
                <div className="space-y-2">
                  {FORMULA_EXAMPLES.map((example, index) => (
                    <Card key={index} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardContent className="p-3" onClick={() => insertExample(example.formula)}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{example.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {example.description}
                            </div>
                            <code className="text-xs bg-muted px-2 py-1 rounded mt-2 block">
                              {example.formula}
                            </code>
                          </div>
                          <Button variant="ghost" size="sm">Usar</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Coluna 2: Variáveis Disponíveis */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Variáveis Disponíveis</CardTitle>
                  <CardDescription className="text-xs">
                    Clique para inserir na fórmula
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {AVAILABLE_VARIABLES.map((variable) => (
                    <Button
                      key={variable.name}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => insertVariable(variable.name)}
                    >
                      <variable.icon className="h-4 w-4 mr-2" />
                      <div className="flex flex-col items-start">
                        <span className="font-mono text-xs">{variable.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {variable.description}
                        </span>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Operadores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" onClick={() => setFormulaExpression(prev => prev + " + ")}>+</Button>
                    <Button variant="outline" size="sm" onClick={() => setFormulaExpression(prev => prev + " - ")}>-</Button>
                    <Button variant="outline" size="sm" onClick={() => setFormulaExpression(prev => prev + " * ")}>×</Button>
                    <Button variant="outline" size="sm" onClick={() => setFormulaExpression(prev => prev + " / ")}>/</Button>
                    <Button variant="outline" size="sm" onClick={() => setFormulaExpression(prev => prev + " % ")}>%</Button>
                    <Button variant="outline" size="sm" onClick={() => setFormulaExpression(prev => prev + "()")}>()</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Condições</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setFormulaExpression(prev => prev + "IF(, , )")}
                  >
                    IF (condição)
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    Sintaxe: IF(condição, valor_true, valor_false)
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Operadores: {">="}, {"<="}, {">"}, {"<"}, {"=="}, {"!="}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saveFormula.isPending || !!validationError}>
            {saveFormula.isPending ? "Salvando..." : "Salvar Fórmula"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
