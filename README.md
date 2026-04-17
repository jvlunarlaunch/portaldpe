# Portal DPE

Um portal de notícias e artigos moderno construído com React 19, Tailwind CSS 4 e Supabase.

## 🚀 Tecnologias

- **Frontend:** React 19, Vite, Tailwind CSS 4, Framer Motion, Tiptap Editor.
- **Backend/Database:** Supabase (PostgreSQL, Auth e Storage).
- **Outros:** TypeScript, Lucide React, Axios, React Helmet Async.

## 📋 Pré-requisitos

- Node.js (v18 ou superior)
- npm ou yarn

## 🛠️ Configuração Inicial

1. **Clonar o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd portaldpe
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   ```

3. **Configurar as variáveis de ambiente:**
   Crie um arquivo `.env` na raiz do projeto e adicione suas credenciais do Supabase:
   ```env
   VITE_SUPABASE_URL=seu_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

## 💻 Como Rodar

Para rodar o projeto em modo de desenvolvimento:

```bash
npm run dev
```

O portal estará disponível em `http://localhost:3000`.

## 📦 Scripts Disponíveis

- `npm run dev`: Inicia o ambiente de desenvolvimento do Vite.
- `npm run build`: Gera a versão de produção otimizada com ofuscação de código.
- `npm run sitemap`: Gera o sitemap para SEO.

## 🛡️ Área Administrativa

Para gerenciar artigos, autores e categorias, acesse a rota `/admin`. O sistema utiliza o Supabase Auth para controle de acesso.

