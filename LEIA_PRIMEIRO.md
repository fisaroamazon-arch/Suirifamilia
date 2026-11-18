# Suiri Família 7.1 — leia primeiro

Este é o projeto completo reorganizado, com as mídias originais. A entrada continua sendo index.html. As quatro páginas principais continuam na raiz: index.html, mulher.html, homem.html e jogos.html.


## Correção da migração 02: IDs em texto

Se a execução anterior informou operator does not exist: text = uuid, execute ROLLBACK; no SQL Editor e rode novamente o arquivo supabase/02_ATUALIZAR_V7.sql inteiro desta entrega. Depois execute supabase/03_TRANSFERENCIAS_V71.sql. A migração 02 agora identifica se a coluna de propriedade é UUID ou texto e compara auth.uid() no tipo correspondente. Nenhum tipo de coluna ou registro de saúde foi convertido. O JavaScript do site não mudou nesta correção.

## Atualização 7.1: transferências corrigidas

Esta é a versão completa do site, com as mídias da versão anterior e a correção de transferências. O banco não foi acessado nem alterado por esta entrega.

Se a migração V7 já foi aplicada, execute somente supabase/03_TRANSFERENCIAS_V71.sql no SQL Editor do Supabase para esta correção. Depois publique os arquivos desta versão completa no mesmo endereço do site e reabra a página. A configuração do seu projeto continua em src/core/config.js.

Se ainda usa a base anterior à V7, siga as instruções abaixo: primeiro supabase/01_DIAGNOSTICO.sql e a migração supabase/02_ATUALIZAR_V7.sql, depois supabase/03_TRANSFERENCIAS_V71.sql. As colunas recebidas nesta conversa confirmam membros, famílias e os dois extratos, mas não confirmam todas as tabelas exigidas pela migração 02. Se ela indicar uma incompatibilidade, envie o erro para adaptação; não remova as verificações.

Após executar o arquivo 03, a função antiga de quatro parâmetros passa a responder pedindo atualização do site. Isso impede que uma tela antiga continue enviando transferências sem identificador. A tela nova chama transferir_saldo_familiar_v71 com cinco parâmetros. SQL e site precisam ser atualizados juntos.

Se houver diferença entre o saldo antigo e o extrato, consulte supabase/04_CONFERIR_SALDOS_V71.sql, que é somente leitura. A fonte oficial passa a ser transacoes, igual à carteira da V7. Nenhum valor da tabela antiga foi somado, copiado ou apagado automaticamente. Um crédito inicial ou ajuste só deve ser lançado depois de conferir a origem da diferença.

Leia docs/TRANSFERENCIAS_V71.html para os detalhes e os limites da correção.

## Para testar pelo celular

1. Extraia TODO o ZIP. Mantenha as pastas src, styles, assets e vendor junto do index.html. Elas são necessárias.
2. Guarde a versão anterior para poder voltar a ela.
3. Antes de publicar a V7, prepare o banco em um projeto de teste: no Supabase, abra SQL Editor → New query. Abra supabase/01_DIAGNOSTICO.sql no editor do celular, copie o conteúdo pelo próprio editor e execute no projeto correto. Esse primeiro arquivo é somente leitura.
4. Faça backup do banco e teste supabase/02_ATUALIZAR_V7.sql na homologação. Ele verifica as tabelas/colunas antes de aplicar alterações, preserva os registros e cria as operações da V7. Se indicar falta de tabela ou coluna, não retire a verificação: guarde o diagnóstico e o erro para adaptação ao seu esquema real. O banco não foi alterado por esta entrega.
5. Depois de validar o resultado no projeto de teste, aplique a migração no projeto usado pelo site. A configuração pública atual está em src/core/config.js e foi preservada. Se estiver usando outro projeto de teste, troque ali a URL e a chave publishable desse projeto.
6. Execute também supabase/03_TRANSFERENCIAS_V71.sql. Publique todo o conteúdo da pasta do projeto, com index.html na raiz da pasta servida pelo GitHub Pages/Netlify. Não publique apenas os arquivos JS e não misture os JS antigos da raiz com a V7.
7. Abra o site por HTTPS. A visualização de arquivos locais do TrebEdit/Acode ajuda no layout, mas não equivale a testar instalação, recuperação de senha, câmera, cache e autenticação em um endereço hospedado.
8. No Supabase Auth → URL Configuration, confira a Site URL e a lista de Redirect URLs do seu site. A recuperação volta a index.html e abre o formulário para criar uma senha nova.

Compras, baixas, aportes, XP, mesada, resgates, extrato e criação inicial de família utilizam funções da V7. Se o SQL ainda não foi aplicado, a tela informa a dependência em vez de fazer gravações parciais. O arquivo de migração não substitui o exame das regras RLS que já existiam no projeto.

## Melhorias preservadas da V7

- JavaScript separado por domínio: núcleo, mercado, finanças, família, agenda, missões, cofres, recados, metas, relatórios e módulos pessoais. HTML principal mantido na raiz.
- Imagens, ícones, músicas, vídeos e vozes organizados em assets, com nomes consistentes e caminhos corrigidos. Todos os binários originais foram preservados.
- Bibliotecas Supabase, Chart e html2pdf incluídas localmente, com versões fixadas e licenças. Não é necessário npm para abrir o site hospedado.
- Recuperação de senha, abertura de agendamento, origem de cupom e seções retráteis ganharam implementações. O Pix não inventa uma chave de pagamento: só é disponibilizado quando ela for configurada em src/core/config.js.
- Removido o formulário de mercado duplicado. Corrigido o recorte da foto, o horário 00:00 e vencimentos no final do mês.
- Tema Claro/Escuro/Seguir o celular nas configurações. Navegação entre seis seções integrada ao histórico; zoom permitido e áreas de toque/foco melhoradas.
- Espaços Mulher e Masculino mantidos, disponíveis sem inferência por nome/parentesco. Módulos íntimos não são mais carregados no início geral.
- Dados pessoais locais separados por pessoa. Dados antigos sem dono identificado não foram apagados nem associados automaticamente a alguém.
- Fila offline confere erro, proprietário, família e confirmação local antes de apagar uma pendência. Nesta etapa, a fila automática atende à foto; operações financeiras exigem conexão.
- Operações transacionais da V7 evitam compra parcial, baixa duplicada e XP repetido. Produtos finalizados ficam no banco com vínculo de compra, preservando o histórico.
- Extrato retira descrições/categorias privadas de terceiros no servidor. Valores e autoria continuam compondo o montante familiar, como no comportamento anterior de máscara de detalhes.
- Barreira RLS de família e de recursos pessoais, sem criar políticas permissivas novas para as tabelas existentes. O SQL exige homologação com o esquema real.
- Catálogo de música do Arcade passa a usar as 19 faixas existentes; sons de comida deixam de sortear arquivos ausentes.
- O acervo de reflexões continua com os cinco textos recebidos; nenhuma frase ausente foi inventada.

## Os dados pessoais que já estavam no aparelho

Entre no seu próprio perfil adulto, abra Configurações e use Exportar dados locais antigos para guardar uma cópia. Se os dados forem seus, use Importar meus dados antigos. A importação pede identificação explícita e só preenche chaves novas ainda vazias; os originais permanecem preservados. Dados já identificados por usuário, como a Forja masculina e o mascote, continuam usando o respectivo ID.

## Cupom por IA

A chave Gemini não fica mais no navegador. A função de servidor está em supabase/functions/suiri-ia/index.ts e precisa ser implantada separadamente no Supabase. Configure os Secrets GEMINI_API_KEY e SUIRI_ALLOWED_ORIGINS (origens completas permitidas, separadas por vírgulas, por exemplo o endereço HTTPS do seu site sem caminho). GEMINI_MODEL é opcional. A função valida a sessão e aplica cota de 20 leituras por hora por conta.

A leitura agora preenche um rascunho de lançamento para revisão. Ela não insere produtos automaticamente no carrinho, evitando registrar a mesma compra outra vez no fechamento. O parser de voz local foi preservado. As sugestões locais de refeições continuam disponíveis; a geração remota de cardápio não foi integrada nesta etapa.

## Testes e limites desta entrega

Foram executados testes de DOM, IndexedDB e JavaScript com serviços simulados e testes das funções SQL em PostgreSQL/PGlite com um esquema representativo. Não houve acesso ao banco real, teste visual em navegador renderizado ou teste em aparelho físico. O arquivo docs/TESTES.json registra os resultados específicos.

Esta entrega não declara concluídos os 42 achados da auditoria. Consulte docs/STATUS_DA_AUDITORIA.html para o que foi corrigido, o que está parcial e o que depende de homologação.

Continuam pendentes: validar compatibilidade com o seu SQL/RLS/triggers atuais; testar duas contas reais e dois celulares; revisar integralmente a autorização de administração de membros; confirmar exclusão de Auth e relacionamentos pela RPC original excluir_minha_propria_conta; terminar a sincronização de todos os recursos pessoais e exclusões locais/remotas; revisão editorial/clínica e direitos de conteúdo; compressão dos GIFs/vídeos; envio Push completo; aplicativo Android e publicação em loja.

O service worker armazena o shell e recursos públicos. Ele não guarda respostas autenticadas, nem baixa toda a biblioteca de músicas/animações para uso offline. A permissão de notificações não significa que exista serviço de envio configurado.

## Conferência rápida

1. Entrar, recuperar senha e criar lar com confirmação de e-mail.
2. Abrir todas as seis abas e os espaços pessoais; alternar os três modos de tema.
3. Criar missão, concluir duas vezes e conferir que o XP foi creditado uma vez.
4. Registrar compra, conferir carteira e verificar que os itens ficaram no histórico.
5. Dar baixa numa conta e tentar repetir a baixa em outro celular.
6. Alternar dois perfis e conferir que dados pessoais não se misturam.
7. Testar falha de rede, foto pendente, reconexão e logout. Na transferência, tocar em Consultar novamente deve recuperar a mesma operação sem novo débito.
8. Gerar PDF, voltar entre seções e testar o teclado, zoom e TalkBack no celular.

## Para continuar o desenvolvimento

src/core contém sessão, configuração, armazenamento e navegação; src/services contém os contratos financeiros; src/features contém os domínios; src/data contém repertório e dicas; styles contém os temas; assets contém as mídias; supabase contém a migração e a função opcional de IA. docs/MAPA_DOS_ARQUIVOS.json relaciona os nomes antigos aos novos.

Os scripts continuam clássicos nesta primeira separação, para preservar a API das telas e permitir hospedagem estática sem compilação. A retirada final de handlers inline e a migração para módulos ES são uma próxima etapa. Não mova manualmente arquivos entre pastas sem atualizar referências e testes.

Há testes reproduzíveis e workflow GitHub Actions. Pelo repositório, a aba Actions executa as verificações automaticamente. Quem tiver ambiente Node pode usar npm ci e npm test; isso não é exigido do usuário do site.
