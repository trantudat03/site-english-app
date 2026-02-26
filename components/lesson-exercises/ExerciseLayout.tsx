"use client";

import { GameLayout, PixelCard, PixelButton } from "@/features/ui";
import { ReactNode, useState } from "react";
import GameHearts from "./GameHearts";

type Props = {
    children: ReactNode;
    progress: number;
    hearts: number;
};

export default function ExerciseLayout({
    children,
    progress,
    hearts,
}: Props) {
    const [currentProgress, setCurrentProgress] = useState(progress);
    const [flash, setFlash] = useState(false);
    const handleCheck = () => {
        setCurrentProgress(prev => Math.min(prev + 10, 100));
        setFlash(true);
        // tắt flash sau 300ms
        setTimeout(() => setFlash(false), 300);
    }
    return (
        <GameLayout title="" backHref="/test-lesson-exercises">
            <PixelCard>
                {/* header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 bg-[#1a1a1a] border-4 border-black p-1 shadow-[4px_4px_0px_#000]">
                        {/* pixel track */}
                        <div className="relative h-4 bg-[#222] overflow-hidden">

                            {/* progress fill */}
                            <div
                                className={`h-full bg-[#4ade80] transition-all duration-500 ease-out
                                ${flash ? "brightness-150 shadow-[0_0_12px_#22c55e]" : ""}`}
                                style={{ width: `${currentProgress}%` }}
                            />

                            {/* pixel grid overlay */}
                            <div className="absolute inset-0 pointer-events-none
                                bg-[linear-gradient(to_right,rgba(0,0,0,0.2)_1px,transparent_1px)]
                                bg-[length:8px_100%]" />
                            </div>


                    </div>
                    <GameHearts lives={hearts} />
                </div>
                {/* body */}
                {children}

                {/* footer */}
                <div className="mt-8">
                    <PixelButton 
                        size="lg" 
                        className="w-full border-2 border-black shadow-[4px_4px_0px_black]
                            active:translate-x-[2px] active:translate-y-[2px]
                            active:shadow-none transition-all"
                        onClick={handleCheck}>
                            
                            KIỂM TRA
                    </PixelButton>
                </div>
            </PixelCard>
        </GameLayout>
    );
}