# MottoRadar — MVP com base de integração

Aplicação responsiva construída com Next.js, TypeScript e Supabase. O ZIP contém a interface original e uma base de backend para ler o catálogo e receber dados normalizados de fontes autorizadas.

## O que existe nesta versão

- Página responsiva com pesquisa e filtros para motos.
- Leitura do catálogo por `GET /api/catalog`, que usa o Supabase configurado no servidor.
- Endpoint protegido `POST /api/ingest` para importar motos e produtos já normalizados.
- Banco com anúncios de motos novas/usadas, acessórios/equipamentos, fontes e execuções de sincronização.
- Chave de serviço do Supabase e segredo de ingestão usados apenas no servidor.
- A interface mantém a vitrine fictícia identificada como demonstração até o banco estar configurado e conter dados reais.

**Ainda não há portais externos conectados por padrão.** Cada integração exige identificar uma API/feed permitido, revisar seus termos, implementar um adaptador específico e testar a qualidade dos dados. Não faça scraping que viole os termos de um site nem contorne controles de acesso.

## Ferramentas sugeridas

- Supabase (PostgreSQL) para banco de dados.
- Vercel para hospedar o Next.js.
- GitHub para guardar o código.
- APIs e feeds autorizados das fontes, priorizando opções gratuitas.

Planos gratuitos têm limites e podem mudar; confira as condições atuais antes de publicar.

## Rodar localmente

Requisitos: Node.js 20.9+.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`. Sem Supabase configurado, a página continua em modo de demonstração.

## Configurar o Supabase

1. Crie um projeto no Supabase.
2. No SQL Editor, execute todo o arquivo `supabase/schema.sql` em um projeto novo. Se já executou uma versão anterior, revise/execute as alterações de esquema sem duplicar políticas existentes.
3. Copie `.env.example` para `.env.local` e preencha:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: chave pública anon/publishable (reservada para uso público; pode ficar vazia nesta versão se não for usada pelo cliente).
   - `SUPABASE_SERVICE_ROLE_KEY`: chave de serviço do Supabase, **somente no servidor**.
   - `INGEST_SECRET`: segredo longo e aleatório para proteger a rota de ingestão.
4. Nunca coloque `SUPABASE_SERVICE_ROLE_KEY` ou `INGEST_SECRET` em variáveis `NEXT_PUBLIC_*`, repositórios públicos, prints ou código executado no navegador.
5. Faça deploy novamente depois de cadastrar as variáveis no ambiente de hospedagem.

## Endpoint de ingestão

`POST /api/ingest`

Cabeçalho:

```http
Authorization: Bearer SEU_INGEST_SECRET
Content-Type: application/json
```

Exemplo de corpo com dados de teste **fictícios** — não use como anúncio real:

```json
{
  "sourceName": "Fornecedor de teste",
  "sourceUrl": "https://example.com",
  "listings": [
    {
      "externalId": "demo-001",
      "title": "Moto de demonstração",
      "brand": "Marca exemplo",
      "model": "Modelo exemplo",
      "year": 2024,
      "mileageKm": 0,
      "priceBrl": 10000,
      "url": "https://example.com/anuncio-demo",
      "condition": "new"
    }
  ],
  "products": [
    {
      "externalId": "demo-capacete-001",
      "title": "Capacete de demonstração",
      "category": "Capacetes",
      "priceBrl": 299.9,
      "url": "https://example.com/produto-demo",
      "inStock": true
    }
  ]
}
```

A rota aceita até 500 registros por chamada, valida os campos básicos e faz upsert por fonte + ID externo/URL. O adaptador de cada fornecedor deve obter dados de acordo com a documentação e permissões da fonte, convertê-los para este formato e enviar o lote. A rota não coleta dados automaticamente sozinha.

## Conectar uma fonte real

Para cada fonte, precisamos:

1. Confirmar que oferece API, feed ou outro método permitido.
2. Documentar autenticação, limites, atribuição exigida e regras de uso.
3. Criar um adaptador isolado para buscar e normalizar dados.
4. Agendar a execução no servidor/worker (por exemplo, cron da hospedagem), respeitando os limites da fonte.
5. Monitorar falhas e registros antigos; não declarar um anúncio indisponível sem uma verificação confiável.
6. Validar os links, preços, moeda, duplicatas e datas de atualização.

## Antes de publicar

- Defina `SUPABASE_SERVICE_ROLE_KEY` e `INGEST_SECRET` como segredos de ambiente.
- Revise as políticas RLS e execute o SQL em ambiente de teste primeiro.
- Configure monitoramento, limites de uso, termos de privacidade e contato do projeto.
- Rode `npm run build` e teste busca, banco e importação antes de anunciar o serviço publicamente.
