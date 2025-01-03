<script>
 import IconText from "$lib/logos/IconText.svelte";
 import { sidebarWidth, databases, openCollections, selectedOpenCollectionId, queryRunning } from "$lib/stores";
 import { beforeNavigate } from "$app/navigation";
 import CollectionTabs from "./CollectionTabs.svelte";
 import CurrentCollection from "./CurrentCollection.svelte";

 let tabsElemHeight = 0;

 beforeNavigate(({ cancel }) => {
  if ($queryRunning) return cancel();
 });
</script>

<svelte:head>
	<title>MongoGUI</title>
</svelte:head>

<div class="wrapper" style="--sidebar-width: {$sidebarWidth}px;">
 <CollectionTabs bind:tabsElemHeight />
 {#if $openCollections.find(col => col.id === $selectedOpenCollectionId)}
  {@const collection = $openCollections.find(col => col.id === $selectedOpenCollectionId)}
  <CurrentCollection {collection} {tabsElemHeight} />
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

 div.empty {
  opacity: .5;
  font-size: .8em;
  font-weight: 500;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
 }
</style>