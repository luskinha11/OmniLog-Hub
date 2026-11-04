const {
  buildDistanceMatrix,
  nearestNeighborMatrixRoute,
  allocateWarehousePallets
} = require('../src/utils/advanced-algorithms');

test('cria matriz de distâncias entre centros', () => {
  const points = [
    { x: 0, y: 0 },
    { x: 3, y: 4 },
    { x: 6, y: 8 }
  ];

  expect(buildDistanceMatrix(points)).toEqual([
    [0, 5, 10],
    [5, 0, 5],
    [10, 5, 0]
  ]);
});

test('monta rota utilizando matriz de distâncias', () => {
  const matrix = [
    [0, 2, 9],
    [2, 0, 3],
    [9, 3, 0]
  ];

  expect(nearestNeighborMatrixRoute(matrix)).toEqual([0, 1, 2]);
});

test('rejeita matriz que não é quadrada', () => {
  expect(() => nearestNeighborMatrixRoute([[0, 1], [1]])).toThrow();
});

test('aloca paletes na matriz tridimensional', () => {
  const result = allocateWarehousePallets(
    [{ id: 'P1', weight: 100 }, { id: 'P2', weight: 150 }],
    {
      corridors: 2,
      shelves: 2,
      levels: 2,
      maxWeightPerSlot: 200,
      hazardousAllowed: false
    }
  );

  expect(result.placed).toHaveLength(2);
  expect(result.unallocated).toHaveLength(0);
  expect(result.matrix[0][0][0].palletId).toBe('P2');
});

test('não permite peso acima do limite', () => {
  const result = allocateWarehousePallets(
    [{ id: 'P1', weight: 300 }],
    {
      corridors: 1,
      shelves: 1,
      levels: 1,
      maxWeightPerSlot: 200
    }
  );

  expect(result.placed).toHaveLength(0);
  expect(result.unallocated).toEqual(['P1']);
});

test('bloqueia cargas perigosas em posições não autorizadas', () => {
  const result = allocateWarehousePallets(
    [{ id: 'P1', weight: 50, hazardous: true }],
    {
      corridors: 1,
      shelves: 1,
      levels: 1,
      maxWeightPerSlot: 200,
      hazardousAllowed: false
    }
  );

  expect(result.placed).toHaveLength(0);
  expect(result.unallocated).toEqual(['P1']);
});

test('rejeita dimensões inválidas do armazém', () => {
  expect(() => allocateWarehousePallets([], {
    corridors: 0,
    shelves: 2,
    levels: 2,
    maxWeightPerSlot: 100
  })).toThrow();
});

test('rejeita peso inválido de palete', () => {
  expect(() => allocateWarehousePallets(
    [{ id: 'P1', weight: -10 }],
    {
      corridors: 1,
      shelves: 1,
      levels: 1,
      maxWeightPerSlot: 100
    }
  )).toThrow();
});
