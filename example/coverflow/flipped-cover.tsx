import { Cover } from "./cover";
import * as styles from "./flipped-cover.css";

export const FlippedCover = ({
  meta,
  size,
}: {
  size: number;
  meta: Parameters<typeof Cover>[0]["meta"];
}) => (
  <div
    className={styles.flipped_cover_container}
    style={{
      width: size,
      height: size,
      fontSize: Math.round(size / 20),
    }}
  >
    <h2 className={styles.title}>{meta.title}</h2>
    <ol className={styles.track_list}>
      {meta.tracks.map(({ title }, index) => (
        <li key={index} className={styles.track_item}>
          <span className={styles.track_number}>{index + 1}.</span>
          <span className={styles.track_title}>{title}</span>
        </li>
      ))}
    </ol>
  </div>
);
