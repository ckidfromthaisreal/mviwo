/**
 * https://github.com/Keyang/node-csvtojson
 * Blazing fast and Comprehensive CSV Parser for Node.JS / Browser / Command Line.
 */
const csv = require('csvtojson');

const axios = require('./axios-runner');

module.exports.importPatients = async () => {
	const data = await csv().fromFile('server/model/patient/Jamyang_2017.csv');

	// const Patient = require('../model/patient/patient.model');

	const jamyang = {
		_id: '5b5eb8b243fac300048056d2',
		name: 'Jamyang School',
		country: 'India'
	};

	const processedData = data.map(patient => {
		const names = patient.Name.split(/\s/g);

		if (names.length > 2 && names[2].length === 1) {
			names.pop();
		}

		const year = patient.BIRTHDAY.substring(0, 4);
		const month = patient.BIRTHDAY.substring(4, 6);
		const day = patient.BIRTHDAY.substring(6, 8);

		return {
			firstName: names[0],
			middleName: names.length > 2 ? names[1] : undefined,
			lastName: names.length === 2 ? names[1] : names[2],
			fatherName: patient.FA_Name,
			dateOfBirth: new Date(Number.parseInt(year), Number.parseInt(month), Number.parseInt(day)) || undefined,
			isFemale: Number.parseInt(patient.Gender) === 2,
			reg_no: Number.parseInt(patient.Reg_No),
			locations: Number.parseInt(patient.Strike_off_2017) === 0 ? [jamyang] : []
		};
	});

	// console.log(processedData);

	const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YjU0Nzk
		2NmFmYWRiYzY0NGFlNzY2NGIiLCJlbWFpbCI6ImFkbWluQG12aXdvLmNvbSIsInVzZX
		JuYW1lIjoiYWRtaW4iLCJwZXJtaXNzaW9ucyI6WyJkYXNoYm9hcmQiLCJsb2NhdGlvb
		jpnZXRNYW55IiwibG9jYXRpb246Z2V0T25lIiwibG9jYXRpb246dXBkYXRlT25lIiwi
		bG9jYXRpb246dXBkYXRlTWFueSIsImxvY2F0aW9uOmluc2VydE9uZSIsImxvY2F0aW9
		uOmluc2VydE1hbnkiLCJsb2NhdGlvbjpkZWxldGVPbmUiLCJsb2NhdGlvbjpkZWxldG
		VNYW55IiwibWV0cmljOmdldE1hbnkiLCJtZXRyaWM6Z2V0T25lIiwibWV0cmljOnVwZ
		GF0ZU9uZSIsIm1ldHJpYzp1cGRhdGVNYW55IiwibWV0cmljOmluc2VydE9uZSIsIm1l
		dHJpYzppbnNlcnRNYW55IiwibWV0cmljOmRlbGV0ZU9uZSIsIm1ldHJpYzpkZWxldGV
		NYW55IiwibWV0cmljLWdyb3VwOmdldE1hbnkiLCJtZXRyaWMtZ3JvdXA6Z2V0T25lIi
		wibWV0cmljLWdyb3VwOmluc2VydE1hbnkiLCJtZXRyaWMtZ3JvdXA6aW5zZXJ0T25lI
		iwibWV0cmljLWdyb3VwOnVwZGF0ZU1hbnkiLCJtZXRyaWMtZ3JvdXA6dXBkYXRlT25l
		IiwibWV0cmljLWdyb3VwOmRlbGV0ZU1hbnkiLCJtZXRyaWMtZ3JvdXA6ZGVsZXRlT25
		lIiwicGF0aWVudDpnZXRNYW55IiwicGF0aWVudDpnZXRPbmUiLCJwYXRpZW50Omluc2
		VydE1hbnkiLCJwYXRpZW50Omluc2VydE9uZSIsInBhdGllbnQ6dXBkYXRlTWFueSIsI
		nBhdGllbnQ6dXBkYXRlT25lIiwicGF0aWVudDpkZWxldGVNYW55IiwicGF0aWVudDpk
		ZWxldGVPbmUiLCJzZXNzaW9uOmdldE1hbnkiLCJzZXNzaW9uOmdldE9uZSIsInNlc3N
		pb246aW5zZXJ0TWFueSIsInNlc3Npb246aW5zZXJ0T25lIiwic2Vzc2lvbjp1cGRhdG
		VNYW55Iiwic2Vzc2lvbjp1cGRhdGVPbmUiLCJzZXNzaW9uOmRlbGV0ZU1hbnkiLCJzZ
		XNzaW9uOmRlbGV0ZU9uZSIsInJlY29yZDpnZXRNYW55IiwicmVjb3JkOmdldE9uZSIs
		InJlY29yZDppbnNlcnRNYW55IiwicmVjb3JkOmluc2VydE9uZSIsInJlY29yZDp1cGR
		hdGVNYW55IiwicmVjb3JkOnVwZGF0ZU9uZSIsInJlY29yZDpkZWxldGVNYW55Iiwicm
		Vjb3JkOmRlbGV0ZU9uZSIsInVzZXI6Z2V0TWFueSIsInVzZXI6dXBkYXRlUG93ZXIiL
		CJ1c2VyOmJhbk9uZSJdLCJleHAiOjE1MzMzNzc4ODcsImlhdCI6MTUzMjc3MzA4N30.
		qNwk6MSpVH4mmqhN8m3u-ftrtUbk8BrPPYTJx-d00f0`;

	axios.insertMany('http://localhost:4200/api/patient', processedData, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
};
