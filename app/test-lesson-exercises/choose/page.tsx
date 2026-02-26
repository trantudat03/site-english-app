import ExerciseLayout from "@/components/lesson-exercises/ExerciseLayout";
import ChooseTranslation from "@/components/lesson-exercises/ChooseTranslation";
import { dataChooseTranslation } from "@/components/lesson-exercises/mock/dataChooseTranslation";


export default function Page() {
  const total = 100;
  const index = 10;
  const progress = (index / total) * 100;

  const exercise = dataChooseTranslation[0];
  return (
    <ExerciseLayout progress={progress} hearts={1}>
      <ChooseTranslation exercise={exercise} />
    </ExerciseLayout>
  );
}