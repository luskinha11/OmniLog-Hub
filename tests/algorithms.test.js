const { nearestNeighborRoute, routeDistance, optimizeRoute2Opt, calculateOrderTotal, allocate3D } = require('../src/utils/algorithms');

test('calcula total do pedido sem erro de arredondamento', () => {
  expect(calculateOrderTotal([{ price: 10.5, quantity: 2 }, { price: 3, quantity: 1 }])).toBe(24);
});

test('ordena pontos pelo vizinho mais próximo', () => {
  const points = [{ x: 0, y: 0, id: 'A' }, { x: 1, y: 0, id: 'B' }, { x: 9, y: 0, id: 'C' }];
  expect(nearestNeighborRoute(points).map(point => point.id)).toEqual(['A', 'B', 'C']);
});

test('2-opt não aumenta a distância da rota inicial', () => {
  const points = [{x:0,y:0,id:'A'},{x:2,y:8,id:'B'},{x:5,y:2,id:'C'},{x:8,y:9,id:'D'},{x:10,y:0,id:'E'}];
  const initial = nearestNeighborRoute(points);
  const optimized = optimizeRoute2Opt(points);
  expect(optimized[0].id).toBe('A');
  expect(routeDistance(optimized)).toBeLessThanOrEqual(routeDistance(initial) + 1e-9);
});

test('rejeita quantidade inválida', () => {
  expect(() => calculateOrderTotal([{ price: 5, quantity: 0 }])).toThrow();
});

test('aloca caixas em 3D sem sobreposição', () => {
  const result = allocate3D(
    [{id:'A',width:4,height:4,depth:4},{id:'B',width:4,height:4,depth:4}],
    [{id:'BIN-1',width:8,height:4,depth:4}]
  );
  expect(result.placed).toHaveLength(2);
  expect(result.unallocated).toHaveLength(0);
  expect(result.placed[0].x + result.placed[0].width).toBeLessThanOrEqual(8);
  expect(result.placed[1].x).toBe(4);
});

test('informa itens que não cabem no armazém', () => {
  const result = allocate3D([{id:'A',width:10,height:10,depth:10}], [{id:'BIN-1',width:5,height:5,depth:5}]);
  expect(result.unallocated).toEqual(['A']);
});
