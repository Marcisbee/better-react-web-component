// Since typescript cannot calculate exact values of
// binary number calculations, we calculate them
// ahead of time in:
// https://dune.land/dune/d8629da4-6f1d-472e-890a-36e0cf399c23

// Optional types
export const optional = {
	string: 0,
	number: 1,
	boolean: 2,
	event: 3,
	json: 4,
} as const;

// Required types
export const required = {
	string: 20,
	number: 21,
	boolean: 22,
	event: 23,
	json: 24,
} as const;

type InferType<T> = T extends typeof optional.string
	? string | undefined
	: T extends typeof optional.json
	? Record<string, unknown> | undefined
	: T extends typeof optional.number
	? number | undefined
	: T extends typeof optional.boolean
	? boolean | undefined
	: T extends typeof optional.event
	? ((e: { detail: any }) => void) | undefined
	: T extends typeof required.string
	? string
	: T extends typeof required.json
	? Record<string, unknown>
	: T extends typeof required.number
	? number
	: T extends typeof required.boolean
	? boolean
	: T extends typeof required.event
	? (e: { detail: any }) => void
	: never;

type Required<T> = {
	[K in keyof T as undefined extends T[K] ? K : never]?: T[K];
};

type Optional<T> = {
	[K in keyof T as undefined extends T[K] ? never : K]: T[K];
};

type MakeUndefinedOptional<T> = Required<T> & Optional<T>;

export type InferProps<
	Props,
	Overwrite extends Record<string, any> = {},
> = Omit<
	MakeUndefinedOptional<{
		[K in keyof Props]-?: InferType<Props[K]>;
	}>,
	keyof Overwrite
> &
	Overwrite;
