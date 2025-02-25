const backendUrl = 'http://localhost:8081';
let cashRegisterOpen = false;
let totalAmount = 0;
const products = [];
const transactions = [];

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
    const initialAmount = parseFloat(document.getElementById('initialAmount').value);
    const currentAmount = parseFloat(document.getElementById('currentAmount').value);

    if (isNaN(initialAmount) || isNaN(currentAmount)) {
        alert('Por favor, insira valores válidos.');
        return;
    }

    const totalCashTransactions = transactions
        .filter(transaction => transaction.paymentMethod === 'dinheiro')
        .reduce((sum, transaction) => sum + transaction.amount, 0);

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
        report[transaction.paymentMethod] += transaction.amount;
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
            cashRegisterOpen = (status === 'OPEN');
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
        button.onclick = showCloseRegisterModal;
    } else {
        button.innerText = 'Abrir Caixa';
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

    try {
        const response = await fetch(`${backendUrl}/produto`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        });

        if (response.ok) {
            products.push(product);
            displayProducts();
            clearRegistrationForm();
            showSuccessMessage();
        } else {
            alert('Erro ao cadastrar o produto');
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

function displayProducts() {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';
    products.forEach(product => {
        productList.innerHTML += `
            <li>
                ${product.ean} - ${product.name} - R$ ${product.value.toFixed(2)} 
                <button onclick="editProduct('${product.ean}')">Editar</button>
            </li>`;
    });
}

function clearRegistrationForm() {
    document.getElementById('ean').value = '';
    document.getElementById('name').value = '';
    document.getElementById('category').value = '';
    document.getElementById('value').value = '';
}

function showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    successMessage.style.display = 'block';
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000); // Esconde a mensagem após 3 segundos
}

async function searchProduct(event) {
    event.preventDefault();
    const searchTerm = document.getElementById('searchTerm').value;
    const resultDiv = document.getElementById('searchResult');
    const product = products.find(p => p.ean === searchTerm || p.name === searchTerm);
    if (product) {
        resultDiv.innerHTML = `<h3>Produto Encontrado:</h3>
        <p>Nome: ${product.name}</p>
        <p>Categoria: ${product.category}</p>
        <p>Valor: R$ ${product.value.toFixed(2)}</p>`;
    } else {
        resultDiv.innerHTML = `<h3>Produto não cadastrado</h3>`;
    }
}

function editProduct(ean) {
    const product = products.find(p => p.ean === ean);
    if (product) {
        document.getElementById('editEan').value = product.ean;
        document.getElementById('editName').value = product.name;
        document.getElementById('editValue').value = product.value;

        // Exibir a seção de edição
        showEditSection();
    }
}

function showEditSection() {
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('searchSection').style.display = 'none';
    document.getElementById('editSection').style.display = 'block';
    document.getElementById('checkoutSection').style.display = 'none';
    document.getElementById('reportSection').style.display = 'none'; // Esconde a seção de relatórios
}

async function editProduct(event) {
    event.preventDefault();
    const ean = document.getElementById('editEan').value;
    const name = document.getElementById('editName').value;
    const value = parseFloat(document.getElementById('editValue').value);

    const productIndex = products.findIndex(p => p.ean === ean);
    if (productIndex !== -1) {
        const updatedProduct = {
            ean,
            name: name || products[productIndex].name,
            category: products[productIndex].category,
            value: value || products[productIndex].value
        };

        try {
            const response = await fetch(`${backendUrl}/produto/${ean}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedProduct)
            });

            if (response.ok) {
                products[productIndex] = updatedProduct;
                displayProducts();
                clearEditForm();
                document.getElementById('editResult').innerText = "Produto atualizado com sucesso!";
            } else {
                document.getElementById('editResult').innerText = "Erro ao atualizar o produto.";
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    } else {
        document.getElementById('editResult').innerText = "Produto não encontrado.";
    }
}

function clearEditForm() {
    document.getElementById('editEan').value = '';
    document.getElementById('editName').value = '';
    document.getElementById('editValue').value = '';
}

async function checkoutProduct(event) {
    event.preventDefault();
    const ean = document.getElementById('eanCheckout').value;
    const resultDiv = document.getElementById('checkoutResult');
    const product = products.find(p => p.ean === ean);
    if (product) {
        resultDiv.innerHTML = `<h3>Produto Encontrado:</h3>
        <p>Nome: ${product.name}</p>
        <p>Categoria: ${product.category}</p>
        <p>Valor: R$ ${product.value.toFixed(2)}</p>`;
        addToCart(product);
    } else {
        resultDiv.innerHTML = `<h3>Produto não encontrado</h3>`;
    }
}

function addToCart(product) {
    const cartList = document.getElementById('cartList');
    const cartItem = document.createElement('li');
    cartItem.innerHTML = `${product.ean} - ${product.name} - R$ ${product.value.toFixed(2)} 
                          <button class="remove-button" onclick="removeFromCart(this)">Remover</button>`;
    cartList.appendChild(cartItem);
    totalAmount += product.value;
    updateTotal(totalAmount);
}

function removeFromCart(button) {
    const cartItem = button.parentElement; // Obtém o item do carrinho
    const itemValue = parseFloat(cartItem.innerText.split(' - R$ ')[1]); // Obtém o valor do item
    totalAmount -= itemValue; // Subtrai o valor do total
    updateTotal(totalAmount); // Atualiza o total
    cartItem.remove(); // Remove o item do carrinho
}

function finalizePurchase() {
    const errorMessage = document.getElementById('errorMessage'); // Referência ao elemento de mensagem de erro
    errorMessage.style.display = 'none';

    if (totalAmount === 0) {
        errorMessage.innerText = "Você não possui nenhum item no carrinho.";
        errorMessage.style.display = 'block';
        return;
    }

    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    if (paymentMethod === "dinheiro") {
        const valorRecebido = parseFloat(document.getElementById('valorRecebido').value);
        if (isNaN(valorRecebido) || valorRecebido < totalAmount) {
            errorMessage.innerText = "Valor recebido insuficiente.";
            errorMessage.style.display = 'block';
            return;
        }
        const troco = valorRecebido - totalAmount;
        alert(`Compra finalizada com sucesso!\nTroco: R$ ${troco.toFixed(2)}`);
    } else {
        alert("Compra finalizada com sucesso!");
    }

    transactions.push({ paymentMethod, amount: totalAmount });
    resetCart(); // Chama a função para resetar o carrinho
    hidePaymentModal();
}

function resetCart() {
    totalAmount = 0; // Zera o total
    updateTotal(totalAmount); // Atualiza o total na interface
    document.getElementById('cartList').innerHTML = ''; // Limpa a lista de produtos no carrinho
}

function showPaymentModal() {
    const errorMessage = document.getElementById('errorMessage'); // Referência ao elemento de mensagem de erro
    errorMessage.style.display = 'none'; // Esconde a mensagem de erro

    if (totalAmount === 0) {
        errorMessage.innerText = "Você não possui nenhum item no carrinho."; // Define a mensagem de erro
        errorMessage.style.display = 'block'; // Exibe a mensagem de erro
        return;
    }

    const modal = document.getElementById('paymentModal');
    const overlay = document.getElementById('overlay');
    modal.style.display = 'block';
    overlay.style.display = 'block';
}

function hidePaymentModal() {
    const modal = document.getElementById('paymentModal');
    const overlay = document.getElementById('overlay');
    modal.style.display = 'none';
    overlay.style.display = 'none';
}

function showCheckoutSection() {
    if (!cashRegisterOpen) {
        alert('O caixa está fechado. Não é possível registrar produtos.');
        return;
    }
    document.getElementById('checkoutSection').style.display = 'block';
    document.getElementById('cartItems').style.display = 'block'; 
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('searchSection').style.display = 'none';
    document.getElementById('editSection').style.display = 'none';
    document.getElementById('reportSection').style.display = 'none'; 
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