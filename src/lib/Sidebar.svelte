<script>
 import { onMount } from "svelte";
 import { page } from "$app/stores";
 import { goto } from "$app/navigation";
 import { sidebarWidth, databases, openCollections, selectedOpenCollectionId } from "$lib/stores";
 import IconText from "$lib/logos/IconText.svelte";
 import Databases from "./sidebar/Databases.svelte";

 let username = $state("...");
 let resizeEnabled = false;

 onMount(async () => {
  if (!await fetchUsername()) return;
  fetchDatabases();
 });

 async function fetchUsername() {
  let response = await fetch("/api/v1/username");
  if (response.ok) {
   username = await response.text();
   return true;
  } else {
   goto(`/login?redirect=${$page.url.pathname}`)
  }
 }

 async function fetchDatabases() {
  let response = await fetch("/api/v1/database-list");
  if (response.ok) {
   let databaseList = await response.json();
   $databases = [
    ...$databases,
    ...databaseList.filter(dbName => !$databases.some(db => db.database === dbName)).map(dbName => ({
     database: dbName,
     connected: false,
    }))
   ];
  }
  else {
   console.error("Failed to fetch databases");
  }
 }

 function enableResize(event) {
  resizeEnabled = {
   widthBefore: parseInt(`${$sidebarWidth}`),
   mouseX: event.x,
  };
 }

 function adjustResize(event) {
  if (!resizeEnabled) return;
  $sidebarWidth = Math.max(160, Math.min(450, resizeEnabled.widthBefore + event.x - resizeEnabled.mouseX));
 }

 function disableResize() {
  resizeEnabled = false;
 }
</script>

<svelte:window onpointermove={adjustResize} onpointerup={disableResize} />
<nav style="--width: {$sidebarWidth}px;">
 <div class="logo">
  <IconText />
 </div>
 <Databases />
 <div class="user">
  <div class="label">Logged in as</div>
  {username}
 </div>
 <button aria-label="resize" class="resize-bar" onpointerdown={enableResize}></button>
</nav>

<style>
 nav {
  position: fixed;
  display: flex;
  align-items: center;
  gap: 1em;
  width: var(--width);
  flex-direction: column;
  height: 100vh;
  border-right: 1px solid rgba(255, 255, 255, .05);
  background: rgba(255, 255, 255, .01);
  overflow: hidden;
 }

 button.resize-bar {
  position: fixed;
  left: calc(var(--width) - 1px);
  width: 4px;
  height: 100%;
  opacity: 0;
  cursor: ew-resize
 }

 button.resize-bar:hover {
  opacity: 1;
 }

 div.logo {
  font-size: 1.3em;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1em 0 ;
 }

 div.user {
  margin-top: auto;
  padding: 1em .8em;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: .3em;
 }

 div.user div.label {
  font-size: .8em;
  opacity: .6;
 }
</style>