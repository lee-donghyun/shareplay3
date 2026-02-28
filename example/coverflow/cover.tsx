import { PointerEventHandler, useState } from "react";
import * as styles from "./cover.css";

const CLICK_AREA = 100;

export const Cover = ({
  size,
  meta,
  backgroundColor,
  onSelect,
}: {
  meta: { src: string; title: string; tracks: { title: string }[] };
  size: number;
  backgroundColor: string;
  onSelect: () => void;
}) => {
  const [clickPosition, setClickPosition] = useState<null | {
    x: number;
    y: number;
  }>(null);
  const grabbing = clickPosition !== null;

  const onPointerDown: PointerEventHandler<HTMLButtonElement> = (e) => {
    const { x, y } = e.currentTarget.getBoundingClientRect();
    setClickPosition({ x, y });
  };

  const onPointerUp: PointerEventHandler<HTMLButtonElement> = (e) => {
    if (clickPosition === null) {
      return;
    }

    const { x, y } = e.currentTarget.getBoundingClientRect();
    const { x: clickX, y: clickY } = clickPosition;
    if (Math.hypot(clickX - x, clickY - y) > CLICK_AREA) {
      return;
    }

    setClickPosition(null);
    onSelect();
  };
  return (
    <div
      className={styles.cover_container}
      style={{
        width: size,
        height: size,
      }}
    >
      <div
        className={styles.reflection}
        style={{
          backgroundColor,
          height: size,
        }}
      ></div>
      <button
        className={styles.cover_button}
        style={{ cursor: grabbing ? "grabbing" : "grab" }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <img
          className={styles.cover_image}
          style={{
            width: size,
            height: size,
          }}
          src={meta.src}
        />
      </button>
    </div>
  );
};
