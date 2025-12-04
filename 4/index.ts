import { readFile } from "fs/promises";

const start = performance.now();

const PART: number = 2;

let grid = String(await readFile("./input.txt"))
  .split("\n")
  .filter((v) => v !== "")
  .map((v) => Array.from<string>(v));

function range(start: number, end: number) {
  const length = end - start;

  return [...Array(length).keys()].map((i) => i + start);
}

function rangeInclusive(start: number, end: number) {
  const length = end - start + 1;

  return [...Array(length).keys()].map((i) => i + start);
}

function countAdjacent(row: number, col: number) {
  let adjacentRolls = 0;

  for (const rowModifier of rangeInclusive(-1, 1)) {
    for (const colModifier of rangeInclusive(-1, 1)) {
      const checkRow = row + rowModifier;
      const checkCol = col + colModifier;

      if (rowModifier === 0 && colModifier === 0) {
        // ignore as this is the paper we are looking at
      } else if (
        Math.min(checkRow, checkCol) < 0 ||
        checkRow >= grid.length ||
        checkCol >= grid[row].length
      ) {
        // ignore as we are outside the grid
      } else {
        if (["@", "x"].includes(grid[checkRow][checkCol])) adjacentRolls += 1;
      }
    }
  }

  return adjacentRolls;
}

function iterate() {
  let accessibleRolls = 0;

  for (const row of range(0, grid.length)) {
    for (const col of range(0, grid[row].length)) {
      if (grid[row][col] === "@") {
        const adjacentRolls = countAdjacent(row, col);
        if (adjacentRolls < 4) {
          accessibleRolls++;
          grid[row][col] = "x";
        }
      }
    }
  }

  console.log(
    `Grid:\n${grid.map((v) => v.join("")).join("\n")}\n\nRemoved ${accessibleRolls} rolls.\n==============`,
  );

  return accessibleRolls;
}

if (PART === 1) {
  const accessible = iterate();

  console.log(
    `Accessible: ${accessible}. Took ${performance.now() - start} ms.`,
  );
} else if (PART === 2) {
  let totalRemoved = 0;
  let removedLastIteration: number;

  do {
    removedLastIteration = iterate();
    totalRemoved += removedLastIteration;
    grid = grid.map((r) => r.map((v) => (v === "x" ? "." : v)));
  } while (removedLastIteration > 0);

  console.log(
    `Total removed: ${totalRemoved}. Took ${performance.now() - start} ms.`,
  );
}
