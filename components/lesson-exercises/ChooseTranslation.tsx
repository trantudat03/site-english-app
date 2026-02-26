"use client";
type Props = {
    exercise: {
        type: string;
        question: string;
        mascot: string;
        answers: {
            id: number;
            text: string;
            correct: boolean;
        }[];
    };
};

export default function ChooseTranslation({ exercise }: Props) {
    return (
        <div className="space-y-8 w-full">

            {/* Title */}
            <div className="text-2xl md:text-3xl font-bold tracking-wider">
                {exercise.type}
            </div>

            {/* Mascot + bubble */}
            <div className="flex items-start gap-4 md:gap-6">
                <img
                    src={exercise.mascot}
                    className="h-24 md:h-32 object-contain shrink-0"
                />

                <div className="relative flex-1 px-4 py-3 md:px-6 md:py-4
                    border-2 border-slate-500 rounded-xl bg-slate-900
                    text-base md:text-xl leading-relaxed">

                        {exercise.question}

                    {/* bubble tail */}
                    <div className="absolute -left-3 top-6 w-4 h-4 bg-slate-900 border-l-2 border-b-2 border-slate-500 rotate-45" />
                </div>
            </div>
            {/* Answers */}
            <div className="space-y-4 w-full">
                {exercise.answers.map(a => (
                    <button
                        key={a.id}
                        className="w-full py-4 px-6 border-2 border-slate-600 rounded-xl text-lg text-center hover:border-purple-400 hover:bg-slate-800 active:scale-[0.98] transition-all"
                    >
                        {a.text}
                    </button>
                ))}
            </div>
        </div>
    );
}