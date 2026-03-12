const configBingo = {
    'b': { min: 1, max: 15 },
    'i': { min: 16, max: 30 },
    'n': { min: 31, max: 45 },
    'g': { min: 46, max: 60 },
    'o': { min: 61, max: 75 }
};

const cartelasExistentes = new Set();

function gerarNumerosColuna(min, max, quantidade) {
    const numeros = [];
    while (numeros.length < quantidade) {
        const numAleatorio = Math.floor(Math.random() * (max - min + 1)) + min;
        if (!numeros.includes(numAleatorio)) {
            numeros.push(numAleatorio);
        }
    }
    return numeros.sort((a, b) => a - b);
}

function obterDadosCartelaUnica() {
    let hashCartela;
    let dadosCartela;
    do {
        dadosCartela = {};
        Object.keys(configBingo).forEach(letra => {
            dadosCartela[letra] = gerarNumerosColuna(configBingo[letra].min, configBingo[letra].max, 5);
        });
        hashCartela = Object.values(dadosCartela).map(coluna => coluna.join(',')).join('|');
    } while (cartelasExistentes.has(hashCartela));

    cartelasExistentes.add(hashCartela);
    return dadosCartela;
}

function baixarCartelaComBiblioteca(containerCartela, index) {
    const tabela = containerCartela.querySelector('.cartela');
    
    const configHtml2canvas = {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false
    };

    return html2canvas(tabela, configHtml2canvas).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `cartela-bingo-${index + 1}.png`;
        link.click();
    }).catch(err => {
        console.error("Erro ao gerar imagem:", err);
    });
}

function renderizarCartela(index) {
    const areaCartelas = document.getElementById('area-cartelas');
    const template = document.getElementById('template-cartela');
    const dados = obterDadosCartelaUnica();
    const clone = template.content.cloneNode(true);
    const container = clone.querySelector('.cartela-container');
    const tabela = clone.querySelector('.cartela');
    const btnDownload = clone.querySelector('.btn-download');

    Object.keys(dados).forEach(letra => {
        const numerosDaColuna = dados[letra];
        const celulas = tabela.querySelectorAll(`td.${letra}`);
        celulas.forEach((td, indexNum) => {
            if (td.classList.contains('curinga')) {
                td.textContent = "";
            } else {
                td.textContent = numerosDaColuna[indexNum];
            }
        });
    });

    btnDownload.addEventListener('click', () => {
        baixarCartelaComBiblioteca(container, index);
    });

    areaCartelas.appendChild(clone);
}

function acaoGerar() {
    const areaCartelas = document.getElementById('area-cartelas');
    const inputQuantidade = document.getElementById('quantidade');
    areaCartelas.innerHTML = '';
    cartelasExistentes.clear();
    const quantidade = parseInt(inputQuantidade.value);
    if (quantidade > 0 && quantidade <= 100) {
        for (let i = 0; i < quantidade; i++) {
            renderizarCartela(i);
        }
    } else {
        alert("Por favor, escolha uma quantidade entre 1 e 100.");
    }
}

function configurarControles() {
    const btnGerar = document.getElementById('btn-gerar');
    const inputQuantidade = document.getElementById('quantidade');
    const btnDownloadAll = document.getElementById('btn-download-all');

    btnGerar.addEventListener('click', acaoGerar);

    inputQuantidade.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            acaoGerar();
        }
    });

    btnDownloadAll.addEventListener('click', async () => {
        const containers = document.querySelectorAll('.cartela-container');
        for (let i = 0; i < containers.length; i++) {
            await baixarCartelaComBiblioteca(containers[i], i);
        }
    });
}

window.onload = configurarControles;