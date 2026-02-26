import CompleteTranslation from "@/components/lesson-exercises/CompleteTranslation";
import ExerciseLayout from "@/components/lesson-exercises/ExerciseLayout";
import { dataCompleteTranslation } from "@/components/lesson-exercises/mock/dataCompleteTranslation";


export default function Page() {
  const total = 100;
  const index = 10;
  const progress = (index / total) * 100;

  const exercise = dataCompleteTranslation;
  return (
    <ExerciseLayout progress={progress} hearts={1}>
        <CompleteTranslation exercise={exercise}/>
    </ExerciseLayout>
  );
}