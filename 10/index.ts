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
      .map((m) => m.split(",").map((v) => parseInt(v)));
    const desiredJoltages = matches[3].split(",").map((v) => parseInt(v));

    return { desiredLights, buttons, desiredJoltages };
  });

type Machine = (typeof machines)[number];

type Action = {
  state: number[];
  button: number[];
  buttonPressCount: number;
  buttonHistory: number[][];
};

// breadth first search until the state matches the desired state
function buttonBFS(
  { desiredLights, buttons, desiredJoltages }: Machine,
  mode: 1 | 2,
) {
  const desiredState = mode === 1 ? desiredLights : desiredJoltages;

  let startState = new Array(desiredState.length).fill(0);
  if (startState.every((v, i) => v === desiredState[i])) return 0;

  const actionsToCheck: Action[] = buttons.map((button) => ({
    state: structuredClone(startState),
    button,
    buttonPressCount: 1,
    buttonHistory: [],
  }));

  let alreadySeenCombinations = new Set<string>();

  while (true) {
    const action = actionsToCheck.shift() as Action;

    const key = `${[action.state, action.button].map((v) => v.join(",")).join("_")}`;
    if (alreadySeenCombinations.has(key)) continue;
    alreadySeenCombinations.add(key);

    const state = action.state;

    if (mode === 2 && state.some((v, i) => v > desiredState[i])) continue;

    for (const pos of action.button) {
      state[pos] = mode === 1 ? (state[pos] + 1) % 2 : state[pos] + 1;
    }

    if (state.every((v, i) => v === desiredState[i])) {
      return action.buttonPressCount;
    } else {
      for (const button of buttons.filter(
        (b) => b.join("") !== action.button.join(""),
      )) {
        actionsToCheck.push({
          state: structuredClone(state),
          button,
          buttonPressCount: action.buttonPressCount + 1,
          buttonHistory: [...action.buttonHistory, action.button],
        });
      }
    }
  }
}

let totalButtons = 0;
let iters = 0;
for (const machine of machines) {
  iters += 1;
  console.log(`checking machine ${iters}/${machines.length}...`);
  const presses = buttonBFS(machine, 1);
  console.log(`machine ${iters}: ${presses}`);
  totalButtons += presses;
}

console.log(`Part 1: ${totalButtons}. Took ${performance.now() - start} ms.`);
