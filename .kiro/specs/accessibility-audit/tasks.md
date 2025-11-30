# Implementation Plan - Auditoria de Acessibilidade

## Fase 1: Correções Críticas de HTML e Semântica

- [x] 1. Corrigir estrutura HTML semântica em todas as páginas


  - Adicionar landmarks apropriados (header, nav, main, footer)
  - Corrigir hierarquia de headings (h1 → h2 → h3)
  - Usar elementos semânticos corretos
  - _Requirements: 2.1, 5.1, 6.3_


- [ ] 1.1 Corrigir Home page (src/pages/Home/index.js)
  - Alterar h3 "Confie-nos..." para h2
  - Adicionar role="main" no main
  - Verificar hierarquia de headings
  - _Requirements: 5.1, 6.4_


- [ ] 1.2 Corrigir Footer (src/components/Footer/index.js)
  - Alterar h6 para h2 em "Recursos" e "Contatos"
  - Adicionar IDs únicos para aria-labelledby
  - Adicionar role="contentinfo" no footer
  - Usar nav e section apropriadamente

  - _Requirements: 5.1, 6.3, 6.5_

- [ ] 1.3 Corrigir Headers (HeaderComCadastro e HeaderSemCadastro)
  - Adicionar aria-label="Navegação principal" no nav
  - Adicionar aria-current="page" em links ativos

  - Garantir que todos os NavLinks tenham href válido
  - _Requirements: 2.1, 6.1_

- [ ] 1.4 Adicionar skip links em todas as páginas
  - Criar componente SkipLinks
  - Adicionar "Ir para conteúdo principal"
  - Adicionar "Ir para navegação"
  - Estilizar para aparecer no :focus
  - _Requirements: 1.1, 2.1_

## Fase 2: Textos Alternativos e Labels

- [ ] 2. Adicionar textos alternativos em todas as imagens
  - Auditar todas as tags <img>
  - Adicionar alt descritivo ou alt="" para decorativas
  - Verificar imagens de fundo que precisam de descrição
  - _Requirements: 2.2_

- [ ] 2.1 Adicionar aria-labels em botões genéricos
  - Botão "Clique aqui" → aria-label="Abrir página Sobre nós"
  - Botão "Conheça nosso aplicativo" → aria-label descritivo
  - Botões de ícone (notificações, chat, calendário)
  - _Requirements: 2.3, 6.2_

- [ ] 2.2 Associar labels a todos os inputs
  - Verificar todos os formulários
  - Adicionar for/id ou aria-labelledby
  - Adicionar aria-required em campos obrigatórios
  - _Requirements: 2.4, 10.1_

- [ ] 2.3 Adicionar descrições em elementos de formulário
  - Usar aria-describedby para instruções
  - Adicionar mensagens de erro acessíveis
  - Implementar aria-invalid para erros
  - _Requirements: 10.2, 10.3, 10.5_

## Fase 3: Navegação por Teclado e Foco

- [x] 3. Implementar navegação por teclado completa

  - Garantir ordem lógica de Tab
  - Adicionar suporte para Shift+Tab
  - Implementar atalhos de teclado onde apropriado
  - _Requirements: 1.1, 1.2_

- [ ] 3.1 Criar indicadores de foco visíveis
  - Atualizar CSS com :focus-visible
  - Garantir contraste 3:1 no indicador
  - Remover outline padrão mas manter acessibilidade
  - Aplicar em todos os elementos interativos
  - _Requirements: 1.3_

- [ ] 3.2 Implementar gerenciamento de foco em modais
  - Prender foco dentro do modal quando aberto
  - Retornar foco ao elemento que abriu ao fechar
  - Adicionar suporte para Escape fechar modal
  - _Requirements: 1.5, 7.1, 7.2_

- [ ] 3.3 Adicionar suporte de teclado em carrosséis
  - Setas esquerda/direita para navegar
  - Tab para focar controles
  - Adicionar aria-controls e aria-label
  - _Requirements: 7.4_

- [ ] 3.4 Implementar navegação em dropdowns
  - Adicionar aria-haspopup e aria-expanded
  - Suporte para setas e Enter
  - Fechar com Escape
  - _Requirements: 7.3_

## Fase 4: Contraste e Cores Acessíveis

- [ ] 4. Auditar e corrigir contraste de cores
  - Usar ferramenta de contraste para verificar todas as cores
  - Ajustar cores para atingir WCAG AA (4.5:1)
  - Documentar razões de contraste
  - _Requirements: 3.1, 3.2, 6.4_


- [ ] 4.1 Corrigir contraste em Home page
  - h3 "Confie-nos..." → cor mais escura
  - Verificar botões e links
  - Verificar texto sobre imagens
  - _Requirements: 3.1, 6.4_



- [ ] 4.2 Implementar variáveis CSS para temas
  - Criar variáveis para cores principais
  - Implementar tema de alto contraste
  - Implementar temas para daltonismo
  - Implementar modo monocromático
  - _Requirements: 3.4, 4.2, 4.3, 4.4_

- [ ] 4.3 Criar modo de baixa visão
  - Aumentar tamanhos de fonte em 25%
  - Aumentar espaçamento
  - Aplicar quando data-low-vision="true"
  - _Requirements: 3.3_

- [ ] 4.4 Garantir zoom até 200% funcional
  - Testar todas as páginas em 200% zoom
  - Corrigir overflow e quebras de layout
  - Manter funcionalidade completa
  - _Requirements: 3.5_

## Fase 5: ARIA e Conteúdo Dinâmico

- [ ] 5. Adicionar roles ARIA apropriados
  - Identificar elementos que precisam de roles
  - Adicionar role="region" em carrosséis
  - Adicionar role="alert" em mensagens
  - _Requirements: 2.1_

- [ ] 5.1 Implementar aria-live para conteúdo dinâmico
  - Notificações → aria-live="polite"
  - Erros → aria-live="assertive"
  - Atualizações de status
  - _Requirements: 2.5, 7.5_

- [ ] 5.2 Adicionar aria-labelledby e aria-describedby
  - Associar títulos a seções
  - Associar descrições a elementos
  - Usar em modais e dropdowns
  - _Requirements: 2.4, 10.3_

- [ ] 5.3 Implementar estados ARIA
  - aria-expanded para dropdowns
  - aria-selected para tabs
  - aria-checked para checkboxes customizados
  - aria-pressed para toggle buttons
  - _Requirements: 7.3_

## Fase 6: Suporte para Tecnologias Assistivas

- [ ] 6. Otimizar para leitores de tela
  - Testar com NVDA
  - Testar com JAWS
  - Testar com VoiceOver
  - Corrigir problemas encontrados
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 6.1 Adicionar textos para surdocegos
  - Descrições completas de imagens importantes
  - Alternativas textuais para animações
  - Estrutura semântica clara
  - _Requirements: 5.4, 5.5_

- [ ] 6.2 Implementar suporte para display braille
  - Garantir hierarquia de headings
  - Usar listas apropriadamente
  - Adicionar tabelas com th e scope
  - _Requirements: 5.1, 5.2, 5.3_

## Fase 7: Informação Não Visual

- [ ] 7. Garantir informação não depende apenas de cor
  - Adicionar ícones a status de consulta
  - Usar padrões além de cores
  - Adicionar texto descritivo
  - _Requirements: 4.1, 4.5_

- [ ] 7.1 Implementar indicadores visuais múltiplos
  - Status com ícone + cor + texto
  - Erros com ícone + cor + mensagem
  - Links com underline + cor
  - _Requirements: 4.1_

## Fase 8: Áreas de Toque e Espaçamento

- [ ] 8. Garantir áreas mínimas de toque
  - Auditar todos os botões e links
  - Garantir 44x44 pixels mínimo
  - Adicionar padding onde necessário
  - _Requirements: 8.1, 8.3_

- [ ] 8.1 Adicionar espaçamento entre elementos
  - Mínimo 8 pixels entre elementos interativos
  - Evitar cliques acidentais
  - Testar em dispositivos touch
  - _Requirements: 8.2, 8.4_

- [ ] 8.2 Fornecer alternativas de teclado para gestos
  - Swipe → setas do teclado
  - Pinch → Ctrl + scroll
  - Documentar atalhos
  - _Requirements: 8.5_

## Fase 9: Movimento e Animações

- [ ] 9. Implementar suporte para prefers-reduced-motion
  - Detectar preferência do sistema
  - Desabilitar animações não essenciais
  - Manter transições funcionais
  - _Requirements: 9.1, 9.2_

- [ ] 9.1 Adicionar controles de pausa em carrosséis
  - Botão de play/pause
  - Pausar no hover
  - Pausar no foco
  - _Requirements: 9.3_

- [ ] 9.2 Desabilitar autoplay de vídeos
  - Remover autoplay de iframes
  - Adicionar controles de vídeo
  - Fornecer transcrições quando possível
  - _Requirements: 9.4_

- [ ] 9.3 Implementar alternativa para parallax
  - Desabilitar para reduced-motion
  - Manter conteúdo acessível
  - _Requirements: 9.5_

## Fase 10: Testes e Validação

- [ ] 10. Executar testes automatizados
  - Configurar axe-core
  - Executar em todas as páginas
  - Corrigir violações encontradas
  - _Requirements: Todos_

- [ ] 10.1 Realizar testes manuais de teclado
  - Navegar todas as páginas com Tab
  - Testar todos os modais
  - Testar todos os formulários
  - Documentar problemas
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 10.2 Testar com leitores de tela
  - NVDA em Windows
  - JAWS em Windows
  - VoiceOver em macOS
  - Documentar experiência
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 10.3 Validar contraste com ferramentas
  - WebAIM Contrast Checker
  - Verificar todas as combinações
  - Documentar razões de contraste
  - _Requirements: 3.1, 3.2, 3.4_

- [ ] 10.4 Testar com usuários reais
  - Recrutar usuários com deficiências
  - Observar uso da aplicação
  - Coletar feedback
  - Implementar melhorias
  - _Requirements: Todos_

## Fase 11: Documentação e Manutenção

- [ ] 11. Criar guia de acessibilidade
  - Documentar padrões implementados
  - Criar checklist para novos recursos
  - Documentar atalhos de teclado
  - _Requirements: Todos_

- [ ] 11.1 Configurar CI/CD para acessibilidade
  - Adicionar testes automatizados ao pipeline
  - Bloquear merge com violações críticas
  - Gerar relatórios de acessibilidade
  - _Requirements: Todos_

- [ ] 11.2 Treinar equipe em acessibilidade
  - Workshop sobre WCAG
  - Demonstração de tecnologias assistivas
  - Revisão de código focada em acessibilidade
  - _Requirements: Todos_
