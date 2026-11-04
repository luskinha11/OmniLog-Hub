const STATUSES = new Set(['AVAILABLE', 'IN_USE', 'MAINTENANCE']);

class Vehicle {
  #status;

  constructor({ plate, model, capacityKg, status = 'AVAILABLE' }) {
    if (!String(plate || '').trim()) throw new Error('A placa é obrigatória.');
    if (!String(model || '').trim()) throw new Error('O modelo é obrigatório.');
    if (!Number.isFinite(Number(capacityKg)) || Number(capacityKg) <= 0) {
      throw new Error('A capacidade deve ser maior que zero.');
    }
    if (!STATUSES.has(status)) throw new Error('Status de veículo inválido.');
    this.plate = String(plate).trim().toUpperCase();
    this.model = String(model).trim();
    this.capacityKg = Number(capacityKg);
    this.#status = status;
  }

  get status() { return this.#status; }
  assign() {
    if (this.#status !== 'AVAILABLE') throw new Error('O veículo não está disponível.');
    this.#status = 'IN_USE';
  }
  release() {
    if (this.#status !== 'IN_USE') throw new Error('O veículo não está em uso.');
    this.#status = 'AVAILABLE';
  }
  sendToMaintenance() {
    if (this.#status === 'IN_USE') throw new Error('Libere o veículo antes da manutenção.');
    this.#status = 'MAINTENANCE';
  }
}

module.exports = Vehicle;
