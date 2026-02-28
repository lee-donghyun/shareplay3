import { style } from "@vanilla-extract/css";

export const container = style({
  overflow: "hidden",
});

export const gesture_container = style({
  touchAction: "none",
  position: "relative",
});

export const cover_item = style({
  position: "absolute",
  left: 0,
  top: 0,
});

export const modal_positioner = style({
  alignItems: "center",
  display: "flex",
  justifyContent: "center",
  left: "0",
  overflow: "auto",
  position: "fixed",
  top: "0",
  width: "100vw",
  height: "100dvh",
  zIndex: "modal",
});
