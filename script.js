document.addEventListener("DOMContentLoaded", () => {
    console.log('Página completamente carregada. JavaScript rodando!');

    const likeButtons = document.querySelectorAll('.like-btn');

    likeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault(); // Impede o comportamento padrão do botão
            const countSpan = button.querySelector('.count');
            if (countSpan) {
                let currentCount = parseInt(countSpan.textContent, 10) || 0;
                currentCount++;
                countSpan.textContent = `${currentCount}`;
                button.classList.add('liked');
                console.log('Post curtido! Nova contagem:', currentCount);
            } else {
                console.warn('Elemento .count não encontrado dentro do botão .like-btn.');
            }
        });
    });

    const commentToggleButtons = document.querySelectorAll('.comment-btn');

    commentToggleButtons.forEach(button => {
        const postArticle = button.closest('.post');
        if (postArticle) {
            const commentsContainer = postArticle.querySelector('.post-comments');
            if (commentsContainer) {
                commentsContainer.style.display = 'none';
                button.dataset.originalButtonText = button.textContent.trim();

                button.addEventListener('click', (event) => {
                    event.preventDefault(); // Impede o comportamento padrão do botão

                    const isHidden = commentsContainer.style.display === 'none';
                    if (isHidden) {
                        commentsContainer.style.display = 'block';
                        button.textContent = `Ocultar comentários`;
                        console.log('Comentários Exibidos!');
                    } else {
                        commentsContainer.style.display = 'none';
                        button.textContent = button.dataset.originalButtonText;
                        console.log('Comentários Ocultados!');
                    }
                });
            } else {
                console.warn('Botão .comment-btn encontrado, mas sem container .post-comments correspondente.', postArticle);
            }
        } else {
            console.warn('Botão .comment-btn encontrado, mas sem elemento .post correspondente.');
        }
    });
});

// --- Funcionalidade: Carregar Mais Posts ---

// Dados de exemplo para simular posts que viriam de um "servidor"
// Substitua por dados reais ou remova quando conectar a um backend
const mockPostsData = [
    {
        author: "Johnny Bravo",
        time: "3 dias atrás",
        avatarUrl: "imagens/Johnny-Bravo-Profile1.jpg",
        content: "🕶️ Johnny Bravo 🏖️ Feriado chegando e a máquina de charme está ligada! Partiu praia, moça? Tenho protetor solar de carisma fator 1000!\n\n#JohnnyBravo #Feriado #Praia #Charme #OndaDoMarBravo #BronzeadoDeDeus",
        imageUrl: "imagens/Johnny-Bravo-Photo2.jpg", // URL de imagem vazia para post só com texto
        likes: 42,
        comments: 9,
        showComments: false, // Começa escondido
        postId: "post3" // ID único do post (importante para backend)
    },
     {
        author: "Johnny Bravo",
        time: "4 dias atrás",
        avatarUrl: "imagens/Johnny-Bravo-Profile2.jpg",
        content: "😎 Johnny Bravo na cozinha? SIM! Aprendi a fazer sanduíche... usando meus bíceps para misturar a maionese. Moça, quer um lanchinho fitness feito com puro charme?\n\n💪 #CozinhaFit #JohnnyChef #Fitness #GastronomiaDeCharme",
        imageUrl: "imagens/Johnny-Bravo-Photo3.jpg", // Exemplo de imagem
        likes: 65,
        comments: 12,
        showComments: false, // Começa escondido
         postId: "post4" // ID único do post
    }
    // Adicione mais objetos de posts fictícios aqui se quiser
];

let postsLoaded = 0; // Contador de posts já carregados
const postsPerLoad = 2; // Quantos posts carregar por vez (ajuste se quiser)

// Função para gerar o HTML de um post individual a partir de um objeto de post
function createPostHTML(post) {
    const postHTML = `
        <article class="post" data-post-id="${post.postId}">
            <div class="post-header">
                <div class="post-author">
                    <img src="${post.avatarUrl}" alt="Avatar do autor do post" class="author-avatar">
                    <div>
                        <span class="author-name">${post.author}</span>
                        <span class="post-time">${post.time}</span>
                    </div>
                </div>
                <div class="post-options">...</div>
            </div>
            <div class="post-content">
                <p>${post.content.replace(/\n/g, '<br>')}</p> <!-- Substitui quebras de linha por <br> para HTML -->
                ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Imagem do post">` : ''} <!-- Adiciona imagem apenas se houver URL -->
            </div>
            <div class="post-actions">
                <a href="#" class="like-btn">Curtir <span class="count">(${post.likes})</span></a>
                <a href="#" class="comment-btn">Comentar <span class="count">(${post.comments})</span></a>
                <a href="#" class="share-btn">Compartilhar</a>
            </div>
            <!-- Área de comentários - Ficará escondida por padrão se usar o CSS -->
            <div class="post-comments" style="display: none;">
                <!-- Comentários para este post viriam aqui dinamicamente também,
                     mas para simplificar agora, eles não são carregados com "Carregar Mais".
                     Se quiser simular comentários tbm, teríamos que adaptar essa parte. -->
                <div class="comment">
                    <!-- Exemplo simples -->
                    <img src="imagens/JennyBravo.jpg" alt="Avatar Comentário" class="comment-avatar">
                    <div class="comment-text">
                        <span class="comment-author">Jenny Bravo</span>
                        <p>Lindo!</p>
                    </div>
                </div>
            </div>
        </article>
    `;
    return postHTML;
}


// Seleciona o botão "Carregar Mais"
const loadMoreButton = document.getElementById('loadMoreButton'); // Usando o ID definido no HTML

// Seleciona o contêiner onde os posts são adicionados (seu .profile-feed)
const postsContainer = document.querySelector('.profile-feed');

// Verifica se o botão e o container existem antes de adicionar o listener
if (loadMoreButton && postsContainer) {
    loadMoreButton.addEventListener('click', () => {

        // Desabilita o botão enquanto carrega
        loadMoreButton.disabled = true;
        loadMoreButton.textContent = 'Carregando...'; // Opcional: Mudar texto do botão

        // Simula um delay de rede (opcional, para ver o "Carregando...")
        setTimeout(() => {
            // Calcula quais posts carregar agora
            const startIndex = postsLoaded;
            const endIndex = postsLoaded + postsPerLoad;
            const postsToLoad = mockPostsData.slice(startIndex, endIndex);

            // Verifica se há posts para carregar
            if (postsToLoad.length > 0) {
                postsToLoad.forEach(postData => {
                    const newPostHTML = createPostHTML(postData);
                    // Cria um elemento temporário para converter a string HTML em elemento DOM
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = newPostHTML.trim();
                    const newPostElement = tempDiv.firstChild; // O elemento article do post

                    // Adiciona o novo post ao final do contêiner de posts
                    postsContainer.appendChild(newPostElement);

                    // Após adicionar o novo post, é necessário adicionar novamente os "ouvintes" de eventos
                    // (Curtir e Comentar toggle) para ESTE novo post, pois eles não vêm automáticos com o HTML gerado.
                    // --- Reaplica Event Listeners para o NOVO Post ---

                    // Botão de Curtir no novo post
                    const newLikeButton = newPostElement.querySelector('.like-btn');
                    if (newLikeButton) {
                         newLikeButton.addEventListener('click', (event) => {
                             event.preventDefault();
                             const countSpan = newLikeButton.querySelector('.count');
                             let currentCount = parseInt(countSpan.textContent.replace('(', '').replace(')', ''), 10);
                             currentCount++;
                             countSpan.textContent = `(${currentCount})`;
                             newLikeButton.classList.add('liked');
                             console.log('Novo post curtido! Nova contagem:', currentCount);
                         });
                    }

                    // Botão de Comentar Toggle no novo post
                     const newCommentToggleButton = newPostElement.querySelector('.comment-btn');
                     const newCommentsContainer = newPostElement.querySelector('.post-comments');

                     if (newCommentToggleButton && newCommentsContainer) {
                         // Esconde os comentários do novo post por padrão via JS
                         newCommentsContainer.style.display = 'none';

                         // Salva o texto original do botão antes de mudar
                         const countSpanInner = newCommentToggleButton.querySelector('.count');
                         if (countSpanInner) {
                             const initialButtonText = newCommentToggleButton.textContent.replace(countSpanInner.textContent, '').trim();
                              newCommentToggleButton.dataset.originalButtonText = initialButtonText;
                         } else {
                             newCommentToggleButton.dataset.originalButtonText = newCommentToggleButton.textContent.trim();
                         }

                         newCommentToggleButton.addEventListener('click', (event) => {
                            event.preventDefault();
                            const isHidden = newCommentsContainer.style.display === 'none';
                            newCommentsContainer.style.display = isHidden ? 'block' : 'none';

                            // Alterna o texto do botão (opcional)
                            const countSpanInnerAgain = newCommentToggleButton.querySelector('.count');
                            if (isHidden) {
                                newCommentToggleButton.textContent = `Ocultar Comentários ${countSpanInnerAgain.textContent}`;
                            } else {
                                newCommentToggleButton.textContent = `${newCommentToggleButton.dataset.originalButtonText} ${countSpanInnerAgain.textContent}`;
                            }
                         });
                     } else {
                         console.warn('Elemento de comentários ou botão de toggle não encontrado para novo post carregado.');
                     }
                    // --- Fim da Reaplição de Event Listeners ---

                });

                // Atualiza o contador de posts carregados
                postsLoaded += postsToLoad.length;

                // Habilita o botão de novo e volta o texto
                loadMoreButton.disabled = false;
                loadMoreButton.textContent = 'Carregar Mais Posts';

                // Verifica se ainda há posts para carregar. Se não, esconde o botão.
                if (postsLoaded >= mockPostsData.length) {
                    loadMoreButton.style.display = 'none'; // Esconde o botão quando não há mais posts
                    console.log('Todos os posts mock foram carregados.');
                }

            } else {
                // Não há mais posts para carregar
                loadMoreButton.style.display = 'none'; // Esconde o botão
                console.log('Não há mais posts para carregar.');
            }
        }, 1000); // Simula delay de 1 segundo (1000ms)
    });
} else {
     console.error('Botão "Carregar Mais" ou container de posts não encontrado no DOM.');
}

// --- Funcionalidade: Mensagem no Logout ---

// Seleciona o link de Logout pelo seu ID
const logoutLink = document.getElementById('logoutLink');

// A mensagem que você quer exibir
const logoutMessageText = "O mundo lá fora pode ser frio e sem graça... Aqui, você tem Johnny Bravo!";

// Duração que a mensagem ficará visível (em milissegundos)
const messageDuration = 4000; // 4 segundos

// Verifica se o link de logout foi encontrado
if (logoutLink) {
    // Adiciona o ouvinte para o evento de clique no link
    logoutLink.addEventListener('click', (event) => {
        // Previne o comportamento padrão do link (navegar para login.html)
        // Remova esta linha (event.preventDefault()) SE quiser que o site realmente vá
        // para a página de login DEPOIS de mostrar a mensagem.
        event.preventDefault();

        // Verifica se já existe uma mensagem na tela para evitar duplicidade
        if (!document.querySelector('.logout-message')) {

            // 1. Cria o elemento div para a mensagem
            const messageElement = document.createElement('div');

            // 2. Adiciona a classe CSS para estilização
            messageElement.classList.add('logout-message');

            // 3. Adiciona o conteúdo (a mensagem dentro de um parágrafo, por exemplo)
            // messageElement.textContent = logoutMessageText; // Opção mais simples só com texto
             const messageContent = document.createElement('p');
             messageContent.textContent = logoutMessageText;
             messageElement.appendChild(messageContent); // Adiciona o p dentro da div


            // 4. Adiciona o elemento ao corpo do documento
            document.body.appendChild(messageElement);

            // 5. Dispara o efeito de fade-in
            // Usa setTimeout com um pequeno delay (tipo 10ms) para garantir
            // que a propriedade opacity: 0 seja aplicada antes de mudar para opacity: 1
            // e a transição funcione corretamente.
            setTimeout(() => {
                messageElement.classList.add('visible');
            }, 10); // Um pequeno delay é suficiente

            // 6. Configura um timer para remover a mensagem após messageDuration
            setTimeout(() => {
                // Dispara o efeito de fade-out removendo a classe 'visible'
                messageElement.classList.remove('visible');

                // Ouve o fim da transição de opacidade para remover o elemento APÓS o fade-out
                messageElement.addEventListener('transitionend', () => {
                    // Verifica se o elemento ainda existe no DOM antes de tentar remover
                    // (segurança caso algo mais remova ele)
                    if (messageElement.parentElement) {
                        messageElement.remove(); // Remove o elemento do DOM
                        console.log('Mensagem de logout removida.');
                    }
                }, { once: true }); // { once: true } garante que o evento seja ouvido apenas uma vez
            }, messageDuration); // Tempo que a mensagem fica totalmente visível
        }
    });
} else {
    console.error('Link de Logout com ID "logoutLink" não encontrado.');
}