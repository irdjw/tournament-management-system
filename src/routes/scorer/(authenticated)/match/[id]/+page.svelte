<script>
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import { onMount, onDestroy } from 'svelte'
  import { getMatch, updateMatchStatus } from '$lib/services/match.service'
  import {
    getMatchScoringState,
    startLeg,
    startTurn,
    recordDart,
    undoLastDart,
    completeTurn,
    completeLeg,
    updateMatchLegsWon,
    completeMatch
  } from '$lib/services/scoring.service'
  import { calculateDartValue, isBust, isCheckout, isCheckable, getSuggestedCheckouts } from '$lib/utils/scoring.utils'
  import Scoreboard from '$lib/components/scorer/Scoreboard.svelte'
  import NumberGrid from '$lib/components/scorer/NumberGrid.svelte'
  import MultiplierSelector from '$lib/components/scorer/MultiplierSelector.svelte'
  import CurrentTurn from '$lib/components/scorer/CurrentTurn.svelte'

  // Match state
  let match = $state(null)
  let loading = $state(true)
  let error = $state(null)

  // Scoring state
  let currentLeg = $state(null)
  let currentTurn = $state(null)
  let currentDarts = $state([])
  let player1Score = $state(501)
  let player2Score = $state(501)
  let player1LegsWon = $state(0)
  let player2LegsWon = $state(0)
  let currentPlayerId = $state(null)
  let turnNumber = $state(1)

  // Input state
  let selectedMultiplier = $state(1)
  let inputDisabled = $state(false)

  // Derived
  let startingScore = $derived(match?.starting_score || match?.tournament?.default_starting_score || 501)
  let bestOfLegs = $derived(match?.best_of_legs || match?.tournament?.default_best_of_legs || 5)
  let legsToWin = $derived(Math.ceil(bestOfLegs / 2))
  let currentScore = $derived(currentPlayerId === match?.player1?.id ? player1Score : player2Score)
  let turnTotal = $derived(currentDarts.reduce((sum, d) => sum + (d.is_bust ? 0 : d.value), 0))
  let checkoutSuggestions = $derived(isCheckable(currentScore) ? getSuggestedCheckouts(currentScore) : [])
  let showTreble = $derived(selectedMultiplier !== 2 || true) // Always show for now

  onMount(async () => {
    await loadMatch()
  })

  async function loadMatch() {
    loading = true
    error = null

    const result = await getMatchScoringState($page.params.id)

    if (result.error) {
      error = result.error.message
      loading = false
      return
    }

    match = result.data.match
    player1LegsWon = match.player1_legs_won || 0
    player2LegsWon = match.player2_legs_won || 0

    // Find active leg or start new one
    const activeLeg = result.data.legs.find(l => !l.winner_id)

    if (activeLeg) {
      await resumeLeg(activeLeg)
    } else if (match.status === 'assigned' || match.status === 'in_progress') {
      await startNewLeg()
    }

    // Update match status to in_progress if needed
    if (match.status === 'assigned') {
      await updateMatchStatus(match.id, 'in_progress')
      match.status = 'in_progress'
    }

    loading = false
  }

  async function resumeLeg(leg) {
    currentLeg = leg
    player1Score = leg.player1_starting_score
    player2Score = leg.player2_starting_score

    // Calculate current scores from turns
    if (leg.turns && leg.turns.length > 0) {
      for (const turn of leg.turns) {
        if (turn.player_id === match.player1.id) {
          player1Score = turn.score_after
        } else {
          player2Score = turn.score_after
        }
      }

      // Find the last complete turn
      const lastTurn = leg.turns[leg.turns.length - 1]
      const lastTurnDarts = lastTurn.darts?.length || 0

      if (lastTurnDarts < 3 && !lastTurn.is_successful_checkout) {
        // Resume incomplete turn
        currentTurn = lastTurn
        currentDarts = lastTurn.darts || []
        currentPlayerId = lastTurn.player_id
        turnNumber = lastTurn.turn_number
      } else {
        // Start next turn
        turnNumber = lastTurn.turn_number + 1
        const lastPlayerWasPlayer1 = lastTurn.player_id === match.player1.id
        currentPlayerId = lastPlayerWasPlayer1 ? match.player2.id : match.player1.id
        await startNewTurn()
      }
    } else {
      // No turns yet, player 1 starts
      currentPlayerId = match.player1.id
      await startNewTurn()
    }
  }

  async function startNewLeg() {
    const legNumber = player1LegsWon + player2LegsWon + 1

    const result = await startLeg(
      match.id,
      legNumber,
      match.player1.id,
      match.player2.id,
      startingScore
    )

    if (result.error) {
      error = result.error.message
      return
    }

    currentLeg = result.data
    player1Score = startingScore
    player2Score = startingScore
    turnNumber = 1

    // Alternate who starts based on leg number
    currentPlayerId = legNumber % 2 === 1 ? match.player1.id : match.player2.id

    await startNewTurn()
  }

  async function startNewTurn() {
    const scoreBefore = currentPlayerId === match.player1.id ? player1Score : player2Score

    const result = await startTurn(
      currentLeg.id,
      currentPlayerId,
      turnNumber,
      scoreBefore
    )

    if (result.error) {
      error = result.error.message
      return
    }

    currentTurn = result.data
    currentDarts = []
    selectedMultiplier = 1
  }

  async function handleNumberSelect(number) {
    if (inputDisabled || currentDarts.length >= 3) return

    // Validate multiplier for special numbers
    let multiplier = selectedMultiplier
    if (number === 0) multiplier = 1 // Miss is always single
    if (number === 25 && multiplier === 3) multiplier = 2 // No treble bull

    inputDisabled = true

    const dartResult = await recordDart(
      currentTurn.id,
      currentDarts.length + 1,
      multiplier,
      number,
      currentScore
    )

    if (dartResult.error) {
      error = dartResult.error.message
      inputDisabled = false
      return
    }

    currentDarts = [...currentDarts, dartResult.data]

    // Update score
    if (!dartResult.isBust) {
      if (currentPlayerId === match.player1.id) {
        player1Score -= dartResult.data.value
      } else {
        player2Score -= dartResult.data.value
      }
    }

    // Check for checkout
    if (dartResult.isCheckout) {
      await handleCheckout()
    } else if (dartResult.isBust || currentDarts.length >= 3) {
      await handleTurnEnd(dartResult.isBust)
    }

    // Reset multiplier after each dart
    selectedMultiplier = 1
    inputDisabled = false
  }

  async function handleUndo() {
    if (currentDarts.length === 0) return

    inputDisabled = true

    const result = await undoLastDart(currentTurn.id)

    if (result.error) {
      error = result.error.message
      inputDisabled = false
      return
    }

    // Restore score if dart wasn't bust
    const removedDart = result.data
    if (!removedDart.is_bust) {
      if (currentPlayerId === match.player1.id) {
        player1Score += removedDart.value
      } else {
        player2Score += removedDart.value
      }
    }

    currentDarts = currentDarts.slice(0, -1)
    inputDisabled = false
  }

  async function handleTurnEnd(wasBust) {
    const finalScore = currentPlayerId === match.player1.id ? player1Score : player2Score
    const actualTurnTotal = wasBust ? 0 : turnTotal

    // If bust, restore score
    if (wasBust) {
      const scoreBefore = currentTurn.score_before
      if (currentPlayerId === match.player1.id) {
        player1Score = scoreBefore
      } else {
        player2Score = scoreBefore
      }
    }

    const isCheckoutAttempt = isCheckable(currentTurn.score_before)

    await completeTurn(
      currentTurn.id,
      actualTurnTotal,
      wasBust ? currentTurn.score_before : finalScore,
      isCheckoutAttempt,
      false
    )

    // Switch player and start new turn
    turnNumber++
    currentPlayerId = currentPlayerId === match.player1.id ? match.player2.id : match.player1.id
    await startNewTurn()
  }

  async function handleCheckout() {
    const winnerId = currentPlayerId
    const checkoutDart = currentDarts.length

    // Complete the turn
    await completeTurn(
      currentTurn.id,
      turnTotal,
      0,
      true,
      true
    )

    // Update final scores
    const player1Final = winnerId === match.player1.id ? 0 : player1Score
    const player2Final = winnerId === match.player2.id ? 0 : player2Score

    // Count total darts in leg
    // This is simplified - in production you'd query all turns
    const totalDarts = (turnNumber - 1) * 6 + currentDarts.length

    // Complete the leg
    await completeLeg(
      currentLeg.id,
      winnerId,
      player1Final,
      player2Final,
      totalDarts,
      checkoutDart
    )

    // Update legs won
    if (winnerId === match.player1.id) {
      player1LegsWon++
    } else {
      player2LegsWon++
    }

    await updateMatchLegsWon(match.id, player1LegsWon, player2LegsWon)

    // Check for match win
    if (player1LegsWon >= legsToWin || player2LegsWon >= legsToWin) {
      await handleMatchWin(winnerId)
    } else {
      // Start next leg
      await startNewLeg()
    }
  }

  async function handleMatchWin(winnerId) {
    await completeMatch(match.id, winnerId, player1LegsWon, player2LegsWon)

    // Redirect to summary or dashboard
    goto('/scorer')
  }
</script>

<div class="scorer-page">
  {#if loading}
    <div class="loading">Loading match...</div>
  {:else if error}
    <div class="error-message">{error}</div>
  {:else if match}
    <div class="scorer-layout">
      <!-- Header -->
      <header class="scorer-header">
        <a href="/scorer" class="back-btn">←</a>
        <span class="match-info">
          Leg {player1LegsWon + player2LegsWon + 1} • Best of {bestOfLegs}
        </span>
      </header>

      <!-- Scoreboard -->
      <Scoreboard
        player1Name={match.player1?.player?.name || 'Player 1'}
        player2Name={match.player2?.player?.name || 'Player 2'}
        {player1Score}
        {player2Score}
        {player1LegsWon}
        {player2LegsWon}
        {currentPlayerId}
        player1Id={match.player1?.id}
        player2Id={match.player2?.id}
        bestOf={bestOfLegs}
      />

      <!-- Current Turn -->
      <CurrentTurn
        darts={currentDarts}
        {turnTotal}
        onUndo={currentDarts.length > 0 ? handleUndo : null}
      />

      <!-- Checkout Suggestion -->
      {#if checkoutSuggestions.length > 0 && currentDarts.length === 0}
        <div class="checkout-hint">
          Checkout: {checkoutSuggestions[0]}
        </div>
      {/if}

      <!-- Multiplier Selector -->
      <MultiplierSelector
        selected={selectedMultiplier}
        onSelect={(m) => selectedMultiplier = m}
        disabled={inputDisabled}
        showTreble={true}
      />

      <!-- Number Grid -->
      <NumberGrid
        onNumberSelect={handleNumberSelect}
        disabled={inputDisabled || currentDarts.length >= 3}
      />
    </div>
  {:else}
    <div class="not-found">Match not found</div>
  {/if}
</div>

<style>
  .scorer-page {
    height: 100dvh;
    display: flex;
    flex-direction: column;
    background: var(--colour-background);
    overflow: hidden;
  }

  .loading, .error-message, .not-found {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    text-align: center;
  }

  .error-message {
    color: var(--colour-error);
  }

  .scorer-layout {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 0.5rem;
    gap: 0.5rem;
    overflow: hidden;
  }

  .scorer-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.25rem 0;
  }

  .back-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    background: white;
    color: var(--colour-text);
    font-size: 1.25rem;
    text-decoration: none;
    box-shadow: var(--shadow-sm);
  }

  .match-info {
    font-size: 0.875rem;
    color: var(--colour-text-light);
  }

  .checkout-hint {
    background: var(--colour-success-light);
    color: var(--colour-success);
    padding: 0.5rem 0.75rem;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 500;
    text-align: center;
  }

  @media (min-height: 700px) {
    .scorer-layout {
      gap: 0.75rem;
      padding: 0.75rem;
    }
  }
</style>
