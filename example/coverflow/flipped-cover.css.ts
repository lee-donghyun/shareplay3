import { style } from "@vanilla-extract/css";

export const flipped_cover_container = style({
  backgroundColor: "#FFF",
  display: "flex",
  flexDirection: "column",
  padding: "2em",
});

export const title = style({
  fontSize: "2.5em",
  lineHeight: "0.8",
  letterSpacing: "-0.05em",
  fontFamily: "Inter, sans-serif",
  fontWeight: 700,
});

export const track_list = style({
  paddingLeft: "0",
  marginTop: "2em",
  listStyleType: "none",
  overflowY: "scroll",
  flex: 1,
});

export const track_item = style({
  fontFamily: "Inter, sans-serif",
  letterSpacing: "-0.03em",
  fontWeight: 600,
  color: "rgb(0 0 0 / 80%)",
  display: "flex",
  alignItems: "baseline",
  marginBottom: "0.125em",
});

export const track_number = style({
  fontSize: "0.75em",
  display: "inline-block",
  width: "1.5em",
});

export const track_title = style({
  flex: 1,
  fontSize: "1em",
});
