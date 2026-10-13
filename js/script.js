document.addEventListener('DOMContentLoaded', () => {
    const mario = document.querySelector('.mario');
    const pipe = document.querySelector('.pipe');
    const gameBoard = document.getElementById ('game-board');
    const hudPlayerName = document.getElementById('hud-player-name');
    const scoreDisplay = document.getElementById('score-display');
    const jumpTip = document.getElementById('jump-tip');
    const starModal = document.getElementById('start-modal');
    const startForm = document.getElementById('start-form');
    const playerInput = document.getElementById('player-input');
});


    const starModal = document.getElementById('start-modal');
    const startForm = document.getElementById('start-form');
    const playerInput = document.getElementById('player-input');
    const btnViewRanking = document.getElementById('btn-view-ranking');

    const gameoverModal = document.getElementById('gameover-modal');
    const finalScoreValue = document.getElementById('final-score-value');
    const saveStatusMsg = document.getElementById('ranking-body');
    const btnRestart = document.getElementById('btn-restart');
    const btnChangePlayer = document.getElementById('btn-change-player');
    //Variaveis de estado 
    let currentPlayer = '';
    let score = 0;
    let isPlaying = false;
    let gameLoop = null;
    let scoreLoop = null;
    // RECUPERAÇÃO DO ULTIMO NOME DE USUARIO UTILIZADO
    const savedName = localStorage.getItem('mario_jump_player');
    if (savedName && playerInput) {
        playerInput.value = savedName;
    }

    function starGame(){
        // LIMPEI LOOPS ANTERIORES SE EXISTIREM
        clearInterval(gameLoop);
        clearInterval (scoreLoop);
        // RESETEI AS POSIÇÕES VISUAIS
        resetElements();

        isPlaying = true;
        score = 0;
        scoreDisplay.textContent = '0';
        hudPlayerName.textContent = currentPlayer || 'Jogador';
        // Ativa as animações CSS do jogo.
        gameBoard.classList.add('running');

        scoreLoop = setInterval (() => {
            if(isPlaying){
                score +=1;
                scoreDisplay.textContent = score;
            }
        }, 100);

        gameLoop = setInterval(checkCollision, 10);
    }
    // Resetar os estilos e posições do Mario e do Cano (Obstaculo)
    function resetElements(){
        // RESETA O CANO (OBSTACULO)
        pipe.style.animation = '';
        pipe.style.left = '';

        // RESET DO MARIO
        mario.src = '../assets/mario.gif'
        mario.style.animation = '';
        mario.style.bottom = '0px';
        mario.style.width = '';
        mario.style.marginLeft = '';
        mario.classList.remove = ('jump');
        if (jumpTip){
        jumpTip.style.opacity = '1';
        }
    }
    // EXECUTA O PULO DO MARIO
    function jump(){
        if (!isPlaying) return;
        if (mario.classList.contains('jump')) return;

        mario.classList.add('jump');

        if(jumpTip){
            jumpTip.style.opacity = '0';
        }

        setTimeout(() => {
            mario.classList.remove ('jump');
        }, 500);
    }
    // Verificar a colisão entre o Mario e o cano (obstaculo)
    function checkCollision(){
        if (!isPlaying) return;

        const pipePosition = pipe.offsetLeft;
        const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');
        // TOLERANCIA DE COLISÃO: QUANDO O CANO ESTA NA FAIXA DE CONTATO COM O MARIO
        if(pipePosition <= 120 && pipePosition > 0 && marioPosition <80){
            triggerGameOver (pipePosition, marioPosition);
        } 
    }
    // TRATAR O GAMOVER
    function triggerGameOver(pipePosition, marioPosition){
        isPlaying = false;
        clearInterval (gameLoop);
        clearInterval (scoreLoop);
        // RENOVAR A CLASSE RUNNING PARA AS ANIMAÇÕES
        gameboard.classList.remove('running');
        // CONGELA O CANO NA POSIÇÃO EXATA DA COLISÃO
        pipe.style.animation = 'none';
        pipe.style.left = `${pipePosition}px`;
        // CONGELA O MARIO NA ALTURA EXATA E MUDA PARA A IMAGEM DE GAME OVER
        mario.style.animation = 'none';
        mario.style.bottom = `${marioPosition}px`;
        mario.src = '../assets/game-over.png';
        mario.style.width = '75px';
        mario.style.marginLeft = '50px';
        // Atualização do modal de game over 
        finalScoreValue.textContent = score;
        saveStatusMsg.textContent = 'Salvando pontuação no banco...';
        saveStatusMsg.style.color = '#ffcc00';

        gameoverModal.classList.add('active');
        // SALVA A PONTUAÇÃO NO BANCO, COM A FUNÇÃO CRIADA CHAMADA DE SAVESCORE.
        saveScore(currentPlayer, score);
    }

    function saveScore(playerName, finalScore){
        fetch('salvar_ranking.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'aplication/json'
            },
            body: JSON.stringify({
                nome: playerName,
                pontos: finalScore 
            })
        })
        .then(res => res.json())
        .then(data => {
            if(data.status === 'sucess'){
                saveStatusMsg.textContent = 'Pontuação registrada no banco!';
                saveStatusMsg.style.cor = '#10b981';
                if(data.ranking){
                    renderRanking(data.ranking, playerName, finalScore);
                }
            } else {
                saveStatusMsg.textContent = (data.message || 'Erro ao registrar.');
                saveStatusMsg.style.color = '#ef4444';
            }
        })
        .catch(err => {
            console.error('erro na requisição', err);
            saveStatusMsg.textContent = 'Erro ao conectar ao servidor.';
            saveStatusMsg.style.color = '#ef4444';
        });
    }
    // busca no ranking atualizado do banco
    function fetchRanking(){
        fetch('obter_ranking.php')
        .then(res => res.json())
        .then (data => {
            if (data.status === 'sucess' && data.ranking){
                renderRanking(data.ranking);
            }
        })
        .catch(err => console.error('Erro ao buscar o ranking', err));
    }

    function renderRanking (list, highlightName = null, highlightScore = null){
        if(!rankingBody) return;
        rankingBody.innerHTML = '';
        if(!list || list.length === 0){
            rankingBody.innerHTML = `<tr><td colspan="3" class="loading-cell">Nenhuma pontuação gravada ainda</td></tr>`;
            return;
        }

        let highlightted = false;

        list.forEach((item, index) => {
            const tr = document.createElement('tr');

            if(!highlightted && highlightName && item.nome === highlightName && parseInt
                (item.pontos, 10) === highlightScore){
                    tr.classList.add('highlight-current');
                    highlightted = true;
               }

               let medal = `${index + 1}º`;
               if (index === 0) medal = '🥇1º';
               else if (index === 1) medal = '🥈2º';
               else if (index === 2) medal = '🥉3º';

               tr.innerHTML = `
                    <td class="ranking-pos">${medal}</td>
                    <td><strong>${escapeHtml (item.nome)}</strong></td>
                    <td>${parseInt(item.pontos, 10)} pts</td>
                `;

                rankingBody.appendChild(tr);
        });
    }

    function escapeHtml(str){
        if(!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
    }

    // eventos de controle e interface do jogo
    // inciar o jogo(formulario)
    startForm.addEventListener('submit',(e) => {
        e.preventDefault(); //IMPEDE O RECARRREGAMENTO DA PAGINA

            const nameValue =  playerInput.inputMode.value.trim();
            if(!nameValue) {
                playerInput.focus();
                return;
            }

            currentPlayer = nameValue;
            localStorage.setItem('mario_jump_player', currentPlayer);

            startModal.classList.remove('active');
            startGame();
    });