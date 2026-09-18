/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Graphics, Container } from "pixi.js";
import { type MazeBoard } from "../game/MazeBoard.ts";
import { Direction, CELL_SIZE, WALL_THICKNESS } from "../types/index.ts";

/** Bright neon cyan for wall lines. */
const WALL_COLOR = 0x00e5ff;

/** Outer glow color (same hue, rendered at low alpha). */
const WALL_GLOW_COLOR = 0x00e5ff;

/** Neon green for the exit cell highlight. */
const EXIT_COLOR = 0x00ff88;

/** Faint grid line color. */
const GRID_COLOR = 0x00e5ff;

/** Alpha for the subtle floor grid lines. */
const GRID_ALPHA = 0.06;

/** Alpha for the glow layer behind walls. */
const GLOW_ALPHA = 0.18;

/** Width of the outer glow stroke (wider = softer glow). */
const GLOW_WIDTH = WALL_THICKNESS * 4;

/**
 * Draws the maze grid (walls and exit highlight) into a PixiJS container.
 * Uses a Tron-inspired neon aesthetic with luminous line walls and a subtle grid floor.
 * Rebuilt each time a new maze is generated.
 */
export class MazeView {
  /** The PixiJS container holding all maze graphics. */
  readonly container: Container;

  constructor() {
    this.container = new Container();
  }

  /**
   * Clears the current view and redraws the maze from the given board.
   * @param board - The maze data to visualize.
   */
  build(board: MazeBoard): void {
    this.container.removeChildren();

    this.drawGridFloor(board);
    this.drawExitHighlight(board);
    this.drawWallGlow(board);
    this.drawWalls(board);
  }

  /**
   * Draws a subtle grid of thin lines across all cells, creating the
   * digital-plane floor effect.
   * @param board - The maze board (for dimensions).
   */
  private drawGridFloor(board: MazeBoard): void {
    const gfx = new Graphics();
    const totalW = board.cols * CELL_SIZE;
    const totalH = board.rows * CELL_SIZE;

    gfx.setStrokeStyle({ width: 1, color: GRID_COLOR, alpha: GRID_ALPHA });

    // Horizontal lines
    for (let r = 0; r <= board.rows; r++) {
      const y = r * CELL_SIZE;
      gfx.moveTo(0, y).lineTo(totalW, y).stroke();
    }

    // Vertical lines
    for (let c = 0; c <= board.cols; c++) {
      const x = c * CELL_SIZE;
      gfx.moveTo(x, 0).lineTo(x, totalH).stroke();
    }

    this.container.addChild(gfx);
  }

  /**
   * Draws a translucent neon highlight on the exit cell.
   * @param board - The maze board (for exit position).
   */
  private drawExitHighlight(board: MazeBoard): void {
    const gfx = new Graphics();
    const pad = WALL_THICKNESS;
    gfx
      .rect(
        board.exit.col * CELL_SIZE + pad,
        board.exit.row * CELL_SIZE + pad,
        CELL_SIZE - pad * 2,
        CELL_SIZE - pad * 2,
      )
      .fill({ color: EXIT_COLOR, alpha: 0.2 });

    // Bright border on the exit cell
    gfx.setStrokeStyle({ width: 2, color: EXIT_COLOR, alpha: 0.6 });
    gfx
      .rect(
        board.exit.col * CELL_SIZE + pad,
        board.exit.row * CELL_SIZE + pad,
        CELL_SIZE - pad * 2,
        CELL_SIZE - pad * 2,
      )
      .stroke();

    this.container.addChild(gfx);
  }

  /**
   * Draws a wide, translucent version of all walls to simulate an outer glow.
   * Rendered behind the sharp wall lines.
   * @param board - The maze board.
   */
  private drawWallGlow(board: MazeBoard): void {
    const gfx = new Graphics();

    for (let r = 0; r < board.rows; r++) {
      for (let c = 0; c < board.cols; c++) {
        const cell = board.getCell({ row: r, col: c })!;
        const x = c * CELL_SIZE;
        const y = r * CELL_SIZE;

        if (cell.walls[Direction.North]) {
          this.drawHorizontalGlow(gfx, x, y, CELL_SIZE);
        }
        if (cell.walls[Direction.West]) {
          this.drawVerticalGlow(gfx, x, y, CELL_SIZE);
        }
        if (r === board.rows - 1 && cell.walls[Direction.South]) {
          this.drawHorizontalGlow(gfx, x, y + CELL_SIZE, CELL_SIZE);
        }
        if (c === board.cols - 1 && cell.walls[Direction.East]) {
          this.drawVerticalGlow(gfx, x + CELL_SIZE, y, CELL_SIZE);
        }
      }
    }

    this.container.addChild(gfx);
  }

  /**
   * Draws all maze walls as thin, bright neon lines.
   * @param board - The maze board to read wall data from.
   */
  private drawWalls(board: MazeBoard): void {
    const gfx = new Graphics();

    gfx.setStrokeStyle({
      width: WALL_THICKNESS,
      color: WALL_COLOR,
    });

    for (let r = 0; r < board.rows; r++) {
      for (let c = 0; c < board.cols; c++) {
        const cell = board.getCell({ row: r, col: c })!;
        const x = c * CELL_SIZE;
        const y = r * CELL_SIZE;

        if (cell.walls[Direction.North]) {
          gfx
            .moveTo(x, y)
            .lineTo(x + CELL_SIZE, y)
            .stroke();
        }
        if (cell.walls[Direction.West]) {
          gfx
            .moveTo(x, y)
            .lineTo(x, y + CELL_SIZE)
            .stroke();
        }
        if (r === board.rows - 1 && cell.walls[Direction.South]) {
          gfx
            .moveTo(x, y + CELL_SIZE)
            .lineTo(x + CELL_SIZE, y + CELL_SIZE)
            .stroke();
        }
        if (c === board.cols - 1 && cell.walls[Direction.East]) {
          gfx
            .moveTo(x + CELL_SIZE, y)
            .lineTo(x + CELL_SIZE, y + CELL_SIZE)
            .stroke();
        }
      }
    }

    this.container.addChild(gfx);
  }

  /** Draws a horizontal glow segment. */
  private drawHorizontalGlow(
    gfx: Graphics,
    x: number,
    y: number,
    length: number,
  ): void {
    gfx.setStrokeStyle({
      width: GLOW_WIDTH,
      color: WALL_GLOW_COLOR,
      alpha: GLOW_ALPHA,
    });
    gfx
      .moveTo(x, y)
      .lineTo(x + length, y)
      .stroke();
  }

  /** Draws a vertical glow segment. */
  private drawVerticalGlow(
    gfx: Graphics,
    x: number,
    y: number,
    length: number,
  ): void {
    gfx.setStrokeStyle({
      width: GLOW_WIDTH,
      color: WALL_GLOW_COLOR,
      alpha: GLOW_ALPHA,
    });
    gfx
      .moveTo(x, y)
      .lineTo(x, y + length)
      .stroke();
  }
}
