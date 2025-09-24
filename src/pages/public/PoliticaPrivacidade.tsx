/**
 * LOG: Criando página de Política de Privacidade
 * DOCUMENTAÇÃO: Página pública com política de privacidade da Agência Kadin para WhatsApp Business API
 * CLEAN CODE: Estrutura semântica, responsiva e acessível
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/**
 * PoliticaPrivacidade - Página de Política de Privacidade
 * 
 * FUNCIONALIDADES:
 * 1. Exibição completa da política de privacidade
 * 2. Navegação interna com índice
 * 3. Estrutura semântica para SEO
 * 4. Design responsivo e acessível
 * 5. Tipografia otimizada para leitura de texto longo
 */
const PoliticaPrivacidade: React.FC = () => {
  console.log('LOG: Renderizando página de Política de Privacidade');

  // LOG: Seções da política para navegação interna
  const sections = [
    { id: 'introducao', title: '1. Introdução' },
    { id: 'coleta', title: '2. Coleta de Informações' },
    { id: 'finalidade', title: '3. Finalidade do Tratamento de Dados' },
    { id: 'compartilhamento', title: '4. Compartilhamento de Dados' },
    { id: 'armazenamento', title: '5. Armazenamento e Segurança' },
    { id: 'direitos', title: '6. Direitos do Titular dos Dados' },
    { id: 'whatsapp', title: '7. Uso de Mensagens no WhatsApp' },
    { id: 'alteracoes', title: '8. Alterações desta Política' },
    { id: 'contato', title: '9. Contato' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* HERO SECTION: Cabeçalho da página */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Política de Privacidade
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              WhatsApp Business API Oficial - Agência Kadin
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Conheça como tratamos e protegemos suas informações pessoais em conformidade com a LGPD
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
                          className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                        >
                          {section.title}
                        </a>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </aside>

              {/* CONTEÚDO DA POLÍTICA: Texto principal */}
              <article className="lg:col-span-3">
                <Card>
                  <CardContent className="p-8 space-y-8">
                    
                    {/* SEÇÃO 1: Introdução */}
                    <section id="introducao">
                      <h2 className="text-2xl font-semibold text-foreground mb-4">
                        1. Introdução
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        A Agência Kadin valoriza a privacidade e a segurança das informações de seus clientes, parceiros e usuários. 
                        Esta Política de Privacidade descreve como coletamos, utilizamos, armazenamos e protegemos os dados pessoais 
                        tratados por meio da API Oficial do WhatsApp Business, em conformidade com a Lei Geral de Proteção de Dados 
                        (Lei nº 13.709/2018 – LGPD) e demais legislações aplicáveis.
                      </p>
                    </section>

                    <Separator />

                    {/* SEÇÃO 2: Coleta de Informações */}
                    <section id="coleta">
                      <h2 className="text-2xl font-semibold text-foreground mb-4">
                        2. Coleta de Informações
                      </h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Ao utilizar nossos serviços integrados à API do WhatsApp Business, poderemos coletar as seguintes informações:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li>Dados de identificação pessoal (nome, CPF, e-mail, telefone);</li>
                        <li>Dados de contato via WhatsApp (mensagens, arquivos de mídia, registros de atendimento);</li>
                        <li>Informações comerciais relacionadas ao uso do serviço (contratos, histórico de comunicação, preferências do cliente);</li>
                        <li>Dados técnicos de navegação (endereço IP, data e hora de acesso, logs de sistema).</li>
                      </ul>
                    </section>

                    <Separator />

                    {/* SEÇÃO 3: Finalidade do Tratamento */}
                    <section id="finalidade">
                      <h2 className="text-2xl font-semibold text-foreground mb-4">
                        3. Finalidade do Tratamento de Dados
                      </h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Os dados coletados serão utilizados exclusivamente para:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li>Comunicação entre empresa e cliente via WhatsApp;</li>
                        <li>Registro de atendimentos e histórico de interações;</li>
                        <li>Melhoria da experiência do usuário e personalização dos serviços;</li>
                        <li>Cumprimento de obrigações legais, regulatórias ou contratuais;</li>
                        <li>Análises internas e geração de relatórios gerenciais.</li>
                      </ul>
                    </section>

                    <Separator />

                    {/* SEÇÃO 4: Compartilhamento de Dados */}
                    <section id="compartilhamento">
                      <h2 className="text-2xl font-semibold text-foreground mb-4">
                        4. Compartilhamento de Dados
                      </h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        A Agência Kadin não compartilha, vende ou comercializa dados pessoais sem o devido consentimento do titular. 
                        O compartilhamento poderá ocorrer somente:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li>Com provedores de tecnologia necessários à operação da API do WhatsApp Business (Meta/Facebook);</li>
                        <li>Com parceiros contratados para prestação de serviços complementares (ex.: servidores de hospedagem, ferramentas de CRM);</li>
                        <li>Quando exigido por autoridades legais ou regulatórias.</li>
                      </ul>
                    </section>

                    <Separator />

                    {/* SEÇÃO 5: Armazenamento e Segurança */}
                    <section id="armazenamento">
                      <h2 className="text-2xl font-semibold text-foreground mb-4">
                        5. Armazenamento e Segurança
                      </h2>
                      <div className="space-y-4 text-muted-foreground leading-relaxed">
                        <p>
                          Adotamos medidas de segurança técnicas, administrativas e organizacionais para proteger os dados pessoais 
                          contra acessos não autorizados, perda, uso indevido ou alteração.
                        </p>
                        <p>
                          Os dados são armazenados em servidores seguros e pelo tempo necessário para cumprir as finalidades desta Política, 
                          respeitando prazos legais e regulatórios.
                        </p>
                      </div>
                    </section>

                    <Separator />

                    {/* SEÇÃO 6: Direitos do Titular */}
                    <section id="direitos">
                      <h2 className="text-2xl font-semibold text-foreground mb-4">
                        6. Direitos do Titular dos Dados
                      </h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Nos termos da LGPD, o titular dos dados pode a qualquer momento:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                        <li>Solicitar acesso às informações pessoais tratadas;</li>
                        <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
                        <li>Solicitar a exclusão de dados pessoais, quando aplicável;</li>
                        <li>Revogar o consentimento previamente concedido;</li>
                        <li>Solicitar a portabilidade dos dados para outro fornecedor de serviços.</li>
                      </ul>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-muted-foreground">
                          <strong>Canal oficial para pedidos:</strong> 
                          <a href="mailto:privacidade@kadin.com.br" className="text-primary hover:underline ml-1">
                            privacidade@kadin.com.br
                          </a>
                        </p>
                      </div>
                    </section>

                    <Separator />

                    {/* SEÇÃO 7: WhatsApp */}
                    <section id="whatsapp">
                      <h2 className="text-2xl font-semibold text-foreground mb-4">
                        7. Uso de Mensagens no WhatsApp
                      </h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        A utilização da API Oficial segue as diretrizes da Meta. Isso significa que:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li>As mensagens podem ser utilizadas para comunicação empresarial e notificações relevantes;</li>
                        <li>Não serão enviadas mensagens de marketing sem prévia autorização do usuário;</li>
                        <li>O usuário poderá, a qualquer momento, solicitar a interrupção do envio de mensagens.</li>
                      </ul>
                    </section>

                    <Separator />

                    {/* SEÇÃO 8: Alterações */}
                    <section id="alteracoes">
                      <h2 className="text-2xl font-semibold text-foreground mb-4">
                        8. Alterações desta Política
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        A Agência Kadin poderá atualizar esta Política periodicamente para refletir mudanças nos serviços ou na 
                        legislação aplicável. Recomendamos a leitura regular desta página para manter-se informado.
                      </p>
                    </section>

                    <Separator />

                    {/* SEÇÃO 9: Contato */}
                    <section id="contato">
                      <h2 className="text-2xl font-semibold text-foreground mb-4">
                        9. Contato
                      </h2>
                      <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
                        <p className="text-muted-foreground leading-relaxed">
                          Em caso de dúvidas ou solicitações relacionadas à privacidade, entre em contato com nosso 
                          Encarregado de Proteção de Dados (DPO):
                        </p>
                        <p className="text-foreground font-medium mt-3">
                          <a href="mailto:agenciakadin@gmail.com" className="text-primary hover:underline">
                            agenciakadin@gmail.com
                          </a>
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

export default PoliticaPrivacidade;