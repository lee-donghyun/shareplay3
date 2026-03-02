"use client";

import { animated, useSprings } from "@react-spring/web";
import { Handler, useGesture } from "@use-gesture/react";
import { useMemo, useRef, useState } from "react";
import { Util as CoverUtil } from "@/example/coverflow/cover.util";
import { make } from "@/example/coverflow/use-machine.hook";

enum State {
  IDLE,
  DRAGGING,
}

type Action = {
  drag: (movementX: number) => State.DRAGGING;
  selectCover: (target: number) => State.IDLE;
};

const useCoverflowMachine = make<State, Action>({
  initial: State.IDLE,
  states: {
    [State.IDLE]: ["drag", "selectCover"],
    [State.DRAGGING]: ["drag", "selectCover"],
  },
});

export interface CoverData {
  src: string;
  title: string;
  artist: string;
  previewUrl?: string | null;
  trackViewUrl?: string | null;
}

const CLICK_AREA = 100;

function CoverItem({
  meta,
  size,
  onSelect,
}: {
  meta: CoverData;
  size: number;
  onSelect: () => void;
}) {
  const [clickPosition, setClickPosition] = useState<null | {
    x: number;
    y: number;
  }>(null);
  const grabbing = clickPosition !== null;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute left-0 right-0 bg-black"
        style={{ top: "100%", height: size }}
      />
      <button
        className="relative block touch-none"
        style={{ cursor: grabbing ? "grabbing" : "grab" }}
        onPointerDown={(e) => {
          const { x, y } = e.currentTarget.getBoundingClientRect();
          setClickPosition({ x, y });
        }}
        onPointerUp={(e) => {
          if (clickPosition === null) return;
          const { x, y } = e.currentTarget.getBoundingClientRect();
          if (
            Math.hypot(clickPosition.x - x, clickPosition.y - y) > CLICK_AREA
          ) {
            return;
          }
          setClickPosition(null);
          onSelect();
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="block select-none pointer-events-none"
          style={{
            width: size,
            height: size,
            WebkitBoxReflect:
              "below 0 linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.4))",
          }}
          src={meta.src}
          alt={meta.title}
          draggable={false}
        />
      </button>
    </div>
  );
}

export function Coverflow({
  covers: coverData,
  size,
  onChange,
  onSelected,
}: {
  covers: CoverData[];
  size: number;
  onChange?: (index: number) => void;
  onSelected?: (index: number) => void;
}) {
  const memo = useRef<{ current: number; prevCurrent: number }>({
    current: 0,
    prevCurrent: 0,
  });

  const coverUtil = useMemo(() => new CoverUtil(size), [size]);

  const [current, setCurrent] = useState(0);

  const [covers, coversApi] = useSprings(coverData.length, (score) => {
    return { from: coverUtil.getTransform(score) };
  });

  const { dispatch } = useCoverflowMachine({
    drag: (movementX) => {
      const { prevCurrent } = memo.current;

      const diffScore = coverUtil.getDiffScore(
        movementX,
        prevCurrent,
        covers.length,
      );

      coversApi.start((index) => {
        const score = index - prevCurrent + diffScore;
        if (Math.abs(score) <= 0.5) {
          setCurrent(index);
          memo.current.current = index;
          onChange?.(index);
        }
        return coverUtil.getTransform(score);
      });

      return State.DRAGGING;
    },
    selectCover: (target) => {
      setCurrent(target);
      onChange?.(target);
      onSelected?.(target);
      memo.current.prevCurrent = target;
      coversApi.start((index) => {
        return { to: coverUtil.getTransform(index - target) };
      });
      return State.IDLE;
    },
  });

  const dragHandler: Handler<"drag" | "wheel"> = ({
    movement: [movementX],
    intentional,
    active,
  }) => {
    if (active && intentional) {
      dispatch("drag", movementX);
      return;
    }
    dispatch("selectCover", memo.current.current);
  };

  const bind = useGesture(
    { onDrag: dragHandler, onWheel: dragHandler },
    { drag: { keyboardDisplacement: size / 10, threshold: 10 } },
  );

  const perspective = coverUtil.perspective;

  return (
    <div
      className="overflow-hidden touch-none"
      style={{
        padding: `${size}px calc(50% - ${size / 2}px) ${size}px calc(50% - ${
          size / 2
        }px)`,
      }}
    >
      <div
        {...bind()}
        className="relative touch-none"
        style={{ height: size, perspective }}
      >
        {covers.map((props, index) => (
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          <animated.div
            key={index}
            className="absolute top-0 left-0"
            style={{
              zIndex: covers.length - Math.abs(current - index),
              ...props,
            }}
          >
            <CoverItem
              meta={coverData[index]}
              size={size}
              onSelect={() => {
                dispatch("selectCover", index);
              }}
            />
          </animated.div>
        ))}
      </div>
    </div>
  );
}
