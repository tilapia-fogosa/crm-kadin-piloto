
# Plano: Adicionar campo "Nome Completo do Aluno" no Atendimento (Matriculado)

## Objetivo
Adicionar um campo de texto obrigatorio "Nome completo do Aluno" que aparece ao selecionar "Matriculado" no formulario de atendimento, posicionado entre o "Qualidade do Lead" e o informativo de matricula. Esse nome sera enviado no processo de matricula em vez do nome do cliente.

## Alteracoes

### 1. Tipo `Attendance` (`src/components/kanban/types.ts`)
- Adicionar campo `studentName?: string` ao tipo `Attendance`

### 2. Hook de estado (`src/components/kanban/components/attendance-form/hooks/useAttendanceFormState.ts`)
- Adicionar estado `studentName` e `studentNameValidationError`
- Retornar os setters correspondentes

### 3. Componente do formulario (`src/components/kanban/components/attendance-form/AttendanceFormContent.tsx`)
- Adicionar campo de input "Nome completo do Aluno" logo apos o `QualityScore`, **antes** do `MatriculationMessage`
- Visivel apenas quando `selectedResult === 'matriculado'`
- Validacao: campo obrigatorio (exibir erro se vazio ao submeter)
- Incluir `studentName` no objeto enviado ao `onSubmit`
- Desabilitar botao "Cadastrar Atendimento" se `studentName` estiver vazio (quando matriculado)

### 4. Hook de submissao (`src/components/kanban/hooks/useAttendanceSubmission.ts`)
- Aceitar `studentName` no parametro
- Passar o `studentName` ao registrar a atividade de Matricula (campo `notes` ou campo dedicado, conforme disponivel na tabela)
- Usar `studentName` em vez de `clientName` nos processos subsequentes de matricula

### 5. Informativo atualizado (`src/components/kanban/components/attendance/MatriculationMessage.tsx`)
- Manter o componente, mas considerar exibir o nome do aluno digitado (ou manter o nome do cliente como referencia)

---

## Detalhes Tecnicos

### Novo campo no formulario (dentro de `AttendanceFormContent.tsx`)
Sera um `Input` com `Label`, renderizado condicionalmente:

```text
{selectedResult === 'matriculado' && (
  <>
    <div className="space-y-2">
      <Label>Nome completo do Aluno *</Label>
      <Input
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
        placeholder="Digite o nome completo do aluno"
        disabled={isDisabled || isProcessing}
      />
      {studentNameValidationError && (
        <Alert variant="destructive">...</Alert>
      )}
    </div>
    <MatriculationMessage clientName={clientName} />
    <MatriculationSection ... />
  </>
)}
```

### Validacao no `handleSubmit`
Antes de submeter, verificar:

```text
if (selectedResult === 'matriculado' && !studentName.trim()) {
  setStudentNameValidationError(true)
  // toast de erro
  return
}
```

### Botao desabilitado
Adicionar condicao ao `disabled` do botao:

```text
(selectedResult === 'matriculado' && !studentName.trim())
```

### Fluxo de dados
O campo `studentName` sera adicionado ao tipo `Attendance` e passado no `onSubmit`, chegando ao `useAttendanceSubmission` para ser persistido junto com a atividade de matricula.

---

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/kanban/types.ts` | Adicionar `studentName?: string` ao tipo `Attendance` |
| `src/components/kanban/components/attendance-form/hooks/useAttendanceFormState.ts` | Adicionar estados `studentName` e `studentNameValidationError` |
| `src/components/kanban/components/attendance-form/AttendanceFormContent.tsx` | Adicionar campo de input, validacao e inclui-lo no submit |
| `src/components/kanban/hooks/useAttendanceSubmission.ts` | Aceitar e persistir `studentName` |

## Ordem de Implementacao
1. Tipo `Attendance` (sem dependencias)
2. Hook `useAttendanceFormState` (depende do tipo)
3. `AttendanceFormContent` (depende do hook)
4. `useAttendanceSubmission` (depende do tipo)
