import {
	Mongoloid
} from '../services/crud/crud.service';

export class Metric implements Mongoloid {
	static dataTypes = [{
			name: 'number',
			simpleName: 'number',
			desc: 'numerical values.',
			icon: {
				class: 'fa fa-hashtag',
				code: 'f292',
				material: 'tune'
			}
		},
		{
			name: 'string',
			simpleName: 'free text',
			desc: 'free text values.',
			icon: {
				class: 'fa fa-quote-right',
				code: 'f10e',
				material: 'text_fields'
			}
		},
		{
			name: 'enum',
			simpleName: 'text from list',
			desc: 'enumeration. only string values from list.',
			icon: {
				class: 'fa fa-object-group',
				code: 'f247',
				material: 'format_shapes'
			}
		},
		{
			name: 'boolean',
			simpleName: 'yes / no',
			desc: 'true or false values.',
			icon: {
				class: 'fa fa-check-square-o',
				code: 'f046',
				material: 'check_box'
			}
		}
		// ,
		// {
		// 	name: 'blob',
		// 	simpleName: 'file',
		// 	desc: 'documents.',
		// 	icon: {
		// 		class: 'fa fa-file',
		// 		code: 'f15b',
		// 		material: 'attach_file'
		// 	}
		// }
		,
		{
			name: 'date',
			simpleName: 'date',
			desc: 'date.',
			icon: {
				class: 'fa fa-calendar',
				code: 'f073',
				material: 'date_range'
			}
		}
	];

	static rules = {
		descriptionMaxLength: 300,
		nameMaxLength: 50,
		nameMinLength: 3,
		defaultIsRequired: false,
		defaultIsEmail: false,
		hintMaxLength: 25,
		defaultLineBreaks: false,
		defaultIsMultiple: false,
		enumValuePattern: '[A-z][A-z ,\'\*\.\\/\-0-9_:]*',
		defaultFreeInput: false
	};

	constructor(
		public _id: string
		, public name: string
		, public isRequired: boolean
		, public dataType: string
		, public groups?: {
			_id: string,
			name: string,
			description?: string
		}[]
		, public description?: string
		, public defaultValue?: any
		, public stringParams?: {
			isEmail: boolean,
			lineBreaks?: boolean
			minLength?: number,
			maxLength?: number,
			pattern?: string,
			hint?: string
		}
		, public numberParams?: {
			minValue: number,
			maxValue: number,
			step: number
			tickInterval: number,
			prefix?: string,
			postfix?: string,
			freeInput: boolean
		}
		, public enumParams?: {
			isMultiple: boolean,
			values: String[]
		}
		, public dateParams?: {
			minDate?: Date,
			maxDate?: Date,
			isMinDateCurrent: boolean,
			isMaxDateCurrent: boolean,
			minDateOffset?: number,
			maxDateOffset?: number
		}
		, public sessions?: number
		, public position?: number
	) {}

	public static shallowClone(metric: Metric): Metric {
		return new Metric(
			undefined,
			metric.name,
			metric.isRequired,
			metric.dataType,
			[],
			metric.description,
			metric.defaultValue,
			metric.stringParams,
			metric.numberParams,
			metric.enumParams,
			metric.dateParams
		);
	}

	public static deepClone(metric: Metric): Metric {
		return new Metric(
			undefined,
			metric.name,
			metric.isRequired,
			metric.dataType,
			[...metric.groups],
			metric.description,
			metric.defaultValue,
			metric.stringParams,
			metric.numberParams,
			metric.enumParams,
			metric.dateParams
		);
	}
}
