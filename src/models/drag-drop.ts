export interface Draggable {
  handleStart(e: DragEvent): void;
  handleEnd(e: DragEvent): void;
}

export interface DragTarget {
  dragOver(e: DragEvent): void;
  dragLeave(e: DragEvent): void;
  drop(e: DragEvent): void;
}