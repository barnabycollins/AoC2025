import { readFile } from "fs/promises";
import { exit } from "process";

type Range = [number, number];

function rangeInclusive(start: number, end: number) {
  const length = end - start + 1;

  return [...Array(length).keys()].map((i) => i + start);
}

function splitStringAtIndex(input: string, index: number) {
  return input.split(new RegExp(`(?<=^.{${index}})`));
}

function countInvalidIds([start, end]: Range) {
  const stringStart = start.toString();
  const stringEnd = end.toString();

  const startLength = stringStart.length;
  const endLength = stringEnd.length;

  // possible lengths of numbers between the start and end
  const lengthsToCheck = rangeInclusive(startLength, endLength).filter(
    (i) => i % 2 === 0,
  );

  let invalidIds = 0;

  for (const possibleLength of lengthsToCheck) {
    const startFirstHalf = (() => {
      if (possibleLength === startLength) {
        const [firstHalf, secondHalf] = splitStringAtIndex(
          stringStart,
          possibleLength / 2,
        ).map(Number);

        // for, eg, 3638, we don't want to include 3636 - start at 3737
        if (firstHalf < secondHalf) return firstHalf + 1;
        else return firstHalf;
      } else {
        // return 10, 1000, 100000 etc
        return parseInt(
          `1${Array(possibleLength / 2 - 1)
            .fill("0")
            .join("")}`,
        );
      }
    })();

    const endFirstHalf = (() => {
      if (possibleLength === endLength) {
        const [firstHalf, secondHalf] = splitStringAtIndex(
          stringEnd,
          possibleLength / 2,
        ).map(Number);

        // for, eg, 3836, we don't want to include 3838 - end at 3737
        if (firstHalf > secondHalf) return firstHalf - 1;
        else return firstHalf;
      } else {
        // return 99, 9999, 999999 etc
        return parseInt(
          Array(possibleLength / 2)
            .fill("9")
            .join(""),
        );
      }
    })();

    console.log(
      `${startFirstHalf}${startFirstHalf} -> ${endFirstHalf}${endFirstHalf}: ${endFirstHalf - startFirstHalf + 1} invalid (${rangeInclusive(startFirstHalf, endFirstHalf).map((v) => `${v}${v}`)})`,
    );

    for (const firstHalf of rangeInclusive(startFirstHalf, endFirstHalf)) {
      invalidIds += parseInt(`${firstHalf}${firstHalf}`);
    }
  }

  return invalidIds;
}

// =========

const input = String(await readFile("./input.txt"))
  .split("\n")[0]
  .split(",")
  .map((v) => v.split("-").map(Number)) as Range[];

console.log(input);

let totalInvalid = 0;

for (const range of input) {
  console.log(`== Range:`, range);
  totalInvalid += countInvalidIds(range);
  console.log("==========");
}

console.log(`Total invalid IDs: ${totalInvalid}`);
