<script>
	import "../app.css";

	let { children } = $props();
</script>

<main>
 {@render children()}
</main>

<a class="footer" target="_blank" href="https://github.com/xgedev/mongo-gui">
 Made with ❤ by Xge
</a>

<style>
 a.footer {
  position: fixed;
  bottom: 5px;
  font-size: .7em;
  opacity: .4;
  left: 50%;
  transform: translateX(-50%);
  text-decoration: none;
 }

 a.footer:hover {
  text-decoration: underline;
 }
</style>