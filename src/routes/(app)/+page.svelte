<script>
 import IconText from "$lib/logos/IconText.svelte";
 import { sidebarWidth, databases, openCollections, selectedOpenCollectionId, queryRunning } from "$lib/stores";
 import { beforeNavigate } from "$app/navigation";
 import DocumentKeyRepresentation from "./DocumentKeyRepresentation.svelte";

 let expandedDocumentIndexes = $state([]);
 let tabsElem;
 let tabsElemHeight = $state(0);

 beforeNavigate(({ cancel }) => {
  if ($queryRunning) return cancel();
 });

 function closeTabId(tabId) {
  $openCollections = $openCollections.filter(col => col.id !== tabId)
 }

 function handleTabClick(tabId) {
  $selectedOpenCollectionId = tabId;
 }

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
   $queryRunning = false;
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
   } else {
    let err = await response.text();
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

<svelte:head>
	<title>MongoGUI</title>
</svelte:head>

<div class="wrapper" style="--sidebar-width: {$sidebarWidth}px;">
 <div class="tabs" bind:clientHeight={tabsElemHeight}>
  {#each $openCollections as tab}
   {@const selected = tab.id === $selectedOpenCollectionId}
   <!-- svelte-ignore a11y_no_static_element_interactions -->
   <!-- svelte-ignore a11y_click_events_have_key_events -->
   <div class="tab {selected ? "active" : ""}" onauxclick={() => closeTabId(tab.id)} onclick={(e) => handleTabClick(tab.id)}>
    <img src="/assets/icons/collection.svg" alt="collection" class="tab-icon">
    <div class="name">{tab.database}.{tab.collection}</div>
    <button class="close" onclick={() => closeTabId(tab.id)}>
     <img src="/assets/icons/close.svg" alt="close" class="close-icon">
    </button>
   </div>
  {/each}
 </div>
 {#if $openCollections.find(col => col.id === $selectedOpenCollectionId)}
  {@const collection = $openCollections.find(col => col.id === $selectedOpenCollectionId)}
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
         <DocumentKeyRepresentation {document} {key} tree={[]} />
        {/each}
       {/if}
      </div>
     {/each}
    </div>
   {/if}
  </div>
 {:else}
  <div class="empty">
   Select a collection to view its documents
  </div>
 {/if}
</div>

<style>
 div.wrapper {
  position: relative;
  margin-left: var(--sidebar-width);
  width: calc(100vw - var(--sidebar-width));
  height: 100vh;
 }

 div.tabs {
  display: flex;
  font-size: .75em;
  flex-wrap: wrap;
  row-gap: .2em;
 }

 div.tabs div.tab {
  display: flex;
  align-items: center;
  gap: .3em;
  padding: .4em .8em;
  user-select: none;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
 }

 div.tabs div.tab.active {
  background: color-mix(in srgb, var(--clr-primary) 20%, rgba(255, 255, 255, .2));
 }

 div.tabs div.tab div.name {
  white-space: nowrap;
 }

 div.tabs div.tab img.tab-icon {
  width: 1em;
 }

 div.tabs div.tab button.close {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: .2em;
  margin-left: 5px;
  opacity: 0;
 }

 div.tabs div.tab button.close img {
  width: .8em;
 }

 div.tabs div.tab.active button.close, div.tabs div.tab:hover button.close {
  opacity: 1;
 }

 div.empty {
  opacity: .5;
  font-size: .8em;
  font-weight: 500;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
 }

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