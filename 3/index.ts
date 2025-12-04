import { readFile } from "fs/promises";

const start = performance.now();

const banks = String(await readFile("./input.txt"))
  .split("\n")
  .filter((v) => v !== "");

const BATTERIES_PER_BANK = 12;

function range(start: number, end: number) {
  const length = end - start;

  return [...Array(length).keys()].map((i) => i + start);
}

export function findMaxJoltage(bank: string) {
  console.log(`BANK: ${bank}`);

  let totalJoltage = "";

  let lowerSearchBound = 0;

  for (const joltageDigit of range(0, BATTERIES_PER_BANK)) {
    let maxJoltageIndex = lowerSearchBound;

    for (
      let batteryIndex = lowerSearchBound;
      batteryIndex < bank.length - (BATTERIES_PER_BANK - joltageDigit - 1);
      batteryIndex++
    ) {
      if (bank[batteryIndex] > bank[maxJoltageIndex]) {
        maxJoltageIndex = batteryIndex;
      }
    }

    console.log(
      `Found digit '${bank[maxJoltageIndex]}' at index ${maxJoltageIndex}.`,
    );

    totalJoltage += bank[maxJoltageIndex];
    lowerSearchBound = maxJoltageIndex + 1;
  }

  console.log(`Max joltage: ${totalJoltage}\n========`);

  return parseInt(totalJoltage);
}

let totalJoltage = 0;

for (const bank of banks) {
  totalJoltage += findMaxJoltage(bank);
}

console.log(
  `Total joltage: ${totalJoltage}. Time taken: ${performance.now() - start} ms`,
);
