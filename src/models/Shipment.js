const TRANSITIONS = {
  PREPARING: new Set(['IN_TRANSIT', 'DELAYED']),
  IN_TRANSIT: new Set(['DELAYED', 'DELIVERED']),
  DELAYED: new Set(['IN_TRANSIT', 'DELIVERED']),
  DELIVERED: new Set()
};

class Shipment {
  #status;
  constructor({ trackingCode, status = 'PREPARING' }) {
    if (!String(trackingCode || '').trim()) throw new Error('O código de rastreio é obrigatório.');
    if (!Object.hasOwn(TRANSITIONS, status)) throw new Error('Status de entrega inválido.');
    this.trackingCode = String(trackingCode).trim();
    this.#status = status;
  }
  get status() { return this.#status; }
  moveTo(status) {
    if (!Object.hasOwn(TRANSITIONS, status) || !TRANSITIONS[this.#status].has(status)) {
      throw new Error(`Não é possível alterar a entrega de ${this.#status} para ${status}.`);
    }
    this.#status = status;
    return this.#status;
  }
  dispatch() { return this.moveTo('IN_TRANSIT'); }
  delay() { return this.moveTo('DELAYED'); }
  deliver() { return this.moveTo('DELIVERED'); }
}

module.exports = Shipment;
