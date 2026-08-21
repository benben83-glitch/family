"use client";

import { useEffect, useState } from "react";
import { generateQuizQuestions } from "@/lib/quiz/generate";
import type { QuizData, QuizQuestion } from "@/lib/quiz/types";

const QUESTIONS_PER_QUIZ = 8;

export function QuizPlayer({ data }: { data: QuizData }) {
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setQuestions(generateQuizQuestions(data, QUESTIONS_PER_QUIZ)), 0);
    return () => clearTimeout(timer);
  }, [data]);

  function startNewQuiz() {
    setQuestions(generateQuizQuestions(data, QUESTIONS_PER_QUIZ));
    setIndex(0);
    setSelected(null);
    setScore(0);
  }

  if (questions === null) {
    return <p className="on-bg text-sm text-center py-12">Préparation du quiz…</p>;
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <span className="text-4xl">🧭</span>
        <p className="font-display text-xl on-bg">Pas encore assez de souvenirs pour un quiz</p>
        <p className="on-bg text-sm max-w-xs">Ajoutez des voyages et des cartes animaux découvertes pour débloquer des questions.</p>
      </div>
    );
  }

  if (index >= questions.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="text-5xl">🏆</span>
        <p className="font-display text-2xl on-bg">
          {score} / {questions.length} bonnes réponses !
        </p>
        <button type="button" onClick={startNewQuiz} className="rounded-full bg-primary text-primary-foreground text-sm px-5 py-2.5 hover:opacity-90 transition-opacity">
          Rejouer
        </button>
      </div>
    );
  }

  const current = questions[index];
  const isLast = index === questions.length - 1;

  function handleSelect(choiceIndex: number) {
    if (selected !== null) return;
    setSelected(choiceIndex);
    if (choiceIndex === current.correctIndex) setScore((s) => s + 1);
  }

  function handleNext() {
    setSelected(null);
    setIndex((i) => i + 1);
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-5">
      <div className="flex items-center justify-between text-sm on-bg">
        <span>
          Question {index + 1} / {questions.length}
        </span>
        <span>
          Score : {score}/{index}
        </span>
      </div>

      {questions.length < QUESTIONS_PER_QUIZ && index === 0 && (
        <p className="text-xs on-bg text-center -mt-3">
          Ajoutez d&apos;autres voyages et cartes animaux découvertes pour débloquer plus de questions.
        </p>
      )}

      <p className="font-display text-xl on-bg whitespace-pre-line text-center">{current.prompt}</p>

      <div className="grid gap-2.5">
        {current.choices.map((choice, choiceIndex) => {
          const isCorrect = choiceIndex === current.correctIndex;
          const isSelected = choiceIndex === selected;
          const showResult = selected !== null;

          let style = "border-border bg-card hover:bg-primary/5";
          if (showResult && isCorrect) style = "border-green-600 bg-green-50 text-green-800";
          else if (showResult && isSelected && !isCorrect) style = "border-red-600 bg-red-50 text-red-800";

          return (
            <button
              key={choiceIndex}
              type="button"
              onClick={() => handleSelect(choiceIndex)}
              disabled={showResult}
              className={`text-left border-2 rounded-xl px-4 py-3 text-sm transition-colors ${style}`}
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
          {isLast ? "Voir mon score" : "Question suivante"}
        </button>
      )}
    </div>
  );
}
