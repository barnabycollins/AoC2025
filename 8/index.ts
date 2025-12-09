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

const coordCount = coords.length;

const bucketedCoords = coords.reduce<{ [sum: string]: string[] }>(
  (acc, [x, y, z]) => {
    const key = floorToNearestPower(x + y + z).toString();
    return { ...acc, [key]: [...(acc[key] ?? []), `${x},${y},${z}`] };
  },
  {},
);

function measureDistance(a: number[], b: number[]) {
  return Math.sqrt(
    Math.abs(a[0] - b[0]) ** 2 +
      Math.abs(a[1] - b[1]) ** 2 +
      Math.abs(a[2] - b[2]) ** 2,
  );
}

const searchDistanceUpperBound = 50000;

const distances: {
  [roundedDistance: string]: {
    coords: string[];
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
      ].sort((a, b) => a.trueDistance - b.trueDistance);
    }
  }
}

console.log(
  `Done bucketing coord pairs after ${performance.now() - start} ms.`,
);

const MAX_CONNECTIONS = 1000;

function connectPairFactory(circuits: Set<string>[]) {
  return function (a: string, b: string) {
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
  };
}

function connectCircuitsPartA() {
  const circuits: Set<string>[] = [];

  const connectPair = connectPairFactory(circuits);

  let connectionCount = 0;

  for (const pairs of Object.values(distances)) {
    for (const pair of pairs) {
      const a = pair.coords[0];
      const b = pair.coords[1];

      connectPair(a, b);

      connectionCount++;
      if (connectionCount >= MAX_CONNECTIONS) return circuits;
    }
  }

  return circuits;
}

const partACircuits = connectCircuitsPartA();

const partAResult = partACircuits
  .sort((a, b) => b.size - a.size)
  .slice(0, 3)
  .reduce((acc, cur) => acc * cur.size, 1);

console.log(`Part 1: ${partAResult}. Took ${performance.now() - start} ms.`);

function connectCircuitsPartB() {
  const circuits: Set<string>[] = [];

  const connectPair = connectPairFactory(circuits);

  let connectionCount = 0;

  for (const pairs of Object.values(distances)) {
    for (const pair of pairs) {
      const a = pair.coords[0];
      const b = pair.coords[1];

      connectPair(a, b);

      connectionCount++;
      if (circuits[0].size === coordCount) return { circuits, lastPair: pair };
    }
  }

  throw new Error(`Ran out of connections to make!`);
}

const { lastPair } = connectCircuitsPartB();

const partBResult = lastPair.coords
  .map((v) => parseInt(v.split(",")[0]))
  .reduce((acc, cur) => acc * cur, 1);

console.log(
  `Part 2: ${partBResult}. Took ${performance.now() - start} ms overall.`,
);
