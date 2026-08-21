"use client";

import { useState } from "react";

type Operation = "+" | "-" | "×";
type Problem = { a: number; b: number; op: Operation; answer: number; choices: number[] };

const QUESTIONS_PER_ROUND = 10;

const LEVELS = [
  { id: 1, label: "Niveau 1", sub: "5-6 ans · additions jusqu'à 10" },
  { id: 2, label: "Niveau 2", sub: "6-7 ans · + et − jusqu'à 20" },
  { id: 3, label: "Niveau 3", sub: "7-8 ans · jusqu'à 100 et tables" },
];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickDistractors(correct: number, count: number): number[] {
  const offsets = shuffle([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
  const result: number[] = [];
  for (const offset of offsets) {
    const candidate = correct + offset;
    if (candidate >= 0 && candidate !== correct && !result.includes(candidate)) result.push(candidate);
    if (result.length === count) break;
  }
  while (result.length < count) result.push(correct + result.length + 1);
  return result;
}

function generateProblem(level: number): Problem {
  let a: number, b: number, op: Operation, answer: number;

  if (level === 1) {
    a = randInt(1, 9);
    b = randInt(1, 10 - a);
    op = "+";
    answer = a + b;
  } else if (level === 2) {
    op = Math.random() < 0.5 ? "+" : "-";
    if (op === "+") {
      a = randInt(1, 15);
      b = randInt(1, 20 - a);
      answer = a + b;
    } else {
      a = randInt(2, 20);
      b = randInt(1, a);
      answer = a - b;
    }
  } else {
    const roll = Math.random();
    if (roll < 0.4) {
      a = randInt(10, 80);
      b = randInt(1, 100 - a);
      op = "+";
      answer = a + b;
    } else if (roll < 0.8) {
      a = randInt(10, 100);
      b = randInt(1, a);
      op = "-";
      answer = a - b;
    } else {
      const tables = [2, 5, 10];
      a = tables[Math.floor(Math.random() * tables.length)];
      b = randInt(1, 10);
      op = "×";
      answer = a * b;
    }
  }

  const choices = shuffle([answer, ...pickDistractors(answer, 3)]);
  return { a, b, op, answer, choices };
}

export function CalculGame() {
  const [level, setLevel] = useState<number | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  function startLevel(lvl: number) {
    setLevel(lvl);
    setProblems(Array.from({ length: QUESTIONS_PER_ROUND }, () => generateProblem(lvl)));
    setIndex(0);
    setSelected(null);
    setScore(0);
  }

  if (level === null) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <p className="on-bg text-sm">Choisis un niveau :</p>
        <div className="flex flex-wrap gap-3 justify-center">
          {LEVELS.map((lvl) => (
            <button
              key={lvl.id}
              type="button"
              onClick={() => startLevel(lvl.id)}
              className="bg-card border border-border rounded-2xl px-6 py-4 flex flex-col items-center gap-1 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <span className="font-display text-lg text-primary">{lvl.label}</span>
              <span className="text-xs text-muted">{lvl.sub}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (index >= problems.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="text-5xl">🏆</span>
        <p className="font-display text-2xl on-bg">
          {score} / {problems.length} bonnes réponses !
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={() => startLevel(level)} className="rounded-full bg-primary text-primary-foreground text-sm px-5 py-2.5 hover:opacity-90 transition-opacity">
            Rejouer
          </button>
          <button type="button" onClick={() => setLevel(null)} className="rounded-full bg-card border border-border text-sm px-5 py-2.5 hover:bg-primary/5 transition-colors shadow-sm">
            Changer de niveau
          </button>
        </div>
      </div>
    );
  }

  const current = problems[index];

  function handleSelect(choice: number) {
    if (selected !== null) return;
    setSelected(choice);
    if (choice === current.answer) setScore((s) => s + 1);
  }

  function handleNext() {
    setSelected(null);
    setIndex((i) => i + 1);
  }

  return (
    <div className="max-w-sm mx-auto flex flex-col gap-5">
      <div className="flex items-center justify-between text-sm on-bg">
        <span>
          Question {index + 1} / {problems.length}
        </span>
        <span>Score : {score}</span>
      </div>

      <p className="font-display text-4xl on-bg text-center">
        {current.a} {current.op} {current.b} = ?
      </p>

      <div className="grid grid-cols-2 gap-3">
        {current.choices.map((choice) => {
          const isCorrect = choice === current.answer;
          const isSelected = choice === selected;
          const showResult = selected !== null;

          let style = "border-border bg-card hover:bg-primary/5";
          if (showResult && isCorrect) style = "border-green-600 bg-green-50 text-green-800";
          else if (showResult && isSelected && !isCorrect) style = "border-red-600 bg-red-50 text-red-800";

          return (
            <button
              key={choice}
              type="button"
              onClick={() => handleSelect(choice)}
              disabled={showResult}
              className={`border-2 rounded-xl py-4 font-display text-2xl transition-colors ${style}`}
            >
              {choice}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <button
          type="button"
          onClick={handleNext}
          className="self-center rounded-full bg-primary text-primary-foreground text-sm px-5 py-2.5 hover:opacity-90 transition-opacity"
        >
          {index === problems.length - 1 ? "Voir mon score" : "Question suivante"}
        </button>
      )}
    </div>
  );
}
