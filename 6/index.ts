import { readFile } from "fs/promises";

const start = performance.now();

type Operator = "*" | "+";

function flip2DArray<T>(rows: T[][]) {
  return rows[0].map((_, colIndex) => rows.map((row) => row[colIndex]));
}

function multiply(a: number, b: number) {
  return a * b;
}
function add(a: number, b: number) {
  return a + b;
}

function convertOperatorToReduceParams(
  operator: Operator,
): [typeof add, number] {
  return operator === "*" ? [multiply, 1] : [add, 0];
}

function solveProblemString(problem: string) {
  const rows = problem.split("\n");
  const operator = rows[0][rows[0].length - 1] as Operator;

  const numbers = rows.map((row) =>
    parseInt(row.replaceAll("*", "").replaceAll("+", "")),
  );

  const [func, initialValue] = convertOperatorToReduceParams(operator);

  return numbers.reduce(func, initialValue);
}

const input = String(await readFile("./input.txt"));

const rows = input
  .split("\n")
  .filter((v) => v !== "")
  .map((v) =>
    v
      .split(/ +/)
      .filter((v) => v !== "")
      .map((n) => (n.match(/^[0-9]+$/) ? parseInt(n) : n)),
  );

const columns = flip2DArray(rows);

let humanTotal = 0;

for (const column of columns) {
  const operator = column.pop() as Operator;

  let intColumn = column as number[];

  const [func, initialValue] = convertOperatorToReduceParams(operator);

  humanTotal += intColumn.reduce(func, initialValue);
}

console.log(
  `Human total: ${humanTotal}. Took ${performance.now() - start} ms.`,
);

// flip the input file along the leading diagonal so it's laid out like human maths
// convert to a 2D array, flip and then convert back to a string again, removing all spaces
const flippedInput = flip2DArray(
  input.split("\n").map((str) => Array.from(str)),
)
  .map((row) => row.filter((v) => v !== " ").join(""))
  .join("\n");

console.log(flippedInput);

const problemStrings = flippedInput.split(/\n\n/);

let cephalopodTotal = 0;

for (const problem of problemStrings) {
  cephalopodTotal += solveProblemString(problem);
}

console.log(
  `Cephalopod total: ${cephalopodTotal}. Took ${performance.now() - start} ms overall.`,
);
