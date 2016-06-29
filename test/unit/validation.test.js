import test from 'ava'
import Validation from '../../src/validation'

test('constructor', (t) => {
  const validation = new Validation()
  t.deepEqual(validation.rules, [])
  t.false(validation.isRequired)
})

test('run', (t) => {
  const validation = new Validation()
  t.deepEqual(validation.run('test', 'hello'), [])
  validation.isRequired = true
  t.is(validation.run('test', '')[0].field, 'test')
  t.is(validation.run('test', '')[0].message, 'cannot be empty')
})

test('humanizeLimit', (t) => {
  t.is(new Validation().humanizeLimit({ min: 1, max: 2 }), ' between 1 and 2')
  t.is(new Validation().humanizeLimit({ min: 1, max: 2, noSpace: true }), 'between 1 and 2')
  t.is(new Validation().humanizeLimit({ min: 1 }), ' above 1')
  t.is(new Validation().humanizeLimit({ max: 2 }), ' below 2')
  t.is(new Validation().humanizeLimit({}), '')
})

test('required', (t) => {
  t.is(new Validation().required().run('field', '').length, 1)
  t.is(new Validation().required().run('field', 'hi').length, 0)
  t.is(new Validation().contains('hi').run('field', '').length, 0)
})

test('contains', (t) => {
  t.is(new Validation().contains('hi').run('field', 'hii').length, 0)
  t.is(new Validation().contains('hi').run('field', 'hello').length, 1)
})

test('equals', (t) => {
  t.is(new Validation().equals('hi').run('field', 'hi').length, 0)
  t.is(new Validation().equals('hi').run('field', 'hello').length, 1)
})

test('isAfter', (t) => {
  t.is(new Validation().isAfter(Date.now() - 1000).run('field', new Date()).length, 0)
  t.is(new Validation().isAfter(Date.now() + 1000).run('field', new Date()).length, 1)
  t.is(new Validation().isAfter().run('field', new Date(Date.now() - 1000)).length, 1)
})

test('isAlpha', (t) => {
  t.is(new Validation().isAlpha().run('field', 'abc').length, 0)
  t.is(new Validation().isAlpha().run('field', 'abc123').length, 1)
})

test('isAlphanumeric', (t) => {
  t.is(new Validation().isAlphanumeric().run('field', 'abc123').length, 0)
  t.is(new Validation().isAlphanumeric().run('field', 'abc123!').length, 1)
})

test('isAscii', (t) => {
  t.is(new Validation().isAscii().run('field', 'foo').length, 0)
  t.is(new Validation().isAscii().run('field', 'ｆｏｏ').length, 1)
})

test('isBase64', (t) => {
  t.is(new Validation().isBase64().run('field', 'Zg==').length, 0)
  t.is(new Validation().isBase64().run('field', '12345').length, 1)
})

test('isBefore', (t) => {
  t.is(new Validation().isBefore(Date.now() + 1000).run('field', new Date()).length, 0)
  t.is(new Validation().isBefore(Date.now() - 1000).run('field', new Date()).length, 1)
  t.is(new Validation().isBefore().run('field', new Date(Date.now() + 1000)).length, 1)
})

test('isBoolean', (t) => {
  t.is(new Validation().isBoolean().run('field', true).length, 0)
  t.is(new Validation().isBoolean().run('field', 'true').length, 0)
  t.is(new Validation().isBoolean().run('field', 'hi').length, 1)
})

test('isCurrency', (t) => {
  t.is(new Validation().isCurrency().run('field', '$12,345.67').length, 0)
  t.is(new Validation().isCurrency().run('field', '$1.0').length, 1)
})

test('isDataURI', (t) => {
  t.is(new Validation().isDataURI().run('field', 'data:,Hello World!').length, 0)
  t.is(new Validation().isDataURI().run('field', 'data:HelloWorld').length, 1)
})

test('isDate', (t) => {
  t.is(new Validation().isDate().run('field', '2011-08-04').length, 0)
  t.is(new Validation().isDate().run('field', 'hi').length, 1)
})

test('isDivisibleBy', (t) => {
  t.is(new Validation().isDivisibleBy(2).run('field', 6).length, 0)
  t.is(new Validation().isDivisibleBy(2).run('field', 5).length, 1)
})

test('isEmail', (t) => {
  t.is(new Validation().isEmail().run('field', 'test@test.com').length, 0)
  t.is(new Validation().isEmail().run('field', '@test.com').length, 1)
})

test('isFQDN', (t) => {
  t.is(new Validation().isFQDN().run('field', 'test.com').length, 0)
  t.is(new Validation().isFQDN().run('field', 'test.c').length, 1)
})

test('isIpAddress', (t) => {
  t.is(new Validation().isIpAddress().run('field', '127.0.0.1').length, 0)
  t.is(new Validation().isIpAddress().run('field', 'abc').length, 1)
})

test('isEnum', (t) => {
  t.is(new Validation().isEnum([1, 2, 3]).run('field', 1).length, 0)
  t.is(new Validation().isEnum([1, 2, 3]).run('field', 4).length, 1)
})

test('isNumber', (t) => {
  t.is(new Validation().isNumber({ min: 2 }).run('field', 3).length, 0)
  t.is(new Validation().isNumber({ min: 2, max: 4 }).run('field', 3).length, 0)
  t.is(new Validation().isNumber({ min: 2 }).run('field', 1).length, 1)
  t.is(new Validation().isNumber({ min: 2, max: 3 }).run('field', 4).length, 1)
})

test('isJSON', (t) => {
  t.is(new Validation().isJSON().run('field', '{ "hi": "hi" }').length, 0)
  t.is(new Validation().isJSON().run('field', '{ hi }').length, 1)
})

test('isLength', (t) => {
  t.is(new Validation().isLength({ min: 2 }).run('field', 'ab').length, 0)
  t.is(new Validation().isLength({ min: 2, max: 3 }).run('field', 'abc').length, 0)
  t.is(new Validation().isLength({ min: 2 }).run('field', 'a').length, 1)
  t.is(new Validation().isLength({ min: 2, max: 3 }).run('field', 'abcc').length, 1)
})

test('isLowercase', (t) => {
  t.is(new Validation().isLowercase().run('field', 'abc').length, 0)
  t.is(new Validation().isLowercase().run('field', 'Abc').length, 1)
})

test('isMACAddress', (t) => {
  t.is(new Validation().isMACAddress().run('field', 'ab:ab:ab:ab:ab:ab').length, 0)
  t.is(new Validation().isMACAddress().run('field', 'abc').length, 1)
})

test('isPhoneNumber', (t) => {
  t.is(new Validation().isPhoneNumber('en-US').run('field', '+18014580386').length, 0)
  t.is(new Validation().isPhoneNumber().run('field', '12345').length, 1)
})

test('isMongoId', (t) => {
  t.is(new Validation().isMongoId().run('field', '507f1f77bcf86cd799439011').length, 0)
  t.is(new Validation().isMongoId().run('field', '507f1f77bcf86cd7994390').length, 1)
})

test('isURL', (t) => {
  t.is(new Validation().isURL().run('field', 'valid.com').length, 0)
  t.is(new Validation().isURL().run('field', 'invalid/').length, 1)
})

test('isUUID', (t) => {
  t.is(new Validation().isUUID().run('field', 'A987FBC9-4BED-3078-CF07-9141BA07C9F3').length, 0)
  t.is(new Validation().isUUID().run('field', 'xxxA987FBC9-4BED-3078-CF07-9141BA07C9F3').length, 1)
})

test('isUppercase', (t) => {
  t.is(new Validation().isUppercase().run('field', 'ABC').length, 0)
  t.is(new Validation().isUppercase().run('field', 'Abc').length, 1)
})

test('isWhitelisted', (t) => {
  t.is(new Validation().isWhitelisted('abc').run('field', 'a').length, 0)
  t.is(new Validation().isWhitelisted('abc').run('field', 'd').length, 1)
})

test('matches', (t) => {
  t.is(new Validation().matches(/a/).run('field', 'a').length, 0)
  t.is(new Validation().matches(/a/).run('field', 'b').length, 1)
})
