# 🚀 Deploy no Vercel - Pet Vita

## Pré-requisitos
- Conta no Vercel
- Repositório GitHub conectado

## Passos para Deploy

### 1. Configurar Variáveis de Ambiente no Vercel
No dashboard do Vercel, adicione as seguintes variáveis de ambiente:

```
REACT_APP_FIREBASE_API_KEY=sua_chave_aqui
REACT_APP_FIREBASE_AUTH_DOMAIN=seu_dominio_aqui
REACT_APP_FIREBASE_PROJECT_ID=seu_projeto_aqui
REACT_APP_FIREBASE_STORAGE_BUCKET=seu_bucket_aqui
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id_aqui
REACT_APP_FIREBASE_APP_ID=seu_app_id_aqui
REACT_APP_API_URL=sua_api_url_aqui
```

### 2. Configurações do Projeto no Vercel
- **Framework Preset**: Create React App
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### 3. Deploy
O deploy acontece automaticamente a cada push na branch `Main`.

## Troubleshooting

### Erro: "Module not found"
- Verifique se todos os imports estão com case-sensitive correto
- Linux/Vercel diferencia maiúsculas de minúsculas

### Erro: "Command npm run build exited with 1"
- Verifique as variáveis de ambiente
- O `CI=false` no package.json ignora warnings do ESLint

### Build local
Para testar o build localmente:
```bash
npm run build
npm install -g serve
serve -s build
```

## Arquivos Importantes
- `vercel.json` - Configuração do Vercel
- `package.json` - Scripts e dependências
- `.env.example` - Template de variáveis de ambiente
- `.vercelignore` - Arquivos ignorados no deploy
