/**
 * LOG: Criando página de Termos de Serviço
 * DOCUMENTAÇÃO: Página pública com termos de serviço da Agência Kadin para WhatsApp Business API
 * CLEAN CODE: Estrutura semântica, responsiva e acessível seguindo padrão da política de privacidade
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/**
 * TermosServico - Página de Termos de Serviço
 * 
 * FUNCIONALIDADES:
 * 1. Exibição completa dos termos de serviço
 * 2. Navegação interna com índice
 * 3. Estrutura semântica para SEO
 * 4. Design responsivo e acessível
 * 5. Tipografia otimizada para leitura de texto longo
 */
const TermosServico: React.FC = () => {
  console.log('LOG: Renderizando página de Termos de Serviço');

  // LOG: Seções dos termos para navegação interna
  const sections = [
    { id: 'aceitacao', title: '1. Aceitação dos Termos' },
    { id: 'servicos', title: '2. Serviços Prestados' },
    { id: 'obrigacoes-cliente', title: '3. Obrigações do Cliente' },
    { id: 'obrigacoes-kadin', title: '4. Obrigações da Agência Kadin' },
    { id: 'limitacao', title: '5. Limitação de Responsabilidade' },
    { id: 'propriedade', title: '6. Propriedade Intelectual' },
    { id: 'vigencia', title: '7. Vigência e Rescisão' },
    { id: 'alteracoes', title: '8. Alterações dos Termos' },
    { id: 'foro', title: '9. Foro' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* HERO SECTION: Cabeçalho da página */}
      <section className="bg-gradient-to-br from-secondary/10 to-primary/10 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Termos de Serviço
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              WhatsApp Business API Oficial - Agência Kadin
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Conheça os termos e condições para utilização dos nossos serviços de comunicação empresarial
            </p>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT: Conteúdo principal */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* ÍNDICE DE NAVEGAÇÃO: Sidebar com navegação interna */}
              <aside className="lg:col-span-1">
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle className="text-lg">Índice</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <nav className="space-y-2">
                      {sections.map((section) => (
                        <a
                          key={section.id}
                          href={`#${section.id}`}
                          className="block text-sm text-muted-foreground hover:text-secondary transition-colors py-1"
                        >
                          {section.title}
                        </a>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </aside>

              {/* CONTEÚDO DOS TERMOS: Texto principal */}
              <article className="lg:col-span-3">
                <Card>
                  <CardContent className="p-8 space-y-8">
                    
                    {/* SEÇÃO 1: Aceitação dos Termos */}
                    <section id="aceitacao">
                      <h2 className="text-2xl font-semibold text-foreground mb-4">
                        1. Aceitação dos Termos
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        Ao contratar e utilizar os serviços da Agência Kadin integrados à API Oficial do WhatsApp Business, 
                        o cliente declara estar ciente e de acordo com estes Termos de Serviço. Caso não concorde, não 
                        deverá utilizar a plataforma.
                      </p>
                    </section>

                    <Separator />

                    {/* SEÇÃO 2: Serviços Prestados */}
                    <section id="servicos">
                      <h2 className="text-2xl font-semibold text-foreground mb-4">
                        2. Serviços Prestados
                      </h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        A Agência Kadin fornece soluções de comunicação empresarial através da integração com a API Oficial 
                        do WhatsApp Business, incluindo:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li>Envio e recebimento de mensagens;</li>
                        <li>Gestão de contatos e histórico de atendimentos;</li>
                        <li>Automação de fluxos de comunicação;</li>
                        <li>Relatórios e análises de performance.</li>
                      </ul>
                    </section>

                    <Separator />

                    {/* SEÇÃO 3: Obrigações do Cliente */}
                    <section id="obrigacoes-cliente">
                      <h2 className="text-2xl font-semibold text-foreground mb-4">
                        3. Obrigações do Cliente
                      </h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        O cliente compromete-se a:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li>Utilizar os serviços em conformidade com a lei vigente e as políticas da Meta (WhatsApp Inc.);</li>
                        <li>Não enviar mensagens não autorizadas (spam) ou de conteúdo ilícito, abusivo ou discriminatório;</li>
                        <li>Garantir que possui o consentimento dos titulares de dados para realizar comunicações via WhatsApp;</li>
                        <li>Responsabilizar-se pela veracidade das informações fornecidas à Agência Kadin.</li>
                      </ul>
                    </section>

                    <Separator />

                    {/* SEÇÃO 4: Obrigações da Agência Kadin */}
                    <section id="obrigacoes-kadin">
                      <h2 className="text-2xl font-semibold text-foreground mb-4">
                        4. Obrigações da Agência Kadin
                      </h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        A Agência Kadin compromete-se a:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li>Prestar os serviços de acordo com o contratado, garantindo a disponibilidade e integridade do sistema;</li>
                        <li>Adotar medidas de segurança adequadas para proteção das informações;</li>
                        <li>Respeitar a privacidade dos usuários conforme disposto na Política de Privacidade;</li>
                        <li>Cumprir a legislação vigente, incluindo a LGPD (Lei nº 13.709/2018).</li>
                      </ul>
                    </section>

                    <Separator />

                    {/* SEÇÃO 5: Limitação de Responsabilidade */}
                    <section id="limitacao">
                      <h2 className="text-2xl font-semibold text-foreground mb-4">
                        5. Limitação de Responsabilidade
                      </h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        A Agência Kadin não se responsabiliza por:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li>Mau uso da ferramenta pelo cliente;</li>
                        <li>Problemas decorrentes de falhas externas aos seus sistemas (como instabilidade da Meta/WhatsApp ou de provedores de internet);</li>
                        <li>Danos indiretos, lucros cessantes ou perda de oportunidades de negócios.</li>
                      </ul>
                    </section>

                    <Separator />

                    {/* SEÇÃO 6: Propriedade Intelectual */}
                    <section id="propriedade">
                      <h2 className="text-2xl font-semibold text-foreground mb-4">
                        6. Propriedade Intelectual
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        Todos os direitos relacionados à plataforma, integrações, automações e metodologias utilizadas pela 
                        Agência Kadin são de sua propriedade ou licenciados, sendo vedada a cópia, reprodução ou utilização não autorizada.
                      </p>
                    </section>

                    <Separator />

                    {/* SEÇÃO 7: Vigência e Rescisão */}
                    <section id="vigencia">
                      <h2 className="text-2xl font-semibold text-foreground mb-4">
                        7. Vigência e Rescisão
                      </h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Estes Termos de Serviço permanecem em vigor durante a utilização dos serviços pela empresa contratante. 
                        A rescisão pode ocorrer:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li>Por iniciativa do cliente, mediante aviso prévio de 30 (trinta) dias;</li>
                        <li>Por descumprimento destes Termos ou da legislação aplicável;</li>
                        <li>Pela descontinuidade dos serviços por decisão da Agência Kadin ou da Meta/WhatsApp.</li>
                      </ul>
                    </section>

                    <Separator />

                    {/* SEÇÃO 8: Alterações dos Termos */}
                    <section id="alteracoes">
                      <h2 className="text-2xl font-semibold text-foreground mb-4">
                        8. Alterações dos Termos
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        A Agência Kadin poderá alterar estes Termos a qualquer momento, sendo o cliente notificado previamente 
                        em caso de mudanças significativas. O uso continuado dos serviços após as alterações implica na aceitação 
                        das novas condições.
                      </p>
                    </section>

                    <Separator />

                    {/* SEÇÃO 9: Foro */}
                    <section id="foro">
                      <h2 className="text-2xl font-semibold text-foreground mb-4">
                        9. Foro
                      </h2>
                      <div className="bg-secondary/5 rounded-lg p-6 border border-secondary/20">
                        <p className="text-muted-foreground leading-relaxed">
                          Fica eleito o foro da comarca de <strong>Maringá/PR</strong>, com renúncia a qualquer outro, 
                          para dirimir dúvidas ou controvérsias oriundas destes Termos de Serviço.
                        </p>
                      </div>
                    </section>

                    {/* ÚLTIMA ATUALIZAÇÃO */}
                    <div className="text-center pt-8 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        Última atualização: {new Date().toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                  </CardContent>
                </Card>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermosServico;