import { Mongoloid } from '../services/crud/crud.service';

export class MetricGroup implements Mongoloid {
	public static rules = {
		descriptionMaxLength: 300,
		nameMaxLength: 50,
		nameMinLength: 3,
		defaultIsMandatory: false
	};

	constructor(
		public _id: string
		, public name: string
		, public metrics?: {
			_id: string,
			name: string,
			dataType: string,
			isRequired: boolean,
			description?: string
		}[]
		, public sessions?: number
		, public description?: string
		, public position?: number
	) {}
}
