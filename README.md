# ufabchess-frontend

Eu tava pensando em migrar o site da UFACHESS, que tá no Google Sites pra o meu GitHub Pages. Acho que eu vou ter mais liberdade.

Migrar do Google Sites para o GitHub Pages te dá muito mais liberdade. No Google Sites você fica preso ao editor deles, com poucas opções de layout, código e performance. No GitHub Pages você controla tudo com HTML, CSS e JavaScript, pode versionar o site, trabalhar por commits e evoluir com o tempo.

Alguns pontos importantes para pensar antes de migrar:

- O Google Sites é totalmente dinâmico e “pronto”. No GitHub Pages tudo é estático, então formulários, comentários ou áreas interativas exigem serviços externos.

- O site é mais institucional e informativo, o GitHub Pages é perfeito.


Um caminho bem comum e recomendado:

- Criar o site no GitHub Pages usando algo simples como HTML puro.

- Replicar primeiro o conteúdo atual do Google Sites.

- Depois melhorar layout, organização e identidade visual aos poucos.

A única coisa que é atualizada constantemente são as tabelas que a gente incorpora do Google Planilhas.

Dá para incorporar tabelas do Google Planilhas no GitHub Pages e elas continuam atualizando automaticamente.
Isso funciona porque quem faz a atualização é o próprio Google, não o site. O GitHub Pages só exibe o conteúdo incorporado.

Pontos importantes para não ter dor de cabeça:

- A planilha precisa estar publicada ou pública para leitura.

- Não dá para proteger dados sensíveis se for público.

- O iframe é o jeito mais rápido e robusto.

- JavaScript é melhor se você quiser identidade visual consistente com o site.


Eu quero transformar o que a gente usa no Google Planilhas, tipo o cadastro dos membros do clube, as pontuações, tudo. Eu quero migrar, eu quero inserir isso em tabelas de SQL, eu quero construir uma base de dados em SQL. Eu já posso mostrar no meu portfólio que eu uso SQL, nem no Google Planilhas ou portfólio.

Quero transformar um projeto operacional em um projeto técnico de portfólio.


- Google Planilhas é uma ferramenta de planilha.
- SQL em um SGBD relacional é uma base de dados de verdade.
- Migrar de planilhas para SQL é uma evolução clara de maturidade técnica.

2. Arquitetura 100% gratuita que faz sentido
Você precisa separar três coisas: frontend, backend e banco de dados.

Frontend
- HTML, CSS e JavaScript puro
- Hospedado no GitHub Pages
- Zero custo

Banco de dados
PostgreSQL gratuito em nuvem
- Supabase

Backend
Preciso de um backend porque GitHub Pages não fala direto com banco SQL.

Opções gratuitas:
- Backend em Python com FasAPI.
- Hospedado no Render
- Esse backend expõe uma API REST.

Fluxo fica assim:
Site estático → JavaScript → API Python → Banco SQL

Custos reais

- GitHub Pages: grátis.

- Supabase: grátis.

- Render: grátis.

- Domínio: opcional.