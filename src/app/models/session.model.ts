import { Mongoloid } from '../services/crud/crud.service';

export class Session implements Mongoloid {
	public static rules = {
		nameMaxLength: 50,
		descriptionMaxLength: 300
	};

	constructor(
		public _id: string
		, public startDate: Date
		, public endDate: Date
		, public locations: {
			_id: string
			, name: string
			, country: string
		}[]
		, public groups: {
			_id: string
			, name: string
			, metrics: {
				_id: string
				, name: string
				, isRequired: boolean
				, dataType: string
				, description?: string
			}[]
			, description?: string
		}[]
		, public name?: string
		, public description?: string
		, public position?: number
	) {}
}
