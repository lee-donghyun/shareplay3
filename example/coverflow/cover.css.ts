import { style } from "@vanilla-extract/css";

export const cover_container = style({
  position: "relative",
});

export const reflection = style({
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  height: "100%",
  userSelect: "none",
});

export const cover_button = style({
  all: "unset",
  cursor: "grab",
});

export const cover_image = style({
  userSelect: "none",
  pointerEvents: "none",
  WebkitBoxReflect:
    "below 0 linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.4))",
});
