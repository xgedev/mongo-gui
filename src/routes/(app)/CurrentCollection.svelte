<script>
 import { sidebarWidth, databases, openCollections, selectedOpenCollectionId, queryRunning } from "$lib/stores";
 import DocumentKeyRepresentation from "./DocumentKeyRepresentation.svelte";
 import CollectionTabs from "./CollectionTabs.svelte";
 import { onMount } from "svelte";

 let { collection, tabsElemHeight } = $props();

 let expandedDocumentIndexes = $state([]);
 let noResults = $state(false);

 $effect(() => {
  if ($selectedOpenCollectionId === collection.id) {
   if (collection.instantQuery) {
    collection.instantQuery = false;
    runQuery();
   }
  }
 })

 function handleNewQuery(query) {
  $openCollections = $openCollections.map(col => {
   if (col.id === $selectedOpenCollectionId) {
    return {
     ...col,
     query,
    }
   }
   return col;
  });
  writeKeyToLocalStorage("query", query);
 }

 function handleNewProjection(projection) {
  $openCollections = $openCollections.map(col => {
   if (col.id === $selectedOpenCollectionId) {
    return {
     ...col,
     projection,
    }
   }
   return col;
  });
  writeKeyToLocalStorage("projection", projection);
 }

 function handleNewLimit(limit) {
  $openCollections = $openCollections.map(col => {
   if (col.id === $selectedOpenCollectionId) {
    return {
     ...col,
     limit: parseInt(limit),
    }
   }
   return col;
  });
  writeKeyToLocalStorage("limit", parseInt(limit));
 }

 function writeKeyToLocalStorage(key, value) {
  let before = JSON.parse(localStorage.getItem(`${collection.database}.${collection.collection}`) || "{}");
  localStorage.setItem(`${collection.database}.${collection.collection}`, JSON.stringify({
   ...before,
   [key]: value,
  }));
 }

 async function runQuery() {
  if ($queryRunning) return;
  $queryRunning = true;
  expandedDocumentIndexes = [];
  let currentCollection = $openCollections.find(col => col.id === $selectedOpenCollectionId);
  try {
   let response = await fetch(`/api/v1/databases/${currentCollection.database}/run-query`, {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
    },
    body: JSON.stringify({
     collection: currentCollection.collection,
     query: JSON.parse(currentCollection.query.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')),
     projection: JSON.parse(currentCollection.projection.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')),
     limit: currentCollection.limit,
    }),
   });
   noResults = true;
   if (response.ok) {
    let documents = await response.json();
    $openCollections = $openCollections.map(col => {
     if (col.id === $selectedOpenCollectionId) {
      return {
       ...col,
       documents,
      }
     }
     return col;
    });
    $queryRunning = false;
   } else {
    let err = await response.text();
    $queryRunning = false;
    return alert(`Failed to run query: ${err}`);
   }
  } catch (err) {
   $queryRunning = false;
   return alert(`Failed to run query: ${err}`);
  }
 }

 function handleExpandDocument(index, key) {
  expandedDocumentIndexes = expandedDocumentIndexes.includes(index) ? expandedDocumentIndexes.filter(i => i !== index) : [...expandedDocumentIndexes, index];
 }
</script>

<div class="collection-container" style="--tabs-elem-height: {tabsElemHeight}px;">
 <div class="input-wrapper">
  <div class="label">Query</div>
  <textarea class="input" value={collection.query} oninput={(e) => handleNewQuery(e.target.value)}></textarea>
 </div>
 <div class="divider"></div>
 <div class="input-wrapper">
  <div class="label">Projection</div>
  <textarea class="input" value={collection.projection} oninput={(e) => handleNewProjection(e.target.value)}></textarea>
 </div>
 <div class="divider"></div>
 <div class="input-wrapper">
  <div class="label">Limit</div>
  <input type="number" class="input" value={collection.limit} oninput={(e) => handleNewLimit(e.target.value)} />
 </div>
 <div class="divider"></div>
 <div class="actions-wrapper">
  <button class="run-query default" onclick={runQuery}>
   {#if $queryRunning}
    • • •
   {:else}
    <img src="/assets/icons/play.svg" alt="run" class="icon">
    Run query
   {/if}
  </button>
 </div>
 {#if !$queryRunning}
  <div class="documents">
   {#each collection.documents as document, i}
    {@const isOpen = expandedDocumentIndexes.includes(i)}
    <div class="document">
     <div class="header">
      <button class="expand {isOpen ? "open" : ""}" onclick={() => handleExpandDocument(i)}>
       <img src="/assets/icons/play.svg" alt="expand" class="expand">
      </button>
      <div class="title">[{i}] | {document._id}</div>
     </div>
     {#if isOpen}
      {#each Object.keys(document) as key}
       <DocumentKeyRepresentation {document} {key} _id={document._id} tree={[]} />
      {/each}
     {/if}
    </div>
   {:else}
    {#if noResults}
     <div class="sub" style="opacity: .8; font-size: .8em;">No results</div>
    {/if}
   {/each}
  </div>
 {/if}
</div>

<style>
 
 div.collection-container {
  display: flex;
  flex-direction: column;
  gap: 1em;
  padding: 1em;
  height: calc(100% - var(--tabs-elem-height) - 5px);
 }

 div.collection-container div.divider {
  width: 100%;
  height: 1px;
  background: #fff;
  opacity: .15;
 }

 div.collection-container div.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: .1em;
 }

 div.collection-container div.input-wrapper div.label {
  font-size: .7em;
  text-transform: uppercase;
  font-weight: 600;
  opacity: .6;
 }

 div.collection-container textarea, div.collection-container input {
  background: rgba(255, 255, 255, .1);
  border-radius: 3px;
  padding: .1em .3em;
  border: 1px solid color-mix(in srgb, var(--clr-primary) 20%, rgba(255, 255, 255, .1));
  outline: none;
  font-family:'Courier New', Courier, monospace;
  font-size: .85em;
  max-width: 100%;
  min-width: 100%;
 }

 div.collection-container input {
  width: max-content;
  padding: .2em .5em;
  max-width: unset;
  min-width: unset;
 }

 div.collection-container button.run-query {
  display: flex;
  align-items: center;
  gap: .8em;
  width: max-content;
  font-size: .8em;
  font-weight: 500;
  padding: .5em .8em;
 }

 div.collection-container button.run-query img.icon {
  width: .8em;
 }

 div.collection-container div.documents {
  display: flex;
  flex-direction: column;
  font-size: 1.1em;
  gap: .2em;
  overflow-y: auto;
  height: 100%;
 }

 div.collection-container div.documents * {
  font-family: monospace;
 }

 div.collection-container div.document {
  display: flex;
  flex-direction: column;
  padding: .2em 0;
  background: rgba(255, 255, 255, .05);
 }

 div.collection-container div.documents div.header {
  display: flex;
  align-items: center;
  gap: .5em;
 }

 div.collection-container div.documents div.header button.expand {
  background: transparent;
  padding: .1em .3em;
 }

 div.collection-container div.documents div.header img.expand {
  width: .5em;
  opacity: .7;
  transform: rotate(90deg);
 }

 div.collection-container div.documents div.header button.open img.expand {
  transform: rotate(-90deg);
 }
</style>