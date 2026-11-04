'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const state = { user: null, products: [], cart: new Map(), categories: [] };

const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);
const dateTime = value => value ? new Date(value).toLocaleString('pt-BR') : 'Não informado';
const roleLabels = { ADMIN: 'Administrador', MANAGER: 'Gerente', OPERATOR: 'Operador', CUSTOMER: 'Cliente' };
const orderLabels = { PENDING: 'Pendente', CONFIRMED: 'Confirmado', SEPARATING: 'Em separação', SHIPPED: 'Enviado', DELIVERED: 'Entregue', CANCELLED: 'Cancelado' };
const deliveryLabels = { PREPARING: 'Preparando', IN_TRANSIT: 'Em trânsito', DELIVERED: 'Entregue', DELAYED: 'Atrasada' };
const staffRoles = ['ADMIN', 'MANAGER', 'OPERATOR'];

async function api(url, options = {}) {
  const config = { credentials: 'same-origin', ...options };
  config.headers = { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) };
  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && state.user) {
      state.user = null;
      renderAuth();
    }
    throw new Error(data.error || `Não foi possível concluir a operação (${response.status}).`);
  }
  return data;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function toast(text, type = 'info') {
  const region = $('#toast-region');
  const item = document.createElement('div');
  item.className = `toast ${type}`;
  item.textContent = text;
  region.appendChild(item);
  window.setTimeout(() => item.remove(), 4200);
}

function setAuthMessage(text = '', type = '') {
  const element = $('#auth-message');
  element.textContent = text;
  element.className = `message${type ? ` ${type}` : ''}`;
}

function setBusy(button, busy, busyText = 'Aguarde...') {
  if (!button) return;
  if (busy) {
    button.dataset.originalText = button.textContent;
    button.textContent = busyText;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
  }
}

function showTab(tabName) {
  $$('.tab').forEach(button => {
    const active = button.dataset.tab === tabName;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });
  $('#login-form').classList.toggle('hidden', tabName !== 'login');
  $('#register-form').classList.toggle('hidden', tabName !== 'register');
  $('#recovery-form').classList.add('hidden');
  setAuthMessage('');
}

function showRecovery() {
  $('#login-form').classList.add('hidden');
  $('#register-form').classList.add('hidden');
  $('#recovery-form').classList.remove('hidden');
  $$('.tab').forEach(button => { button.classList.remove('active'); button.setAttribute('aria-selected', 'false'); });
  setAuthMessage('');
}

function renderAuth() {
  const logged = Boolean(state.user);
  $('#auth-panel').classList.toggle('hidden', logged);
  $('#app-panel').classList.toggle('hidden', !logged);
  $('#logout-button').classList.toggle('hidden', !logged);
  $('#user-label').classList.toggle('hidden', !logged);
  $('#user-label').textContent = logged ? `${state.user.name || state.user.email} · ${roleLabels[state.user.role] || state.user.role}` : '';
  $('#welcome-title').textContent = logged ? `Olá, ${(state.user.name || state.user.email).split(' ')[0]}` : 'Sua operação';
  const isCustomer = state.user?.role === 'CUSTOMER';
  const isStaff = staffRoles.includes(state.user?.role);
  $('#cart-panel').classList.toggle('hidden', !isCustomer);
  $('#orders-panel').classList.toggle('hidden', !isCustomer);
  $('#staff-panel').classList.toggle('hidden', !isStaff);
  $('#admin-summary').classList.toggle('hidden', !isStaff);
  $('#product-management-panel').classList.toggle('hidden', !['ADMIN', 'MANAGER'].includes(state.user?.role));
  if (!isCustomer) state.cart.clear();
  renderCart();
}

async function loadUser() {
  const result = await api('/api/auth/me');
  state.user = result.user;
  renderAuth();
  if (state.user) await loadDashboard();
}

async function authenticate(form, endpoint, successMessage) {
  const button = $('button[type="submit"]', form);
  setBusy(button, true, 'Validando...');
  const body = Object.fromEntries(new FormData(form));
  try {
    const result = await api(endpoint, { method: 'POST', body: JSON.stringify(body) });
    state.user = result.user;
    state.cart.clear();
    renderAuth();
    form.reset();
    try { await loadDashboard(); } catch (dashboardError) { toast(`Login concluído, mas parte do painel não carregou: ${dashboardError.message}`, 'warning'); }
    toast(successMessage, 'success');
  } catch (error) {
    setAuthMessage(error.message, 'error');
  } finally {
    setBusy(button, false);
  }
}

async function logout() {
  const button = $('#logout-button');
  setBusy(button, true, 'Saindo...');
  try {
    await api('/api/auth/logout', { method: 'POST' });
    state.user = null;
    state.cart.clear();
    renderAuth();
    showTab('login');
    toast('Você saiu da sua conta com segurança.', 'success');
  } catch (error) {
    toast(error.message, 'error');
  } finally {
    setBusy(button, false);
  }
}

async function loadProducts() {
  state.products = await api('/api/products');
  renderProducts();
}

function renderProducts() {
  const search = ($('#product-search')?.value || '').trim().toLocaleLowerCase('pt-BR');
  const products = state.products.filter(product => `${product.name} ${product.category} ${product.description || ''}`.toLocaleLowerCase('pt-BR').includes(search));
  $('#product-count').textContent = `${products.length} ${products.length === 1 ? 'produto' : 'produtos'}`;
  const canBuy = state.user?.role === 'CUSTOMER';
  $('#products-list').innerHTML = products.map(product => `
    <article class="product">
      <div class="product-info">
        <h3>${escapeHtml(product.name)}</h3>
        <small>${escapeHtml(product.category)} · ${Number(product.available_stock)} disponíveis</small>
        ${product.description ? `<p class="product-description">${escapeHtml(product.description)}</p>` : ''}
      </div>
      <div class="product-actions">
        <span class="price">${money(product.price)}</span>
        ${canBuy ? `<button class="button button-primary add-cart-button" type="button" data-add-cart="${Number(product.id)}" ${Number(product.available_stock) < 1 ? 'disabled' : ''}>Adicionar</button>` : ''}
      </div>
    </article>`).join('') || '<p class="empty-state">Nenhum produto encontrado.</p>';
}

function addToCart(productId) {
  const product = state.products.find(item => Number(item.id) === productId);
  if (!product) return;
  const current = state.cart.get(productId)?.quantity || 0;
  if (current + 1 > Math.min(Number(product.available_stock), 100)) {
    toast('A quantidade solicitada ultrapassa o estoque disponível.', 'warning');
    return;
  }
  state.cart.set(productId, { product, quantity: current + 1 });
  renderCart();
  toast(`${product.name} adicionado ao carrinho.`, 'success');
}

function changeCartQuantity(productId, delta) {
  const entry = state.cart.get(productId);
  if (!entry) return;
  const next = entry.quantity + delta;
  if (next <= 0) state.cart.delete(productId);
  else if (next > Math.min(Number(entry.product.available_stock), 100)) toast('Limite de quantidade atingido para este produto.', 'warning');
  else entry.quantity = next;
  renderCart();
}

function renderCart() {
  const entries = [...state.cart.entries()];
  const totalItems = entries.reduce((sum, [, item]) => sum + item.quantity, 0);
  const total = entries.reduce((sum, [, item]) => sum + Number(item.product.price) * item.quantity, 0);
  $('#cart-count').textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`;
  $('#cart-total').textContent = money(total);
  $('#checkout-button').disabled = !entries.length || state.user?.role !== 'CUSTOMER';
  $('#cart-items').innerHTML = entries.length ? entries.map(([id, item]) => `
    <div class="cart-item">
      <div><div class="cart-item-name">${escapeHtml(item.product.name)}</div><div class="cart-item-price">${money(item.product.price)} cada · ${money(Number(item.product.price) * item.quantity)}</div></div>
      <div class="cart-item-controls">
        <button class="qty-button" type="button" data-cart-delta="-1" data-product-id="${id}" aria-label="Diminuir quantidade">−</button>
        <span class="qty-value">${item.quantity}</span>
        <button class="qty-button" type="button" data-cart-delta="1" data-product-id="${id}" aria-label="Aumentar quantidade">+</button>
        <button class="remove-button" type="button" data-cart-remove="${id}" aria-label="Remover produto">×</button>
      </div>
    </div>`).join('') : '<p class="muted empty-state">Seu carrinho está vazio.</p>';
}

async function checkout() {
  const button = $('#checkout-button');
  const entries = [...state.cart.entries()];
  if (!entries.length) return;
  if (!window.confirm(`Confirmar pedido com ${entries.reduce((sum, [, item]) => sum + item.quantity, 0)} item(ns), total de ${$('#cart-total').textContent}?`)) return;
  setBusy(button, true, 'Finalizando...');
  try {
    const result = await api('/api/orders', { method: 'POST', body: JSON.stringify({ items: entries.map(([product_id, item]) => ({ product_id, quantity: item.quantity })) }) });
    state.cart.clear();
    renderCart();
    toast(`Pedido ${result.order.order_number} criado! Código de rastreio: ${result.order.tracking_code}`, 'success');
    await Promise.all([loadProducts(), loadOrders()]);
  } catch (error) {
    toast(error.message, 'error');
  } finally {
    setBusy(button, false);
  }
}

async function loadOrders() {
  if (state.user?.role !== 'CUSTOMER') return;
  const rows = await api('/api/orders/mine');
  $('#orders-list').innerHTML = rows.length ? rows.map(order => `
    <article class="order-row">
      <div class="order-row-top"><span class="order-number">${escapeHtml(order.order_number)}</span><span class="status-pill ${order.status === 'DELIVERED' ? 'good' : order.status === 'CANCELLED' ? 'warn' : ''}">${escapeHtml(orderLabels[order.status] || order.status)}</span></div>
      <div class="order-meta">${money(order.total)} · ${dateTime(order.created_at)}</div>
      <div class="order-meta">${order.status === 'CANCELLED' ? 'Pedido cancelado.' : `Rastreio: <strong>${escapeHtml(order.tracking_code || 'Aguardando geração')}</strong>${order.delivery_status ? ` · ${escapeHtml(deliveryLabels[order.delivery_status] || order.delivery_status)}` : ''}`}</div>
    </article>`).join('') : '<p class="muted empty-state">Você ainda não possui pedidos.</p>';
}

function renderSummary(summary) {
  const values = [
    ['Produtos ativos', summary.products],
    ['Pedidos', summary.orders],
    ['Clientes', summary.customers],
    ['Unidades livres', summary.available_units],
    ['Valor em pedidos', money(summary.orders_value)]
  ];
  $('#admin-summary').innerHTML = values.map(([label, value]) => `<div class="stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('');
}

async function loadCategories() {
  state.categories = await api('/api/admin/categories');
  $('#product-category').innerHTML = '<option value="">Selecione</option>' + state.categories.map(category => `<option value="${Number(category.id)}">${escapeHtml(category.name)}</option>`).join('');
}

async function loadManagedProducts() {
  const rows = await api('/api/products/manage');
  $('#managed-products').innerHTML = rows.length ? `<table class="data-table"><thead><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Status</th><th>Ações</th></tr></thead><tbody>${rows.map(product => `
    <tr><td>${escapeHtml(product.name)}</td><td>${escapeHtml(product.category)}</td><td>${money(product.price)}</td><td><span class="status-pill ${product.active ? 'good' : 'warn'}">${product.active ? 'Ativo' : 'Inativo'}</span></td>
    <td><div class="table-actions"><button class="table-action" type="button" data-edit-product="${Number(product.id)}">Editar</button>${product.active ? `<button class="table-action danger" type="button" data-disable-product="${Number(product.id)}">Desativar</button>` : `<button class="table-action" type="button" data-enable-product="${Number(product.id)}">Reativar</button>`}</div></td></tr>`).join('')}</tbody></table>` : '<p class="muted empty-state">Nenhum produto cadastrado.</p>';
}

function resetProductForm() {
  $('#product-form').reset();
  $('#product-form [name="id"]').value = '';
  $('#product-form [name="weight"]').value = '0';
  $('#cancel-product-edit').classList.add('hidden');
  $('button[type="submit"]', $('#product-form')).textContent = 'Salvar produto';
}

async function saveProduct(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const values = Object.fromEntries(new FormData(form));
  const id = values.id;
  const payload = { category_id: Number(values.category_id), name: values.name.trim(), description: values.description.trim(), price: Number(values.price), weight: Number(values.weight || 0), active: values.active !== 'false' };
  const button = $('button[type="submit"]', form);
  setBusy(button, true, 'Salvando...');
  try {
    const result = await api(id ? `/api/products/${id}` : '/api/products', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) });
    toast(result.message || 'Produto salvo com sucesso.', 'success');
    resetProductForm();
    await Promise.all([loadProducts(), loadManagedProducts(), loadAdminSummary()]);
  } catch (error) {
    toast(error.message, 'error');
  } finally {
    setBusy(button, false);
  }
}

async function editProduct(id) {
  const product = await api('/api/products/manage');
  const selected = product.find(item => Number(item.id) === id);
  if (!selected) return toast('Produto não encontrado.', 'error');
  const form = $('#product-form');
  form.elements.id.value = selected.id;
  form.elements.active.value = String(Boolean(selected.active));
  form.elements.name.value = selected.name;
  form.elements.category_id.value = selected.category_id;
  form.elements.price.value = selected.price;
  form.elements.weight.value = selected.weight;
  form.elements.description.value = selected.description || '';
  $('#cancel-product-edit').classList.remove('hidden');
  $('button[type="submit"]', form).textContent = 'Atualizar produto';
  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function setProductActive(id, active) {
  const action = active ? 'reativar' : 'desativar';
  if (!window.confirm(`Tem certeza que deseja ${action} este produto?`)) return;
  try {
    const [product] = (await api('/api/products/manage')).filter(item => Number(item.id) === id);
    if (!product) throw new Error('Produto não encontrado.');
    const result = await api(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify({ category_id: product.category_id, name: product.name, description: product.description || '', price: Number(product.price), weight: Number(product.weight || 0), active }) });
    toast(result.message || 'Status do produto atualizado.', 'success');
    await Promise.all([loadProducts(), loadManagedProducts(), loadAdminSummary()]);
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function loadInventory() {
  const rows = await api('/api/inventory');
  $('#inventory-list').innerHTML = rows.length ? `<table class="data-table"><thead><tr><th>Produto</th><th>Armazém</th><th>Disponível</th><th>Total</th><th>Ajustar</th></tr></thead><tbody>${rows.map(item => `
    <tr><td>${escapeHtml(item.product)}</td><td>${escapeHtml(item.warehouse)}</td><td>${Number(item.available)}</td><td>${Number(item.quantity)}</td><td><div class="table-actions"><input class="table-input" type="number" min="${Number(item.reserved_quantity)}" value="${Number(item.quantity)}" data-stock-value="${Number(item.id)}" aria-label="Nova quantidade de ${escapeHtml(item.product)}"><button class="table-action" type="button" data-save-stock="${Number(item.id)}">Salvar</button></div></td></tr>`).join('')}</tbody></table>` : '<p class="muted empty-state">Nenhum registro de estoque.</p>';
}

async function updateInventory(id) {
  const input = $(`[data-stock-value="${id}"]`);
  const quantity = Number(input?.value);
  if (!Number.isInteger(quantity) || quantity < 0) return toast('Informe uma quantidade inteira válida.', 'warning');
  try {
    const result = await api(`/api/inventory/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) });
    toast(result.message || 'Estoque atualizado.', 'success');
    await Promise.all([loadInventory(), loadProducts(), loadAdminSummary()]);
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function loadStaffOrders() {
  const rows = await api('/api/orders');
  $('#staff-orders').innerHTML = rows.length ? `<table class="data-table"><thead><tr><th>Pedido</th><th>Cliente</th><th>Total</th><th>Status</th><th>Alterar</th></tr></thead><tbody>${rows.map(order => `
    <tr><td>${escapeHtml(order.order_number)}</td><td>${escapeHtml(order.customer)}</td><td>${money(order.total)}</td><td>${escapeHtml(orderLabels[order.status] || order.status)}</td><td><div class="table-actions"><select class="table-select" data-order-status="${Number(order.id)}" aria-label="Status do pedido">${Object.entries(orderLabels).map(([value, label]) => `<option value="${value}" ${value === order.status ? 'selected' : ''}>${label}</option>`).join('')}</select><button class="table-action" type="button" data-save-order="${Number(order.id)}">Salvar</button></div></td></tr>`).join('')}</tbody></table>` : '<p class="muted empty-state">Nenhum pedido recebido.</p>';
}

async function updateOrderStatus(id) {
  const status = $(`[data-order-status="${id}"]`)?.value;
  if (!status) return;
  if (status === 'CANCELLED' && !window.confirm('Cancelar este pedido e liberar o estoque reservado?')) return;
  try {
    const result = await api(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    toast(result.message || 'Status do pedido atualizado.', 'success');
    await Promise.all([loadStaffOrders(), loadDeliveries(), loadInventory(), loadAdminSummary(), loadProducts()]);
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function loadDeliveries() {
  const rows = await api('/api/deliveries');
  $('#deliveries-list').innerHTML = rows.length ? `<table class="data-table"><thead><tr><th>Rastreio</th><th>Pedido</th><th>Cliente</th><th>Status</th><th>Alterar</th></tr></thead><tbody>${rows.map(delivery => `
    <tr><td>${escapeHtml(delivery.tracking_code)}</td><td>${escapeHtml(delivery.order_number)}</td><td>${escapeHtml(delivery.customer)}</td><td>${escapeHtml(deliveryLabels[delivery.status] || delivery.status)}</td><td><div class="table-actions"><select class="table-select" data-delivery-status="${Number(delivery.id)}" aria-label="Status da entrega">${Object.entries(deliveryLabels).map(([value, label]) => `<option value="${value}" ${value === delivery.status ? 'selected' : ''}>${label}</option>`).join('')}</select><button class="table-action" type="button" data-save-delivery="${Number(delivery.id)}">Salvar</button></div></td></tr>`).join('')}</tbody></table>` : '<p class="muted empty-state">Nenhuma entrega cadastrada.</p>';
}

async function updateDeliveryStatus(id) {
  const status = $(`[data-delivery-status="${id}"]`)?.value;
  if (!status) return;
  try {
    const result = await api(`/api/deliveries/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    toast(result.message || 'Entrega atualizada.', 'success');
    await Promise.all([loadDeliveries(), loadStaffOrders(), loadInventory(), loadAdminSummary(), loadProducts()]);
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function loadAdminSummary() {
  if (!staffRoles.includes(state.user?.role)) return;
  const summary = await api('/api/admin/summary');
  renderSummary(summary);
}

async function loadStaffDashboard() {
  if (!staffRoles.includes(state.user?.role)) return;
  const tasks = [loadAdminSummary(), loadInventory(), loadStaffOrders(), loadDeliveries()];
  if (['ADMIN', 'MANAGER'].includes(state.user.role)) tasks.push(loadCategories(), loadManagedProducts());
  await Promise.all(tasks);
}

async function loadDashboard() {
  await loadProducts();
  if (state.user.role === 'CUSTOMER') await loadOrders();
  if (staffRoles.includes(state.user.role)) await loadStaffDashboard();
}

async function trackDelivery(event) {
  event.preventDefault();
  const code = new FormData(event.currentTarget).get('code');
  const result = $('#tracking-result');
  result.textContent = 'Consultando rastreio...';
  try {
    const delivery = await api(`/api/deliveries/track/${encodeURIComponent(String(code).trim())}`);
    const deliveryStatus = delivery.order_status === 'CANCELLED' ? 'Pedido cancelado' : (deliveryLabels[delivery.status] || delivery.status);
    result.innerHTML = `<strong>${escapeHtml(delivery.tracking_code)}</strong><br>Pedido: ${escapeHtml(delivery.order_number)}<br>Status: ${escapeHtml(deliveryStatus)}<br>Última atualização: ${dateTime(delivery.updated_at)}${delivery.estimated_delivery ? `<br>Previsão: ${new Date(`${delivery.estimated_delivery}T12:00:00`).toLocaleDateString('pt-BR')}` : ''}`;
  } catch (error) {
    result.textContent = error.message;
  }
}

async function requestPasswordReset(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = $('#request-reset-button');
  const email = form.elements.email.value.trim();
  setBusy(button, true, 'Enviando...');
  try {
    const result = await api('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
    setAuthMessage(`${result.message} Confira seu e-mail ou o terminal local do servidor.`, 'success');
  } catch (error) {
    setAuthMessage(error.message, 'error');
  } finally {
    setBusy(button, false);
  }
}

async function resetPassword() {
  const form = $('#recovery-form');
  const button = $('#reset-password-button');
  const values = new FormData(form);
  setBusy(button, true, 'Redefinindo...');
  try {
    const result = await api('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ email: values.get('email'), code: values.get('code'), password: values.get('password') }) });
    showTab('login');
    setAuthMessage(result.message, 'success');
    form.reset();
  } catch (error) {
    setAuthMessage(error.message, 'error');
  } finally {
    setBusy(button, false);
  }
}

function bindEvents() {
  $$('.tab').forEach(button => button.addEventListener('click', () => showTab(button.dataset.tab)));
  $('#login-form').addEventListener('submit', event => { event.preventDefault(); authenticate(event.currentTarget, '/api/auth/login', 'Login realizado com sucesso.'); });
  $('#register-form').addEventListener('submit', event => { event.preventDefault(); authenticate(event.currentTarget, '/api/auth/register', 'Conta criada com sucesso.'); });
  $('#show-recovery').addEventListener('click', showRecovery);
  $('#back-login').addEventListener('click', () => showTab('login'));
  $('#recovery-form').addEventListener('submit', requestPasswordReset);
  $('#reset-password-button').addEventListener('click', resetPassword);
  $('#logout-button').addEventListener('click', logout);
  $('#products-list').addEventListener('click', event => {
    const button = event.target.closest('[data-add-cart]');
    if (button) addToCart(Number(button.dataset.addCart));
  });
  $('#cart-items').addEventListener('click', event => {
    const change = event.target.closest('[data-cart-delta]');
    const remove = event.target.closest('[data-cart-remove]');
    if (change) changeCartQuantity(Number(change.dataset.productId), Number(change.dataset.cartDelta));
    if (remove) { state.cart.delete(Number(remove.dataset.cartRemove)); renderCart(); }
  });
  $('#checkout-button').addEventListener('click', checkout);
  $('#product-search').addEventListener('input', renderProducts);
  $('#refresh-orders').addEventListener('click', () => loadOrders().catch(error => toast(error.message, 'error')));
  $('#refresh-all').addEventListener('click', async () => { const button = $('#refresh-all'); setBusy(button, true, 'Atualizando...'); try { await loadDashboard(); toast('Dados atualizados.', 'success'); } catch (error) { toast(error.message, 'error'); } finally { setBusy(button, false); } });
  $('#track-form').addEventListener('submit', trackDelivery);
  $('#product-form').addEventListener('submit', saveProduct);
  $('#cancel-product-edit').addEventListener('click', resetProductForm);
  $('#managed-products').addEventListener('click', event => {
    const edit = event.target.closest('[data-edit-product]');
    const disable = event.target.closest('[data-disable-product]');
    const enable = event.target.closest('[data-enable-product]');
    if (edit) editProduct(Number(edit.dataset.editProduct)).catch(error => toast(error.message, 'error'));
    if (disable) setProductActive(Number(disable.dataset.disableProduct), false);
    if (enable) setProductActive(Number(enable.dataset.enableProduct), true);
  });
  $('#inventory-list').addEventListener('click', event => { const button = event.target.closest('[data-save-stock]'); if (button) updateInventory(Number(button.dataset.saveStock)); });
  $('#staff-orders').addEventListener('click', event => { const button = event.target.closest('[data-save-order]'); if (button) updateOrderStatus(Number(button.dataset.saveOrder)); });
  $('#deliveries-list').addEventListener('click', event => { const button = event.target.closest('[data-save-delivery]'); if (button) updateDeliveryStatus(Number(button.dataset.saveDelivery)); });
}

async function checkApi() {
  const status = $('#api-status');
  try {
    const health = await api('/api/health');
    status.classList.add('online');
    status.classList.remove('offline');
    status.innerHTML = `<i class="status-dot"></i> API conectada · MySQL ${escapeHtml(health.version)}`;
  } catch {
    status.classList.add('offline');
    status.classList.remove('online');
    status.innerHTML = '<i class="status-dot"></i> API ou banco indisponível';
  }
}

(async function init() {
  bindEvents();
  await checkApi();
  try {
    await loadUser();
  } catch (error) {
    toast(error.message, 'error');
  }
})();
