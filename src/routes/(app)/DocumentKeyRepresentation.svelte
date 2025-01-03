<script>
 import DocumentKeyRepresentation from "./DocumentKeyRepresentation.svelte";
 import { writable } from "svelte/store";

 let { document, key, indent = 1 } = $props();

 let isValueObj = typeof document[key] === "object";
 let isValueArr = Array.isArray(document[key]);
 let expand = $state(false);

 function handleValueClick() {
  prompt("Value", JSON.stringify(document[key], null, 2));
 }
</script>

<div class="wrapper" style="--indent: {indent}">
 <div class="column key">
  {#if isValueObj && (!isValueArr || document[key].length)}
   <button class="expand {expand ? "open" : ""}" onclick={() => expand = !expand}>
    <img src="/assets/icons/play.svg" alt="expand" class="expand">
   </button>
  {/if}
  {key}
 </div>
 {#if isValueObj}
  <button class="column value" onclick={handleValueClick}>{(isValueArr && !document[key].length) ? "[]" : ""}</button>
 {:else}
  <button class="column value" onclick={handleValueClick}>{document[key]}</button>
 {/if}
</div>
{#if expand}
 {#each Object.keys(document[key]) as key2}
  <DocumentKeyRepresentation document={document[key]} key={key2} indent={indent + 1} />
 {/each}
{/if}

<style>
 div.wrapper {
  display: flex;
  font-size: .9em;
 }

 div.wrapper * {
  font-family: monospace;
 }

 .column {
  position: relative;
  width: 50%;
  border-right: 1px solid rgba(255, 255, 255, .1);
  border-bottom: 1px solid rgba(255, 255, 255, .1);
  padding: .1em 0;
 }

 .column.key {
  padding-left: calc(1em * var(--indent));
 }

 .column.value {
  padding-left: .5em;
 }
 
 button.column {
  background: none;
  text-align: start;
  cursor: default;
  user-select: none;
 }

 button.expand {
  position: absolute;
  background: none;
  left: calc(.1em + 1em * (var(--indent) - 1));
  top: 45%;
  transform: translateY(-50%);
  opacity: .6;
  padding: .1em;
  padding-right: 1em;
 }

 button.expand img {
  width: .5em;
  transform: rotate(90deg);
 }

 button.expand.open img {
  transform: rotate(-90deg);
 }
</style>