/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { type GameState } from "../GameState.ts";
import { type Game } from "../Game.ts";
import { GameOverState } from "./GameOverState.ts";
import {
  collectibleDisplayName,
  collectibleColor,
  ItemColor,
} from "../../types/index.ts";

/**
 * The main gameplay state.
 * The maze is visible and the player moves via AI agent MCP tools.
 * Checks for win condition each frame.
 */
export class GameplayState implements GameState {
  /** Reference to the game orchestrator. */
  private game: Game;

  /** DOM element for the in-game HUD (move counter). */
  private hud: HTMLDivElement | null = null;

  /** Span displaying the current move count. */
  private moveCountEl: HTMLSpanElement | null = null;

  /** Span displaying the explored cell count. */
  private exploredCountEl: HTMLSpanElement | null = null;

  /** Span displaying the currently held item. */
  private inventoryEl: HTMLSpanElement | null = null;

  /**
   * @param game - The game orchestrator instance.
   */
  constructor(game: Game) {
    this.game = game;
  }

  /** @inheritdoc */
  enter(): void {
    // newGame() should already have been called (e.g. by StartGameTool)
    // before transitioning to this state. If not, create a default game.
    if (!this.game.board) {
      this.game.newGame();
    }
    this.game.renderer.buildMazeView(this.game.board);
    this.game.renderer.updatePlayerPosition(this.game.player.position);
    this.game.board.revealFrom(this.game.player.position);
    this.game.renderer.updateFog(this.game.board);
    this.game.renderer.showGameCanvas(true);
    this.game.toolRegistry.registerGameplayTools();
    this.createHud();
    this.updateExploredCount();
  }

  /** @inheritdoc */
  exit(): void {
    this.game.renderer.showGameCanvas(false);
    this.hud?.remove();
    this.hud = null;
    this.moveCountEl = null;
    this.exploredCountEl = null;
    this.inventoryEl = null;
  }

  /**
   * Updates the move counter display.
   * @param count - The current move count.
   */
  updateMoveCount(count: number): void {
    if (this.moveCountEl) {
      this.moveCountEl.textContent = String(count);
    }
  }

  /**
   * Updates the inventory display in the HUD.
   */
  updateInventory(): void {
    if (!this.inventoryEl) return;
    const inv = this.game.player.inventory;
    if (inv === null) {
      this.inventoryEl.textContent = "\u2014"; // em dash
      this.inventoryEl.style.color = "";
    } else {
      this.inventoryEl.textContent = collectibleDisplayName(inv);
      const color = collectibleColor(inv);
      const colorMap: Record<ItemColor, string> = {
        [ItemColor.Red]: "#ff0044",
        [ItemColor.Blue]: "#00aaff",
        [ItemColor.Green]: "#00ff88",
      };
      this.inventoryEl.style.color = color ? colorMap[color] : "#ff6600";
    }
  }

  /**
   * Updates the explored cell counter display.
   */
  updateExploredCount(): void {
    if (this.exploredCountEl) {
      const total = this.game.board.rows * this.game.board.cols;
      this.exploredCountEl.textContent = `${this.game.board.revealedCount}/${total}`;
    }
  }

  /** Creates the HUD overlay with move and explored counters. */
  private createHud(): void {
    this.hud = document.createElement("div");
    this.hud.id = "gameplay-hud";

    this.moveCountEl = document.createElement("span");
    this.moveCountEl.id = "move-count";
    this.moveCountEl.textContent = "0";

    this.exploredCountEl = document.createElement("span");
    this.exploredCountEl.id = "explored-count";
    this.exploredCountEl.textContent = "0/0";

    this.hud.innerHTML = `<span class="hud-label">MOVES</span> `;
    this.hud.appendChild(this.moveCountEl);

    const separator = document.createElement("span");
    separator.className = "hud-separator";
    this.hud.appendChild(separator);

    const exploredLabel = document.createElement("span");
    exploredLabel.className = "hud-label";
    exploredLabel.textContent = "EXPLORED";
    this.hud.appendChild(exploredLabel);
    this.hud.append(" ");
    this.hud.appendChild(this.exploredCountEl);

    const separator2 = document.createElement("span");
    separator2.className = "hud-separator";
    this.hud.appendChild(separator2);

    const holdingLabel = document.createElement("span");
    holdingLabel.className = "hud-label";
    holdingLabel.textContent = "HOLDING";
    this.hud.appendChild(holdingLabel);
    this.hud.append(" ");

    this.inventoryEl = document.createElement("span");
    this.inventoryEl.id = "inventory-item";
    this.inventoryEl.textContent = "\u2014"; // em dash
    this.hud.appendChild(this.inventoryEl);

    document.getElementById("app")!.appendChild(this.hud);
  }

  /** @inheritdoc */
  update(_dt: number): void {
    if (this.game.board.isExit(this.game.player.position)) {
      this.game.won = true;
      this.game.setState(new GameOverState(this.game));
    }
  }
}
