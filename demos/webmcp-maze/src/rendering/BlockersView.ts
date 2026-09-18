/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Graphics, Container } from "pixi.js";
import { type MazeBoard } from "../game/MazeBoard.ts";
import {
  type Position,
  Direction,
  BlockerType,
  ItemColor,
  blockerColor,
  CELL_SIZE,
  WALL_THICKNESS,
} from "../types/index.ts";

/** Neon color values for each door color. */
const COLOR_MAP: Record<ItemColor, number> = {
  [ItemColor.Red]: 0xff0044,
  [ItemColor.Blue]: 0x00aaff,
  [ItemColor.Green]: 0x00ff88,
};

/** Gray color for rocks. */
const ROCK_COLOR = 0x666666;

/** Cyan edge glow on rocks. */
const ROCK_GLOW_COLOR = 0x00e5ff;

/** Thickness of door bars. */
const DOOR_THICKNESS = WALL_THICKNESS * 3;

/** Glow width for door bars. */
const DOOR_GLOW_WIDTH = WALL_THICKNESS * 6;

/**
 * Renders blockers (locked doors and rocks) on maze passages.
 * Doors appear as thick colored bars; rocks as gray irregular shapes.
 */
export class BlockersView {
  /** The PixiJS container holding all blocker graphics. */
  readonly container: Container;

  constructor() {
    this.container = new Container();
  }

  /**
   * Rebuilds all blocker graphics from the board state.
   * @param board - The maze board containing blockers.
   */
  build(board: MazeBoard): void {
    this.container.removeChildren();

    // Track drawn passages to avoid duplicates (each blocker is stored on both sides)
    const drawn = new Set<string>();

    for (const blocker of board.getAllBlockers()) {
      const key = this.passageKey(blocker.position, blocker.direction);
      if (drawn.has(key)) continue;
      drawn.add(key);

      if (blocker.type === BlockerType.Rock) {
        this.drawRock(blocker.position, blocker.direction);
      } else {
        const color = this.getDoorColor(blocker.type);
        this.drawDoor(blocker.position, blocker.direction, color);
      }
    }
  }

  /**
   * Updates the view to match current board state.
   * @param board - The maze board.
   */
  update(board: MazeBoard): void {
    this.build(board);
  }

  /** Draws a colored door bar across a passage. */
  private drawDoor(pos: Position, dir: Direction, color: number): void {
    const { x1, y1, x2, y2 } = this.getPassageCoords(pos, dir);

    const gfx = new Graphics();

    // Glow layer
    gfx.setStrokeStyle({ width: DOOR_GLOW_WIDTH, color, alpha: 0.15 });
    gfx.moveTo(x1, y1).lineTo(x2, y2).stroke();

    // Main bar
    gfx.setStrokeStyle({ width: DOOR_THICKNESS, color, alpha: 0.9 });
    gfx.moveTo(x1, y1).lineTo(x2, y2).stroke();

    // Center lock indicator (small circle)
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    gfx.circle(cx, cy, 3).fill({ color: 0xffffff, alpha: 0.7 });
    gfx.circle(cx, cy, 1.5).fill({ color, alpha: 1 });

    this.container.addChild(gfx);
  }

  /** Draws a rock obstacle across a passage. */
  private drawRock(pos: Position, dir: Direction): void {
    const { x1, y1, x2, y2 } = this.getPassageCoords(pos, dir);

    const gfx = new Graphics();

    // Glow layer
    gfx.setStrokeStyle({
      width: DOOR_GLOW_WIDTH,
      color: ROCK_GLOW_COLOR,
      alpha: 0.08,
    });
    gfx.moveTo(x1, y1).lineTo(x2, y2).stroke();

    // Rock body — thick jagged line
    gfx.setStrokeStyle({ width: DOOR_THICKNESS * 1.2, color: ROCK_COLOR });
    gfx.moveTo(x1, y1).lineTo(x2, y2).stroke();

    // Irregular highlights
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    gfx.circle(cx - 2, cy - 1, 2.5).fill({ color: 0x888888, alpha: 0.6 });
    gfx.circle(cx + 3, cy + 1, 2).fill({ color: 0x555555, alpha: 0.5 });

    this.container.addChild(gfx);
  }

  /**
   * Returns the pixel coordinates for a passage between two cells.
   * The line is drawn along the shared edge.
   */
  private getPassageCoords(
    pos: Position,
    dir: Direction,
  ): { x1: number; y1: number; x2: number; y2: number } {
    const x = pos.col * CELL_SIZE;
    const y = pos.row * CELL_SIZE;
    const pad = CELL_SIZE * 0.15;

    switch (dir) {
      case Direction.North:
        return { x1: x + pad, y1: y, x2: x + CELL_SIZE - pad, y2: y };
      case Direction.South:
        return {
          x1: x + pad,
          y1: y + CELL_SIZE,
          x2: x + CELL_SIZE - pad,
          y2: y + CELL_SIZE,
        };
      case Direction.West:
        return { x1: x, y1: y + pad, x2: x, y2: y + CELL_SIZE - pad };
      case Direction.East:
        return {
          x1: x + CELL_SIZE,
          y1: y + pad,
          x2: x + CELL_SIZE,
          y2: y + CELL_SIZE - pad,
        };
    }
  }

  /** Returns the neon color for a door blocker type. */
  private getDoorColor(type: BlockerType): number {
    const color = blockerColor(type);
    if (color) return COLOR_MAP[color];
    return ROCK_COLOR;
  }

  /**
   * Creates a canonical key for a passage so both sides map to the same key.
   * Uses the smaller cell position to ensure uniqueness.
   */
  private passageKey(pos: Position, dir: Direction): string {
    const col2 =
      dir === Direction.East
        ? pos.col + 1
        : dir === Direction.West
          ? pos.col - 1
          : pos.col;
    const row2 =
      dir === Direction.South
        ? pos.row + 1
        : dir === Direction.North
          ? pos.row - 1
          : pos.row;

    // Canonical: smaller row first, then smaller col
    if (pos.row < row2 || (pos.row === row2 && pos.col < col2)) {
      return `${pos.row},${pos.col}-${row2},${col2}`;
    }
    return `${row2},${col2}-${pos.row},${pos.col}`;
  }
}
