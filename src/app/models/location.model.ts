import { Mongoloid } from '../services/crud/crud.service';

export class Location implements Mongoloid {
	public static rules = {
		nameMaxLength: 50,
		nameMinLength: 3,
	};

	constructor(
		public _id: string
		, public name: string
		, public country: string
		, public address?: string
		, public patients?: {
			_id: string
			, uid: string
			, firstName: string
			, lastName: string
			, isFemale: boolean
			, dateOfBirth?: Date
		}[]
		, public position?: number
	) {}
}
