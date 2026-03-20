# 📺 CompararTVs

Aplicativo de comparação de TVs com IA **gratuita**. Compare modelos lado a lado por tecnologia de tela, resolução, preço, reviews e muito mais — com ranking inteligente gerado pelo Google Gemini.

## Funcionalidades

- **3 formas de adicionar TVs:**
  - 🔗 **Link da loja** — Amazon, Mercado Livre, Kabum, Magazine Luiza ou qualquer site
  - 📝 **Modelo** — ex: `Samsung QN55Q80C`, `LG OLED55C3`
  - 📸 **Foto da caixa** — tire uma foto ou arraste uma imagem; a IA reconhece o modelo automaticamente

- **Comparação completa:**
  - Tecnologia de tela (OLED, QLED, Mini-LED, LED...)
  - Resolução, tamanho, taxa de atualização, HDR, Smart TV
  - Melhor preço encontrado
  - Reviews e avaliações de múltiplas fontes
  - Ranking inteligente com análise detalhada e recomendação final

## Configuração (100% gratuito)

1. Clone o repositório e instale as dependências:
   ```bash
   npm install
   ```

2. Obtenha sua chave **gratuita** do Google Gemini:
   - Acesse [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
   - Faça login com sua conta Google
   - Clique em **"Create API Key"**
   - Copie a chave gerada

3. Crie o arquivo `.env.local` na raiz do projeto:
   ```
   GEMINI_API_KEY=AIzaSy...
   ```

4. Inicie o servidor:
   ```bash
   npm run dev
   ```

5. Acesse [http://localhost:3000](http://localhost:3000)

> **Limites gratuitos do Gemini 1.5 Flash:** 15 req/min · 1 milhão de tokens/dia — mais que suficiente para uso pessoal.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS** para estilização
- **Google Gemini 1.5 Flash** (gratuito) — análise de specs, reconhecimento de imagem e ranking
- **Axios + Cheerio** para scraping de lojas
