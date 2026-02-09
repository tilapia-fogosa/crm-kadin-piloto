

# Plano: Atualizar informativo com nome do aluno em tempo real

## Objetivo
O informativo "Matriculando..." deve exibir o nome digitado no campo "Nome completo do Aluno" em tempo real, em vez do nome do cliente.

## Alteracao

### Arquivo: `src/components/kanban/components/attendance-form/AttendanceFormContent.tsx`
- Passar `studentName` (ou fallback para `clientName`) ao componente `MatriculationMessage`
- Trocar de `clientName={clientName}` para `clientName={studentName.trim() || clientName}`

Dessa forma, enquanto o usuario digita o nome do aluno, o informativo atualiza automaticamente para "Matriculando [Nome Digitado]". Se o campo estiver vazio, exibe o nome do cliente como fallback.

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/kanban/components/attendance-form/AttendanceFormContent.tsx` | Passar `studentName` ao `MatriculationMessage` |

Nenhuma alteracao necessaria no `MatriculationMessage.tsx` pois ele ja aceita `clientName` como prop.

