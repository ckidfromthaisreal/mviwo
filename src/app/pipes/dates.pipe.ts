import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'age'
})
export class AgePipe implements PipeTransform {
	transform(value: Date/*|moment.Moment*/, args: string[]): string {
		if (!value) {
			return '';
		}

		value = new Date(value);

		const today = new Date();
		let age = today.getFullYear() - value.getFullYear();
		const m = today.getMonth() - value.getMonth();
		const d = today.getDate() - value.getDate();
		if (m < 0 || (m === 0 && d < 0)) {
			age--;
		}

		return age > 0 ? `${age} year${age > 1 ? 's' : ''}` :
			m > 0 ? `${m} month${m > 1 ? 's' : ''}` :
				`${d} day${d > 1 || d === 0 ? 's' : ''}`;
	}
}
