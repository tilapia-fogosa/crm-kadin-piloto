/**
 * PropostaConsultoria.tsx - Landing Page de Proposta de Consultoria Técnica
 * 
 * @description Página pública isolada para formalização de proposta de consultoria.
 * Não requer autenticação e não acessa dados externos do sistema.
 * 
 * @version 1.0.0
 * @date 04/12/2025
 * 
 * ESTRUTURA DA PÁGINA:
 * 1. Header com logo da Kadin
 * 2. Hero section com título principal
 * 3. Índice de navegação lateral (sticky)
 * 4. Seções do SOW organizadas
 * 5. Footer com informações de contato
 */

import React, { useState, useEffect } from 'react';
import { FileText, Target, CheckCircle2, XCircle, Package, Clock, DollarSign, Settings, Users, ChevronRight, Mail, Phone, Calendar, Building2, Shield, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

/**
 * Interface para definição das seções da página
 * Facilita a navegação e renderização dinâmica
 */
interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
}

/**
 * Componente principal da Landing Page de Proposta de Consultoria
 */
const PropostaConsultoria: React.FC = () => {
  console.log('LOG: Renderizando página pública de Proposta de Consultoria');

  // Estado para controlar a seção ativa durante scroll
  const [activeSection, setActiveSection] = useState<string>('introducao');

  /**
   * Definição das seções da página para navegação
   * Cada seção possui um ID único, título e ícone correspondente
   */
  const sections: Section[] = [{
    id: 'introducao',
    title: '1. Introdução',
    icon: <BookOpen className="h-4 w-4" />
  }, {
    id: 'natureza',
    title: '2. Natureza da Consultoria',
    icon: <Shield className="h-4 w-4" />
  }, {
    id: 'escopo',
    title: '3. Escopo de Atuação',
    icon: <Target className="h-4 w-4" />
  }, {
    id: 'fora-escopo',
    title: '4. Fora do Escopo',
    icon: <XCircle className="h-4 w-4" />
  }, {
    id: 'entregaveis',
    title: '5. Entregáveis Mensais',
    icon: <Package className="h-4 w-4" />
  }, {
    id: 'horas',
    title: '6. Horas e Banco de Horas',
    icon: <Clock className="h-4 w-4" />
  }, {
    id: 'comercial',
    title: '7. Condições Comerciais',
    icon: <DollarSign className="h-4 w-4" />
  }, {
    id: 'execucao',
    title: '8. Forma de Execução',
    icon: <Settings className="h-4 w-4" />
  }];

  /**
   * Efeito para atualizar a seção ativa baseado no scroll
   * Utiliza Intersection Observer para melhor performance
   */
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };
    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observar todas as seções
    sections.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  /**
   * Função para scroll suave até a seção
   */
  const scrollToSection = (sectionId: string) => {
    console.log(`LOG: Navegando para seção: ${sectionId}`);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  return <div className="min-h-screen bg-background">
      {/* HEADER: Cabeçalho com logo e título do documento */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo da Kadin */}
            <div className="flex items-center gap-3">
              <img src="/logo-kadin.png" alt="Kadin Logo" className="h-10 w-auto" />
              <div className="hidden sm:block">
                <p className="text-sm text-muted-foreground">Consultoria Técnica</p>
              </div>
            </div>
            
            {/* Badge de documento oficial */}
            <Badge variant="outline" className="border-primary text-primary">
              <FileText className="h-3 w-3 mr-1" />
              SOW - Statement of Work
            </Badge>
          </div>
        </div>
      </header>

      {/* HERO SECTION: Título principal e metadados */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              Proposta Comercial
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Statement of Work (SOW)
            </h1>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-primary mb-6">
              Consultoria Técnica – Projeto ERP Método Supera
            </h2>
            
            {/* Metadados do documento */}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Data: 04/12/2025</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>Franqueador: Método Supera</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT: Layout com sidebar de navegação e conteúdo */}
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR: Navegação lateral sticky */}
          <aside className="lg:w-72 shrink-0">
            <nav className="sticky top-24 space-y-1 rounded-lg border border-border bg-card p-4">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Índice
              </h3>
              {sections.map(section => <button key={section.id} onClick={() => scrollToSection(section.id)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors ${activeSection === section.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                  {section.icon}
                  <span className="truncate">{section.title}</span>
                  {activeSection === section.id && <ChevronRight className="h-4 w-4 ml-auto" />}
                </button>)}
            </nav>
          </aside>

          {/* CONTENT: Conteúdo principal das seções */}
          <div className="flex-1 max-w-4xl space-y-12">
            
            {/* SEÇÃO 1: Introdução */}
            <section id="introducao" className="scroll-mt-24">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    1. Introdução
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-slate max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    Este documento estabelece o escopo de trabalho, responsabilidades, limites de atuação, 
                    entregáveis e condições de execução da consultoria técnica prestada pela empresa do 
                    Consultor ao <strong className="text-foreground">Franqueador Método Supera</strong>.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    O objetivo central é apoiar tecnicamente na construção, validação e implantação do 
                    novo <strong className="text-foreground">Sistema de Gestão Empresarial (ERP)</strong>, 
                    garantindo que o produto final atenda às necessidades operacionais e estratégicas 
                    da rede de franquias.
                  </p>
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground italic">
                      A consultoria atua como agente técnico especializado, suportando decisões do Franqueador, 
                      mas sem responsabilidade direta por desenvolvimento de software ou aprovação final de funcionalidades.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* SEÇÃO 2: Natureza da Consultoria */}
            <section id="natureza" className="scroll-mt-24">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    2. Natureza da Consultoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    A Consultoria Técnica caracteriza-se como serviço especializado prestado por 
                    empresa independente, com as seguintes premissas:
                  </p>
                  <div className="space-y-3">
                    {['Não executa desenvolvimento de software, programação ou criação de telas.', 'Não é responsável por configurar o sistema diretamente nas unidades franqueadas.', 'Não realiza suporte técnico de primeiro nível às unidades.', 'Não aprova nem altera funcionalidades de forma vinculativa; emite parecer técnico, sendo a decisão sempre do Franqueador.', 'Pode envolver participação de técnicos adicionais indicados pela empresa do Consultor, sem ônus gerencial ao Franqueador.'].map((item, index) => <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <Badge variant="outline" className="shrink-0 mt-0.5">
                          {index + 1}
                        </Badge>
                        <p className="text-sm text-muted-foreground">{item}</p>
                      </div>)}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* SEÇÃO 3: Escopo de Atuação */}
            <section id="escopo" className="scroll-mt-24">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    3. Escopo de Atuação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <p className="text-muted-foreground">
                    A seguir, estão definidas as áreas formais de atuação da Consultoria Técnica no projeto ERP.
                  </p>

                  {/* 3.1 Governança */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-foreground flex items-center gap-2">
                      <span className="text-primary">3.1</span> Governança e Diretrizes do Sistema
                    </h4>
                    <ul className="space-y-2">
                      {['Construção da visão macro e dos princípios orientadores do ERP.', 'Acompanhamento da arquitetura funcional e das integrações propostas.', 'Identificação e comunicação de riscos operacionais, técnicos ou estratégicos.', 'Recomendações para padronização de fluxos e consistência do produto.'].map((item, index) => <li key={index} className="flex items-start gap-2 text-muted-foreground">
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>)}
                    </ul>
                  </div>

                  <Separator />

                  {/* 3.2 Validação Técnica */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-foreground flex items-center gap-2">
                      <span className="text-primary">3.2</span> Validação Técnica (Sem Execução)
                    </h4>
                    <ul className="space-y-2">
                      {['Validação de testes funcionais, homologações e fluxos críticos.', 'Revisão e validação de telas sob a ótica do franqueado e da operação.', 'Proposição de ajustes de UX e otimizações de usabilidade.', 'Emissão de parecer técnico estruturado com recomendações.', 'Identificação de falhas, gaps e inconsistências do sistema.'].map((item, index) => <li key={index} className="flex items-start gap-2 text-muted-foreground">
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>)}
                    </ul>
                  </div>

                  <Separator />

                  {/* 3.3 Acompanhamento da Implantação */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-foreground flex items-center gap-2">
                      <span className="text-primary">3.3</span> Acompanhamento da Implantação
                    </h4>
                    <ul className="space-y-2">
                      {['Criação e acompanhamento de grupo piloto.', 'Avaliação da aderência do sistema à rotina das unidades.', 'Diagnóstico de pontos de melhoria, riscos de adoção e gargalos operacionais.', 'Suporte técnico-pedagógico na explicação do uso do ERP aos franqueados.', 'Acompanhamento dos resultados do rollout e etapas de implantação.'].map((item, index) => <li key={index} className="flex items-start gap-2 text-muted-foreground">
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>)}
                    </ul>
                  </div>

                  <Separator />

                  {/* 3.4 Conciliação entre Stakeholders */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-foreground flex items-center gap-2">
                      <span className="text-primary">3.4</span> Conciliação entre Stakeholders
                    </h4>
                    <ul className="space-y-2">
                      {['Facilitar comunicação entre Franqueador, Franqueados e equipes técnicas.', 'Apoiar decisões estratégicas com análise técnica imparcial.', 'Mediar conflitos de entendimento entre operação, desenvolvimento e gestão.', 'Traduzir necessidades operacionais para linguagem técnica compreensível.'].map((item, index) => <li key={index} className="flex items-start gap-2 text-muted-foreground">
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>)}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* SEÇÃO 4: Fora do Escopo */}
            <section id="fora-escopo" className="scroll-mt-24">
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <XCircle className="h-6 w-6 text-destructive" />
                    </div>
                    4. Fora do Escopo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Para evitar ambiguidades, ficam claramente <strong className="text-destructive">excluídas</strong> das 
                    responsabilidades da Consultoria:
                  </p>
                  <div className="space-y-3">
                    {['Desenvolvimento de software, criação de telas ou ajustes de programação.', 'Parametrização ou configuração do ERP dentro das unidades franqueadas.', 'Suporte técnico de primeiro nível ou atendimento a tickets operacionais.', 'Acompanhamento diário de dúvidas de usuários.', 'Gestão de fornecedores, squads de desenvolvimento ou equipes externas.', 'Aprovação final de funcionalidades ou definição obrigatória de requisitos.'].map((item, index) => <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                        <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">{item}</p>
                      </div>)}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* SEÇÃO 5: Entregáveis Mensais */}
            <section id="entregaveis" className="scroll-mt-24">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    5. Entregáveis Mensais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    A consultoria entregará, dentro das horas contratadas, os seguintes materiais e atividades:
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[{
                    title: 'Parecer Técnico Formal',
                    description: 'Relatório com análises, riscos, classificações e recomendações.'
                  }, {
                    title: 'Validação e Homologação',
                    description: 'Emissão de parecer estruturado por módulo entregue.'
                  }, {
                    title: 'Ata de Reuniões Técnicas',
                    description: 'Registro das decisões, riscos e próximos passos.'
                  }, {
                    title: 'Relatório de Adoção e Implantação',
                    description: 'Status das unidades piloto e indicadores.'
                  }, {
                    title: 'Diagnóstico Mensal de Evolução',
                    description: 'Revisão do progresso versus objetivo do ERP.'
                  }].map((item, index) => <Card key={index} className="bg-muted/30 border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Badge className="bg-primary text-primary-foreground shrink-0">
                              {index + 1}
                            </Badge>
                            <div>
                              <h5 className="font-medium text-foreground mb-1">{item.title}</h5>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>)}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* SEÇÃO 6: Horas e Banco de Horas */}
            <section id="horas" className="scroll-mt-24">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    6. Horas Contratadas e Banco de Horas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 mb-6">
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="p-6 text-center">
                        <div className="text-4xl font-bold text-primary mb-2">30h</div>
                        <p className="text-sm text-muted-foreground">Horas mensais fixas</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-secondary/5 border-secondary/20">
                      <CardContent className="p-6 text-center">
                        <div className="text-4xl font-bold text-secondary mb-2">30 dias</div>
                        <p className="text-sm text-muted-foreground">Prazo para compensação</p>
                      </CardContent>
                    </Card>
                  </div>
                  <ul className="space-y-3">
                    {['Será mantido banco de horas, compensável em até 30 dias após o fechamento de cada mês.', 'Horas extras poderão ser contratadas conforme tabela comercial a ser apresentada.', 'Todas as horas serão registradas em planilha compartilhada.'].map((item, index) => <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>)}
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* SEÇÃO 7: Condições Comerciais */}
            <section id="comercial" className="scroll-mt-24">
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    7. Condições Comerciais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Valor da Hora */}
                  <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Valor da Hora Técnica</p>
                          <div className="text-3xl font-bold text-primary">R$ 250,00</div>
                        </div>
                        <DollarSign className="h-12 w-12 text-primary/30" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Condições de Pagamento */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">Condição de Pagamento:</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Badge className="bg-primary text-primary-foreground text-lg px-3 py-1">50%</Badge>
                            <p className="text-sm text-muted-foreground">
                              Poderá ser compensado via abatimento de saldos em aberto junto ao Franqueador.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Badge className="bg-secondary text-secondary-foreground text-lg px-3 py-1">50%</Badge>
                            <p className="text-sm text-muted-foreground">Pagos em espécie até o dia 30 do mês do serviço prestado.</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Reajuste */}
                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Reajuste:</strong> Reajuste anual pelo IPCA, 
                      sempre no mês de fevereiro.
                    </p>
                  </div>

                  {/* Despesas */}
                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Despesas Operacionais:</strong> Reuniões 
                      presenciais e visitas técnicas terão despesas tratadas conforme acordo prévio.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* SEÇÃO 8: Forma de Execução */}
            <section id="execucao" className="scroll-mt-24">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Settings className="h-6 w-6 text-primary" />
                    </div>
                    8. Forma de Execução
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    A consultoria será realizada por meio de:
                  </p>
                  <ul className="space-y-3">
                    {['Reuniões remotas e presenciais conforme necessidade.', 'Comunicação oficial por canais definidos pelo Franqueador.', 'Documentação registrada no backlog e sistema de gestão do projeto.', 'Participação em cerimônias do projeto (kickoff, homologação, implantação, acompanhamento de unidades piloto).'].map((item, index) => <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>)}
                  </ul>
                  
                  <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-border text-center">
                    <p className="text-sm text-muted-foreground italic">
                      (Documento inicial – será atualizado conforme evolução do projeto.)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

          </div>
        </div>
      </main>

      {/* FOOTER: Rodapé com informações de contato */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Logo e descrição */}
            <div>
              <img src="/logo-kadin.png" alt="Kadin Logo" className="h-10 w-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                Consultoria Técnica especializada em transformação digital e 
                implementação de sistemas empresariais.
              </p>
            </div>
            
            {/* Informações do documento */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Documento</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  SOW - Statement of Work
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Criado em 04/12/2025
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Projeto ERP Método Supera
                </li>
              </ul>
            </div>
            
            {/* Contato */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contato</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">agenciakadin@gmai<Mail className="h-4 w-4" />
                  contato@kadin.com.br
                </li>
                <li className="flex items-center gap-2">(44) 99924-5040<Phone className="h-4 w-4" />
                  (11) 99999-9999
                </li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 Agência Kadin. Todos os direitos reservados.</p>
            <p>Documento confidencial - Uso restrito</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default PropostaConsultoria;