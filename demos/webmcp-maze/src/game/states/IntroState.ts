/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { type GameState } from "../GameState.ts";
import { type Game } from "../Game.ts";

/**
 * The intro/title screen state.
 * Displays a welcome message and waits for the AI agent to start the game
 * via the `start_game` MCP tool.
 */
export class IntroState implements GameState {
  /** Reference to the game orchestrator. */
  private game: Game;

  /** DOM overlay element for the intro screen. */
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
    this.overlay.id = "intro-overlay";
    this.overlay.innerHTML = `
      <h1>Maze Escape</h1>
      <p>You are trapped in a maze. Ask the AI agent to help you escape!</p>
      <p class="hint">The agent can use the <code>start_game</code> tool to begin.</p>
    `;
    document.getElementById("app")!.appendChild(this.overlay);

    this.game.toolRegistry.registerIntroTools();
  }

  /** @inheritdoc */
  exit(): void {
    this.overlay?.remove();
    this.overlay = null;
  }

  /** @inheritdoc */
  update(_dt: number): void {
    // Intro is static — nothing to update per frame.
  }
}
