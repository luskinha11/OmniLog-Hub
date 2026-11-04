function buildDistanceMatrix(points) {
  if (!Array.isArray(points)) {
    throw new TypeError('Os pontos devem ser uma lista.');
  }

  points.forEach((point, index) => {
    if (!Number.isFinite(Number(point.x)) || !Number.isFinite(Number(point.y))) {
      throw new Error(`Coordenadas inválidas no ponto ${index}.`);
    }
  });

  return points.map(a =>
    points.map(b =>
      Math.hypot(
        Number(a.x) - Number(b.x),
        Number(a.y) - Number(b.y)
      )
    )
  );
}

function nearestNeighborMatrixRoute(matrix, startIndex = 0) {
  if (!Array.isArray(matrix)) {
    throw new TypeError('A matriz de distâncias é inválida.');
  }

  const size = matrix.length;

  if (size === 0) return [];

  matrix.forEach(row => {
    if (!Array.isArray(row) || row.length !== size) {
      throw new Error('A matriz deve ser quadrada.');
    }

    row.forEach(value => {
      if (!Number.isFinite(value) || value < 0) {
        throw new Error('A matriz possui distância inválida.');
      }
    });
  });

  if (!Number.isInteger(startIndex) || startIndex < 0 || startIndex >= size) {
    throw new Error('Índice inicial inválido.');
  }

  const remaining = new Set(
    Array.from({ length: size }, (_, index) => index)
  );

  const route = [startIndex];
  remaining.delete(startIndex);

  while (remaining.size > 0) {
    const current = route[route.length - 1];
    let bestIndex = -1;
    let bestDistance = Infinity;

    for (const index of remaining) {
      if (matrix[current][index] < bestDistance) {
        bestDistance = matrix[current][index];
        bestIndex = index;
      }
    }

    route.push(bestIndex);
    remaining.delete(bestIndex);
  }

  return route;
}

function allocateWarehousePallets(pallets, config) {
  if (!Array.isArray(pallets) || !config) {
    throw new TypeError('Paletes ou configuração inválidos.');
  }

  const { corridors, shelves, levels, maxWeightPerSlot } = config;

  const dimensions = [corridors, shelves, levels];

  if (!dimensions.every(value => Number.isInteger(value) && value > 0)) {
    throw new Error('As dimensões do armazém devem ser inteiros positivos.');
  }

  if (!Number.isFinite(maxWeightPerSlot) || maxWeightPerSlot <= 0) {
    throw new Error('Peso máximo por posição inválido.');
  }

  const hazardousAllowed = config.hazardousAllowed === true;
  const restrictedSlots = config.restrictedSlots || [];

  if (!Array.isArray(restrictedSlots)) {
    throw new Error('As restrições de posições devem ser uma lista.');
  }

  const restrictions = new Map();

  for (const slot of restrictedSlots) {
    const { corridor, shelf, level } = slot;

    if (
      !Number.isInteger(corridor) || corridor < 0 || corridor >= corridors ||
      !Number.isInteger(shelf) || shelf < 0 || shelf >= shelves ||
      !Number.isInteger(level) || level < 0 || level >= levels
    ) {
      throw new Error('Restrição de posição fora dos limites do armazém.');
    }

    restrictions.set(`${corridor}-${shelf}-${level}`, slot);
  }

  pallets.forEach((pallet, index) => {
    if (!Number.isFinite(pallet.weight) || pallet.weight <= 0) {
      throw new Error(`Peso inválido no palete ${index + 1}.`);
    }

    if (
      pallet.hazardous !== undefined &&
      typeof pallet.hazardous !== 'boolean'
    ) {
      throw new Error(`Classificação de periculosidade inválida no palete ${index + 1}.`);
    }
  });

  const matrix = Array.from(
    { length: corridors },
    () => Array.from(
      { length: shelves },
      () => Array(levels).fill(null)
    )
  );

  const ordered = [...pallets].sort((a, b) => b.weight - a.weight);

  const placed = [];
  const unallocated = [];

  for (const pallet of ordered) {
    let allocation = null;

    for (let c = 0; c < corridors && !allocation; c++) {
      for (let s = 0; s < shelves && !allocation; s++) {
        for (let l = 0; l < levels && !allocation; l++) {
          if (matrix[c][s][l] !== null) continue;

          const rule = restrictions.get(`${c}-${s}-${l}`) || {};

          const allowedWeight = rule.maxWeight ?? maxWeightPerSlot;
          const allowedHazardous = rule.hazardousAllowed ?? hazardousAllowed;

          if (!Number.isFinite(allowedWeight) || allowedWeight <= 0) {
            throw new Error('Limite de peso da posição inválido.');
          }

          if (pallet.weight > allowedWeight) continue;
          if (pallet.hazardous === true && allowedHazardous !== true) continue;

          allocation = {
            palletId: pallet.id ?? null,
            corridor: c,
            shelf: s,
            level: l,
            weight: pallet.weight,
            hazardous: pallet.hazardous === true
          };

          matrix[c][s][l] = allocation;
          placed.push(allocation);
        }
      }
    }

    if (!allocation) {
      unallocated.push(pallet.id ?? pallet);
    }
  }

  return { matrix, placed, unallocated };
}

module.exports = {
  buildDistanceMatrix,
  nearestNeighborMatrixRoute,
  allocateWarehousePallets
};
