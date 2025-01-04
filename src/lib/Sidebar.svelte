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
    ...databaseList.filter(newDB => !$databases.some(db => db.database === newDB.database)).map(newDB => ({
     database: newDB.database,
     write: newDB.write,
     limits: newDB.limits,
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
  <div class="name">{username}</div>
  <button class="logout" onclick={() => window.location.href = "/api/v1/logout"}>
   <img src="/assets/icons/logout.svg" alt="logout" class="icon">
  </button>
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
  position: relative;
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

 div.user div.name {
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
 }

 div.user button.logout {
  position: absolute;
  right: 1em;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  padding: .3em;
  opacity: .7;
  display: flex;
  align-items: center;
  justify-content: center;
 }

 div.user button.logout img {
  width: 1.2em;
 }

 div.user button.logout:hover {
  background: rgba(255, 255, 255, .05);
  opacity: .9;
 }
</style>