<script>
  /**
   * NumberGrid Component
   * Grid of number buttons for dart scoring (1-20 + 25/Bull + 0/Miss)
   */

  let { onNumberSelect, disabled = false } = $props()

  const numbers = [
    [1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15],
    [16, 17, 18, 19, 20]
  ]

  function handleSelect(number) {
    if (!disabled) {
      onNumberSelect(number)
    }
  }
</script>

<div class="number-grid" class:disabled>
  {#each numbers as row}
    <div class="number-row">
      {#each row as number}
        <button
          type="button"
          class="number-btn"
          onclick={() => handleSelect(number)}
          {disabled}
        >
          {number}
        </button>
      {/each}
    </div>
  {/each}

  <div class="number-row special-row">
    <button
      type="button"
      class="number-btn miss-btn"
      onclick={() => handleSelect(0)}
      {disabled}
    >
      Miss
    </button>
    <button
      type="button"
      class="number-btn bull-btn"
      onclick={() => handleSelect(25)}
      {disabled}
    >
      Bull
    </button>
  </div>
</div>

<style>
  .number-grid {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    width: 100%;
  }

  .number-grid.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .number-row {
    display: flex;
    gap: 0.375rem;
  }

  .number-btn {
    flex: 1;
    min-height: 48px;
    border: none;
    border-radius: var(--radius-md);
    background: var(--colour-surface, #f5f5f5);
    color: var(--colour-text);
    font-size: 1.125rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.1s, transform 0.1s;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .number-btn:active {
    transform: scale(0.95);
    background: var(--colour-primary-light);
  }

  .number-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .special-row {
    margin-top: 0.25rem;
  }

  .miss-btn {
    background: #e0e0e0;
    color: #757575;
  }

  .miss-btn:active {
    background: #bdbdbd;
  }

  .bull-btn {
    background: #c62828;
    color: white;
  }

  .bull-btn:active {
    background: #b71c1c;
  }

  @media (min-width: 400px) {
    .number-btn {
      min-height: 52px;
      font-size: 1.25rem;
    }
  }
</style>
