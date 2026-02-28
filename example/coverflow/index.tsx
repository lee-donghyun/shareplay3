import { animated, useSpring, useSprings } from "@react-spring/web";
import { Handler, useGesture } from "@use-gesture/react";
import { useMemo, useRef, useState } from "react";
import { Cover } from "./cover";
import { Dialog } from "@ark-ui/react/dialog";
import { Portal } from "@ark-ui/react/portal";
import { Util as CoverUtil } from "./cover.util";
import { Util as ModalUtil } from "./modal.util";
import { make } from "./use-machine.hook";
import { FlippedCover } from "./flipped-cover";
import * as styles from "./index.css";

enum State {
  IDLE,
  DRAGGING,
  MODAL,
}

type Action = {
  drag: (movementX: number) => State.DRAGGING;
  openModal: (target: number) => State.MODAL;
  closeModal: () => State.IDLE;
  selectCover: (target: number) => State.IDLE;
};

const useCoverflowMachine = make<State, Action>({
  initial: State.IDLE,
  states: {
    [State.IDLE]: ["drag", "openModal", "selectCover"],
    [State.DRAGGING]: ["drag", "selectCover"],
    [State.MODAL]: ["closeModal"],
  },
});

export const Coverflow = ({
  covers: coverData,
  size,
  backgroundColor,
  onChange,
  onSelected,
}: {
  covers: Parameters<typeof Cover>[0]["meta"][];
  size: number;
  backgroundColor: string;
  onChange?: (index: number) => void;
  onSelected?: (index: number) => void;
}) => {
  const memo = useRef<{ current: number; prevCurrent: number }>({
    current: 0,
    prevCurrent: 0,
  });

  const coverUtil = useMemo(() => new CoverUtil(size), [size]);
  const modalUtil = useMemo(() => new ModalUtil(), []);

  const [current, setCurrnet] = useState(0);

  const [covers, coversApi] = useSprings(coverData.length, (score) => {
    return coverUtil.getTransform(score);
  });

  const [modal, modalApi] = useSpring(() => modalUtil.getInvisibleTransform());

  const { state, dispatch } = useCoverflowMachine({
    drag: (movementX) => {
      const { prevCurrent } = memo.current;

      const diffScore = coverUtil.getDiffScore(
        movementX,
        prevCurrent,
        covers.length
      );

      coversApi.start((index) => {
        const score = index - prevCurrent + diffScore;
        if (Math.abs(score) <= 0.5) {
          setCurrnet(index);
          memo.current.current = index;
          onChange?.(index);
        }
        return coverUtil.getTransform(score);
      });

      return State.DRAGGING;
    },
    openModal: (target) => {
      coversApi.start((index) => {
        if (index === target) {
          modalApi.start(modalUtil.getVisibleTransform());
          return modalUtil.getFlippedCoverTransform();
        }
      });
      return State.MODAL;
    },
    closeModal: () => {
      modalApi.start(modalUtil.getInvisibleTransform());
      coversApi.start((index) => ({
        ...coverUtil.getTransform(index - current),
        delay: modalUtil.delay,
      }));
      return State.IDLE;
    },
    selectCover: (target) => {
      setCurrnet(target);
      onChange?.(target);
      onSelected?.(target);
      memo.current.prevCurrent = target;
      coversApi.start((index) => {
        return coverUtil.getTransform(index - target);
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
    { drag: { keyboardDisplacement: size / 10, threshold: 10 } }
  );

  const perspective = coverUtil.perspective;

  return (
    <>
      <div
        className={styles.container}
        style={{
          padding: `${size}px calc(50% - ${size / 2}px) ${size}px calc(50% - ${
            size / 2
          }px)`,
        }}
      >
        <div
          {...bind()}
          className={styles.gesture_container}
          style={{ height: size, perspective }}
        >
          {covers.map((props, index) => (
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            <animated.div
              key={index}
              className={styles.cover_item}
              style={{
                zIndex: covers.length - Math.abs(current - index),
                ...props,
              }}
            >
              <Cover
                meta={coverData[index]}
                backgroundColor={backgroundColor}
                size={size}
                onSelect={() => {
                  if (current === index) {
                    dispatch("openModal", index);
                    return;
                  }
                  dispatch("selectCover", index);
                }}
              />
            </animated.div>
          ))}
        </div>
      </div>
      <Dialog.Root
        open={state === State.MODAL}
        lazyMount
        unmountOnExit
        present={state === State.MODAL || state === State.IDLE}
        onOpenChange={({ open }) => {
          if (!open) {
            dispatch("closeModal");
          }
        }}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner className={styles.modal_positioner}>
            <Dialog.Content style={{ perspective }}>
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <animated.div style={modal}>
                <FlippedCover size={size} meta={coverData[current]} />
              </animated.div>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};
