<script lang="ts">
	let { size = 24, color = 'black' }: { size?: number; color?: string } = $props();
</script>

<div class="text-red-500 hover:animate-spin">
	<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 250 250">
		<g fill="none" stroke={color} stroke-width="21">
			<circle cx="125" cy="125" r="106" />
			<path d="M125,19 v212 M125,125 l-75,75 M125,125 l75,75" />
		</g>
	</svg>
</div>
