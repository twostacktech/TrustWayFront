# TrustWay Front

<p align="center">
  <img src="./src/assets/trustway.png" alt="TrustWay" width="240" />
</p>

<h3 align="center">
  Seguro veicular inteligente, cotação FIPE e gestão de apólices em uma experiência premium.
</h3>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=0B1020" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img alt="TailwindCSS" src="https://img.shields.io/badge/TailwindCSS-4.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

---

## Sobre o projeto

O **TrustWay Front** é a interface web da TrustWay, uma plataforma de seguros automotivos com foco em simulação inteligente, experiência visual moderna e gestão de apólices.

A aplicação combina uma landing page imersiva com simulador baseado na Tabela FIPE, autenticação de usuários, painel administrativo e telas para acompanhamento de apólices.

## Destaques

- **Home premium e responsiva** com animações, carros em destaque e seção institucional.
- **Simulador de seguro** integrado à API pública da FIPE.
- **Cotação estimada** com mensalidade, franquia e percentual de cobertura.
- **Login e cadastro** conectados à API TrustWay.
- **Controle de acesso** por tipo de usuário, redirecionando administradores e clientes.
- **Painel administrativo** para consulta, criação, edição e exclusão de apólices.
- **Busca de apólices** por nome, CPF ou placa.
- **Detalhes do veículo** vinculados a cada apólice.
- **Relatórios e gestão de colaboradores** em áreas dedicadas.
- **Feedback visual** com toasts, loaders e estados de erro.

## Tecnologias

| Camada | Ferramentas |
| --- | --- |
| Interface | React, TypeScript, Vite |
| Estilização | Tailwind CSS, CSS customizado |
| Navegação | React Router DOM |
| HTTP | Axios, Fetch API |
| Animações | Framer Motion |
| Ícones | Lucide React, Phosphor Icons |
| Notificações | React Toastify |
| Qualidade | ESLint |

## Integrações

### API TrustWay

A aplicação consome a API principal em:

```ts
https://trustway.onrender.com
```

Serviços disponíveis em `src/services/Service.ts`:

- `login`
- `cadastrarUsuario`
- `buscar`
- `cadastrar`
- `atualizar`
- `deletar`
- `obterHeaderAutenticado`

### API FIPE

O simulador da Home usa a API pública da FIPE para buscar marcas, modelos, anos e valores de veículos:

```ts
https://parallelum.com.br/fipe/api/v1/carros
```

## Rotas principais

| Rota | Descrição |
| --- | --- |
| `/` | Home pública |
| `/home` | Home pública |
| `/login` | Login do usuário |
| `/cadastro` | Cadastro de usuário |
| `/admcliente` | Administração de clientes |
| `/apolices` | Gestão de apólices |
| `/minhas-apolices` | Área de apólices do usuário |
| `/relatorios` | Relatórios |
| `/gestao-colaborador` | Gestão de colaboradores |

## Estrutura do projeto

```txt
src/
  assets/              # Imagens, vídeo e fotos da equipe
  components/          # Navbar, footer, cursor e componentes compartilhados
  models/              # Tipagens de Apólice e Veículo
  pages/               # Telas da aplicação
  services/            # Cliente HTTP e helpers de autenticação
  App.tsx              # Definição das rotas
  main.tsx             # Entrada da aplicação
```

## Como executar

### Pré-requisitos

- Node.js instalado
- npm instalado

### Instalação

```bash
npm install
```

### Ambiente de desenvolvimento

```bash
npm run dev
```

Depois, acesse a URL exibida no terminal. Normalmente:

```txt
http://localhost:5173
```

### Build de produção

```bash
npm run build
```

### Pré-visualização do build

```bash
npm run preview
```

### Verificação com ESLint

```bash
npm run lint
```

## Scripts disponíveis

| Comando | Função |
| --- | --- |
| `npm run dev` | Inicia o servidor Vite |
| `npm run build` | Gera o build de produção |
| `npm run preview` | Executa uma prévia do build |
| `npm run lint` | Analisa o código com ESLint |

## Fluxo de autenticação

1. O usuário informa e-mail e senha em `/login`.
2. O front envia os dados para `/usuarios/logar`.
3. O token retornado é salvo no `localStorage`.
4. O sistema busca os dados completos do usuário pelo CPF.
5. O tipo do usuário define o redirecionamento:
   - Administrador: `/admcliente`
   - Cliente: `/minhas-apolices`

## 👩‍💻 Equipe

<p align="center">

<a href="https://github.com/BiiaBraga">
<img src="https://github.com/BiiaBraga.png" width="120"/>
</a>

<a href="https://github.com/jbgx014">
<img src="https://github.com/jbgx014.png" width="120"/>
</a>

<a href="https://github.com/macedoo15">
<img src="https://github.com/macedoo15.png" width="120"/>
</a>

<a href="https://github.com/lou-godoi">
<img src="https://github.com/lou-godoi.png" width="120"/>
</a>

<a href="https://github.com/luannaalcantara">
<img src="https://github.com/luannaalcantara.png" width="120"/>
</a>

<a href="https://github.com/lucaaas-araujo">
<img src="https://github.com/lucaaas-araujo.png" width="120"/>
</a>

</p>

## Status

Projeto finalizado com sucesso, entregando uma interface moderna em React totalmente integrada à API TrustWay, além de recursos avançados de simulação veicular conectados à Tabela FIPE, proporcionando eficiência, desempenho e uma experiência completa ao usuário.

---

<p align="center">
  Feito com dedicação pela equipe TrustWay.
</p>
