import {
	Component,
	OnInit,
	Input,
	forwardRef,
} from '@angular/core';
import {
	ControlValueAccessor,
	NG_VALUE_ACCESSOR
} from '@angular/forms';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'mviwo-list-select',
	templateUrl: './mviwo-list-select.component.html',
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: forwardRef(() => MviwoListSelectComponent),
		multi: true
	}],
	styleUrls: ['./mviwo-list-select.component.scss']
})
export class MviwoListSelectComponent implements OnInit, ControlValueAccessor {
	@Input() dataSource: any[] = [];
	@Input() sortableTarget = false;
	@Input() maxItemsTarget: number;
	@Input() minItemsTarget: number;
	@Input() sourceLabel: string;
	@Input() targetLabel: string;
	@Input() showFields: string[];
	@Input() showSourceItemNumber = false;
	@Input() showTargetItemNumber = false;
	private propagateChange: (_: any) => {};
	dataTarget: any[] = [];
	selectedSource: any[] = [];
	selectedTarget: any[] = [];

	@Input() immovableFunction: (item: any) => boolean = (item) => false;

	constructor() {}

	ngOnInit() {
		if (!this.showFields) {
			this.showFields = Object.keys(this.dataSource[0]);
		}
	}

	addAllOnClick(event) {
		this.dataSource = this.dataSource.filter(item => !this.selectedSource.includes(item));
		this.dataTarget.push(...this.selectedSource);
		this.selectedSource.splice(0, this.selectedSource.length);

		this.propagateChange(this.dataTarget);
	}

	removeAllOnClick(event) {
		this.dataTarget = this.dataTarget.filter(item => !this.selectedTarget.includes(item));
		this.dataSource.push(...this.selectedTarget);
		this.selectedTarget.splice(0, this.selectedTarget.length);

		this.propagateChange(this.dataTarget);
	}

	addOnClick(event, item) {
		event.stopPropagation();
		this.dataSource.splice(this.dataSource.indexOf(item), 1);
		this.dataTarget.push(item);

		const ind = this.selectedSource.indexOf(item);
		if (ind > -1) {
			this.selectedSource.splice(ind, 1);
		}

		this.propagateChange(this.dataTarget);
	}

	removeOnClick(event, item) {
		event.stopPropagation();
		this.dataTarget.splice(this.dataTarget.indexOf(item), 1);
		this.dataSource.push(item);

		const ind = this.selectedTarget.indexOf(item);
		if (ind > -1) {
			this.selectedTarget.splice(ind, 1);
		}

		this.propagateChange(this.dataTarget);
	}

	selectSourceItem(checkbox, item) {
		if (!this.immovableFunction(item)) {
			checkbox.toggle();
			this.sourceSelectionOnChange(null, checkbox, item);
		}
	}

	selectTargetItem(checkbox, item) {
		if (!this.immovableFunction(item)) {
			checkbox.toggle();
			this.targetSelectionOnChange(null, checkbox, item);
		}
	}

	sourceSelectionOnChange(event, control, item) {
		if (control.checked) {
			this.selectedSource.push(item);
		} else {
			this.selectedSource.splice(this.selectedSource.indexOf(item), 1);
		}
	}

	targetSelectionOnChange(event, control, item) {
		if (control.checked) {
			this.selectedTarget.push(item);
		} else {
			this.selectedTarget.splice(this.selectedTarget.indexOf(item), 1);
		}
	}

	targetUpOnClick(event, item) {
		event.stopPropagation();

		const ind = this.dataTarget.indexOf(item);
		const temp = this.dataTarget[ind - 1];
		this.dataTarget[ind - 1] = item;
		this.dataTarget[ind] = temp;

		this.propagateChange(this.dataTarget);
	}

	targetDownOnClick(event, item) {
		event.stopPropagation();

		const ind = this.dataTarget.indexOf(item);
		const temp = this.dataTarget[ind + 1];
		this.dataTarget[ind + 1] = item;
		this.dataTarget[ind] = temp;

		this.propagateChange(this.dataTarget);
	}

	showFieldValue(item, field) {
		const val = item[field];
		if (val instanceof Array) {
			return `${val.length} ${field}`;
		} else {
			return val;
		}
	}

	//

	writeValue(value: any[]) {
		if (typeof value !== 'undefined') {
			this.dataTarget = value;
		}
	}

	registerOnChange(fn) {
		this.propagateChange = fn;
	}

	registerOnTouched(fn: any) {}
}
