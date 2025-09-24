/**
 * LOG: Criando layout público para Landing Pages
 * DOCUMENTAÇÃO: Layout simples para páginas públicas sem autenticação
 * CLEAN CODE: Componente focado e reutilizável para todas as landing pages
 */

import React from "react";
import { Outlet } from "react-router-dom";

/**
 * PublicLayout - Layout para páginas públicas (landing pages)
 * 
 * FUNCIONALIDADES:
 * 1. Header simples com logo da Kadin
 * 2. Área de conteúdo responsiva  
 * 3. Footer com informações da empresa
 * 4. Estilização consistente com design system
 */
const PublicLayout: React.FC = () => {
  console.log('LOG: Renderizando PublicLayout para página pública');
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* HEADER: Cabeçalho simples com logo */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo da Agência Kadin */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">K</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">
                Agência Kadin
              </h1>
            </div>
            
            {/* Navegação opcional */}
            <nav className="hidden md:flex items-center space-x-6">
              <a 
                href="/politica-de-privacidade" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Política de Privacidade
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT: Área principal do conteúdo */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* FOOTER: Rodapé com informações da empresa */}
      <footer className="border-t border-border bg-muted/30 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Informações da empresa */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Agência Kadin
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Soluções inovadoras em comunicação empresarial e gestão de relacionamento com clientes através do WhatsApp Business API.
              </p>
            </div>

            {/* Contato */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Contato
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>📧 agenciakadin@gmail.com</p>
                <p>🔒 privacidade@kadin.com.br</p>
              </div>
            </div>

            {/* Links importantes */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Links Importantes
              </h3>
              <div className="space-y-2 text-sm">
                <a 
                  href="/politica-de-privacidade" 
                  className="block text-muted-foreground hover:text-primary transition-colors"
                >
                  Política de Privacidade
                </a>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="border-t border-border mt-8 pt-4 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Agência Kadin. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;