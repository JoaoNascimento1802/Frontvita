# Design Document - Auditoria de Acessibilidade

## Overview

Este documento detalha o design técnico para implementar acessibilidade completa na aplicação Pet Vita, incluindo correções de HTML, CSS, ARIA, navegação por teclado e suporte para tecnologias assistivas.

## Architecture

### Camadas de Acessibilidade

1. **Camada Semântica (HTML)**
   - Estrutura HTML5 semântica
   - Landmarks apropriados
   - Hierarquia de headings correta

2. **Camada de Apresentação (CSS)**
   - Variáveis CSS para temas acessíveis
   - Indicadores de foco visíveis
   - Contraste adequado

3. **Camada de Interação (JavaScript)**
   - Gerenciamento de foco
   - Navegação por teclado
   - ARIA dinâmico

4. **Camada de Conteúdo**
   - Textos alternativos
   - Labels descritivos
   - Mensagens de erro claras

## Components and Interfaces

### 1. Sistema de Temas Acessíveis

```css
:root {
  /* Tema padrão */
  --text-color: #111;
  --bg-color: #fff;
  --primary-color: #8D7EFB;
  --secondary-color: #B77EFF;
  
  /* Contraste */
  --focus-color: #1a73e8;
  --focus-bg: rgba(26, 115, 232, 0.15);
  --focus-outline-width: 3px;
  --focus-outline-offset: 2px;
}

[data-high-contrast="true"] {
  --text-color: #000;
  --bg-color: #fff;
  --primary-color: #0000EE;
  --secondary-color: #551A8B;
  --focus-color: #000;
}

[data-colorblind="deuteranopia"],
[data-colorblind="protanopia"] {
  --primary-color: #005A9C;
  --secondary-color: #FFAA00;
}

[data-colorblind="tritanopia"] {
  --primary-color: #C41E3A;
  --secondary-color: #00A86B;
}

[data-monochrome="true"] {
  filter: grayscale(1);
}

[data-low-vision="true"] {
  --font-scale: 1.25;
  --spacing-scale: 1.2;
}
```

### 2. Indicadores de Foco

```css
:focus-visible {
  outline: var(--focus-outline-width) solid var(--focus-color);
  outline-offset: var(--focus-outline-offset);
  box-shadow: 0 0 0 4px var(--focus-bg);
}

/* Remove outline padrão mas mantém para :focus-visible */
:focus:not(:focus-visible) {
  outline: none;
}
```

### 3. Skip Links

```html
<a href="#main" class="skip-link">Ir para conteúdo principal</a>
<a href="#nav" class="skip-link">Ir para navegação</a>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 8px;
  background: var(--bg-color);
  color: var(--text-color);
  padding: 8px 12px;
  border: 2px solid var(--focus-color);
  border-radius: 6px;
  z-index: 1000;
  text-decoration: none;
}

.skip-link:focus {
  top: 8px;
}
```

## Data Models

### Accessibility Context

```javascript
interface AccessibilitySettings {
  highContrast: boolean;
  colorblindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
  monochrome: boolean;
  lowVision: boolean;
  reducedMotion: boolean;
  fontSize: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Navegação por teclado completa
*For any* elemento interativo na aplicação, quando um usuário navega usando Tab, o elemento deve receber foco visível e ser acessível por teclado
**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Landmarks semânticos presentes
*For any* página da aplicação, deve existir pelo menos um elemento main, header, nav e footer com roles apropriados
**Validates: Requirements 2.1**

### Property 3: Textos alternativos em imagens
*For any* elemento img na aplicação, deve existir um atributo alt com descrição significativa ou alt="" para imagens decorativas
**Validates: Requirements 2.2**

### Property 4: Labels associados a inputs
*For any* elemento input, select ou textarea, deve existir um label associado via for/id ou aria-labelledby
**Validates: Requirements 2.4**

### Property 5: Contraste mínimo AA
*For any* texto na aplicação, a razão de contraste entre texto e fundo deve ser no mínimo 4.5:1 para texto normal e 3:1 para texto grande
**Validates: Requirements 3.1, 3.2**

### Property 6: Informação não apenas por cor
*For any* informação transmitida por cor (como status), deve existir um indicador adicional (ícone, texto, padrão)
**Validates: Requirements 4.1**

### Property 7: Hierarquia de headings
*For any* página, os headings devem seguir ordem lógica (h1 → h2 → h3) sem pular níveis
**Validates: Requirements 5.1**

### Property 8: Foco preso em modais
*For any* modal aberto, a navegação por Tab deve permanecer dentro do modal até que seja fechado
**Validates: Requirements 7.1**

### Property 9: Área mínima de toque
*For any* elemento interativo, a área clicável deve ser no mínimo 44x44 pixels
**Validates: Requirements 8.1**

### Property 10: Respeito a prefers-reduced-motion
*For any* animação ou transição, quando prefers-reduced-motion está ativo, animações não essenciais devem ser desabilitadas
**Validates: Requirements 9.1**

## Error Handling

### Erros de Acessibilidade Identificados

1. **Links sem href válido**
   - Problema: `<a class="nav_link active">` sem href
   - Solução: Usar NavLink do React Router com to prop

2. **Botões sem labels**
   - Problema: `<button>Clique aqui</button>` genérico
   - Solução: Adicionar aria-label descritivo

3. **Headings incorretos**
   - Problema: `<h6>Recursos</h6>` para título principal
   - Solução: Usar `<h2>` para subtítulos de seção

4. **Contraste insuficiente**
   - Problema: `<h3>Confie-nos...</h3>` com contraste baixo
   - Solução: Ajustar cor para atingir 4.5:1

5. **Elementos duplicados**
   - Problema: Múltiplos `<h6>Recursos</h6>`
   - Solução: Usar IDs únicos e aria-labelledby

## Testing Strategy

### Testes Manuais

1. **Navegação por Teclado**
   - Testar Tab/Shift+Tab em todas as páginas
   - Verificar ordem lógica de foco
   - Testar atalhos de teclado

2. **Leitores de Tela**
   - NVDA (Windows)
   - JAWS (Windows)
   - VoiceOver (macOS/iOS)
   - TalkBack (Android)

3. **Ferramentas de Auditoria**
   - axe DevTools
   - WAVE
   - Lighthouse
   - Pa11y

### Testes Automatizados

```javascript
// Exemplo de teste de acessibilidade
describe('Accessibility Tests', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Home />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('should have proper heading hierarchy', () => {
    const { container } = render(<Home />);
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    // Verificar ordem lógica
  });
});
```

## Implementation Plan

### Fase 1: Correções Críticas (Prioridade Alta)

1. Corrigir estrutura HTML semântica
2. Adicionar textos alternativos em imagens
3. Corrigir hierarquia de headings
4. Adicionar labels em formulários
5. Implementar navegação por teclado

### Fase 2: Melhorias de Contraste (Prioridade Alta)

1. Auditar todas as cores
2. Ajustar contraste para WCAG AA
3. Implementar temas de alto contraste
4. Adicionar modos para daltonismo

### Fase 3: ARIA e Interatividade (Prioridade Média)

1. Adicionar roles apropriados
2. Implementar aria-labels
3. Adicionar aria-live para conteúdo dinâmico
4. Implementar gerenciamento de foco em modais

### Fase 4: Testes e Validação (Prioridade Média)

1. Testes com leitores de tela
2. Testes de navegação por teclado
3. Auditoria com ferramentas automatizadas
4. Testes com usuários reais

## Specific Fixes Required

### Home Page (src/pages/Home/index.js)

```javascript
// ANTES
<h3>Confie-nos o melhor cuidado para o seu animal de estimação</h3>

// DEPOIS
<h2 style={{ color: '#1a1a1a' }}>Confie-nos o melhor cuidado para o seu animal de estimação</h2>

// ANTES
<button>Clique aqui</button>

// DEPOIS
<button aria-label="Abrir página Sobre nós">Clique aqui</button>

// ANTES
<button>Conheça nosso aplicativo de perto</button>

// DEPOIS
<button aria-label="Conheça nosso aplicativo de perto">Conheça nosso aplicativo</button>
```

### Footer (src/components/Footer/index.js)

```javascript
// ANTES
<h6>Recursos</h6>

// DEPOIS
<h2 id="footer-links-title">Recursos</h2>
<nav aria-labelledby="footer-links-title">
  <ul>...</ul>
</nav>

// ANTES
<h6>Contatos</h6>

// DEPOIS
<h2 id="footer-contact-title">Contatos</h2>
<section aria-labelledby="footer-contact-title">
  <ul>...</ul>
</section>
```

### Header (src/components/HeaderComCadastro/index.js)

```javascript
// ADICIONAR
<nav className="nav" aria-label="Navegação principal">
  <NavLink to="/" aria-current={isActive ? "page" : undefined}>
    Home
  </NavLink>
  ...
</nav>

// ADICIONAR em botões de ícone
<button
  aria-label="Abrir notificações"
  aria-haspopup="true"
  aria-expanded={showNotifications}
>
  <BsBellFill />
  {unreadCount > 0 && (
    <span className="notification-badge" aria-label={`${unreadCount} notificações não lidas`}>
      {unreadCount}
    </span>
  )}
</button>
```

## Accessibility Checklist

- [ ] Todos os elementos interativos são acessíveis por teclado
- [ ] Indicadores de foco visíveis em todos os elementos
- [ ] Landmarks semânticos (header, nav, main, footer)
- [ ] Hierarquia de headings correta (h1 → h2 → h3)
- [ ] Textos alternativos em todas as imagens
- [ ] Labels associados a todos os inputs
- [ ] Contraste mínimo 4.5:1 para texto normal
- [ ] Contraste mínimo 3:1 para texto grande
- [ ] ARIA labels em botões sem texto
- [ ] aria-live para conteúdo dinâmico
- [ ] Gerenciamento de foco em modais
- [ ] Skip links para navegação rápida
- [ ] Suporte para prefers-reduced-motion
- [ ] Área mínima 44x44px para elementos touch
- [ ] Informação não depende apenas de cor
- [ ] Temas para daltonismo implementados
- [ ] Modo de alto contraste disponível
- [ ] Modo de baixa visão com fontes maiores
- [ ] Testes com leitores de tela realizados
- [ ] Auditoria automatizada sem violações
