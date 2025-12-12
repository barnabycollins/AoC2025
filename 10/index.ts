import { readFile } from "fs/promises";

const start = performance.now();

const machines = String(await readFile("./input.txt"))
  .split("\n")
  .filter((v) => v !== "")
  .map((machineRow) => {
    const matches = [
      ...machineRow.matchAll(
        /^\[([\.#]+)\] ((?:\([0-9,]+\) )+)\{([0-9,]+)\}$/g,
      ),
    ][0];

    const desiredLights = matches[1].split("").map((v) => (v === "." ? 0 : 1));
    const buttons = matches[2]
      .replaceAll("(", "")
      .replaceAll(")", "")
      .split(" ")
      .filter((v) => v !== "")
      .map((m) => m.split(",").map((v) => parseInt(v)))
      .sort((a, b) => a.length - b.length);
    const desiredJoltages = matches[3].split(",").map((v) => parseInt(v));

    return { desiredLights, buttons, desiredJoltages };
  });

type Machine = (typeof machines)[number];

function range(start: number, end: number) {
  const length = end - start;

  return [...Array(length).keys()].map((i) => i + start);
}

function rangeInclusive(start: number, end: number) {
  const length = end - start + 1;

  return [...Array(length).keys()].map((i) => i + start);
}

function distributePresses(
  pressesToDivide: number,
  buttonsToAllocate: number,
): number[][] {
  if (pressesToDivide === 0) return [Array(buttonsToAllocate).fill(0)];
  if (buttonsToAllocate === 1) return [[pressesToDivide]];

  let combinations = [];

  for (const index of rangeInclusive(0, pressesToDivide)) {
    const lowerCombinations = distributePresses(
      pressesToDivide - index,
      buttonsToAllocate - 1,
    );

    for (const c of lowerCombinations) {
      combinations.push([index, ...c]);
    }
  }

  return combinations;
}

function executeCombination(
  combo: number[],
  buttons: number[][],
  desiredState: number[],
  part: 1 | 2,
) {
  const state = Array(desiredState.length).fill(0);

  for (const buttonIndex of range(0, buttons.length)) {
    const pressCount = combo[buttonIndex];

    for (const statePosition of buttons[buttonIndex]) {
      state[statePosition] += pressCount;

      if (part === 1) {
        state[statePosition] %= 2;
      } else {
        if (state.some((v, i) => v > desiredState[i])) return false;
      }
    }
  }

  return state.every((v, i) => v === desiredState[i]);
}

function buttonCombinationSearch(
  { desiredLights, buttons, desiredJoltages }: Machine,
  part: 1 | 2,
) {
  const buttonCount = buttons.length;
  const desiredState = part === 1 ? desiredLights : desiredJoltages;

  let pressCount = 0;

  while (true) {
    const buttonCombinations = distributePresses(pressCount, buttonCount);

    for (const combo of buttonCombinations) {
      const matches = executeCombination(combo, buttons, desiredState, part);

      if (matches) {
        return pressCount;
      }
    }

    pressCount++;
  }
}

let totalButtons = 0;
let iters = 0;
for (const machine of machines) {
  iters += 1;
  console.log(`checking machine ${iters}/${machines.length}...`);
  const presses = buttonCombinationSearch(machine, 1);
  console.log(`machine ${iters}: ${presses}`);
  totalButtons += presses;
}

console.log(`Part 1: ${totalButtons}. Took ${performance.now() - start} ms.`);

totalButtons = 0;
iters = 0;

for (const machine of machines) {
  iters += 1;
  console.log(`checking machine ${iters}/${machines.length}...`);
  const presses = buttonCombinationSearch(machine, 2);
  console.log(`machine ${iters}: ${presses}`);
  totalButtons += presses;
}

console.log(`Part 2: ${totalButtons}. Took ${performance.now() - start} ms.`);
