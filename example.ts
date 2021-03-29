import * as handle from './handle';

type Id = string;

class Asset {
	public readonly id: Id;

	constructor(id: Id) {
		this.id = id;
		cache.set(this);
	}

	destructor() {
		cache.remove(this.id);
	}
}

class Cache {
	private readonly assets: Map<Id, Asset>;

	constructor() {
		this.assets = new Map();
	}

	set(asset: Asset): void {
		const id = asset.id;
		if(this.assets.get(id) != undefined) {
			throw new Error(`asset cache already contains ${asset}`);
		}
		this.assets.set(id, asset);
	}

	get(id: Id): Asset | undefined {
		return this.assets.get(id);
	}

	remove(id: Id): void {
		this.assets.delete(id);
	}
}

const cache = new Cache();
const handles = new handle.Register<Asset>();
    
function load(id: Id): Promise<void> {
	new Asset(id);
	return Promise.resolve();
}

export function get(id: Id, handle: handle.Handle): undefined | Asset {
	const asset = cache.get(id);

	if(asset == undefined) { return; }
	
	handles.register(asset, handle).then((count) => {
		if(count === 0) {
			asset.destructor();
			console.log("asset '${asset.id}' removed.");
		}
	});

	return asset;
}

export async function require(id: Id, handle: handle.Handle): Promise<Asset> {
	await load(id);

	return <Asset>get(id, handle);
}

//
    
const handle = new handle.Handle();
require("asset1", handle);
require("asset2", handle);
handle.release();
