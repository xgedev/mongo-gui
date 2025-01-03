<script>
 import { modalData } from "$lib/modal.js";
</script>

{#if $modalData}
 <div class="modal">
  {$modalData.value}
 </div>
{/if}

<style>
 div.modal {
  position: fixed;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
 }
</style>