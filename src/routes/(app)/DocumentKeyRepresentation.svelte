<script>
 import DocumentKeyRepresentation from "./DocumentKeyRepresentation.svelte";
 import { writable } from "svelte/store";
 import { openCollections, selectedOpenCollectionId } from "$lib/stores";
 import { modalData, openModal } from "$lib/modal.js";

 let { document, key, _id, tree = [], indent = 1 } = $props();

 let isValueObj = typeof document[key] === "object";
 let isValueArr = Array.isArray(document[key]);
 let expand = $state(false);

 function handleValueClick() {
  openModal({
   value: document[key],
  }, async (code) => {
   if (code === 0) { // abort
    return true;
   } else if (code === 1) { // store
    if (!_id) {
     alert("No _id found - cannot update document");
     return false;
    }
    let treeToUpdate = [...tree, key].join("."); // ex.: config.roleIds.0
    let openCollection = $openCollections.find(col => col.id === $selectedOpenCollectionId);
    let response = await fetch(`/api/v1/databases/${openCollection.database}/run-update-one`, {
     method: "PATCH",
     headers: {
      "Content-Type": "application/json",
     },
     body: JSON.stringify({
      collection: openCollection.collection,
      _id,
      query: {
       $set: {
        [treeToUpdate]: $modalData.value,
       }
      }
     }),
    });
    if (response.ok) {
     openCollections.update(collections => collections.map(col => {
      if (col.id === $selectedOpenCollectionId) {
       return {
        ...col,
        documents: col.documents.map(doc => {
         if (doc._id === _id) {
          return doTreeUpdate(doc, [...tree, key], $modalData.value);
         }
         return doc;
        }),
       };
      }
      return col;
     }));
     function doTreeUpdate(doc, tree, value) {
      if (tree.length === 1) {
       return {
        ...doc,
        [tree[0]]: value,
       }
      } else {
       return {
        ...doc,
        [tree[0]]: doTreeUpdate(doc[tree[0]], tree.slice(1), value),
       }
      }
     }
     return true;
    }
    let error = await response.text();
    alert("Failed to update document: " + error);
    return false;
   }
  });
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
  <DocumentKeyRepresentation document={document[key]} key={key2} {_id} tree={[...tree, key]} indent={indent + 1} />
 {/each}
{/if}

<style>
 div.wrapper {
  display: flex;
  font-size: .9em;
 }

 div.wrapper:hover {
  background: rgba(255, 255, 255, .05);
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

 .column.value:hover {
  background: rgba(255, 255, 255, .03);
  box-shadow: inset 0 0 0 1px var(--clr-primary);
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