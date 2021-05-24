export class Handle {
	public readonly released: Promise<void>;
	public release: () => void;

	public constructor() {
		this.released = new Promise((release) => {
			this.release = release;
		});
	}
}

export class Register<T extends Object> {
	private handles: WeakMap<T, number>;

	public constructor() {
		this.handles = new WeakMap();
	}

	/**
	 * @returns Promise resolving when the handle is released with the remaining handle count of the object as argument.
	 */
	public register(o: T, handle: Handle): Promise<number> {
		// @ts-ignore
		this.handles.set(o, this.handles.get(o) + 1 || 1);

		return handle.released.then(() => this.unregister(o));
	}

	/**
	 * @returns remaining handle count
	 */
	private unregister(o: T): number {
		const count = <number>this.handles.get(o) - 1;

		this.handles.set(o, count);

		return count;
	}
}
