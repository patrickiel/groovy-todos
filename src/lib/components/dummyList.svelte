<script lang="ts">
	const min = 0;
	const max = 10;
	const count = 5;
	const range = max - min;
	const inc = range / count;
	const opacities = Array.from({ length: count }, (_, index) => Math.round(max - index * inc));
</script>

<div class="flex flex-col gap-2">
	{#each opacities as opacity}
		<div class="h-12 rounded-md bg-white" style="opacity: {opacity / 100}"></div>
	{/each}
</div>
