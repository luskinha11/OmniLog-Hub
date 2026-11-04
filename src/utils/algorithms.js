// Rota demonstrativa: vizinho mais próximo (heurística gulosa).
// Distâncias devem usar a mesma unidade e pontos precisam de x/y numéricos.
function nearestNeighborRoute(points, startIndex = 0) {
  if (!Array.isArray(points) || points.length === 0) return [];
  if (!Number.isInteger(startIndex) || startIndex < 0 || startIndex >= points.length) {
    throw new Error('Índice inicial inválido.');
  }
  const distance = (a, b) => Math.hypot(Number(a.x) - Number(b.x), Number(a.y) - Number(b.y));
  const remaining = new Set(points.map((_, index) => index));
  const route = [startIndex];
  remaining.delete(startIndex);
  while (remaining.size) {
    const current = points[route[route.length - 1]];
    let bestIndex = -1;
    let bestDistance = Infinity;
    for (const index of remaining) {
      const candidateDistance = distance(current, points[index]);
      if (candidateDistance < bestDistance) {
        bestDistance = candidateDistance;
        bestIndex = index;
      }
    }
    route.push(bestIndex);
    remaining.delete(bestIndex);
  }
  return route.map(index => points[index]);
}

function routeDistance(route) {
  let total = 0;
  for (let i = 1; i < route.length; i += 1) {
    total += Math.hypot(
      Number(route[i].x) - Number(route[i - 1].x),
      Number(route[i].y) - Number(route[i - 1].y)
    );
  }
  return total;
}

// Melhoria 2-opt: tenta reduzir cruzamentos sem alterar o ponto inicial.
function optimizeRoute2Opt(points, startIndex = 0) {
  let best = nearestNeighborRoute(points, startIndex);
  if (best.length < 4) return best;
  let improved = true;
  while (improved) {
    improved = false;
    const currentDistance = routeDistance(best);
    for (let i = 1; i < best.length - 1 && !improved; i += 1) {
      for (let k = i + 1; k < best.length; k += 1) {
        const candidate = [
          ...best.slice(0, i),
          ...best.slice(i, k + 1).reverse(),
          ...best.slice(k + 1)
        ];
        if (routeDistance(candidate) + 1e-9 < currentDistance) {
          best = candidate;
          improved = true;
          break;
        }
      }
    }
  }
  return best;
}

function calculateOrderTotal(items) {
  if (!Array.isArray(items)) throw new TypeError('A lista de itens é inválida.');
  return items.reduce((sum, item) => {
    const price = Number(item.price);
    const quantity = Number(item.quantity);
    if (!Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('Preço ou quantidade inválidos.');
    }
    return sum + Math.round(price * 100) * quantity;
  }, 0) / 100;
}

function validateDimensions(item, label = 'Item') {
  const dimensions = ['width', 'height', 'depth'];
  for (const key of dimensions) {
    if (!Number.isFinite(Number(item[key])) || Number(item[key]) <= 0) {
      throw new Error(`${label}: dimensão ${key} deve ser maior que zero.`);
    }
  }
}

function uniqueOrientations(item) {
  const values = [
    [Number(item.width), Number(item.height), Number(item.depth)],
    [Number(item.width), Number(item.depth), Number(item.height)],
    [Number(item.height), Number(item.width), Number(item.depth)],
    [Number(item.height), Number(item.depth), Number(item.width)],
    [Number(item.depth), Number(item.width), Number(item.height)],
    [Number(item.depth), Number(item.height), Number(item.width)]
  ];
  const seen = new Set();
  return values.filter(dimensions => {
    const key = dimensions.join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function overlaps(a, b) {
  return !(
    a.x + a.width <= b.x || b.x + b.width <= a.x ||
    a.y + a.height <= b.y || b.y + b.height <= a.y ||
    a.z + a.depth <= b.z || b.z + b.depth <= a.z
  );
}

// Alocação 3D didática: first-fit por volume com pontos de encaixe e rotação.
// Cada caixa é alocada em um único espaço, sem sobreposição, dentro de um bin.
function allocate3D(items, bins) {
  if (!Array.isArray(items) || !Array.isArray(bins)) throw new TypeError('Itens e espaços devem ser listas.');
  bins.forEach((bin, index) => validateDimensions(bin, `Espaço ${index + 1}`));
  items.forEach((item, index) => validateDimensions(item, `Item ${index + 1}`));
  const available = bins.map(bin => ({ ...bin, placements: [] }));
  const ordered = [...items].sort((a, b) =>
    (Number(b.width) * Number(b.height) * Number(b.depth)) -
    (Number(a.width) * Number(a.height) * Number(a.depth))
  );
  const placed = [];
  const unallocated = [];

  for (const item of ordered) {
    let result = null;
    for (const bin of available) {
      const xs = new Set([0]);
      const ys = new Set([0]);
      const zs = new Set([0]);
      for (const box of bin.placements) {
        xs.add(box.x + box.width);
        ys.add(box.y + box.height);
        zs.add(box.z + box.depth);
      }
      const candidates = [];
      for (const z of zs) for (const y of ys) for (const x of xs) candidates.push({ x, y, z });
      candidates.sort((a, b) => a.z - b.z || a.y - b.y || a.x - b.x);
      for (const point of candidates) {
        for (const [width, height, depth] of uniqueOrientations(item)) {
          if (point.x + width > Number(bin.width) || point.y + height > Number(bin.height) || point.z + depth > Number(bin.depth)) continue;
          const candidate = { itemId: item.id ?? null, binId: bin.id ?? null, x: point.x, y: point.y, z: point.z, width, height, depth };
          if (bin.placements.every(existing => !overlaps(candidate, existing))) {
            bin.placements.push(candidate);
            result = candidate;
            break;
          }
        }
        if (result) break;
      }
      if (result) break;
    }
    if (result) placed.push(result);
    else unallocated.push(item.id ?? item);
  }
  return { placed, unallocated };
}

module.exports = { nearestNeighborRoute, routeDistance, optimizeRoute2Opt, calculateOrderTotal, allocate3D };
