const Vehicle = require('../src/models/Vehicle');
const Shipment = require('../src/models/Shipment');
const Payment = require('../src/models/Payment');

test('Vehicle permite reservar e liberar veículo', () => {
  const vehicle = new Vehicle({ plate: 'ABC1D23', model: 'Van', capacityKg: 1200 });
  vehicle.assign();
  expect(vehicle.status).toBe('IN_USE');
  vehicle.release();
  expect(vehicle.status).toBe('AVAILABLE');
});

test('Vehicle impede manutenção enquanto está em uso', () => {
  const vehicle = new Vehicle({ plate: 'ABC1D23', model: 'Van', capacityKg: 1200 });
  vehicle.assign();
  expect(() => vehicle.sendToMaintenance()).toThrow();
});

test('Shipment segue transições de rastreamento válidas', () => {
  const shipment = new Shipment({ trackingCode: 'OMNI-TEST-001' });
  shipment.dispatch(); shipment.delay(); shipment.dispatch(); shipment.deliver();
  expect(shipment.status).toBe('DELIVERED');
  expect(() => shipment.delay()).toThrow();
});

test('Payment aprova e permite estorno somente após aprovação', () => {
  const payment = new Payment({ method: 'PIX', amount: 99.9 });
  payment.approve();
  payment.refund();
  expect(payment.status).toBe('REFUNDED');
  expect(() => payment.approve()).toThrow();
});
