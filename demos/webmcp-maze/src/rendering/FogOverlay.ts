/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Graphics, Container } from "pixi.js";
import { type MazeBoard } from "../game/MazeBoard.ts";
import { CELL_SIZE } from "../types/index.ts";

/** Color matching the application background for opaque fog. */
const FOG_COLOR = 0x050a14;

/** Alpha for fog rectangles — nearly opaque with a hint of neon bleeding through. */
const FOG_ALPHA = 0.95;

/** Neon cyan used for the fog-edge glow. */
const EDGE_GLOW_COLOR = 0x00e5ff;

/** Alpha for the fog-edge glow rectangles. */
const EDGE_GLOW_ALPHA = 0.07;

/** Neighbor offsets for checking adjacency (4 cardinal directions). */
const NEIGHBORS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

/**
 * Draws dark rectangles over unrevealed maze cells to create a fog of war effect.
 * Fogged cells adjacent to revealed areas get a subtle neon glow to hint at
 * unexplored territory. Sits between {@link MazeView} and {@link PlayerView}
 * in the PixiJS stage so fog covers walls and floor but never the player or trail.
 */
export class FogOverlay {
  /** The PixiJS container holding the fog graphics. */
  readonly container: Container;

  constructor() {
    this.container = new Container();
  }

  /**
   * Redraws the fog overlay based on the board's revealed state.
   * Draws a dark rectangle over every unrevealed cell, with a subtle glow
   * on cells that border the revealed area.
   * @param board - The maze board with fog of war visibility data.
   */
  update(board: MazeBoard): void {
    this.container.removeChildren();

    const fog = new Graphics();
    const glow = new Graphics();

    for (let r = 0; r < board.rows; r++) {
      for (let c = 0; c < board.cols; c++) {
        if (board.isRevealed({ row: r, col: c })) continue;

        const x = c * CELL_SIZE;
        const y = r * CELL_SIZE;

        fog.rect(x, y, CELL_SIZE, CELL_SIZE).fill({
          color: FOG_COLOR,
          alpha: FOG_ALPHA,
        });

        if (this.isAdjacentToRevealed(board, r, c)) {
          glow.rect(x, y, CELL_SIZE, CELL_SIZE).fill({
            color: EDGE_GLOW_COLOR,
            alpha: EDGE_GLOW_ALPHA,
          });
        }
      }
    }

    this.container.addChild(fog);
    this.container.addChild(glow);
  }

  /**
   * Checks whether an unrevealed cell is adjacent to at least one revealed cell.
   * @param board - The maze board.
   * @param row - Cell row.
   * @param col - Cell column.
   */
  private isAdjacentToRevealed(
    board: MazeBoard,
    row: number,
    col: number,
  ): boolean {
    for (const [dr, dc] of NEIGHBORS) {
      const nr = row + dr;
      const nc = col + dc;
      if (
        nr >= 0 &&
        nr < board.rows &&
        nc >= 0 &&
        nc < board.cols &&
        board.isRevealed({ row: nr, col: nc })
      ) {
        return true;
      }
    }
    return false;
  }
}
