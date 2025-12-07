import { readFile } from "fs/promises";

const start = performance.now();

function range(start: number, end: number) {
  const length = end - start;

  return [...Array(length).keys()].map((i) => i + start);
}

function findCharacterInRow(row: string, character: string): number[] {
  let indices = [];

  for (const index of range(0, row.length)) {
    const char = row[index];

    if (char === character) indices.push(index);
  }

  return indices;
}

function optimiseInput(rows: string[]) {
  const tree: { [key: string]: true } = {};

  for (const rowIndex of range(0, rows.length)) {
    const row = rows[rowIndex];

    for (const splitterIndex of findCharacterInRow(row, "^")) {
      tree[`${rowIndex}-${splitterIndex}`] = true;
    }
  }

  return tree;
}

const [init, ...rows] = String(await readFile("./input.txt"))
  .split("\n")
  .filter((row) => row !== "")
  .filter((row) => !/^\.+$/.test(row));

const [initialBeamIndex] = findCharacterInRow(init, "S");

const beams = new Set([initialBeamIndex]);

let splits = 0;

for (const row of rows) {
  const splitterIndices = findCharacterInRow(row, "^");

  for (const beam of beams) {
    if (splitterIndices.includes(beam)) {
      beams.delete(beam);
      beams.add(beam - 1);
      beams.add(beam + 1);

      splits += 1;
    }
  }
}

console.log(`PART 1: Splits: ${splits}. Took ${performance.now() - start} ms.`);

const optimisedInput = optimiseInput(rows);

const memoisedOutputs: { [key: string]: number } = {};

function simulateTimeline(rowIndex: number, beamIndex: number): number {
  if (rowIndex === rows.length) return 1;

  const key = `${rowIndex}-${beamIndex}`;

  if (key in memoisedOutputs) return memoisedOutputs[key];

  if (optimisedInput[`${rowIndex}-${beamIndex}`] === true) {
    let totalRoutes = 0;

    for (const modifier of [-1, 1]) {
      const routes = simulateTimeline(rowIndex + 1, beamIndex + modifier);

      totalRoutes += routes;
    }

    memoisedOutputs[key] = totalRoutes;

    return totalRoutes;
  } else {
    const result = simulateTimeline(rowIndex + 1, beamIndex);

    memoisedOutputs[key] = result;

    return result;
  }
}

const routes = simulateTimeline(0, initialBeamIndex);

console.log(
  `PART 2: Timelines: ${routes}. Took ${performance.now() - start} ms overall.`,
);
