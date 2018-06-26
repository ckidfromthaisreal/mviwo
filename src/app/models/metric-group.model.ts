import { Mongoloid } from '../services/crud/crud.service';
import { Metric } from './metric.model';

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
		, public isMandatory: boolean
		, public metrics: {
			_id: string
			, name: string
			, isRequired: boolean
		}[]
		, public description?: string
		, public position?: number
	) {}

	/**
	 * returns a shallow copy of given metric group.
	 * @param metricGroup to be cloned.
	 */
	// public static clone(metricGroup: MetricGroupModel): MetricGroupModel {
	// 	return new MetricGroupModel(
	// 		undefined,
	// 		metricGroup.name + '_clone',
	// 		metricGroup.isMandatory, [],
	// 		metricGroup.description
	// 	);
	// }
}
