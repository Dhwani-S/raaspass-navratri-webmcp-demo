/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { type GameState } from "../GameState.ts";
import { type Game } from "../Game.ts";

/**
 * The game-over state.
 * Displays results (win/lose, move count) and waits for the agent
 * to start a new game or acknowledge the outcome.
 */
export class GameOverState implements GameState {
  /** Reference to the game orchestrator. */
  private game: Game;

  /** DOM overlay element for the game-over screen. */
  private overlay: HTMLDivElement | null = null;

  /**
   * @param game - The game orchestrator instance.
   */
  constructor(game: Game) {
    this.game = game;
  }

  /** @inheritdoc */
  enter(): void {
    this.overlay = document.createElement("div");
    this.overlay.id = "gameover-overlay";

    const title = this.game.won ? "You Escaped!" : "Game Over";
    const message = this.game.won
      ? `Congratulations! You escaped the maze in ${this.game.player.moveCount} moves.`
      : "Better luck next time!";

    this.overlay.innerHTML = `
      <h1>${title}</h1>
      <p>${message}</p>
      <p class="hint">The agent can use <code>start_game</code> to play again.</p>
    `;
    document.getElementById("app")!.appendChild(this.overlay);

    this.game.toolRegistry.registerGameOverTools();
  }

  /** @inheritdoc */
  exit(): void {
    this.overlay?.remove();
    this.overlay = null;
  }

  /** @inheritdoc */
  update(_dt: number): void {
    // Game over is static — nothing to update per frame.
  }
}
