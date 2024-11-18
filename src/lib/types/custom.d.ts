/// <reference types="svelte" />

declare namespace svelteHTML {
  interface HTMLAttributes<T> {
    'on:click_outside'?: (e: CustomEvent) => void;
  }
}
