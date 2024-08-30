
type TodoItem = {
    id: string;
    created: Date;
    text: string;
    completed: boolean;
};

type TodoList = {
    id: string;
    todos: TodoItem[];
};