
interface MatriculationMessageProps {
  clientName: string
}

export function MatriculationMessage({ clientName }: MatriculationMessageProps) {
  return (
    <div className="p-4 border rounded-md bg-red-50 text-red-800">
      Você irá fazer a matrícula de {clientName}, ele irá para a tela de pré-venda onde poderá ser preenchido a Ficha de Matrícula do Aluno com Todos dados.
    </div>
  )
}
