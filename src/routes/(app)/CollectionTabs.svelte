<script>
 import { sidebarWidth, databases, openCollections, selectedOpenCollectionId, queryRunning } from "$lib/stores";
 import DocumentKeyRepresentation from "./DocumentKeyRepresentation.svelte";

 let { tabsElemHeight = $bindable() } = $props();

 function closeTabId(tabId) {
  $openCollections = $openCollections.filter(col => col.id !== tabId)
 }

 function handleTabClick(tabId) {
  $selectedOpenCollectionId = tabId;
 }
</script>

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

<style>
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
</style>

