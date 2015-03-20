
import Converter = require('../../../../../src/ODBM/Entity/Property/Converter');
import Type = require('../../../../../src/ODBM/Mapping/Type');
/* tslint:disable:max-line-length */
describe('ODBM.Entity.Property.Converter', () => {
	var converter = new Converter();

	describe('convertBoolean', () => {
		it('should return value in specified type', () => {
			expect(converter.convertBoolean(new Type.Boolean(), true)).toBeTruthy();
			expect(converter.convertBoolean(new Type.Boolean(), false)).toBeFalsy();
			expect(converter.convertBoolean(new Type.Boolean(), 1)).toBeTruthy();
			expect(converter.convertBoolean(new Type.Boolean(), 0)).toBeFalsy();
			expect(converter.convertBoolean(new Type.Boolean(), '1')).toBeTruthy();
			expect(converter.convertBoolean(new Type.Boolean(), '0')).toBeTruthy(); // be careful
			expect(converter.convertBoolean(new Type.Boolean(true), null)).toBeNull();
			expect(converter.convertBoolean(new Type.Boolean(true), undefined)).toBeNull();
			expect(() => { converter.convertBoolean(new Type.Boolean(false), null); }).toThrow('Specified type is not nullable, then should not be null or undefined');
			expect(() => { converter.convertBoolean(new Type.Boolean(false), undefined); }).toThrow('Specified type is not nullable, then should not be null or undefined');
		});
	});

	describe('convertDate', () => {
		it('should return value in specified type', () => {
			var d1 = new Date();
			expect(converter.convertDate(new Type.Date(), d1)).toEqual(d1);
			expect(converter.convertDate(new Type.Date(), 'Mon Feb 23 2015 09:22:39 GMT+0100 (CET)')).toEqual(new Date('Mon Feb 23 2015 09:22:39 GMT+0100 (CET)')); // uses moment.js
			expect(converter.convertDate(new Type.Date(true, true), null)).toBeNull();
			expect(() => { converter.convertDate(new Type.Date(), null); }).toThrow('Specified type is not nullable, then should not be null or undefined');
			expect(() => { converter.convertDate(new Type.Date(), undefined); }).toThrow('Specified type is not nullable, then should not be null or undefined');
		});
	});

	describe('convertInteger', () => {
		it('should return value in specified type', () => {
			expect(converter.convertInteger(new Type.Integer(), 10)).toBe(10);
			expect(converter.convertInteger(new Type.Integer(), '10')).toBe(10);
			expect(converter.convertInteger(new Type.Integer(), -10)).toBe(-10);
			expect(converter.convertInteger(new Type.Integer(), 3.14)).toBe(3);
			expect(converter.convertInteger(new Type.Integer(), true)).toBeNaN();
			expect(converter.convertInteger(new Type.Integer(), false)).toBeNaN();
			expect(converter.convertInteger(new Type.Integer(8, true), null)).toBeNull();
			expect(() => { converter.convertInteger(new Type.Integer(1), 128); }).toThrow('Integer is out of type range. Should be between <-128;127> but 128 given.');
			expect(() => { converter.convertInteger(new Type.Integer(1), -129); }).toThrow('Integer is out of type range. Should be between <-128;127> but -129 given.');
			expect(() => { converter.convertInteger(new Type.Integer(), null); }).toThrow('Specified type is not nullable, then should not be null or undefined');
			expect(() => { converter.convertInteger(new Type.Integer(), undefined); }).toThrow('Specified type is not nullable, then should not be null or undefined');
		});
	});

	describe('convertFloat', () => {
		it('should return value in specified type', () => {
			expect(converter.convertFloat(new Type.Float(), 1.13)).toBe(1.13);
			expect(converter.convertFloat(new Type.Float(), 1)).toBe(1.0);
			expect(converter.convertFloat(new Type.Float(8, true), null)).toBeNull();
			expect(() => { converter.convertFloat(new Type.Float(), null); }).toThrow('Specified type is not nullable, then should not be null or undefined');
			expect(() => { converter.convertFloat(new Type.Float(), undefined); }).toThrow('Specified type is not nullable, then should not be null or undefined');
		});
	});

	describe('convertString', () => {
		it('should return value in specified type', () => {
			expect(converter.convertString(new Type.String(), 'Hi world')).toBe('Hi world');
			expect(converter.convertString(new Type.String(), 113)).toBe('113');
			expect(converter.convertString(new Type.String(), '')).toBe('');
			expect(converter.convertString(new Type.String(50, true), null)).toBe(null);
			expect(converter.convertString(new Type.String(50, true), undefined)).toBe(null);
			expect(() => { converter.convertString(new Type.String(4), '12345'); }).toThrow('String is out of size. Should be 4 but 5 given.');
			expect(() => { converter.convertString(new Type.String(4), 'abcdef'); }).toThrow('String is out of size. Should be 4 but 6 given.');
			expect(() => { converter.convertString(new Type.String(), null); }).toThrow('Specified type is not nullable, then should not be null or undefined');
			expect(() => { converter.convertString(new Type.String(), undefined); }).toThrow('Specified type is not nullable, then should not be null or undefined');
		});
	});

	describe('convertId', () => {
		it('should return value in specified type', () => {
			expect(converter.convertId(new Type.Id(Type.String), 'myId')).toBe('myId');
			expect(converter.convertId(new Type.Id(), 113)).toBe(113);
			expect(converter.convertId(new Type.Id(Type.String), '')).toBe('');
			expect(converter.convertId(new Type.Id(Type.String), null)).toBe(null);
			expect(converter.convertId(new Type.Id(Type.String), undefined)).toBe(null);
			expect(converter.convertId(new Type.Id(), null)).toBe(null);
			expect(converter.convertId(new Type.Id(), undefined)).toBe(null);
			expect(() => { converter.convertId(new Type.Id(new Type.String(4)), '12345'); }).toThrow('String is out of size. Should be 4 but 5 given.');
		});
	});

	describe('convertByType', () => {
		it('should return value in specified type', () => {
			var d1 = new Date();
			expect(converter.convertByType(new Type.String, 'myId')).toBe('myId');
			expect(converter.convertByType(new Type.Integer, 113)).toBe(113);
			expect(converter.convertByType(new Type.Float, 1.13)).toBe(1.13);
			expect(converter.convertByType(new Type.Boolean, true)).toBe(true);
			expect(converter.convertByType(new Type.Date, d1)).toEqual(d1);
			expect(converter.convertByType(new Type.Id, 10)).toBe(10);
		});
	});
});
