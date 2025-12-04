import { readFile } from "fs/promises";

const start = performance.now();

const PART: 1 | 2 = 2;

type Range = [number, number];

function rangeInclusive(start: number, end: number) {
  const length = end - start + 1;

  return [...Array(length).keys()].map((i) => i + start);
}

function splitStringIntoChunks(input: string, index: number) {
  return [...(input.match(new RegExp(`.{${index}}`, "g")) ?? [])];
}

function getFactors(v: number) {
  if (PART === 1) return v % 2 === 0 ? [2] : [];

  return Array.from(Array(Math.floor(v / 2 + 1)), (_, i) => i).filter(
    (i) => v % i === 0,
  );
}

const invalidIds = new Set<number>();

function countInvalidIds([start, end]: Range) {
  const stringStart = start.toString();
  const stringEnd = end.toString();

  console.log(`Checking range:`, start, end);

  const startLength = stringStart.length;
  const endLength = stringEnd.length;

  // possible lengths of numbers between the start and end
  const lengthsToCheck = rangeInclusive(startLength, endLength).map(
    (length) => ({ length, factors: getFactors(length) }),
  );

  for (const lengthEntry of lengthsToCheck) {
    const possibleLength = lengthEntry.length;

    for (const factor of lengthEntry.factors) {
      const startFirstChunk = (() => {
        if (possibleLength === startLength) {
          const [firstChunk, ...remainingChunks] = splitStringIntoChunks(
            stringStart,
            factor,
          ).map(Number);

          let lastChunkState: "same" | "bigger" | "smaller" = "same";
          let chunkIndex = 0;

          do {
            if (remainingChunks[chunkIndex] > firstChunk)
              lastChunkState = "bigger";
            if (remainingChunks[chunkIndex] < firstChunk)
              lastChunkState = "smaller";

            chunkIndex++;
          } while (
            lastChunkState === "same" &&
            chunkIndex < remainingChunks.length
          );

          // for, eg, 3638, we don't want to include 3636 - start at 3737
          if (lastChunkState === "bigger") return firstChunk + 1;
          else return firstChunk;
        } else {
          // return 10, 1000, 100000 etc
          return parseInt(
            `1${Array(factor - 1)
              .fill("0")
              .join("")}`,
          );
        }
      })();

      const endFirstChunk = (() => {
        if (possibleLength === endLength) {
          const [firstChunk, ...remainingChunks] = splitStringIntoChunks(
            stringEnd,
            factor,
          ).map(Number);

          let lastChunkState: "same" | "bigger" | "smaller" = "same";
          let chunkIndex = 0;

          do {
            if (remainingChunks[chunkIndex] > firstChunk)
              lastChunkState = "bigger";
            if (remainingChunks[chunkIndex] < firstChunk)
              lastChunkState = "smaller";

            chunkIndex++;
          } while (
            lastChunkState === "same" &&
            chunkIndex < remainingChunks.length
          );

          if (lastChunkState === "smaller") return firstChunk - 1;
          else return firstChunk;
        } else {
          return parseInt(`${Array(factor).fill("9").join("")}`);
        }
      })();

      if (startFirstChunk > endFirstChunk) {
        console.log(`No possible invalid ids for chunk length ${factor}`);
        continue;
      }

      console.log(
        `${startFirstChunk.toString().repeat(possibleLength / factor)} -> ${endFirstChunk.toString().repeat(possibleLength / factor)} (chunk length ${factor}): ${endFirstChunk - startFirstChunk + 1} invalid (${rangeInclusive(startFirstChunk, endFirstChunk).map((v) => `${v.toString().repeat(possibleLength / factor)}`)})`,
      );

      for (const firstHalf of rangeInclusive(startFirstChunk, endFirstChunk)) {
        const number = parseInt(
          firstHalf.toString().repeat(possibleLength / factor),
        );

        if (number < start) throw new Error(`start ${number} ${start}`);
        if (number > end) throw new Error(`end ${number} ${end}`);

        invalidIds.add(number);
      }
    }
  }

  console.log("========");
}

// =========

const input = String(await readFile("./input.txt"))
  .split("\n")[0]
  .split(",")
  .map((v) => v.split("-").map(Number)) as Range[];

for (const range of input) {
  countInvalidIds(range);
}

const totalInvalid = [...invalidIds].reduce((acc, cur) => acc + cur, 0);

console.log(
  `Total invalid IDs: ${totalInvalid}. Took ${performance.now() - start} ms.`,
);
