<script>
  /**
   * MultiplierSelector Component
   * Toggle buttons for Single/Double/Treble selection
   */

  let { selected = 1, onSelect, disabled = false, showTreble = true } = $props()

  function handleSelect(multiplier) {
    if (!disabled) {
      onSelect(multiplier)
    }
  }
</script>

<div class="multiplier-selector" class:disabled>
  <button
    type="button"
    class="multiplier-btn"
    class:selected={selected === 1}
    onclick={() => handleSelect(1)}
    {disabled}
  >
    Single
  </button>
  <button
    type="button"
    class="multiplier-btn double"
    class:selected={selected === 2}
    onclick={() => handleSelect(2)}
    {disabled}
  >
    Double
  </button>
  {#if showTreble}
    <button
      type="button"
      class="multiplier-btn treble"
      class:selected={selected === 3}
      onclick={() => handleSelect(3)}
      {disabled}
    >
      Treble
    </button>
  {/if}
</div>

<style>
  .multiplier-selector {
    display: flex;
    gap: 0.5rem;
    width: 100%;
  }

  .multiplier-selector.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .multiplier-btn {
    flex: 1;
    min-height: 44px;
    border: 2px solid var(--colour-border);
    border-radius: var(--radius-md);
    background: white;
    color: var(--colour-text);
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .multiplier-btn:active {
    transform: scale(0.97);
  }

  .multiplier-btn.selected {
    border-color: var(--colour-primary);
    background: var(--colour-primary);
    color: white;
  }

  .multiplier-btn.double.selected {
    border-color: #1976d2;
    background: #1976d2;
  }

  .multiplier-btn.treble.selected {
    border-color: #7b1fa2;
    background: #7b1fa2;
  }

  .multiplier-btn:disabled {
    cursor: not-allowed;
  }

  @media (min-width: 400px) {
    .multiplier-btn {
      min-height: 48px;
      font-size: 1rem;
    }
  }
</style>
