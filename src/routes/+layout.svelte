<script lang="ts">
	import { browser } from '$app/environment';
	import type { Snippet } from 'svelte';

	$effect(() => {
		if (browser && 'serviceWorker' in navigator) {
			// navigator.serviceWorker.register('/service-worker.ts');
		}
	});
	let { children }: { children: Snippet } = $props();
</script>

{@render children()}
