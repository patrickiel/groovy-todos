import { browser } from '$app/environment';

export type ErrorHandler<T> = (
    error: unknown,
    key: string,
    initialValue: T,
    setToErrorValue: (value: T) => void
) => void;

export class LocalStore<T> {
    private key: string;
    private initialValue: T;
    private _value = $state<T>() as T;
    private onError: ErrorHandler<T>;

    constructor(key: string, initialValue: T, onError?: ErrorHandler<T>) {
        this.key = key;
        this.initialValue = initialValue;
        this.onError = onError || defaultErrorHandler;

        if (!browser) {
            this._value = initialValue;
            return;
        }

        const storedItem = localStorage.getItem(key);

        if (storedItem === null) {
            this._value = initialValue;
            return;
        }

        try {
            this._value = JSON.parse(storedItem);
        } catch (error) {
            this.handleError(error);
        }
    }

    public get value(): T {
        return this._value;
    }

    public set value(value: T) {
        this._value = value;

        if (!browser) {
            return;
        }

        try {
            localStorage.setItem(this.key, JSON.stringify(this.value));
        } catch (error) {
            this.handleError(error);
        }
    }

    // sometimes its necessary to trigger a save to local storage manually, maby there is a better whay so this method can be removed?
    public saveToLocalStorage(): void {
        if (!browser) {
            return;
        }

        try {
            localStorage.setItem(this.key, JSON.stringify(this.value));
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: unknown) {
        this.onError(error, this.key, this.initialValue, (value) => { this._value = value; });
    }
}

const defaultErrorHandler = <T>(error: unknown, key: string, initialValue: T, setToErrorValue: (value: T) => void): void => {
    console.error(`Error ${error} for key ${key}: ${error}`);
    setToErrorValue(initialValue);
};