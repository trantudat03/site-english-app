"use client";

type Props = {
  lives: number;
  maxLives?: number;
};
// vẽ 1 trái tim 
function PixelHeart({ filled }: { filled: boolean }) {
  const color = filled ? "bg-red-500" : "bg-gray-600";
  // ma trận trái tim
  const pattern = [
    0,1,1,0,1,1,0,
    1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,
    0,1,1,1,1,1,0,
    0,0,1,1,1,0,0,
    0,0,0,1,0,0,0,
  ];

  return (
    <div className="w-6 h-6">
      <div className="grid grid-cols-7 gap-[1px]">
        {pattern.map((v, i) => (
          <div
            key={i}
            className={`w-[4px] h-[4px] ${v ? color : "bg-transparent"}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function GameHearts({ lives, maxLives = 5 }: Props) {
  return (
    <div className="flex gap-2 items-center">
      {Array.from({ length: maxLives }).map((_, i) => (
        <PixelHeart key={i} filled={i < lives} />
      ))}
    </div>
  );
}