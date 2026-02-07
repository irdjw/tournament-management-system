<script>
  /**
   * Scoreboard Component
   * Displays current scores, legs won, and current player indicator
   */

  let {
    player1Name = 'Player 1',
    player2Name = 'Player 2',
    player1Score = 501,
    player2Score = 501,
    player1LegsWon = 0,
    player2LegsWon = 0,
    currentPlayerId = null,
    player1Id = null,
    player2Id = null,
    bestOf = 5
  } = $props()

  const legsToWin = Math.ceil(bestOf / 2)
</script>

<div class="scoreboard">
  <div class="player-section" class:active={currentPlayerId === player1Id}>
    <div class="player-header">
      <span class="player-name">{player1Name}</span>
      <span class="legs-won">{player1LegsWon}/{legsToWin}</span>
    </div>
    <div class="score">{player1Score}</div>
    {#if currentPlayerId === player1Id}
      <div class="throw-indicator">Throwing</div>
    {/if}
  </div>

  <div class="divider">
    <span class="vs">vs</span>
  </div>

  <div class="player-section" class:active={currentPlayerId === player2Id}>
    <div class="player-header">
      <span class="player-name">{player2Name}</span>
      <span class="legs-won">{player2LegsWon}/{legsToWin}</span>
    </div>
    <div class="score">{player2Score}</div>
    {#if currentPlayerId === player2Id}
      <div class="throw-indicator">Throwing</div>
    {/if}
  </div>
</div>

<style>
  .scoreboard {
    display: flex;
    align-items: stretch;
    background: white;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
  }

  .player-section {
    flex: 1;
    padding: 0.75rem;
    text-align: center;
    transition: background 0.2s;
  }

  .player-section.active {
    background: var(--colour-primary-light);
  }

  .player-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.25rem;
  }

  .player-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--colour-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 70%;
  }

  .legs-won {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--colour-primary);
    background: var(--colour-primary-light);
    padding: 0.125rem 0.375rem;
    border-radius: var(--radius-sm);
  }

  .player-section.active .legs-won {
    background: white;
  }

  .score {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--colour-text);
    line-height: 1;
  }

  .throw-indicator {
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--colour-primary);
    text-transform: uppercase;
    margin-top: 0.25rem;
    letter-spacing: 0.05em;
  }

  .divider {
    display: flex;
    align-items: center;
    padding: 0 0.25rem;
    background: var(--colour-background);
  }

  .vs {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--colour-text-light);
    text-transform: uppercase;
  }

  @media (min-width: 400px) {
    .player-section {
      padding: 1rem;
    }

    .player-name {
      font-size: 1rem;
    }

    .score {
      font-size: 3rem;
    }

    .throw-indicator {
      font-size: 0.75rem;
    }
  }
</style>
