import { readFile } from "fs/promises";

const start = performance.now();

const input = String(await readFile("./input.txt"))
  .split("\n\n")
  .filter((v) => v !== "");

const ranges = input[0].split("\n").map((v) => v.split("-"));
const ids = input[1].split("\n").filter((v) => v !== "");

type DigitTree =
  | {
      [digit: string]: DigitTree;
    }
  | true;
type IDCheckTree = { [length: string]: DigitTree };

function rangeInclusive(start: number, end: number) {
  const length = end - start + 1;

  return [...Array(length).keys()].map((i) => i + start);
}

function buildTreeSegment(
  rangeStart: string,
  rangeEnd: string,
  inputTree: DigitTree,
): DigitTree {
  // if another range has already set this path to true then leave it alone
  if (inputTree === true) {
    return true;
  }

  // if the range is, eg, 000 - 999 then we know anything will fit
  if (/^0+$/.test(rangeStart) && /^9+$/.test(rangeEnd)) {
    return true;
  }

  const currentNumberLength = rangeStart.length;

  for (const digit of rangeInclusive(
    parseInt(rangeStart[0]),
    parseInt(rangeEnd[0]),
  ).map((v) => v.toString())) {
    if (currentNumberLength === 1) {
      inputTree[digit] = true;
    } else {
      const nextRangeStart =
        digit === rangeStart[0]
          ? rangeStart.substring(1)
          : `${Array(currentNumberLength - 1)
              .fill("0")
              .join("")}`;

      const nextRangeEnd =
        digit === rangeEnd[0]
          ? rangeEnd.substring(1)
          : `${Array(currentNumberLength - 1)
              .fill("9")
              .join("")}`;

      inputTree[digit] = buildTreeSegment(
        nextRangeStart,
        nextRangeEnd,
        inputTree[digit] ?? {},
      );
    }
  }

  return inputTree;
}

function buildCheckTree(ranges: string[][]) {
  const tree: IDCheckTree = {};

  for (const [start, end] of ranges) {
    for (const numberLength of rangeInclusive(start.length, end.length)) {
      const rangeStart = Math.max(
        parseInt(start),
        parseInt(
          `1${Array(numberLength - 1)
            .fill("0")
            .join("")}`,
        ),
      ).toString();

      const rangeEnd = Math.min(
        parseInt(end),
        parseInt(`${Array(numberLength).fill("9").join("")}`),
      ).toString();

      tree[numberLength.toString()] = buildTreeSegment(
        rangeStart,
        rangeEnd,
        tree[numberLength.toString()] ?? {},
      );
    }
  }

  return tree;
}

function checkId(remainingDigits: string, remainingTree: DigitTree) {
  // handle the (unlikely) case where the top-level tree is true
  if (remainingTree === true) return true;

  const currentDigit = remainingDigits[0];

  if (remainingTree[currentDigit] === true) return true;
  if (!(currentDigit in remainingTree)) return false;

  return checkId(remainingDigits.substring(1), remainingTree[currentDigit]);
}

// ======

const idCheckTree = buildCheckTree(ranges);

console.log(`Tree built in ${performance.now() - start} ms.`);

let validIds = 0;

for (const id of ids) {
  const isValid = checkId(id, idCheckTree[id.length]);

  if (isValid) {
    validIds += 1;
  }
}

console.log(
  `Valid IDs: ${validIds}. Took ${performance.now() - start} ms in total.`,
);
