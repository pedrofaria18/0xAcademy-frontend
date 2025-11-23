# Web3 Courses Platform - Frontend

Frontend moderno para plataforma educacional Web3 com autenticação MetaMask, integração com RainbowKit e interface responsiva.

## 🚀 Features

- **Autenticação Web3**: Login com MetaMask via RainbowKit
- **Interface Moderna**: Next.js 14 + TailwindCSS + Shadcn/ui
- **Gestão de Cursos**: Listagem, detalhes e matrículas
- **Dashboard**: Área do aluno e instrutor
- **Upload de Vídeos**: Integração com Cloudflare Stream
- **Dark Mode**: Tema claro/escuro automático
- **Responsivo**: Funciona em desktop e mobile

## 📋 Prerequisites

- Node.js 18+
- pnpm 8+
- Backend rodando na porta 3001
- WalletConnect Project ID

## 🛠 Installation

1. **Instalar dependências:**
```bash
pnpm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp .env.local.example .env.local
```

Editar `.env.local`:
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: Obter em https://cloud.walletconnect.com
- `NEXT_PUBLIC_API_URL`: URL do backend (default: http://localhost:3001/api)

3. **Iniciar desenvolvimento:**
```bash
pnpm dev
```

Aplicação rodará em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router pages
│   ├── courses/           # Páginas de cursos
│   ├── dashboard/         # Dashboard do usuário
│   └── layout.tsx         # Layout principal
├── components/            # Componentes React
│   ├── ui/               # Componentes UI (shadcn)
│   ├── layout/           # Header, Footer, etc
│   └── courses/          # Componentes de cursos
├── hooks/                # Custom hooks
│   └── useWeb3Auth.ts    # Hook de autenticação
├── lib/                  # Utilitários
│   ├── api.ts           # Cliente API
│   └── utils.ts         # Funções auxiliares
├── store/               # Estado global (Zustand)
│   └── auth.ts         # Store de autenticação
└── styles/             # Estilos globais
```

## 🎨 Componentes UI

Usando componentes do **shadcn/ui**:
- Button, Card, Input, Badge
- Dropdown Menu, Dialog, Toast
- Tabs, Progress, Avatar
- E mais...

## 🔐 Autenticação Web3

O fluxo de autenticação:
1. Usuário conecta wallet via RainbowKit
2. Backend gera nonce único
3. Usuário assina mensagem SIWE
4. Backend verifica assinatura
5. JWT token é armazenado

## 📚 Páginas Principais

### Home (`/`)
- Landing page
- CTA para login/cadastro
- Features da plataforma

### Cursos (`/courses`)
- Listagem de cursos
- Busca e filtros
- Cards com informações

### Curso Individual (`/courses/[id]`)
- Detalhes do curso
- Lista de aulas
- Botão de matrícula

### Dashboard (`/dashboard`)
- Cursos matriculados
- Progresso de aprendizado
- Certificados

### Área do Instrutor (`/dashboard/instructor`)
- Criar/editar cursos
- Upload de vídeos
- Estatísticas

## 🛠 Comandos Úteis

```bash
# Desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Iniciar produção
pnpm start

# Lint
pnpm lint

# Formatar código
pnpm format

# Type check
pnpm type-check
```

## 🔧 Configuração Adicional

### WalletConnect
1. Criar conta em https://cloud.walletconnect.com
2. Criar novo projeto
3. Copiar Project ID
4. Adicionar ao `.env.local`

### Chains Suportadas
- Ethereum Mainnet
- Sepolia Testnet
- Polygon
- Arbitrum
- Optimism

Configurar em `src/config/wagmi.ts`

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
pnpm i -g vercel

# Deploy
vercel
```

### Outras Plataformas
- Netlify
- Railway
- AWS Amplify

## 🎯 Próximos Passos

1. **Melhorias UI/UX**:
   - Animações com Framer Motion
   - Skeleton loaders
   - Feedback visual

2. **Features Avançadas**:
   - Chat em tempo real
   - Notificações push
   - Sistema de gamificação

3. **Web3 Features**:
   - Pagamento em crypto
   - NFT certificates
   - DAO governance

4. **Performance**:
   - Image optimization
   - Code splitting
   - Cache strategies

## 📄 Environment Variables

```env
# App
NEXT_PUBLIC_APP_NAME=Web3 Courses
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Chain ID
NEXT_PUBLIC_CHAIN_ID=11155111

# Cloudflare (opcional)
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=
NEXT_PUBLIC_CLOUDFLARE_STREAM_URL=

# Analytics (opcional)
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_MIXPANEL_TOKEN=
```

## 🤝 Contributing

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 License

MIT License - veja LICENSE para detalhes

## 💬 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato.
# 0xAcademy-frontend
