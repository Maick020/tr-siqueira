/* ==========================================================
   DADOS DOS PRODUTOS
   ========================================================== */
const products = [
  { id: 1,  nome: 'Baby ET',            categoria: 'acessorios', preco: 50.00, precoAntigo: 80.00, imagem: 'imagens/et.jpeg' },
  { id: 2,  nome: 'Bolsa necessaria',      categoria: 'acessorios', preco: 25.00, precoAntigo: 39.90,  imagem: 'imagens/necessaire.jpg' },
  { id: 3,  nome: 'Boné aba reta',     categoria: 'masculino', preco: 50.00, precoAntigo: 79.90, imagem: 'imagens/bone-reto.jpeg' },
  { id: 4,  nome: 'Boné aba reta bege',      categoria: 'masculino', preco: 50.00, precoAntigo: 79.90,  imagem: 'imagens/bone-bege.jpeg' },
  { id: 5,  nome: 'Boné bordado bege',       categoria: 'masculino', preco: 50.00, precoAntigo: 79.90, imagem: 'imagens/bone-bordado.jpg' },
  { id: 6,  nome: 'Boné preto truker',      categoria: 'masculino', preco: 40.00, precoAntigo: 69.90, imagem: 'imagens/bone-truker.jpg' },
  { id: 7,  nome: 'Caminhão de corrida',     categoria: 'acessorios', preco: 70.00, precoAntigo: 109.90,  imagem: 'imagens/ca-corrida.jpeg' },
  { id: 8,  nome: 'Miniatura caminhão DAF',       categoria: 'acessorios', preco: 35.00, precoAntigo: 58.90, imagem: 'imagens/daf.jpeg' },
  { id: 9,  nome: 'Miniatura caminhão Scania',      categoria: 'acessorios', preco: 35.00, precoAntigo: 58.90,  imagem: 'imagens/scania.jpeg' },
  { id: 10, nome: 'Miniatura caminhão Volvo',   categoria: 'acessorios', preco: 35.00, precoAntigo: 58.90,  imagem: 'imagens/volvo.jpeg' },
  { id: 11, nome: 'Copo termico',       categoria: 'acessorios', preco: 30.00, precoAntigo: 50.00,  imagem: 'imagens/copo.jpeg' },
  { id: 12, nome: 'Meia cano alto  ',     categoria: 'masculino', preco: 25.00, precoAntigo: 45.90,  imagem: 'imagens/meia.jpeg' },
  { id: 13, nome: 'Camisa nossa Senhora Aparecida',     categoria: 'masculino', preco: 70.00, precoAntigo: 99.90,  imagem: 'imagens/nossa-senhora.jpg' },
  { id: 14, nome: 'Camisa cinza',     categoria: 'masculino', preco: 70.00, precoAntigo: 99.90,  imagem: 'imagens/camisa-cinza.jpg' },
  { id: 15, nome: 'Camisa rosa ',     categoria: 'feminino', preco: 70.00, precoAntigo:  99.90,  imagem: 'imagens/camisa-rosa.jpg' },
  { id: 16, nome: 'Moletom ',     categoria: 'masculino', preco: 130.00, precoAntigo:  159.90,  imagem: 'imagens/moletom.jpg' },
];

const WHATSAPP_NUMERO = '5538999868379';
const CART_STORAGE_KEY = 'carrinho';

const productsGrid = document.getElementById('productsGrid');

/* ==========================================================
   FILTRO POR PÁGINA
   Cada HTML (roupas.html, acessorios.html) declara
   `categoriasPagina` (um array) antes de carregar este script.
   roupas.html usa ['masculino', 'feminino']; acessorios.html
   usa ['acessorios']. O index.html não declara nada e continua
   mostrando tudo.
   ========================================================== */
const produtosDaPagina = typeof categoriasPagina !== 'undefined'
  ? products.filter(p => categoriasPagina.includes(p.categoria))
  : products;

/* ==========================================================
   HELPERS
   ========================================================== */
function formatarPreco(valor) {
  return 'R$ ' + valor.toFixed(2).replace('.', ',');
}

function carregarCarrinho() {
  try {
    const dados = localStorage.getItem(CART_STORAGE_KEY);
    return dados ? JSON.parse(dados) : [];
  } catch (e) {
    return [];
  }
}

function salvarCarrinho() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(carrinho));
  atualizarContadorCarrinho();
}

let carrinho = carregarCarrinho();

/* ==========================================================
   RENDERIZAÇÃO DOS PRODUTOS
   ========================================================== */
function renderProducts(lista) {
  productsGrid.innerHTML = '';

  if (lista.length === 0) {
    productsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align:center; padding: 40px;">Nenhum produto encontrado.</p>';
    return;
  }

  lista.forEach((product, index) => {
    const card = document.createElement('div');
    card.classList.add('product-card');

    card.innerHTML = `
      <div class="product-image" id="img-wrap-${product.id}">
        <img
          src="${product.imagem}"
          alt="${product.nome}"
          style="width:100%; height:100%; object-fit:cover;"
          onerror="this.parentElement.innerHTML = 'Produto ${index + 1}';"
        />
      </div>

      <div class="product-info">
        <h3>${product.nome}</h3>

        <div class="price">
          <span class="new-price">${formatarPreco(product.preco)}</span>
          ${product.precoAntigo ? `<span class="old-price">${formatarPreco(product.precoAntigo)}</span>` : ''}
        </div>

        <button class="buy-btn" data-id="${product.id}">
          Comprar
        </button>
      </div>
    `;

    card.querySelector('.buy-btn').addEventListener('click', () => {
      if (product.categoria === 'acessorios') {
        // Acessórios não têm tamanho — vai direto pro carrinho.
        adicionarAoCarrinho(product, 'Único');
        abrirCarrinho();
      } else {
        openSizeModal(product);
      }
    });
    productsGrid.appendChild(card);
  });
}

renderProducts(produtosDaPagina);

/* ==========================================================
   BUSCA
   A busca filtra dentro da categoria da página atual (não do
   catálogo inteiro), pra não misturar seções.
   ========================================================== */
function criarBarraDeBusca() {
  const header = document.querySelector('header');
  if (!header || document.querySelector('.search-box')) return;

  const searchBox = document.createElement('div');
  searchBox.classList.add('search-box');
  searchBox.innerHTML = `
    <input type="text" id="searchInput" placeholder="Buscar produto..." />
    <button id="searchBtn" type="button">Buscar</button>
  `;

  header.appendChild(searchBox);

  const input = searchBox.querySelector('#searchInput');
  input.addEventListener('input', () => {
    const termo = input.value.trim().toLowerCase();
    const filtrados = termo
      ? produtosDaPagina.filter(p => p.nome.toLowerCase().includes(termo))
      : produtosDaPagina;
    renderProducts(filtrados);
  });

  searchBox.querySelector('#searchBtn').addEventListener('click', () => input.focus());
}

criarBarraDeBusca();

/* ==========================================================
   MODAL DE TAMANHOS
   ========================================================== */
const modal = document.createElement('div');
modal.id = 'sizeModal';

modal.innerHTML = `
  <div id="modalOverlay" style="
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 999;
  ">
    <div style="
      background: #1C1815;
      padding: 30px;
      border-radius: 25px;
      width: 320px;
      text-align: center;
      animation: popup 0.3s ease;
    ">
      <h2 style="margin-bottom: 20px; color: #fa2e2ef7;">
        Escolha o Tamanho
      </h2>

      <div style="display:flex; gap:10px; justify-content:center; margin-bottom:25px;">
        <button class="size-btn">P</button>
        <button class="size-btn">M</button>
        <button class="size-btn">G</button>
        <button class="size-btn">GG</button>
      </div>

      <button id="closeSizeModalBtn" style="
        background:#4D0F00;
        color:white;
        border:none;
        padding:12px 25px;
        border-radius:15px;
        cursor:pointer;
        font-weight:bold;
      ">
        Fechar
      </button>
    </div>
  </div>
`;

document.body.appendChild(modal);
document.getElementById('closeSizeModalBtn').addEventListener('click', closeModal);

let selectedProduct = null;

function openSizeModal(product) {
  selectedProduct = product;
  document.getElementById('modalOverlay').style.display = 'flex';

  const sizeButtons = document.querySelectorAll('.size-btn');
  sizeButtons.forEach(button => {
    button.onclick = () => {
      const tamanho = button.innerText;
      adicionarAoCarrinho(selectedProduct, tamanho);
      closeModal();
      abrirCarrinho();
    };
  });
}

function closeModal() {
  document.getElementById('modalOverlay').style.display = 'none';
}

/* ==========================================================
   CARRINHO
   ========================================================== */
function adicionarAoCarrinho(product, tamanho) {
  const itemExistente = carrinho.find(
    item => item.productId === product.id && item.tamanho === tamanho
  );

  if (itemExistente) {
    itemExistente.qtd += 1;
  } else {
    carrinho.push({ productId: product.id, tamanho, qtd: 1 });
  }

  salvarCarrinho();
  renderCartItems();
}

function removerDoCarrinho(index) {
  carrinho.splice(index, 1);
  salvarCarrinho();
  renderCartItems();
}

function alterarQuantidade(index, delta) {
  carrinho[index].qtd += delta;
  if (carrinho[index].qtd <= 0) {
    carrinho.splice(index, 1);
  }
  salvarCarrinho();
  renderCartItems();
}

function calcularTotal() {
  return carrinho.reduce((total, item) => {
    const produto = products.find(p => p.id === item.productId);
    return produto ? total + produto.preco * item.qtd : total;
  }, 0);
}

/* ---------- UI do carrinho (botão + painel) ---------- */
function criarUiCarrinho() {
  const header = document.querySelector('header');
  if (!header || document.getElementById('cartBtn')) return;

  const cartBtn = document.createElement('button');
  cartBtn.id = 'cartBtn';
  cartBtn.style.cssText = `
    background: var(--color-vinho);
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 10px;
    cursor: pointer;
    font-weight: bold;
    margin-left: 15px;
  `;
  cartBtn.innerHTML = 'Carrinho (<span id="cartCount">0</span>)';
  cartBtn.addEventListener('click', abrirCarrinho);
  header.appendChild(cartBtn);

  const painel = document.createElement('div');
  painel.id = 'cartOverlay';
  painel.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;
  painel.innerHTML = `
    <div style="
      background: #1C1815;
      padding: 30px;
      border-radius: 25px;
      width: 360px;
      max-height: 80vh;
      overflow-y: auto;
      color: #ffffff;
    ">
      <h2 style="margin-bottom: 20px;">Seu carrinho</h2>
      <div id="cartItemsList"></div>
      <p id="cartTotal" style="margin: 20px 0; font-weight: bold; font-size: 18px;"></p>
      <button id="finalizarPedidoBtn" style="
        width: 100%;
        background: var(--color-vinho);
        color: white;
        border: none;
        padding: 12px;
        border-radius: 15px;
        font-weight: bold;
        cursor: pointer;
        margin-bottom: 10px;
      ">Finalizar pedido no WhatsApp</button>
      <button id="closeCartBtn" style="
        width: 100%;
        background: transparent;
        color: #86fa2ef7;
        border: 1px solid #2a9e0df7;
        padding: 12px;
        border-radius: 15px;
        cursor: pointer;
      ">Continuar comprando</button>
    </div>
  `;
  document.body.appendChild(painel);

  document.getElementById('closeCartBtn').addEventListener('click', fecharCarrinho);
  document.getElementById('finalizarPedidoBtn').addEventListener('click', finalizarPedido);

  atualizarContadorCarrinho();
}

function atualizarContadorCarrinho() {
  const contador = document.getElementById('cartCount');
  if (!contador) return;
  const totalItens = carrinho.reduce((soma, item) => soma + item.qtd, 0);
  contador.innerText = totalItens;
}

function renderCartItems() {
  const lista = document.getElementById('cartItemsList');
  const totalEl = document.getElementById('cartTotal');
  if (!lista || !totalEl) return;

  if (carrinho.length === 0) {
    lista.innerHTML = '<p>Seu carrinho está vazio.</p>';
    totalEl.innerText = '';
    return;
  }

  lista.innerHTML = carrinho.map((item, index) => {
    const produto = products.find(p => p.id === item.productId);
    if (!produto) return '';
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #4D0F00; padding-bottom:10px;">
        <div>
          <strong>${produto.nome}</strong><br/>
          ${item.tamanho !== 'Único' ? `<small>Tamanho: ${item.tamanho}</small><br/>` : ''}
          <small>${formatarPreco(produto.preco)} x ${item.qtd}</small>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <button class="qty-btn" data-action="menos" data-index="${index}">−</button>
          <span style="min-width:18px; text-align:center; font-weight:bold;">${item.qtd}</span>
          <button class="qty-btn" data-action="mais" data-index="${index}">+</button>
          <button class="remove-btn" data-action="remover" data-index="${index}">✕</button>
        </div>
      </div>
    `;
  }).join('');

  lista.querySelectorAll('button[data-action]').forEach(btn => {
    const index = Number(btn.dataset.index);
    const acao = btn.dataset.action;
    btn.addEventListener('click', () => {
      if (acao === 'mais') alterarQuantidade(index, 1);
      if (acao === 'menos') alterarQuantidade(index, -1);
      if (acao === 'remover') removerDoCarrinho(index);
    });
  });

  totalEl.innerText = 'Total: ' + formatarPreco(calcularTotal());
}

function abrirCarrinho() {
  renderCartItems();
  document.getElementById('cartOverlay').style.display = 'flex';
}

function fecharCarrinho() {
  document.getElementById('cartOverlay').style.display = 'none';
}

/* ---------- Finalizar pedido ---------- */
function finalizarPedido() {
  if (carrinho.length === 0) {
    alert('Seu carrinho está vazio.');
    return;
  }

  const linhas = carrinho.map(item => {
    const produto = products.find(p => p.id === item.productId);
    if (!produto) return '';
    const tamanhoTexto = item.tamanho !== 'Único' ? ` (Tam. ${item.tamanho})` : '';
    return `- ${produto.nome}${tamanhoTexto} x${item.qtd} - ${formatarPreco(produto.preco * item.qtd)}`;
  });

  const mensagem =
    'Olá! Quero fazer o seguinte pedido:\n\n' +
    linhas.join('\n') +
    `\n\nTotal: ${formatarPreco(calcularTotal())}`;

  const whatsappURL = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;
  window.open(whatsappURL, '_blank');
}

/* ==========================================================
   INICIALIZAÇÃO
   ========================================================== */
criarUiCarrinho();

const style = document.createElement('style');
style.innerHTML = `
  .size-btn {
    width: 55px;
    height: 55px;
    border: 2px solid #4D0F00;
    background: white;
    color:#fad12ef7;
    border-radius: 15px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: 0.3s;
  }

  .size-btn:hover {
    background: #a52302;
    color: white;
  }

  @keyframes popup {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .qty-btn {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 50%;
    background: var(--color-vinho);
    color: white;
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.2s;
  }

  .qty-btn:hover {
    background: var(--color-vinho-claro);
    transform: scale(1.08);
  }

  .remove-btn {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 10px;
    background: transparent;
    border: 2px solid #a52302;
    color: #a52302;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.2s;
  }

  .remove-btn:hover {
    background: #a52302;
    color: white;
  }
`;
document.head.appendChild(style);