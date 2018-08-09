import { Mongoloid } from '../services/crud/crud.service';

export class Record implements Mongoloid {
	public static rules = {};

	constructor(
		public _id: string
		, public session: string
		, public patient: {
			uid: string
			, _id?: string
		}
		, public results: {
			group: {
				_id: string
				, name: string
			}
			, metric: {
				_id: string
				, name: string
			}
			, value: number | string | boolean | Date
		}[]
		, public createdBy: {
			_id: string
			, username: string
		}
		, public updatedBy: {
			_id: string
			, username: string
		}
		, public position?: number
		, public offline?: boolean
	) {}
}
