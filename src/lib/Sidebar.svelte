<script>
 import { onMount } from "svelte";
 import { page } from "$app/stores";
 import { goto } from "$app/navigation";
 import { sidebarWidth, databases, openCollections, selectedOpenCollectionId } from "$lib/stores";
 import IconText from "$lib/logos/IconText.svelte";

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

 async function handleDBConnect(databaseName) {
  let db = $databases.find(db => db.database === databaseName);
  if (!db) return;
  if (db.state === 2) { // connected
   databases.set($databases.map(db => {
    if (db.database === databaseName) {
     return ({
      ...db,
      state: 0,
      collections: [],
     });
    }
    return db;
   }));
   openCollections.set($openCollections.filter(col => col.database !== databaseName));
   return;
  } else if (db.state === 1) { // connecting
   return;
  } else { // disconnected
   databases.set($databases.map(db => {
    if (db.database === databaseName) {
     return ({
      ...db,
      state: 1,
     });
    }
    return db;
   }));
   let response = await fetch(`/api/v1/database/${databaseName}/collection-list`);
   if (response.ok) {
    let collections = await response.json();
    databases.set($databases.map(db => {
     if (db.database === databaseName) {
      return ({
       ...db,
       state: 2,
       collections,
      });
     }
     return db;
    }));
   } else {
    alert(`Error connecting to the database. Status: ${response.status}`);
    databases.set($databases.map(db => {
     if (db.database === databaseName) {
      return ({
       ...db,
       state: 0,
       collections: [],
      });
     }
     return db;
    }));
   }
  }
 }

 async function handleCollectionClick(databaseName, collectionName) {
  let foundOpen = $openCollections.find(col => col.database === databaseName && col.collection === collectionName);
  if (!foundOpen) {
   foundOpen = {
    id: Date.now() + Math.random()*1000000,
    database: databaseName,
    collection: collectionName,
    query: "{}",
    projection: "{}",
    limit: 1,
    documents: [],
   };
   $openCollections = [...$openCollections, foundOpen];
  }
  $selectedOpenCollectionId = foundOpen.id;
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
 <div class="databases">
  {#each $databases as db, i}
   <div class="database">
    <div class="header">
     <div class="name">{db.database}</div>
     <button class="default connect" onclick={() => handleDBConnect(db.database)}>
      {#if db.state === 2}
       Disconnect
      {:else if db.state === 1}
       • • •
      {:else}
       Connect
      {/if}
     </button>
    </div>
    {#if db.state === 2}
     <div class="collections">
      {#each db.collections as collection}
       {@const open = $openCollections.some(col => col.collection === collection)}
       <button class="collection {open ? "active" : ""}" onclick={() => handleCollectionClick(db.database, collection)}>
        <img src="/assets/icons/collection.svg" alt="collection" onload={SVGInject(this)} class="sidebar-col-icon">
        <div class="name">{collection}</div>
       </button>
      {/each}
     </div>
    {/if}
   </div>
   {#if i <= $databases.length - 1}
    <div class="divider"></div>
   {/if}
  {/each}
 </div>
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

 div.databases {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: .7em;
  overflow: auto;
 }

 div.database {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 .8em;
  gap: .3em;
 }

 div.database div.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
 }

 div.database div.header button.connect {
  width: max-content;
  font-size: .7em;
  padding: .4em .8em;
  border-radius: 3px;
  background: rgba(255, 255, 255, .15);
 }

 div.database div.collections {
  display: flex;
  flex-direction: column;
  gap: .1em;
  font-size: .85em;
 }

 div.database button.collection {
  display: flex;
  align-items: center;
  gap: .5em;
  padding: .4em 0;
  padding-left: .5em;
  text-align: start;
  background: none;
  max-width: 100%;
  cursor: default;
 }
 div.database button.collection:hover {
  background: rgba(255, 255, 255, .05);
 }

 div.database button.collection.active {
  background: color-mix(in srgb, var(--clr-primary) 40%, transparent);
 }
 div.database button.collection.active:hover {
  opacity: .85;
 }

 div.database button.collection div.name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
 }

 :global(div.database button.collection svg.sidebar-col-icon) {
  width: 1em;
  opacity: .8;
 }

 :global(div.database button.collection.active svg.sidebar-col-icon) {
  fill: color-mix(in srgb, var(--clr-primary) 80%, #fff);
  stroke: color-mix(in srgb, var(--clr-primary) 80%, #fff);
 }

 div.databases div.divider {
  width: 100%;
  height: 1px;
  background: #fff;
  opacity: .08;
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