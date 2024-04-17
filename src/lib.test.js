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
	//import * as NamespaceExport from './lib.js';
	import readByBlock from './lib.js';
	//## Standard
	import PathNS from 'node:path';
	import FSNS from 'node:fs/promises';
	import CryptoNS from 'node:crypto';
	//## External
	import Test from 'cno-test';
//# Constants
const FILENAME = 'lib.test.js';
const LOREM_PATH = PathNS.normalize( PathNS.join( 'test', 'lorem.txt' ) );
const LOREM_BUFFER = await FSNS.readFile( LOREM_PATH, 'utf8' );
const LOREM_LENGTH = 8206;
const LOREM_HASH = Buffer.from( '2b475df87b81a47cad467229e6c5a77fc4ec6c80aa13e13f4af1eb86a8c505a9', 'hex' );
const ALT_LENGTH = 8192;
const ALT_HASH = Buffer.from( '8f54277e73de035d2ec917391562411a3c3d5723171f2d3f3dc50f0b81a2bb86', 'hex' );
//## Errors

//# Global Variables
/**## Functions*/

Test.test( 'readByBlock:throws', function( t ){
	var return_error = null;
	t.diagnostic( t.name );
	const test_matrix = {
		functions: {
			defaultExport: DefaultExport,
			//namespaceExport: NamespaceExport.readByBlock,
			namedExport: readByBlock
		},
		conditions: {
			input_options_type: {
				args: [
					true
				],
				expected: {
					instanceOf: TypeError,
					code: 'ERR_INVALID_ARG_TYPE'
				}
			},
			filehandle_type: {
				args: [
					{ filehandle: true }
				],
				expected: {
					instanceOf: Error,
					code: 'ERR_INVALID_ARG_VALUE'
				}
			},
			filehandle_value: {
				args: [
					{ filehandle: null }
				],
				expected: {
					instanceOf: Error,
					code: 'ERR_INVALID_ARG_VALUE'
				}
			},
			path_type: {
				args: [
					{ path: true }
				],
				expected: {
					instanceOf: Error,
					code: 'ERR_INVALID_ARG_VALUE'
				}
			},
			path_value: {
				args: [
					{
						path: '',
						logOptions: ( options ) => {
							console.log( "%o", options );
						} 
					}
				],
				expected: {
					instanceOf: Error,
					code: 'ERR_INVALID_ARG_VALUE'
				}
			},
			blksize_value: {
				args: [
					{ path: LOREM_PATH, statObject: { blksize: true, size: LOREM_LENGTH  } }
				],
				expected: {
					instanceOf: Error,
					code: 'ERR_INVALID_ARG_VALUE'
				}
			},
			size_value: {
				args: [
					{ path: LOREM_PATH, statObject: { blksize: 4096, size: true  } }
				],
				expected: {
					instanceOf: Error,
					code: 'ERR_INVALID_ARG_VALUE'
				}
			}
		}
	};
	for( const function_key of Object.keys( test_matrix.functions ) ){
		var input_function = test_matrix.functions[function_key];
		for( const condition_key of Object.keys( test_matrix.conditions ) ){
			var condition_id = `${t.name}:${function_key}:${condition_key}`;
			t.diagnostic( condition_id );
			var condition = test_matrix.conditions[condition_key];
			var bound_function = input_function.bind( null, ...condition.args );
			var validator_function = Test.errorExpected.bind( null, condition.expected );
			try{
				Test.assert.throws( bound_function, validator_function );
			} catch(error){
				return_error = new Error(`${condition_id}:Test.assert.throws threw an error: ${error}`);
				throw return_error;
			}
		}
	}
} );
Test.test.skip( 'readByBlock:returns', async function( t ){
	t.diagnostic( t.name );
	const lorem_filehandle = await FSNS.open( LOREM_PATH );
	const lorem_stat = await lorem_filehandle.stat();
	var return_error = null;
	var hasher = null;
	const onReadFunction = ( read_object ) => {
		if( read_object.bytesRead === read_object.buffer.length ){
			hasher.update( read_object.buffer );
		} else{
			hasher.update( read_object.buffer.subarray( 0, read_object.bytesRead ) );
		}
	};
	const onCloseFunction = () => {
		return hasher.digest();
	}
	var test_matrix = {
		functions: {
			defaultExport: DefaultExport,
			//namespaceExport: NamespaceExport.readByBlock,
			namedExport: readByBlock
		},
		conditions: {
			input_options_noop: {
				args: [
					{
						noop: true
					}
				],
				expected: null
			},
			input_options_noDefaults: {
				args: [
					{
						noop: true,
						noDefaults: true,
					}
				],
				expected: null
			},
			input_options_noDynamic: {
				args: [
					{
						noop: true,
						noDefaults: false,
						noDynamic: true
					}
				],
				expected: null
			},
			input_options_filehandle: {
				args: [
					{
						filehandle: lorem_filehandle,
						onReadBlockFunction: onReadFunction,
						onCloseFunction: onCloseFunction,
						logOptions: ( options ) => {
							console.log( "%o", options );
						}
					}
				],
				expected: LOREM_HASH,
			},
			input_options_path: {
				args: [
					{
						path: LOREM_PATH,
						onReadBlockFunction: onReadFunction,
						onCloseFunction: onCloseFunction,
						logOptions: ( options ) => {
							console.log( "%o", options );
						}
					}
				],
				expected: LOREM_HASH
			},
			input_options_statObject: {
				args: [
					{
						path: LOREM_PATH,
						statObject: lorem_stat,
						onReadBlockFunction: onReadFunction,
						onCloseFunction: onCloseFunction
					}
				],
				expected: LOREM_HASH
			},
			input_options_blockSize: {
				args: [
					{
						filehandle: lorem_filehandle,
						statObject: lorem_stat,
						blockSize: 2048,
						onReadBlockFunction: onReadFunction,
						onCloseFunction: onCloseFunction
					}
				],
				expected: LOREM_HASH
			},
			input_options_fileSize: {
				args: [
					{
						filehandle: lorem_filehandle,
						statObject: lorem_stat,
						fileSize: ALT_LENGTH,
						onReadBlockFunction: onReadFunction,
						onCloseFunction: onCloseFunction
					}
				],
				expected: ALT_HASH
			},
			input_options_both_size: {
				args: [
					{
						filehandle: lorem_filehandle,
						statObject: lorem_stat,
						blockSize: 2048,
						fileSize: ALT_LENGTH,
						onReadBlockFunction: onReadFunction,
						onCloseFunction: onCloseFunction
					}
				],
				expected: ALT_HASH
			},
		}
		/*var use_filehandle = true;
		var use_closeFileHandle = false;
		var use_statObject = false;
		var use_blockSize = false;
		var use_fileSize = false;
		for( var i = 1; i <= 2**6; i++ ){
			var condition_options = {};
			if( ( i % 2 ) === 0 ){
				use_filehandle = !use_filehandle;
			}
			if( ( i % 4 ) === 0 ){
				use_closeFileHandle = !use_closeFileHandle;
			}
			if( ( i % 8 ) === 0 ){
				use_statObject = !use_statObject;
			}
			if( ( i % 16 ) === 0 ){
				use_blockSize = !use_blockSize;
			}
			if( ( i % 32 ) === 0 ){
				use_fileSize = !use_fileSize;
			}
			if( use_filehandle === true ){
				condition_options.filehandle = lorem_filehandle;
			} else{
				condition_options.path = LOREM_PATH;
				if( use_closeFileHandle === true ){
					condition_options.closeFileHandle = true;
				}
			}
			if( use_statObject === true ){
				condition_options.statObject = lorem_stat;
			}
			if( use_blockSize === true ){
				condition_options.blockSize = 2048;
			}
			if( use_fileSize === true ){
				condition_options.fileSize = 8192;
			}
			test_matrix.conditions[`input_options_${i}`] = {
				args: [
					condition_options
				],
				expected: null
			};
		}*/
	};
	for( const function_key of Object.keys( test_matrix.functions ) ){
		var input_function = test_matrix.functions[function_key];
		for( const condition_key of Object.keys( test_matrix.conditions ) ){
			hasher = CryptoNS.createHash( 'sha256' );
			var condition_id = `${t.name}:${function_key}:${condition_key}`;
			t.diagnostic( condition_id );
			var condition = test_matrix.conditions[condition_key];
			condition.args[0].logOptions = ( options ) => {
				console.log( `${condition_id}: %o`, options );
			};
			var function_return = null;
			try{
				function_return = await input_function.apply( null, condition.args );
			} catch(error){
				return_error = new Error(`For ${condition_id}: await input_function.apply threw an error: ${error}`);
				throw return_error;
			}
			Test.assert.deepStrictEqual( function_return, condition.expected );
		}
	}
	lorem_filehandle.close();
} );

// lib.test.js EOF

