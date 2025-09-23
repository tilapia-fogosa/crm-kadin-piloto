import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtecaoFuncionalidade } from "@/components/features/ProtecaoFuncionalidade";
import { GestaoProcessos } from "./components/GestaoProcessos";
import { Comissoes } from "./components/Comissoes";

export default function PosVendaComercialPage() {
  return (
    <ProtecaoFuncionalidade
      funcionalidade="pos_venda_comercial"
      mensagem="Esta funcionalidade não está disponível para sua unidade."
    >
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Pós-venda Comercial</h1>
          <p className="text-muted-foreground">
            Gerencie processos pós-matrícula e acompanhe comissões da equipe comercial.
          </p>
        </div>

        <Tabs defaultValue="gestao-processos" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gestao-processos">Gestão de Processos</TabsTrigger>
            <TabsTrigger value="comissoes">Comissões</TabsTrigger>
          </TabsList>
          
          <TabsContent value="gestao-processos" className="space-y-4">
            <GestaoProcessos />
          </TabsContent>
          
          <TabsContent value="comissoes" className="space-y-4">
            <Comissoes />
          </TabsContent>
        </Tabs>
      </div>
    </ProtecaoFuncionalidade>
  );
}