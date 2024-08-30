import { LocalStore, type ErrorHandler } from './local-store.svelte';

import { Peer, DataConnection } from 'peerjs';
import { nanoid } from 'nanoid';

export class SyncedStore<T> extends LocalStore<T> {
    private peer: Peer | undefined = undefined;
    private connections: DataConnection[] = [];
    private syncKey: string;

    constructor(key: string, initialValue: T, onError?: ErrorHandler<T>) {
        super(key, initialValue, onError);
        this.syncKey = `${key}_sync_id`;
        this.initializePeer();
    }

    private initializePeer() {
        let syncId = localStorage.getItem(this.syncKey);
        if (!syncId) {
            syncId = nanoid();
            localStorage.setItem(this.syncKey, syncId);
        }

        this.peer = new Peer(syncId);

        this.peer.on('open', (id) => {
            console.log('My peer ID is: ' + id);
        });

        this.peer.on('connection', (conn) => {
            this.setupConnection(conn);
        });
    }

    private setupConnection(conn: DataConnection) {
        this.connections.push(conn);

        conn.on('open', () => {
            conn.send(JSON.stringify(this.value));
        });

        conn.on('data', (data) => {
            const receivedValue: T = JSON.parse(data as string);
            this.mergeValues(receivedValue);
        });
    }

    public connectToPeer(peerId: string) {
        if (!this.peer) {
            console.error('Peer not initialized');
            return;
        }
        const conn = this.peer.connect(peerId);
        this.setupConnection(conn);
    }

    private mergeValues(receivedValue: T) {
        const mergedTodos = [] as T;
        const currentTodos = this.value;

        // Create a map of todos by id for faster lookup
        const todoMap = new Map<string, TodoItem>();
        currentTodos.forEach(todo => todoMap.set(todo.id, todo));

        receivedValue.forEach(receivedTodo => {
            const existingTodo = todoMap.get(receivedTodo.id);

            if (!existingTodo) {
                // New todo, add it to the merged list
                mergedTodos.push(receivedTodo);
            } else if (receivedTodo.lastUpdated > existingTodo.lastUpdated) {
                // Received todo is more recent, use it
                mergedTodos.push(receivedTodo);
            } else {
                // Existing todo is more recent or same, keep it
                mergedTodos.push(existingTodo);
            }

            // Remove from map to mark as processed
            todoMap.delete(receivedTodo.id);
        });

        // Add any remaining todos from the current list
        todoMap.forEach(todo => mergedTodos.push(todo as TodoItem));

        // Sort the merged list by lastUpdated (most recent first)
        mergedTodos.sort((a, b) => b.lastUpdated - a.lastUpdated);

        // Update the store value
        this.value = mergedTodos;
    }

    public set value(value: T) {
        super.value = value;
        this.syncToPeers();
    }

    private syncToPeers() {
        const valueJson = JSON.stringify(this.value);
        this.connections.forEach(conn => conn.send(valueJson));
    }

    public destroy() {
        if (this.peer) {
            this.peer.destroy();
        }
    }

    public getSyncId(): string | undefined {
        return this.peer?.id;
    }
}