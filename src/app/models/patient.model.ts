import { Mongoloid } from '../services/crud/crud.service';

export class Patient implements Mongoloid {
	public static rules = {
		nameMaxLength: 50,
		nameMinLength: 1,
	};

	constructor(
		public _id: string
		, public uid: string
		, public firstName: string
		, public lastName: string
		, public isFemale: boolean
		, public middleName?: string
		, public fatherName?: string
		, public motherName?: string
		, public dateOfBirth?: Date
		, public placeOfBirth?: string
		, public job?: string
		, public reg_no?: number
		, public locations?: {
			_id: string
			, name: string
			, country: string
		}[]
		, public position?: number
	) {}
}
