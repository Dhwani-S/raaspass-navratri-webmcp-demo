/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Graphics, Container } from "pixi.js";
import { type MazeBoard } from "../game/MazeBoard.ts";
import {
  CollectibleType,
  ItemColor,
  collectibleColor,
  CELL_SIZE,
} from "../types/index.ts";

/** Neon color values for each item color. */
const COLOR_MAP: Record<ItemColor, number> = {
  [ItemColor.Red]: 0xff0044,
  [ItemColor.Blue]: 0x00aaff,
  [ItemColor.Green]: 0x00ff88,
};

/** Orange color for dynamite. */
const DYNAMITE_COLOR = 0xff6600;

/** Glow alpha for the outer halo of collectibles. */
const GLOW_ALPHA = 0.2;

/** Radius of the collectible shape relative to cell size. */
const ITEM_RADIUS = CELL_SIZE * 0.15;

/**
 * Renders collectible items (keys and dynamite) on the maze grid.
 * Items pulse gently to draw attention.
 */
export class CollectiblesView {
  /** The PixiJS container holding all collectible graphics. */
  readonly container: Container;

  /** Individual item graphics for animation. */
  private items: Graphics[] = [];

  /** Elapsed time for pulse animation. */
  private elapsed = 0;

  constructor() {
    this.container = new Container();
  }

  /**
   * Rebuilds all collectible graphics from the board state.
   * @param board - The maze board containing collectibles.
   */
  build(board: MazeBoard): void {
    this.container.removeChildren();
    this.items = [];
    this.elapsed = 0;

    for (const collectible of board.getAllCollectibles()) {
      const cx = collectible.position.col * CELL_SIZE + CELL_SIZE / 2;
      const cy = collectible.position.row * CELL_SIZE + CELL_SIZE / 2;
      const gfx = this.drawItem(cx, cy, collectible.type);
      this.container.addChild(gfx);
      this.items.push(gfx);
    }
  }

  /**
   * Updates the view to match current board state.
   * @param board - The maze board.
   */
  update(board: MazeBoard): void {
    this.build(board);
  }

  /**
   * Per-frame animation update for pulsing effect.
   * @param dt - Delta time in seconds.
   */
  tick(dt: number): void {
    this.elapsed += dt;
    const scale = 1 + 0.05 * Math.sin(this.elapsed * 3);
    for (const item of this.items) {
      item.scale.set(scale);
    }
  }

  /** Draws a collectible item at pixel coordinates. */
  private drawItem(x: number, y: number, type: CollectibleType): Graphics {
    const gfx = new Graphics();
    const color = this.getColor(type);

    if (type === CollectibleType.Dynamite) {
      this.drawDynamite(gfx, color);
    } else {
      this.drawKey(gfx, color);
    }

    gfx.x = x;
    gfx.y = y;
    gfx.pivot.set(0, 0);
    return gfx;
  }

  /** Draws a diamond-shaped key. */
  private drawKey(gfx: Graphics, color: number): void {
    const r = ITEM_RADIUS;

    // Glow halo
    gfx
      .poly([0, -r * 1.8, r * 1.8, 0, 0, r * 1.8, -r * 1.8, 0])
      .fill({ color, alpha: GLOW_ALPHA });

    // Diamond shape
    gfx.setStrokeStyle({ width: 2, color });
    gfx.poly([0, -r, r, 0, 0, r, -r, 0]).fill({ color, alpha: 0.6 }).stroke();

    // Inner highlight
    const ir = r * 0.4;
    gfx.circle(0, 0, ir).fill({ color: 0xffffff, alpha: 0.5 });
  }

  /** Draws a dynamite stick shape. */
  private drawDynamite(gfx: Graphics, color: number): void {
    const r = ITEM_RADIUS;
    const w = r * 0.6;
    const h = r * 1.6;

    // Glow halo
    gfx.circle(0, 0, r * 1.8).fill({ color, alpha: GLOW_ALPHA });

    // Stick body
    gfx.roundRect(-w, -h / 2, w * 2, h, 2).fill({ color, alpha: 0.8 });

    // Fuse line at top
    gfx.setStrokeStyle({ width: 1.5, color: 0xffaa00 });
    gfx
      .moveTo(0, -h / 2)
      .lineTo(r * 0.3, -h / 2 - r * 0.6)
      .stroke();

    // Spark dot
    gfx.circle(r * 0.3, -h / 2 - r * 0.6, 2).fill({
      color: 0xffff00,
      alpha: 0.9,
    });
  }

  /** Returns the neon color for a collectible type. */
  private getColor(type: CollectibleType): number {
    const itemColor = collectibleColor(type);
    if (itemColor) return COLOR_MAP[itemColor];
    return DYNAMITE_COLOR;
  }
}
