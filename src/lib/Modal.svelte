<script>
 import { modalData, closeModal } from "$lib/modal.js";

 let loading = $state(false);
 let newValue = $state(stringifyValue($modalData.value));

 function stringifyValue(value) {
  if (typeof value === "object" || typeof value === "string") {
   return JSON.stringify(value, null, 2);
  }
  return value;
 }

 function parseValue(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (!isNaN(parseInt(value))) {
   if (value.includes(".")) {
    return parseFloat(value);
   }
   return parseInt(value);
  }
  if (value.startsWith('"') && value.endsWith('"')) {
   return value.slice(1, -1);
  }
  try {
   return JSON.parse(value);
  } catch (err) {
   alert("Error when parsing JSON: " + err)
   return value;
  }
 }

 function handleCancel() {
  closeModal(0);
 }

 async function handleConfirm() {
  loading = true;
  modalData.update(data => {
   return {
    ...data,
    value: parseValue(newValue),
   }
  });
  try {
   let result = await closeModal(1);
   loading = false;
  } catch (err) {
   loading = false;
   alert("Error: " + err);
  }
 }
</script>

{#if $modalData}
 <div class="modal">
  <div class="title">Edit value</div>
  <textarea value={stringifyValue($modalData.value)} oninput={(e) => newValue = e.target.value}></textarea>
  <div class="actions">
   <button class="default cancel" onclick={handleCancel}>Cancel</button>
   <button class="default confirm" onclick={handleConfirm}>
    {#if loading}
     • • •
    {:else}
     Confirm
    {/if}
   </button>
  </div>
 </div>
{/if}

<style>
 div.modal {
  position: fixed;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 450px;
  height: 550px;
  background: #0c1b0c;
  z-index: 1;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  padding: 1em;
  gap: 1em;
  border: 1px solid rgba(255, 255, 255, .2);
  box-shadow: 0 0 30px 0 rgba(0, 0, 0, .3);
 }

 div.title {
  font-size: 1.1em;
  font-weight: 500;
 }

 textarea {
  background: rgba(0, 0, 0, .1);
  height: 100%;
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, .2);
  padding: .3em;
  font-family: monospace;
  resize: none;
  outline: none;
 }

 div.actions {
  display: flex;
  font-size: .8em;
  justify-content: flex-end;
  gap: .5em;
 }

 div.actions button {
  max-width: 100px;
 }

 div.actions button.cancel {
  background: rgba(255, 255, 255, .3);
 }
</style>