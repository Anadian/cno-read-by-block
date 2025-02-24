#!/usr/bin/env node
/**
# [lib.test.js](src/lib.test.js)
> Tests for `cno-read-by-block`.

Author: Anadian

Code license: MIT
```
	Copyright 2024 Anadian
	Permission is hereby granted, free of charge, to any person obtaining a copy of this 
software and associated documentation files (the "Software"), to deal in the Software 
without restriction, including without limitation the rights to use, copy, modify, 
merge, publish, distribute, sublicense, and/or sell copies of the Software, and to 
permit persons to whom the Software is furnished to do so, subject to the following 
conditions:
	The above copyright notice and this permission notice shall be included in all copies 
or substantial portions of the Software.
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE 
OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
Documentation License: [![Creative Commons License](https://i.creativecommons.org/l/by-sa/4.0/88x31.png)](http://creativecommons.org/licenses/by-sa/4.0/)
> The source-code comments and documentation are written in [GitHub Flavored Markdown](https://github.github.com/gfm/).

*/

//# Dependencies
	//## Internal
	import DefaultExport from './lib.js';
	import * as NamespaceExport from './lib.js';
	import { readByBlockFromOptions } from './lib.js';
	//## Standard
	import PathNS from 'node:path';
	import FSNS from 'node:fs/promises';
	import CryptoNS from 'node:crypto';
	import UtilNS from 'node:util';
	//## External
	import Test from 'cno-test';
//# Constants
const FILENAME = 'lib.test.js';
const LOREM_PATH = PathNS.normalize( PathNS.join( 'test', 'lorem.txt' ) );
var LOREM_FILEHANDLE = await FSNS.open( LOREM_PATH );
console.log( "global opened: %d", LOREM_FILEHANDLE.fd ); 
var LOREM_BUFFER;
await LOREM_FILEHANDLE.read( LOREM_BUFFER, 0 );
const LOREM_STAT = await LOREM_FILEHANDLE.stat();
Test.test.after( () => {
	console.log( "Closing %d", LOREM_FILEHANDLE.fd );
	LOREM_FILEHANDLE.close();
} );
const LOREM_LENGTH = 8206;
const LOREM_HASH = Buffer.from( '2b475df87b81a47cad467229e6c5a77fc4ec6c80aa13e13f4af1eb86a8c505a9', 'hex' );
const ALT_LENGTH = 8192;
const ALT_HASH = Buffer.from( 'd19c80b61107b390c4a66422bd2bed6f3f8f71e0fb4311054539dd1c79c0f16d', 'hex' );
//## Errors

//# Global Variables
/**## Functions*/
Test.test( 'readByBlockFromOptions', async function( t ){
	t.diagnostic( t.name );
	// Suite State
	var onReadFunction = function( test_name, hasher, block_object ){
		this?.logger?.log({file: FILENAME, function: test_name, level: 'debug', message: `bytes read: ${block_object.bytesRead} buffer: ${block_object.buffer}`});
		hasher.update( block_object.buffer.subarray( 0, block_object.bytesRead ) );
	};
	var onEndFunction = function( test_name, hasher, state ){
		this?.logger?.log({file: FILENAME, function: test_name, level: 'debug', message: 'onEndFunction'});
		return hasher.digest();
	};
	var pre = function( subtest_object = null ){
		const FUNCTION_NAME = 'pre';
		this?.logger?.log({file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `pre received: ${subtest_object.id}`});
		subtest_object.state.hasher = CryptoNS.createHash( 'sha256' );
		subtest_object.condition.args[0].onReadFunction = onReadFunction.bind( this, subtest.id, subtest_object.state.hasher );
		subtest_object.condition.args[0].onEndFunction = onEndFunction.bind( this, subtest.id, subtest_object.state.hasher );
		if( !( subtest_object.condition.args[0].path || subtest_object.condition.args[0].filehandle ) ){
			this?.logger?.log({file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: 'Using reusable filehandle.'});
			subtest_object.condition.args[0].filehandle = reusable_filehandle;
			if( subtest_object.condition.args[0].canStat === false ){
				this?.logger?.log({file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: 'Using reusable stat object.'});
				subtest_object.condition.args[0].statObject = reusable_statObject;
			}
		}
		if( subtest_object.condition.args[0].closeFileHandle === true ){
			subtest_object.condition.args[0].onCloseFunction = function(){
				this?.logger?.log({file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: 'Closing file.'});
			};
		}
		return subtest_object;
	};
	var reusable_filehandle = null;
	var reusable_statObject = null;
	// Matrix
	const test_matrix = {
		functions: {
			defaultExport: DefaultExport.readByBlockFromOptions,
			namespaceExport: NamespaceExport.readByBlockFromOptions,
			namedExport: readByBlockFromOptions
		},
		conditions: {
			input_options_type: {
				skip: false,
				debug: false,
				success: false, //true: deepStrictEqual; false: throws
				promise: false, //true: await resolve then deepStrictEqual; false: rejects
				args: [
					true
				],
				expected: {
					instanceOf: TypeError,
					code: 'ERR_INVALID_ARG_TYPE'
				},
				pre: null,
				post: null
			},
			input_options_filehandle_type: {
				skip: false,
				debug: false,
				success: false,
				promise: false,
				args: [
					{
						filehandle: true
					}
				],
				expected: {
					instanceOf: Error,
					code: 'ERR_INVALID_ARG_VALUE'
				}
			},
			input_options_path_type: {
				skip: false,
				debug: false,
				success: false,
				promise: false,
				args: [
					{
						filehandle: null,
						path: true
					}
				],
				expected: {
					instanceOf: Error,
					code: 'ERR_INVALID_ARG_VALUE'
				}
			},
			input_options_null_input: {
				skip: false,
				debug: false,
				success: false,
				promise: false,
				args: [
					{
						filehandle: null,
						path: ""
					}
				],
				expected: {
					instanceOf: Error,
					code: 'ERR_INVALID_ARG_VALUE'
				}
			},
			input_options_canstat: {
				skip: false,
				debug: false,
				success: false,
				promise: true,
				args: [
					{
						logOptions: ( options ) =>{
							console.log( "%o", options );
						},
						filehandle: null,
						path: LOREM_PATH,
						canStat: false
					}
				],
				expected: {
					instanceOf: Error,
					code: 'ERR_INVALID_ARG_VALUE'
				}
			},
			input_options_noop: {
				skip: false,
				debug: false,
				success: true,
				promise: false,
				args: [
					{
						noop: true
					}
				],
				expected: null
			},
			input_options_noDefaults: {
				skip: false,
				debug: false,
				success: true,
				promise: false,
				args: [
					{
						noop: true,
						noDefaults: true
					}
				],
				expected: null
			},
			input_options_noDynamic: {
				skip: false,
				debug: false,
				success: true,
				promise: false,
				args: [
					{
						noop: true,
						noDynamic: true
					}
				],
				expected: null
			},
			path_test: {
				skip: false,
				debug: false,
				success: true,
				promise: true,
				args: [
					{
						path: LOREM_PATH,
					}
				],
				expected: ( returned_promise ) => {
					return returned_promise.then(
						( returned_object ) => {
							return returned_object.endPromise.then(
								() => {
									return true;
								},
								null
							);
						},
						( error ) => {
							Test.assert.fail( error );
						}
					);
				},
				pre: pre,
				post: null
			},
			early_end_test: {
				skip: false,
				debug: true,
				success: true,
				args: [
					{
						path: LOREM_PATH,
						start: 0,
						end: ALT_LENGTH,
						closeFileHandle: false
					}
				],
				expected: ( returned_value ) => {
					if( returned_value instanceof Promise ){
						return returned_value.then(
							( returned_object ) => {
								return returned_object.endPromise.then(
									( hash_digest_buffer ) => {
										return hash_digest_buffer.equals( ALT_HASH );
									},
									null
								);
							},
							null
						);
					} else{
						throw returned_value;
					}
				},
				pre: pre,
				post: function( subtest_object = null ){
					const FUNCTION_NAME = 'post';
					this?.logger?.log({file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${UtilNS.inspect( subtest_object, { showHidden: false, depth: 3, colors: true } )}`});
					//this?.logger?.log({file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `Setting reusable_filehandle to ${subtest_object.state.returnedValue.filehandle.fd}`});
					reusable_filehandle = subtest_object.state.resolvedValue.filehandle;
					reusable_statObject = subtest_object.state.resolvedValue.statObject;
				}
			},
			reuse_filehandle_test: {
				skip: false,
				debug: true,
				success: true,
				args: [
					{
						start: 0,
						closeFileHandle: false
					}
				],
				expected: ( returned_value ) => {
					if( returned_value instanceof Promise ){
						return returned_value.then(
							( returned_object ) => {
								return returned_object.endPromise.then(
									( hash_digest_buffer ) => {
										return hash_digest_buffer.equals( LOREM_HASH );
									},
									null
								);
							},
							null
						);
					} else{
						throw returned_value;
					}
				},
				pre: pre,
				post: null
			},
			close_test: { // Not needed as the Test.after() closes the shared filehandle.
				skip: true,
				debug: true,
				success: true,
				args: [
					{
						canStat: false,
						closeFileHandle: true
					}
				],
				expected: ( returned_promise ) => {
					return returned_promise.then(
						( returned_object ) => {
							return returned_object.endPromise.then(
								( hash_digest_buffer ) => {
									return hash_digest_buffer.equals( LOREM_HASH );
								},
								null
							);
						},
						null
					);
				},
				pre: pre,
				post: function( subtest_object = null ){
					reusable_filehandle = null;
					reusable_statObject = null;
				}
			}
		}
	};
	for( const function_key of Object.keys( test_matrix.functions ) ){
		var input_function = test_matrix.functions[function_key];
		//console.log( "function key: %s type: %s", function_key, typeof(input_function) );
		for( const condition_key of Object.keys( test_matrix.conditions ) ){
			var subtest = {
				id: `${t.name}:${function_key}:${condition_key}`,
				condition: test_matrix.conditions[condition_key],
				state: {
					thisObject: null
				}
			};
			if( subtest.condition.skip !== true ){
				t.diagnostic( subtest.id );
				if( subtest.condition.debug === true ){
					subtest.state.thisObject = {
						logger: { 
							log: function( message_object ){
								console.log( "%s: %s: %s: %s", subtest.id, message_object.function, message_object.level, message_object.message );
							}
						}
					};
				}
				if( typeof(subtest.condition.pre) === 'function' ){
					subtest = await subtest.condition.pre.call( subtest.state.thisObject, subtest );
				}
				try{
					subtest.state.returnedValue = input_function.call( subtest.state.thisObject, ...subtest.condition.args );
				} catch( error ){
					subtest.state.error = error;
				}
				if( subtest.state.returnedValue instanceof Promise ){
					try{
						subtest.state.resolvedValue = await subtest.state.returnedValue;
					} catch( error ){
						subtest.state.rejection = error;
					}
				}
				//var bound_function = input_function.bind( subtest.state.thisObject, ...subtest.condition.args );
				if( typeof(subtest.condition.expected) === 'function' ){
					Test.assert( await subtest.condition.expected( subtest.state.returnedValue ?? subtest.state.error ), `${subtest.id}:customValidator` );
				} else{ // condition.expected is a value
					if( subtest.condition.success === true ){
						Test.assert.deepStrictEqual( await subtest.state.returnedValue, subtest.condition.expected, `${subtest.id}:success` );
					} else{
						var validator_function = Test.errorExpected.bind( subtest.state.thisObject, subtest.condition.expected );
						if( subtest.state.error ){
							Test.assert( validator_function.call( subtest.state.thisObject, subtest.state.error ), `${subtest.id}:throw` );
						} else{
							await Test.assert.rejects( subtest.state.returnedValue, validator_function, `${subtest.id}:reject` );
						} 
					}
				}
				if( typeof(subtest.condition.post) === 'function' ){
					//t.diagnostic('Calling post');
					await subtest.condition.post.call( subtest.state.thisObject, subtest );
				}
			} else{
				t.diagnostic( `${subtest.id}: skipped.` );
			}
		}
	}
	/*var hasher = CryptoNS.createHash( 'sha256' );
	var log_function = function( name, message_object ){
		console.log( "%s: %s: %s: %s", name, message_object.function, message_object.level, message_object.message );
	};
	var onCloseFunction = function( test_name, hasher, state ){
	};
	var state = await readByBlockFromOptions.call(
		{ 
			logger: { 
				log: log_function.bind( null, 'path_test' )
			}
		},
		{
			path: LOREM_PATH,
			closeFileHandle: false,
			logOptions: ( options ) =>{
				console.log( "path_test options: %o", options );
			}
		}
	);
	await state.readPromise;
	await readByBlockFromOptions.call(
		{ 
			logger: { 
				log: log_function.bind( null, 'filehandle_test' ) 
			}
		},
		{
			filehandle: state.filehandle,
			statObject: state.statObject,
			start: 0,
			onReadFunction: onReadFunction.bind( 
				{ 
					logger: { 
						log: log_function.bind( null, 'filehandle_test' ) 
					}
				}
			),
			onEndFunction: onEndFunction.bind( 
				{ 
					logger: { 
						log: log_function.bind( null, 'filehandle_test' ) 
					}
				}
			),
			logOptions: ( options ) => {
				console.log( "filehandle_test options: %o", options );
			}
		}
	).then(
		( returned_object ) => {
			return returned_object.readPromise.then(
				() => {
					return returned_object.endPromise;
				},
				null
			);
		},
		null
	).then(
		( hash_digest_buffer ) => {
			console.log({file: FILENAME, function: 'filehandle_test', level: 'debug', message: `hash_digest_buffer: ${hash_digest_buffer.toString( 'hex' )}`});
		},
		null
	);
	await readByBlockFromOptions.call(
		{ 
			logger: { 
				log: log_function.bind( null, 'late-start_test' )
			}
		},
		{
			filehandle: state.filehandle,
			blockSize: state.statObject.blksize,
			fileSize: state.statObject.size,
			start: 512,
			logOptions: ( options ) => {
				console.log( "late-start test options: %o", options );
			}
		}
	).then(
		( returned_object ) => {
			return returned_object.readPromise;
		},
		null
	);
	await readByBlockFromOptions.call(
		{
			logger: {
				log: log_function.bind( null, 'early-end_test' )
			}
		},
		{
			filehandle: state.filehandle,
			statObject: state.statObject,
			start: 0,
			end: ALT_LENGTH,
			onReadFunction: onReadFunction.bind(
				{
					logger: {
						log: log_function.bind( null, 'early-end_test' )
					}
				}
			)
		}
	).then(
		( returned_object ) => {
			return returned_object.readPromise;
		},
		null
	);
	await readByBlockFromOptions.call(
		{ 
			logger: { 
				log: log_function.bind( null, 'closeFileHandle_test' ) 
			}
		},
		{
			filehandle: state.filehandle,
			statObject: state.statObject,
			start: 0,
			closeFileHandle: true,
			logOptions: ( options ) => {
				console.log( "closeFileHandle_test options: %o", options );
			}
		}
	).then(
		( returned_object ) => {
			return returned_object.readPromise;
		},
		null
	);*/
} );

// lib.test.js EOF

