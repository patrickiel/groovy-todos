<script lang="ts">
	import type { LocalStore } from '$lib/local-store.svelte';
	import { GripVertical, Square, SquareCheck, X } from 'lucide-svelte';
	import { slide, fly } from 'svelte/transition';

	let {
		all,
		todos,
		isChecked,
		canEdit
	}: {
		all: LocalStore<Todo[]>;
		todos: Todo[];
		isChecked: boolean;
		canEdit: boolean;
	} = $props();

	let movedTodo = $state<Todo>();
	let focusedTodo = $state<Todo>();
	let deletingTodo = $state<Todo | null>(null);

	function onDragStart(event: DragEvent, todo: Todo) {
		if (event.dataTransfer) {
			// Create an invisible element to use as the drag image
			const dragGhost = document.createElement('div');
			dragGhost.style.opacity = '0';
			document.body.appendChild(dragGhost);

			event.dataTransfer.setDragImage(dragGhost, 0, 0);
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/plain', todo.id);

			// Remove the ghost element after a short delay
			setTimeout(() => {
				document.body.removeChild(dragGhost);
			}, 0);
		}

		movedTodo = todo;
	}

	function onTouchStart(event: TouchEvent, todo: Todo) {
		event.preventDefault();
		movedTodo = todo;
	}

	function toggleTodo(id: string) {
		const todoIndex = all.value.findIndex((todo) => todo.id === id);
		if (todoIndex !== -1) {
			const updatedTodo = { ...all.value[todoIndex], completed: !all.value[todoIndex].completed };
			all.value = [
				updatedTodo,
				...all.value.slice(0, todoIndex),
				...all.value.slice(todoIndex + 1)
			];
		}
	}

	function deleteTodo(todo: Todo) {
		deletingTodo = todo;
		all.value = all.value.filter((t) => t.id !== todo.id);

		// Wait for animation to complete before removing from state
		setTimeout(() => {
			deletingTodo = null;
		}, 200);
	}

	function todoTransition(node: Element, params: any) {
		if (deletingTodo?.id === params.id) {
			return fly(node, { duration: 200, x: -200, y: 0 });
		} else {
			return fly(node, { duration: 200, y: isChecked ? -100 : 100 });
		}
	}

	function onDragOver(event: DragEvent, todo: Todo) {
		event.preventDefault();
		swapTodos(todo);
	}

	function onTouchMove(event: TouchEvent, todo: Todo) {
		event.preventDefault();
		swapTodos(todo);
	}

	function swapTodos(todo: Todo) {
		if (movedTodo === undefined) return;

		//swap todo with draggedTodo
		all.value = all.value.map((t) => {
			if (t.id === todo.id) return movedTodo!;
			if (t.id === movedTodo!.id) return todo;
			return t;
		});
	}
</script>

<ul>
	{#each todos as currentTodo (currentTodo.id)}
		<li
			class="mb-2 flex h-12 items-center justify-between rounded-md duration-200 bg-white bg-opacity-50 hover:bg-opacity-60
{movedTodo === currentTodo ? 'scale-105 bg-yellow-200 border-4 border-yellow-300' : ''}"
			onmouseenter={() => (focusedTodo = currentTodo)}
			onmouseleave={() => {
				all.saveToLocalStorage();
				focusedTodo = undefined;
			}}
			ondragover={(e) => onDragOver(e, currentTodo)}
			ondragend={() => (movedTodo = undefined)}
			ontouchmove={(e) => onTouchMove(e, currentTodo)}
			ontouchend={(movedTodo = undefined)}
			in:slide={{ duration: 200 }}
			out:todoTransition={{ id: currentTodo.id }}
		>
			{#if movedTodo === undefined ? focusedTodo === currentTodo : movedTodo === currentTodo}
				<button
					class="flex w-5 flex-shrink-0 items-center justify-center"
					draggable="true"
					ondragstart={(e) => onDragStart(e, currentTodo)}
					ontouchstart={(e) => onTouchStart(e, currentTodo)}
				>
					<GripVertical size={24} class="text-black opacity-50 hover:opacity-90" />
				</button>
			{:else}
				<div class="w-5 flex-shrink-0"></div>
			{/if}

			<button onclick={() => toggleTodo(currentTodo.id)} class="mr-2">
				{#if isChecked}
					<SquareCheck
						class="opacity-50 duration-100 hover:fill-yellow-500/30 hover:text-yellow-300 hover:opacity-90"
					/>
				{:else}
					<Square
						class="opacity-50 duration-100 hover:fill-yellow-500/30 hover:text-yellow-300 hover:opacity-90"
					/>
				{/if}
			</button>

			<input
				class="w-full flex-grow bg-transparent outline-none"
				type="text"
				disabled={!canEdit}
				bind:value={currentTodo.text}
			/>

			{#if movedTodo === undefined ? focusedTodo === currentTodo : false}
				<button onclick={() => deleteTodo(currentTodo)} class="ml-auto pr-3 text-sm text-white">
					<X class="text-black opacity-50 hover:opacity-90" size={24} />
				</button>
			{/if}
		</li>
	{/each}
</ul>
