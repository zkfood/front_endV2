async function listarProdutos(eEntrega) {
    const pedidosCarrinho = JSON.parse(sessionStorage.getItem('PRODUTOS_CARRINHO')) || [];

    if (!pedidosCarrinho || pedidosCarrinho.length === 0) {
        const lista = document.getElementById('lista');
        lista.style.display = "none";
    }


    const totalItensH3 = document.getElementById('totalItensCarrinho');
    totalItensH3.innerHTML = `Itens (${pedidosCarrinho.length})`;

    const divCardPagameto = document.getElementById('cardPagamento');

    divCardPagameto.innerHTML = '';

    let valorTotal = 0;

    if (eEntrega) {
        valorTotal += 3;
    }

    const divListagemProdutos = document.getElementById('listagemProdutos');
    divListagemProdutos.innerHTML = '';


    for (const item of pedidosCarrinho) {

        const produto = await new FetchBuilder().request(`${ambiente.local}${prefix.produtos}/${item.id}`);
        const itemNoCarrinho = pedidosCarrinho.find(produto => produto.id === item.id);

        if (produto.disponibilidade) {
            divListagemProdutos.innerHTML += `
            <div class="card-cardapio" data-id="${produto.id}">
                <div class="conteudo-cardapio">
                    <h2>${produto.nome}</h2>
                    <p>${produto.descricao}</p>
                    <div class="servir">
                        <img src="../../assets/icons-usuário-cinza.png" alt="icone de usuario">
                        <h5>Serve ${produto.qtdPessoas} pessoas</h5>
                    </div>
                    <h1><span>R$</span>${produto.valor.toFixed(2)}</h1>
                </div>
                <div class="imagem-cardapio">
                    <img src="${ambiente.local}${prefix.produtos}/imagem/${produto.id}" alt="Foto do prato">
                    <div class="menu-card">
                        <div class="seletor-quantidade">
                            <button class="diminuir" onclick="diminuir(${produto.id})">-</button>
                            <input value="${itemNoCarrinho.quantidade}" min="1" max="99" readonly>
                            <button class="aumentar" onclick="somar(${produto.id})">+</button>
                        </div>
                        <button class="botao-lixo" onclick="deletarItemCarrinho(${produto.id})">
                            <img src="../../assets/Trash.png" alt="icone de lixo">
                        </button>
                    </div>
                </div>
            </div>
        `;

            divCardPagameto.innerHTML += `
        <div class="item">
            <span>${itemNoCarrinho.quantidade}x</span>
            <span>${produto.nome}</span>
            <span>R$ ${(produto.valor * itemNoCarrinho.quantidade).toFixed(2)}</span>
        </div>
    `;

        }

        valorTotal += produto.valor * itemNoCarrinho.quantidade;
    }

    if (eEntrega) {
        divCardPagameto.innerHTML += `
            <div class="item">
                <span>Taxa de entrega</span>
                <span>R$ ${(3).toFixed(2)}</span>
            </div>
        `;
    }

    divCardPagameto.innerHTML += `
        <div class="total"><b>Valor</b><h2>R$ ${valorTotal.toFixed(2)}</h2></div>
        <a class="botao-azul" onclick="continuar()">Continuar</a>
    `;
}

function deletarItemCarrinho(id) {
    const pedidosCarrinho = JSON.parse(sessionStorage.getItem('PRODUTOS_CARRINHO'));
    const itemNoCarrinho = pedidosCarrinho.filter(produto => Number(produto.id) !== id);

    sessionStorage.setItem('PRODUTOS_CARRINHO', JSON.stringify(itemNoCarrinho));

    window.location.reload();
}

async function somar(id) {
    const pedidosCarrinho = JSON.parse(sessionStorage.getItem('PRODUTOS_CARRINHO'));
    const itemNoCarrinho = pedidosCarrinho.find(produto => Number(produto.id) === id);

    if (itemNoCarrinho) {
        itemNoCarrinho.quantidade = (Number(itemNoCarrinho.quantidade) + 1).toString();
    }

    sessionStorage.setItem('PRODUTOS_CARRINHO', JSON.stringify(pedidosCarrinho));

    const divListagemProdutos = document.getElementById('listagemProdutos');
    divListagemProdutos.innerHTML = '';

    await listarProdutos();
}

async function diminuir(id) {
    const pedidosCarrinho = JSON.parse(sessionStorage.getItem('PRODUTOS_CARRINHO'));
    const itemNoCarrinho = pedidosCarrinho.find(produto => Number(produto.id) === id);

    if (itemNoCarrinho) {
        if (itemNoCarrinho.quantidade === '0') {
            exibirPopup("Não é possível pedir pedidos com quantidades negativas...", "erro")
            return;
        }
        itemNoCarrinho.quantidade = (Number(itemNoCarrinho.quantidade) - 1).toString();
    }

    sessionStorage.setItem('PRODUTOS_CARRINHO', JSON.stringify(pedidosCarrinho));

    const divListagemProdutos = document.getElementById('listagemProdutos');
    divListagemProdutos.innerHTML = '';

    await listarProdutos();

}

async function continuar() {
    const radios = document.getElementsByName('entrega');
    const horario = (new Date().getHours).toString

    function esperar(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
    
if (horario == "11" || horario == "16") {
    let selectedOption;
    radios.forEach((radio) => {
        if (radio.checked) {
            selectedOption = radio.value;
        }
    });
    
    if (selectedOption === undefined) {
        exibirPopup("Escolha um tipo de entrega antes de prosseguir...", "erro")
        return;
    } else if (selectedOption === "Balcão") {
        sessionStorage.setItem('TIPO_ENTREGA_CARRINHO', selectedOption);
        await cadastrarPedido();
    } else {
        sessionStorage.setItem('TIPO_ENTREGA_CARRINHO', selectedOption);
        window.location = './endereco.html';
    }
}else{
    exibirPopup("Estamos fora do horário de funcionamento", "erro")
    await esperar(2000); 
    window.location = './home_pos_login.html'
}

  
}

window.onload = async function () {
    await listarProdutos();
}

// Função para exibir o popup de sucesso ou erro
function exibirPopup(mensagem, tipo) {
    const popup = document.getElementById("popup");
    const popupIcon = document.getElementById("popup-icon");
    const popupTitle = document.getElementById("popup-title");
    const popupMessage = document.getElementById("popup-message");

    if (tipo === "success") {
        popupIcon.src = "/ZKFood/assets/sucesso.png";
        popupTitle.textContent = "Sucesso!";
        popupTitle.style.color = "#33D700";
    } else {
        popupIcon.src = "/ZKFood/assets/erro.png";
        popupTitle.textContent = "Erro!";
        popupTitle.style.color = "#EB3223";
    }

    popupMessage.textContent = mensagem;
    popup.style.display = "flex";
}

// Função para fechar o popup
function closePopup() {
    const popup = document.getElementById("popup");
    popup.style.display = "none";
}