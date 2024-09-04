<script lang="ts">
	import { LocalStore } from '$lib/local-store.svelte';
	import '../app.css';
	import { fade, slide } from 'svelte/transition';
	import GroovyHeader from '$lib/components/groovyHeader.svelte';
	import TodoList from '$lib/components/todoList.svelte';
	import InputBox from '$lib/components/inputBox.svelte';
	import DummyList from '$lib/components/dummyList.svelte';
	import Divider from '$lib/components/divider.svelte';

	let all = $state(new LocalStore<Todo[]>('todos', []));
	let active = $derived<Todo[]>(all.value.filter((todo) => !todo.completed));
	let completed = $derived<Todo[]>(all.value.filter((todo) => todo.completed));
	let dividerIsCollapsed = new LocalStore('collapsed', false);
</script>

<div class="hippie-bg min-h-screen">
	<main class="mx-auto flex max-w-md flex-col p-4">
		<div class="py-8">
			<GroovyHeader text="Groovy TODOs" />
		</div>

		<InputBox todos={all} />

		{#if all.value.length === 0}
			<div in:fade={{ duration: 200 }}>
				<DummyList />
			</div>
		{/if}

		<TodoList {all} todos={active} isChecked={false} canEdit={true} />

		{#if completed.length !== 0}
			<div in:fade={{ duration: 200 }}>
				<Divider {all} {completed} {dividerIsCollapsed} />
				{#if !dividerIsCollapsed.value}
					<div class="opacity-50" in:slide out:slide>
						<TodoList {all} todos={completed} isChecked={true} canEdit={true} />
					</div>
				{/if}
			</div>
		{/if}
	</main>
</div>

<style>
	.hippie-bg {
		color: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
		background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
		background-size: 400% 400%;
		animation: gradient 10s ease infinite;
	}

	@keyframes gradient {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}
</style>
