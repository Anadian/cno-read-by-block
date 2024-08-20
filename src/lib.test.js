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
const ALT_HASH = Buffer.from( '8f54277e73de035d2ec917391562411a3c3d5723171f2d3f3dc50f0b81a2bb86', 'hex' );
//## Errors

//# Global Variables
/**## Functions*/
Test.test( 'readByBlockFromOptions', async function( t ){
	t.diagnostic( t.name );
	const test_matrix = {
		functions: {
			defaultExport: DefaultExport.readByBlockFromOptions,
			namespaceExport: NamespaceExport.readByBlockFromOptions,
			namedExport: readByBlockFromOptions
		},
		conditions: {
			input_options_type: {
				skip: false,
				success: false, //true: deepStrictEqual; false: throws
				promise: false, //true: await resolve then deepStrictEqual; false: rejects
				args: [
					true
				],
				expected: {
					instanceOf: TypeError,
					code: 'ERR_INVALID_ARG_TYPE'
				}
			},
			input_options_filehandle_type: {
				skip: false,
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
				success: true,
				promise: false,
				args: [
					{
						noop: true,
						noDynamic: true
					}
				],
				expected: null
			}
		}
	};
	for( const function_key of Object.keys( test_matrix.functions ) ){
		var input_function = test_matrix.functions[function_key];
		//console.log( "function key: %s type: %s", function_key, typeof(input_function) );
		for( const condition_key of Object.keys( test_matrix.conditions ) ){
			var test_id = `${t.name}:${function_key}:${condition_key}`;
			var condition = test_matrix.conditions[condition_key];
			if( condition.skip !== true ){
				t.diagnostic( test_id );
				var bound_function = input_function.bind( {
					logger: { 
						log: function( message_object ){
							console.log( "%s: %s: %s: %s", test_id, message_object.function, message_object.level, message_object.message );
						}
					}
				}, ...condition.args );
				if( condition.success === true ){
					Test.assert.deepStrictEqual( await bound_function(), condition.expected, test_id );
				} else{
					var validator_function = Test.errorExpected.bind( { logger: { log: console.log } }, condition.expected );
					if( condition.promise === true ){
						await Test.assert.rejects( bound_function(), validator_function, test_id );
					} else{
						Test.assert.throws( bound_function, validator_function, test_id );
					}
				}
			} else{
				t.diagnostic( `${test_id}: skipped.` );
			}
		}
	}
	var state = await readByBlockFromOptions.call(
		{ 
			logger: { 
				log: function( message_object ){
					console.log( "%s: %s: %s: %s", 'path_test', message_object.function, message_object.level, message_object.message );
				}
			}
		},
		{
			path: LOREM_PATH,
			//closeFileHandle: false,
			logOptions: ( options ) =>{
				console.log( "path_test options: %o", options );
			}
		}
	);
	await state.readPromise;
	/*await readByBlockFromOptions.call(
		{ 
			logger: { 
				log: function( message_object ){
					console.log( "%s: %s: %s: %s", 'filehandle_test', message_object.function, message_object.level, message_object.message );
				}
			} 
		},
		{
			filehandle: state.filehandle,
			statObject: state.statObject,
			start: 0,
			logOptions: ( options ) => {
				console.log( "filehandle_test options: %o", options );
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
				log: function( message_object ){
					console.log( "%s: %s: %s: %s", 'late-start test', message_object.function, message_object.level, message_object.message );
				}
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
				log: function( message_object ){
					console.log( "%s: %s: %s: %s", 'closeFileHandle_test', message_object.function, message_object.level, message_object.message );
				}
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
	);
	/*
	await FSNS.open( LOREM_PATH ).then(
		( filehandle ) => {
			console.log( "filehandle opened: %d", filehandle.fd );
			filehandle.on( 'close', () => {
				console.log( "onClose %d", filehandle.fd );
			} );
			return readByBlockFromOptions.call(
				{ 
					logger: { 
						log: function( message_object ){
							console.log( "%s: %s: %s: %s", 'filehandle_test', message_object.function, message_object.level, message_object.message );
						}
					} 
				},
				{
					filehandle: filehandle,
					statObject: state.statObject,
					start: 0,
					logOptions: ( options ) => {
						console.log( "filehandle options: %o", options );
					}
				}
			).then(
				( return_value ) => {
					return return_value.readPromise.then(
						() => {
							console.log( "Closing %d", filehandle.fd );
							filehandle.close();
						},
						null
					);
				},
				null
			);
		},
		null
	);
	await FSNS.open( LOREM_PATH ).then(
		( filehandle ) => {
			console.log( "late-start opened: %d", filehandle.fd );
			filehandle.on( 'close', () => {
				console.log( "onClose %d", filehandle.fd );
			} );
			return readByBlockFromOptions.call(
				{
					logger: {
						log: function( message_object ){
							console.log( "%s: %s: %s: %s", 'filehandle_test', message_object.function, message_object.level, message_object.message );
						}
					}
				},
				{
					filehandle: filehandle,
					blockSize: state.statObject.blksize,
					fileSize: state.statObject.size,
					start: 512,
					logOptions: ( options ) =>{
						console.log( "late-start options: %o", options );
					},
					onReadFunction: ( read_buffer ) => {
						console.log( 'Yo from onReadFunction.' );
					},
					onCloseFunction: () => {
						console.log( 'Yo from onCloseFunction.' );
					},
					onEndFunction: () => {
						console.log( 'Yo from onEndFunction.' );
					}
				}
			).then(
				( return_value ) => {
					return return_value.readPromise.then(
						() => {
							console.log( "Closing %d", filehandle.fd );
							filehandle.close();
						},
						null
					);
				},
				null
			);
		},
		null
	);
	await FSNS.open( LOREM_PATH ).then(
		( filehandle ) => {
			console.log( "restart opened: %d", filehandle.fd );
			filehandle.on( 'close', () => {
				console.log( "onClose %d", filehandle.fd );
			} );
			return readByBlockFromOptions.call( { logger: { log: console.log } }, {
				filehandle: filehandle,
				statObject: state.statObject,
				closeFileHandle: true,
				start: 0,
				logOptions: ( options ) =>{
					console.log( "closing filehandle options: %o", options );
				},
				onReadFunction: ( read_buffer ) => {
					console.log( 'Yo from onReadFunction 2.' );
				},
				onCloseFunction: () => {
					console.log( 'Yo from onCloseFunction 2.' );
				},
				onEndFunction: () => {
					console.log( 'Yo from onEndFunction. 2' );
				}
			} ).then(
				( return_value ) => {
					return return_value.readPromise.then(
						() => {
							console.log( "Closing %d", filehandle.fd );
							filehandle.close();
						},
						null
					);
				},
				null
			);
		},
		null
	);*/
} );

// lib.test.js EOF

