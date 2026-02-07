<script>
  /**
   * CurrentTurn Component
   * Displays current turn's darts and total
   */

  import { formatDart } from '$lib/utils/scoring.utils'

  let { darts = [], turnTotal = 0, onUndo = null } = $props()

  function getDartDisplay(index) {
    const dart = darts[index]
    if (!dart) return { display: '-', isEmpty: true, isBust: false }

    return {
      display: formatDart(dart.multiplier, dart.number),
      isEmpty: false,
      isBust: dart.is_bust
    }
  }
</script>

<div class="current-turn">
  <div class="darts-display">
    {#each [0, 1, 2] as index}
      {@const dart = getDartDisplay(index)}
      <div class="dart-slot" class:empty={dart.isEmpty} class:bust={dart.isBust}>
        <span class="dart-icon">{index < darts.length ? '🎯' : '⚫'}</span>
        <span class="dart-value">{dart.display}</span>
      </div>
    {/each}
  </div>

  <div class="turn-info">
    <div class="turn-total">
      <span class="label">Turn Total</span>
      <span class="value">{turnTotal}</span>
    </div>

    {#if onUndo && darts.length > 0}
      <button type="button" class="undo-btn" onclick={onUndo}>
        Undo
      </button>
    {/if}
  </div>
</div>

<style>
  .current-turn {
    background: white;
    border-radius: var(--radius-md);
    padding: 0.75rem;
    box-shadow: var(--shadow-sm);
  }

  .darts-display {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .dart-slot {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem;
    background: var(--colour-background);
    border-radius: var(--radius-md);
    border: 2px solid transparent;
  }

  .dart-slot.empty {
    opacity: 0.4;
  }

  .dart-slot.bust {
    background: var(--colour-error-light);
    border-color: var(--colour-error);
  }

  .dart-icon {
    font-size: 1.25rem;
    margin-bottom: 0.25rem;
  }

  .dart-value {
    font-size: 1rem;
    font-weight: 600;
    color: var(--colour-text);
  }

  .dart-slot.bust .dart-value {
    color: var(--colour-error);
    text-decoration: line-through;
  }

  .turn-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .turn-total {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .turn-total .label {
    font-size: 0.875rem;
    color: var(--colour-text-light);
  }

  .turn-total .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--colour-primary);
  }

  .undo-btn {
    padding: 0.5rem 1rem;
    border: 1px solid var(--colour-border);
    border-radius: var(--radius-md);
    background: white;
    color: var(--colour-text-light);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .undo-btn:active {
    background: var(--colour-background);
  }
</style>
