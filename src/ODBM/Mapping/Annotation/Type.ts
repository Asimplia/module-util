
export = Type;
class Type {

	get Nullable() { return this.nullable; }

	constructor(
		private nullable: boolean
	) {}
}
