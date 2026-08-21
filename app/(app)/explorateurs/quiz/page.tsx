import { getQuizData } from "@/lib/quiz/data";
import { QuizPlayer } from "./quiz-player";

export default async function QuizPage() {
  const data = await getQuizData();

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-display text-3xl text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.35)]">Quiz</h1>
        <p className="text-white/95 text-sm mt-1 font-medium [text-shadow:0_1px_6px_rgba(0,0,0,0.3)]">Sur nos voyages, les animaux découverts et les pays visités.</p>
      </div>

      <QuizPlayer data={data} />
    </div>
  );
}
