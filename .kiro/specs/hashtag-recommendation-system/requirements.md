# Requirements Document

## Introduction

Este documento define os requisitos para implementar um sistema de hashtags nos posts e um sistema de recomendações inteligentes (posts e usuários) baseado em relacionamentos no Neo4j, similar ao Twitter. O sistema utilizará o grafo de relacionamentos para sugerir conteúdo e pessoas relevantes baseado em likes, hashtags compartilhadas e conexões sociais.

## Requirements

### Requirement 1: Sistema de Hashtags em Posts

**User Story:** Como um usuário da plataforma, eu quero adicionar hashtags aos meus posts, para que eu possa categorizar meu conteúdo e torná-lo mais descobrível para outros usuários interessados nos mesmos tópicos.

#### Acceptance Criteria

1. WHEN um usuário escreve um post com texto contendo "#" seguido de caracteres alfanuméricos THEN o sistema SHALL extrair automaticamente as hashtags do conteúdo
2. WHEN um post é criado com hashtags THEN o sistema SHALL armazenar as hashtags tanto no PostgreSQL quanto criar nós e relacionamentos no Neo4j
3. WHEN um usuário clica em uma hashtag THEN o sistema SHALL exibir uma página com todos os posts que contêm aquela hashtag
4. WHEN um post contém múltiplas hashtags THEN o sistema SHALL processar e armazenar todas as hashtags encontradas
5. IF uma hashtag já existe no sistema THEN o sistema SHALL reutilizar o nó existente no Neo4j ao invés de criar um duplicado
6. WHEN um post é exibido THEN as hashtags no conteúdo SHALL ser renderizadas como links clicáveis
7. WHEN um usuário busca por hashtags THEN o sistema SHALL retornar hashtags ordenadas por popularidade (número de posts)

### Requirement 2: Recomendações de Posts Baseadas em Grafo

**User Story:** Como um usuário da plataforma, eu quero ver posts recomendados relevantes para mim, para que eu possa descobrir conteúdo interessante baseado nos meus interesses e nas pessoas que eu sigo.

#### Acceptance Criteria

1. WHEN um usuário acessa o feed THEN o sistema SHALL incluir posts recomendados baseados em múltiplos fatores do grafo
2. WHEN o sistema calcula recomendações de posts THEN ele SHALL considerar posts com hashtags que o usuário frequentemente interage
3. WHEN o sistema calcula recomendações de posts THEN ele SHALL considerar posts curtidos por pessoas que o usuário segue
4. WHEN o sistema calcula recomendações de posts THEN ele SHALL considerar posts de usuários similares (que compartilham interesses via hashtags)
5. IF um usuário curtiu posts com determinadas hashtags THEN o sistema SHALL priorizar posts com as mesmas hashtags
6. WHEN posts recomendados são retornados THEN eles SHALL ser ordenados por relevância (score calculado pelo algoritmo)
7. WHEN o sistema não encontra posts suficientes baseados em relacionamentos THEN ele SHALL complementar com posts populares recentes
8. WHEN um usuário já viu ou interagiu com um post THEN esse post SHALL ser excluído das recomendações

### Requirement 3: Recomendações de Usuários Baseadas em Grafo

**User Story:** Como um usuário da plataforma, eu quero receber sugestões inteligentes de pessoas para seguir, para que eu possa expandir minha rede com usuários que compartilham interesses similares aos meus.

#### Acceptance Criteria

1. WHEN um usuário solicita sugestões de pessoas para seguir THEN o sistema SHALL retornar usuários baseados em múltiplos fatores do grafo
2. WHEN o sistema calcula sugestões de usuários THEN ele SHALL priorizar usuários que usam hashtags similares às que o usuário atual usa
3. WHEN o sistema calcula sugestões de usuários THEN ele SHALL considerar usuários que curtiram os mesmos posts
4. WHEN o sistema calcula sugestões de usuários THEN ele SHALL considerar amigos de amigos (2º grau de conexão)
5. IF dois usuários curtiram múltiplos posts com as mesmas hashtags THEN eles SHALL ter maior score de similaridade
6. WHEN sugestões de usuários são retornadas THEN elas SHALL ser ordenadas por score de relevância
7. WHEN o sistema não encontra usuários suficientes baseados em relacionamentos THEN ele SHALL complementar com usuários populares
8. WHEN um usuário já segue alguém THEN esse usuário SHALL ser excluído das sugestões

### Requirement 4: Trending Hashtags

**User Story:** Como um usuário da plataforma, eu quero ver quais hashtags estão em alta no momento, para que eu possa descobrir tópicos populares e participar de conversas relevantes.

#### Acceptance Criteria

1. WHEN um usuário acessa a página de trending THEN o sistema SHALL exibir as hashtags mais usadas em um período de tempo específico
2. WHEN o sistema calcula trending hashtags THEN ele SHALL considerar o número de posts nas últimas 24 horas
3. WHEN o sistema calcula trending hashtags THEN ele SHALL considerar o número de usuários únicos que usaram a hashtag
4. WHEN trending hashtags são exibidas THEN cada hashtag SHALL mostrar o número de posts associados
5. IF uma hashtag teve crescimento significativo THEN ela SHALL ser marcada como "em alta" ou "trending"
6. WHEN um usuário clica em uma trending hashtag THEN ele SHALL ser direcionado para a página de posts daquela hashtag
7. WHEN trending hashtags são calculadas THEN o sistema SHALL atualizar a lista periodicamente (ex: a cada 15 minutos)

### Requirement 5: Análise de Similaridade entre Usuários

**User Story:** Como um usuário da plataforma, eu quero que o sistema identifique usuários com interesses similares aos meus, para que as recomendações sejam mais precisas e relevantes.

#### Acceptance Criteria

1. WHEN o sistema calcula similaridade entre usuários THEN ele SHALL usar algoritmos de grafo do Neo4j
2. WHEN dois usuários compartilham hashtags em seus posts THEN o sistema SHALL criar uma relação de similaridade no grafo
3. WHEN dois usuários curtem posts com as mesmas hashtags THEN o score de similaridade SHALL aumentar
4. WHEN dois usuários seguem pessoas em comum THEN o score de similaridade SHALL aumentar
5. IF o score de similaridade entre dois usuários é alto THEN eles SHALL aparecer nas sugestões um do outro
6. WHEN a similaridade é calculada THEN o sistema SHALL considerar a recência das interações (interações recentes têm mais peso)
7. WHEN a similaridade é calculada THEN o sistema SHALL normalizar os scores para uma escala de 0 a 1

### Requirement 6: Performance e Escalabilidade

**User Story:** Como desenvolvedor do sistema, eu quero que as consultas de recomendação sejam rápidas e escaláveis, para que a experiência do usuário não seja prejudicada mesmo com grande volume de dados.

#### Acceptance Criteria

1. WHEN uma consulta de recomendação é executada THEN ela SHALL retornar resultados em menos de 500ms
2. WHEN hashtags são indexadas no Neo4j THEN o sistema SHALL criar índices apropriados para otimizar buscas
3. WHEN o grafo cresce THEN as consultas SHALL manter performance aceitável através de índices e otimizações
4. IF uma consulta de recomendação demora muito THEN o sistema SHALL ter um timeout e retornar resultados parciais
5. WHEN múltiplos usuários solicitam recomendações simultaneamente THEN o sistema SHALL processar as requisições sem degradação significativa
6. WHEN dados são sincronizados entre PostgreSQL e Neo4j THEN a operação SHALL ser assíncrona para não bloquear o usuário
7. WHEN o cache de recomendações expira THEN o sistema SHALL recalcular em background

### Requirement 7: Integração com Sistema Existente

**User Story:** Como desenvolvedor do sistema, eu quero que o novo sistema de hashtags e recomendações se integre perfeitamente com o código existente, para que não haja quebras de funcionalidade e a manutenção seja facilitada.

#### Acceptance Criteria

1. WHEN um post é criado THEN o sistema SHALL manter a compatibilidade com a estrutura atual de posts
2. WHEN hashtags são adicionadas THEN elas SHALL ser armazenadas sem modificar significativamente o schema atual do Post
3. WHEN o Neo4j está indisponível THEN o sistema SHALL continuar funcionando com funcionalidade reduzida (sem recomendações)
4. IF o serviço de recomendações falha THEN o sistema SHALL fazer fallback para o comportamento atual
5. WHEN novos endpoints de API são criados THEN eles SHALL seguir os padrões de autenticação e validação existentes
6. WHEN o frontend consome as novas APIs THEN ele SHALL manter a compatibilidade com componentes existentes
7. WHEN testes são executados THEN o sistema SHALL incluir testes para as novas funcionalidades de hashtags e recomendações
