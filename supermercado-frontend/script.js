const backendUrl = 'http://localhost:8081';
let cashRegisterOpen = false;
let totalAmount = 0;
const products = [];
const transactions = [];
let initialAmount = 0; // Variável para armazenar o valor inicial do fundo do caixa

async function openCashRegister() {
    try {
        const response = await fetch(`${backendUrl}/api/caixa-register/open`, { method: 'POST' });
        if (response.ok) {
            document.getElementById('cashRegisterStatus').innerText = 'Status: Aberto';
            cashRegisterOpen = true;
            updateCashRegisterButton();
            alert('Caixa aberto com sucesso!');
        } else {
            alert('Erro ao abrir o caixa');
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

function showCloseRegisterModal() {
    document.getElementById('closeRegisterModal').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}

function hideCloseRegisterModal() {
    document.getElementById('closeRegisterModal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

async function handleCloseRegister(event) {
    event.preventDefault();
    const currentAmount = parseFloat(document.getElementById('currentAmount').value);

    if (isNaN(currentAmount)) {
        alert('Por favor, insira um valor válido.');
        return;
    }

    const totalCashTransactions = transactions
        .filter(transaction => transaction.paymentMethod === 'dinheiro')
        .reduce((sum, transaction) => sum + transaction.totalAmount, 0);

    const expectedAmount = initialAmount + totalCashTransactions;
    const caixaBateu = expectedAmount === currentAmount;

    alert(`Caixa bateu: ${caixaBateu ? 'Sim' : 'Não'}`);

    const report = generateReport();
    displayReport(report);
    await salvarRelatorio(report); // Salvar o relatório

    try {
        const response = await fetch(`${backendUrl}/api/caixa-register/close`, { method: 'POST' });
        if (response.ok) {
            document.getElementById('cashRegisterStatus').innerText = 'Status: Fechado';
            cashRegisterOpen = false;
            updateCashRegisterButton();
            hideCloseRegisterModal();
        } else {
            alert('Erro ao fechar o caixa');
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

function generateReport() {
    const report = {
        data: new Date().toISOString().split('T')[0], // Adiciona a data atual ao relatório
        debito: 0,
        credito: 0,
        pix: 0,
        dinheiro: 0
    };

    transactions.forEach(transaction => {
        report[transaction.paymentMethod] += transaction.totalAmount;
    });

    return report;
}

function displayReport(report) {
    const reportContent = document.getElementById('reportContent');
    reportContent.innerHTML = `
        <p>Data: ${report.data}</p>
        <p>Débito: R$ ${report.debito.toFixed(2)}</p>
        <p>Crédito: R$ ${report.credito.toFixed(2)}</p>
        <p>Pix: R$ ${report.pix.toFixed(2)}</p>
        <p>Dinheiro: R$ ${report.dinheiro.toFixed(2)}</p>
    `;
    document.getElementById('reportSection').style.display = 'block';
}

async function getCashRegisterStatus() {
    try {
        const response = await fetch(`${backendUrl}/api/caixa-register/status`);
        if (response.ok) {
            const status = await response.json();
            cashRegisterOpen = status.open;
            document.getElementById('cashRegisterStatus').innerText = `Status: ${cashRegisterOpen ? 'Aberto' : 'Fechado'}`;
            updateCashRegisterButton();
        } else {
            alert('Erro ao obter o status do caixa');
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

function updateCashRegisterButton() {
    const button = document.querySelector('.open-cash-register-btn');
    if (cashRegisterOpen) {
        button.innerText = 'Fechar Caixa';
        button.classList.remove('btn-success');
        button.classList.add('btn-danger');
        button.onclick = showCloseRegisterModal;
    } else {
        button.innerText = 'Abrir Caixa';
        button.classList.remove('btn-danger');
        button.classList.add('btn-success');
        button.onclick = openCashRegister;
    }
}

// Chame a função para obter o status do caixa ao carregar a página
document.addEventListener('DOMContentLoaded', getCashRegisterStatus);

async function registerProduct(event) {
    event.preventDefault();
    const ean = document.getElementById('ean').value;
    const name = document.getElementById('name').value;
    const category = document.getElementById('category').value;
    const value = parseFloat(document.getElementById('value').value);

    if (!ean || !name || !category || isNaN(value)) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    const product = { ean, name, category, value };
    products.push(product);
    document.getElementById('successMessage').style.display = 'block';
    setTimeout(() => {
        document.getElementById('successMessage').style.display = 'none';
    }, 3000);
}

function showRegisterSection() {
    document.getElementById('checkoutSection').style.display = 'none';
    document.getElementById('cartItems').style.display = 'none'; 
    document.getElementById('registerSection').style.display = 'block';
    document.getElementById('searchSection').style.display = 'none';
    document.getElementById('editSection').style.display = 'none';
    document.getElementById('reportSection').style.display = 'none';
}

function showSearchSection() {
    document.getElementById('checkoutSection').style.display = 'none';
    document.getElementById('cartItems').style.display = 'none'; 
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('searchSection').style.display = 'block';
    document.getElementById('editSection').style.display = 'none';
    document.getElementById('reportSection').style.display = 'none';
}

function showEditSection() {
    document.getElementById('checkoutSection').style.display = 'none';
    document.getElementById('cartItems').style.display = 'none'; 
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('searchSection').style.display = 'none';
    document.getElementById('editSection').style.display = 'block';
    document.getElementById('reportSection').style.display = 'none';
}

function showCheckoutSection() {
    if (!cashRegisterOpen) {
        alert('O caixa está fechado. Abra o caixa para registrar produtos.');
        return;
    }
    document.getElementById('checkoutSection').style.display = 'block';
    document.getElementById('cartItems').style.display = 'block'; 
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('searchSection').style.display = 'none';
    document.getElementById('editSection').style.display = 'none';
    document.getElementById('reportSection').style.display = 'none';
}

function showReportSection() {
    document.getElementById('checkoutSection').style.display = 'none';
    document.getElementById('cartItems').style.display = 'none'; 
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('searchSection').style.display = 'none';
    document.getElementById('editSection').style.display = 'none';
    document.getElementById('reportSection').style.display = 'block';
}

function toggleDinheiroSection() {
    const dinheiroSection = document.getElementById('dinheiroSection');
    dinheiroSection.style.display = (dinheiroSection.style.display === 'none' || dinheiroSection.style.display === '') ? 'block' : 'none';
}

async function salvarRelatorio(report) {
    try {
        const response = await fetch(`${backendUrl}/api/relatorios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(report)
        });

        if (response.ok) {
            alert('Relatório salvo com sucesso!');
        } else {
            alert('Erro ao salvar o relatório');
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function buscarRelatoriosPorData(event) {
    event.preventDefault();
    const data = document.getElementById('reportDate').value;

    try {
        const response = await fetch(`${backendUrl}/api/relatorios?data=${data}`);
        if (response.ok) {
            const relatorios = await response.json();
            exibirRelatorios(relatorios);
        } else {
            alert('Erro ao buscar relatórios');
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

function exibirRelatorios(relatorios) {
    const reportContent = document.getElementById('reportContent');
    reportContent.innerHTML = '';

    relatorios.forEach(relatorio => {
        reportContent.innerHTML += `
            <p>Data: ${relatorio.data}</p>
            <p>Débito: R$ ${relatorio.debito.toFixed(2)}</p>
            <p>Crédito: R$ ${relatorio.credito.toFixed(2)}</p>
            <p>Pix: R$ ${relatorio.pix.toFixed(2)}</p>
            <p>Dinheiro: R$ ${relatorio.dinheiro.toFixed(2)}</p>
            <hr>
        `;
    });
}

function updateTotal(amount) {
    const totalAmountElement = document.getElementById('totalAmount');
    totalAmountElement.textContent = `R$ ${amount.toFixed(2).replace('.', ',')}`; // Formata o valor
}

updateTotal(0.00);

// Função para pesquisar produto
async function searchProduct(event) {
    event.preventDefault();
    const searchTerm = document.getElementById('searchTerm').value.toLowerCase();

    const foundProducts = products.filter(product => 
        product.ean.toLowerCase().includes(searchTerm) || 
        product.name.toLowerCase().includes(searchTerm)
    );

    const searchResult = document.getElementById('searchResult');
    searchResult.innerHTML = '';

    if (foundProducts.length > 0) {
        foundProducts.forEach(product => {
            searchResult.innerHTML += `
                <div class="product">
                    <p>EAN: ${product.ean}</p>
                    <p>Nome: ${product.name}</p>
                    <p>Categoria: ${product.category}</p>
                    <p>Valor: R$ ${product.value.toFixed(2).replace('.', ',')}</p>
                </div>
                <hr>
            `;
        });
    } else {
        searchResult.innerHTML = '<p>Nenhum produto encontrado.</p>';
    }
}

// Função para editar produto
async function editProduct(event) {
    event.preventDefault();
    const editEan = document.getElementById('editEan').value;
    const editName = document.getElementById('editName').value;
    const editValue = parseFloat(document.getElementById('editValue').value);

    if (!editEan || isNaN(editValue)) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    const productIndex = products.findIndex(product => product.ean === editEan);

    if (productIndex === -1) {
        alert('Produto não encontrado.');
        return;
    }

    if (editName) {
        products[productIndex].name = editName;
    }

    if (!isNaN(editValue)) {
        products[productIndex].value = editValue;
    }

    document.getElementById('editResult').innerHTML = `
        <div class="alert alert-success">Produto atualizado com sucesso!</div>
    `;

    setTimeout(() => {
        document.getElementById('editResult').innerHTML = '';
    }, 3000);
}

// Função para registrar produto e adicionar ao carrinho
async function checkoutProduct(event) {
    event.preventDefault();
    const eanCheckout = document.getElementById('eanCheckout').value;

    const product = products.find(product => product.ean === eanCheckout);

    if (!product) {
        alert('Produto não encontrado.');
        return;
    }

    // Adiciona o produto ao carrinho
    const cartList = document.getElementById('cartList');
    const listItem = document.createElement('li');
    listItem.style.display = 'flex';
    listItem.style.justifyContent = 'space-between';
    listItem.innerHTML = `
        <span> ${product.ean}</span>
        <span> ${product.name}</span>
        <span>Valor: R$ ${product.value.toFixed(2).replace('.', ',')}</span>
        <button class="btn btn-danger btn-sm" onclick="removeFromCart(this, ${product.value})">Remover</button>
    `;
    cartList.appendChild(listItem);

    // Atualiza o total
    totalAmount += product.value;
    updateTotal(totalAmount);

    // Limpa o campo de entrada
    document.getElementById('eanCheckout').value = '';
}

// Função para remover produto do carrinho
function removeFromCart(button, value) {
    const listItem = button.parentElement;
    listItem.remove();

    // Atualiza o total
    totalAmount -= value;
    updateTotal(totalAmount);
}

// Função para finalizar a compra
async function finalizePurchase(event) {
    event.preventDefault();
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    if (!paymentMethod) {
        alert('Por favor, selecione um método de pagamento.');
        return;
    }

    const cartItems = document.querySelectorAll('#cartList li');
    if (cartItems.length === 0) {
        alert('O carrinho está vazio.');
        return;
    }

    const transaction = {
        items: [],
        paymentMethod: paymentMethod,
        totalAmount: totalAmount
    };

    cartItems.forEach(item => {
        const ean = item.querySelector('span:nth-child(1)').textContent.split(': ')[1];
        const name = item.querySelector('span:nth-child(2)').textContent.split(': ')[1];
        const value = parseFloat(item.querySelector('span:nth-child(3)').textContent.split(': ')[1].replace('R$ ', '').replace(',', '.'));

        transaction.items.push({ ean, name, value });
    });

    transactions.push(transaction);

    // Limpa o carrinho
    document.getElementById('cartList').innerHTML = '';
    totalAmount = 0;
    updateTotal(totalAmount);

    // Calcula o troco se a forma de pagamento for dinheiro
    if (paymentMethod === 'dinheiro') {
        const valorRecebido = parseFloat(document.getElementById('valorRecebido').value.replace(',', '.'));
        if (isNaN(valorRecebido) || valorRecebido < transaction.totalAmount) {
            alert('Valor recebido inválido ou insuficiente.');
            return;
        }
        const troco = valorRecebido - transaction.totalAmount;
        alert(`Pagamento efetuado com sucesso! Troco: R$ ${troco.toFixed(2).replace('.', ',')}`);
    } else {
        alert('Pagamento efetuado com sucesso!');
    }

    // Fecha o modal de pagamento
    hidePaymentModal();
}

function showPaymentModal() {
    document.getElementById('paymentModal').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}

function hidePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

function toggleDinheiroSection() {
    const dinheiroSection = document.getElementById('dinheiroSection');
    dinheiroSection.style.display = (dinheiroSection.style.display === 'none' || dinheiroSection.style.display === '') ? 'block' : 'none';
}

// Função para abrir o modal de abertura do caixa
function showOpenRegisterModal() {
    document.getElementById('openRegisterModal').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}

// Função para fechar o modal de abertura do caixa
function hideOpenRegisterModal() {
    document.getElementById('openRegisterModal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

// Função para lidar com a abertura do caixa
async function handleOpenRegister(event) {
    event.preventDefault();
    initialAmount = parseFloat(document.getElementById('initialAmountOpen').value);

    if (isNaN(initialAmount) || initialAmount < 0) {
        alert('Por favor, insira um valor válido.');
        return;
    }

    try {
        const response = await fetch(`${backendUrl}/api/caixa-register/open`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ initialAmount })
        });

        if (response.ok) {
            document.getElementById('cashRegisterStatus').innerText = 'Status: Aberto';
            cashRegisterOpen = true;
            updateCashRegisterButton();
            alert('Caixa aberto com sucesso!');
            hideOpenRegisterModal();
        } else {
            alert('Erro ao abrir o caixa');
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Atualize a função openCashRegister para abrir o modal
function openCashRegister() {
    showOpenRegisterModal();
}