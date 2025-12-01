import { readFile } from "fs/promises";

// https://adventofcode.com/2025/day/1

const STARTING_POSITION = 50;
const DIAL_SIZE = 100;

type RotationString = `${"L" | "R"}${number}`;

const rotationRegex = /^(L|R)([0-9]+)$/g;

function mod(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

function parseRotation(rotation: RotationString) {
  const [_, directionString, distanceString] = [
    ...rotation.matchAll(rotationRegex),
  ][0];

  const direction = directionString === "L" ? -1 : 1;
  const distance = parseInt(distanceString);

  return { direction, distance };
}

function rotateDial(startPosition: number, rotation: RotationString) {
  const { direction, distance } = parseRotation(rotation);

  return mod(startPosition + direction * distance, DIAL_SIZE);
}

function countClicks(startPosition: number, rotationString: RotationString) {
  const { direction, distance } = parseRotation(rotationString);

  // convert left turns into right turns by 'flipping' the dial - we can now add the distance on
  const adjustedStartPosition =
    direction === -1 ? mod(DIAL_SIZE - startPosition, 100) : startPosition;

  // adjustedStartPosition and distance are now always positive and always in the same 'direction'
  const rotationEnd = adjustedStartPosition + distance;

  return Math.floor(rotationEnd / DIAL_SIZE);
}

// =========

const input = String(await readFile("./input.txt"))
  .split("\n")
  .filter((v) => v !== "") as RotationString[];

let position = STARTING_POSITION;

let zeroPositionCount = 0;
let clickCount = 0;

for (const rotation of input) {
  const start = position;

  clickCount += countClicks(position, rotation);

  position = rotateDial(position, rotation);

  const isZero = position === 0;
  if (isZero) zeroPositionCount++;

  console.log(
    `${start} --[${rotation}]-> ${position} (${clickCount} clicks)${isZero ? " [ZERO]" : ""}`,
  );
}

console.log(`Zeros: ${zeroPositionCount}`);
console.log(`Clicks: ${clickCount}`);
