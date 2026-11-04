const METHODS = new Set(['PIX', 'CARD', 'BOLETO', 'CASH']);
const TRANSITIONS = {
  PENDING: new Set(['APPROVED', 'REJECTED']),
  APPROVED: new Set(['REFUNDED']),
  REJECTED: new Set(),
  REFUNDED: new Set()
};

class Payment {
  #status = 'PENDING';
  constructor({ method, amount }) {
    if (!METHODS.has(method)) throw new Error('Método de pagamento inválido.');
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) throw new Error('O valor deve ser maior que zero.');
    this.method = method;
    this.amount = Math.round(Number(amount) * 100) / 100;
  }
  get status() { return this.#status; }
  approve() { return this.#move('APPROVED'); }
  reject() { return this.#move('REJECTED'); }
  refund() { return this.#move('REFUNDED'); }
  #move(next) {
    if (!TRANSITIONS[this.#status].has(next)) throw new Error(`Transição de pagamento inválida: ${this.#status} -> ${next}.`);
    this.#status = next;
    return this.#status;
  }
}

module.exports = Payment;
