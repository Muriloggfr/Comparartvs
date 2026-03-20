# 📺 CompararTVs

Aplicativo de comparação de TVs com IA. Compare modelos lado a lado por tecnologia de tela, resolução, preço, reviews e muito mais — com ranking inteligente gerado pelo Claude AI.

## Funcionalidades

- **3 formas de adicionar TVs:**
  - 🔗 **Link da loja** — Amazon, Mercado Livre, Kabum, Magazine Luiza ou qualquer site
  - 📝 **Modelo** — ex: `Samsung QN55Q80C`, `LG OLED55C3`
  - 📸 **Foto da caixa** — tire uma foto ou arraste uma imagem; a IA reconhece o modelo

- **Comparação completa:**
  - Tecnologia de tela (OLED, QLED, Mini-LED, LED...)
  - Resolução, tamanho, taxa de atualização, HDR, Smart TV
  - Melhor preço encontrado
  - Reviews e avaliações de múltiplas fontes
  - Ranking inteligente com análise detalhada e recomendação final

## Configuração

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie o arquivo `.env.local` com sua chave da API Anthropic:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
   Obtenha sua chave em [console.anthropic.com](https://console.anthropic.com)

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Acesse [http://localhost:3000](http://localhost:3000)

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS** para estilização
- **Claude AI** (claude-sonnet-4-6) para análise de specs, reconhecimento de imagem e geração de ranking
- **Axios + Cheerio** para scraping de lojas
