import { readFile } from "fs/promises";

const start = performance.now();

const FLOOR_POWER = 8;
const distanceStep = 2 ** FLOOR_POWER;

function floorToNearestPower(input: number) {
  return Math.floor(input / 2 ** FLOOR_POWER) * 2 ** FLOOR_POWER;
}

const coords = String(await readFile("./input.txt"))
  .split("\n")
  .filter((row) => row !== "")
  .map((v) => v.split(",").map((s) => parseInt(s)));

const bucketedCoords = coords.reduce<{ [sum: string]: string[] }>(
  (acc, [x, y, z]) => {
    const key = floorToNearestPower(x + y + z).toString();
    return { ...acc, [key]: [...(acc[key] ?? []), `${x},${y},${z}`] };
  },
  {},
);

const [maxX, maxY, maxZ] = coords.reduce((acc, [x, y, z]) => [
  Math.max(acc[0], x),
  Math.max(acc[1], y),
  Math.max(acc[2], z),
]);

function measureDistance(a: number[], b: number[]) {
  return Math.sqrt(
    Math.abs(a[0] - b[0]) ** 2 +
      Math.abs(a[1] - b[1]) ** 2 +
      Math.abs(a[2] - b[2]) ** 2,
  );
}

const searchDistanceUpperBound = 10000;

const distances: {
  [roundedDistance: string]: {
    coords: [string, string];
    trueDistance: number;
  }[];
} = {};

for (const coord of coords) {
  const x = coord[0];
  const y = coord[1];
  const z = coord[2];
  const nKey = floorToNearestPower(x + y + z);
  const key = nKey.toString();

  let candidateNeighbours = bucketedCoords[key].slice(
    0,
    bucketedCoords[key].indexOf(`${x},${y},${z}`),
  );

  let distance = distanceStep;

  while (distance / 3 < searchDistanceUpperBound) {
    candidateNeighbours.push(
      ...(bucketedCoords[(nKey - distance).toString()] ?? []),
    );

    distance += distanceStep;
  }

  for (const neighbour of candidateNeighbours) {
    const dist = measureDistance(
      coord,
      neighbour.split(",").map((v) => parseInt(v)),
    );

    if (dist < searchDistanceUpperBound) {
      let distKey = floorToNearestPower(dist).toString();
      distances[distKey] = [
        ...(distances[distKey] ?? []),
        { coords: [`${x},${y},${z}`, neighbour], trueDistance: dist },
      ];
    }
  }
}

console.log(`Done bucketing coord pairs.`);

const MAX_CONNECTIONS = 1000;

function connectCircuits() {
  const circuits: Set<string>[] = [];

  let connectionCount = 0;

  for (const pairs of Object.values(distances)) {
    for (const pair of pairs.sort((a, b) => a.trueDistance - b.trueDistance)) {
      const a = pair.coords[0];
      const b = pair.coords[1];

      let circuitA = circuits.findIndex((circuit) => circuit.has(a));
      let circuitB = circuits.findIndex((circuit) => circuit.has(b));

      if (circuitA < 0) {
        circuits.push(new Set([a]));
        circuitA = circuits.length - 1;
      }
      if (circuitB < 0) {
        circuits.push(new Set([b]));
        circuitB = circuits.length - 1;
      }

      if (circuitA !== circuitB) {
        circuits[circuitA] = new Set([
          ...circuits[circuitA],
          ...circuits[circuitB],
        ]);
        circuits.splice(circuitB, 1);
      }

      connectionCount++;
      if (connectionCount >= MAX_CONNECTIONS) return circuits;
    }
  }

  return circuits;
}

const circuits = connectCircuits();

const multipliedCircuitSizes = circuits
  .sort((a, b) => b.size - a.size)
  .slice(0, 3)
  .reduce((acc, cur) => acc * cur.size, 1);

console.log(
  `Part 1: ${multipliedCircuitSizes}. Took ${performance.now() - start} ms.`,
);
