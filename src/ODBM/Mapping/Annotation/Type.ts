
export = Type;
class Type {

	get Nullable() { return this.nullable; }

	constructor(
		protected nullable: boolean
	) {}
}
