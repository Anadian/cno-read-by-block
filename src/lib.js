#!/usr/bin/env node
/**
# [lib.js](src/lib.js)
> `cno-read-by-block`: Uses NodeJS's promise API to asynchronously read a file by its optimal blocksize.

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
	//## Standard
	import FSNS from 'node:fs/promises';
	//## External
//# Constants
const FILENAME = 'lib.js';
//## Errors

//# Global Variables
/**## Functions*/
/**
### readByBlock
> Reads a file, denoted either by an existing file handle or opened from the given path, asynchronously one optimally-sized IO block at a time.

#### Parametres
| name | type | description |
| --- | --- | --- |
| input_options | object | Run-time options. \[default: {}\] |

##### `options` Properties
| name | type | default | description |
| noop | boolean | false | Skip primary functionality. |
| noDefaults | boolean | false | Don't apply static default options. |
| noDynamic | boolean | false | Don't apply dynamic default options. |
| filehandle | object | null | The filehandle to read, takes precedence over `options.path`. |
| closeFileHandle | boolean | false | Whether to automatically close the file handle after it's read; by default, `false` when using a pre-existing file handle via `options.filehandle` and dynamically set to `true` if opening a new file from `options.path`. |
| path | string | '' | The path of the file to open, only used if `options.filehandle` isn't specified. |
| blockSize | number | NaN | The IO block size to use for read operations, if neither this nor `options.statObject.blksize` are specified, the file will be stat'd to get its optimal block size. |
| fileSize | number | NaN | The number of bytes to read into the file. if neither this nor `options.statObject.size` are specified, the file will be stat'd to find its length. |
| statObject | object | null | An object in the form of those returned by NodeJS's `stat` function; its property (`options.statObject.blksize`) will be used as the block size if `options.blockSize` isn't specified. |
| onReadBlockFunction | function | null | A function to be "then"'d with the return of each read call. |
| onCloseFunction | function | null | A function to be "then"'d when closing a newly opened filehandle. |

#### Returns
| type | description |
| --- | --- |
| Promise | A promise which resolves with the filehandle when the entire file has been read. |

#### Throws
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | TypeError | Thrown if a given argument isn't of the correct type. |

#### History
| version | change |
| --- | --- |
| 0.0.1 | WIP |
*/
function readByBlock( input_options = {} ){
	const FUNCTION_NAME = 'readByBlock';
	const DEFAULT_OPTIONS = {
		noop: false, // Skip primary functionality.
		noDefaults: false, // Don't apply static default options.
		noDynamic: false, // Don't apply dynamic default options.
		filehandle: null, // The filehandle to read, takes precedence over `options.path`.
		closeFileHandle: false,
		path: '', // The path of the file to open, only used if `options.filehandle` isn't specified.
		blockSize: 0, // The IO block size to use for read operations, if neither this nor `options.statObject.blksize` are specified, the file will be stat'd to get its optimal block size.
		fileSize: 0,
		statObject: null, // An object in the form of those returned by NodeJS's `stat` function; its property (`options.statObject.blksize`) will be used as the block size if `options.blockSize` isn't specified.
		onReadBlockFunction: null, // A function to be "then"'d with the return of each read call.
		onCloseFunction: null,
		logOptions: null,
	};
	// Variables
	var arguments_array = Array.from(arguments);
	var _return = Promise.resolve( null );
	var return_error = null;
	var options = {};
	var filehandle = null;
	this?.logger?.log({file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	// Parametre checks
	if( typeof(input_options) !== 'object' ){
		return_error = new TypeError('Param "input_options" is not of type object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	// Options
	if( input_options.noDefaults !== true ){
		if( options.noDynamic !== true ){
			var dynamic_defaults = {};
			if( options.filehandle == null ){
				dynamic_defaults.closeFileHandle = true;
			}
			dynamic_defaults.blockSize = NaN;
			dynamic_defaults.fileSize = NaN;
			options = Object.assign( options, DEFAULT_OPTIONS, dynamic_defaults, input_options );
		} else{
			options = Object.assign( options, DEFAULT_OPTIONS, input_options );
		} // noDynamic
	} else{
		options = Object.assign( options, input_options );
	} // noDefaults
	if( typeof(options.logOptions) === 'function' ){
		options.logOptions( options );
	}
	if( options.noop !== true ){
		// Function
		/*if( options.filehandle != null && typeof(options.filehandle) === 'object' ){
			filehandle = options.filehandle;
			_return = Promise.resolve( filehandle );
		} else{
			return_error = new TypeError( `"options.filehandle" is not a valid object: type: ${typeof(options.filehandle)} value: ${options.filehandle}` );
			return_error.code = 'ERR_INVALID_ARG_TYPE';
			throw return_error;
		}
			if( options.path == '' ){
				return_error = new Error(`"options.path" is an empty string.`);
				return_error.code = 'ERR_INVALID_ARG_VALUE';
				throw return_error;
			} else{
				return_error = new TypeError(`"options.path" is not a string; type: ${typeof(options.path)}`);
				return_error.code = 'ERR_INVALID_ARG_TYPE';
				throw return_error;
			}
		if( filehandle == null )*/
		if( options.filehandle != null && typeof(options.filehandle) === 'object' ){
			filehandle = options.filehandle;
			_return = Promise.resolve( filehandle );
		} else if( options.path != '' && typeof(options.path) === typeof('') ){
			console.log( 'Going with options.path.' );
			_return = FSNS.open( options.path ).then(
				( file_handle ) => {
					filehandle = file_handle;
					return file_handle;
				},
				/* c8 ignore start */ ( error ) => {
					return_error = new Error(`FSNS.open threw an error: ${error}`);
					throw return_error;
				} /* c8 ignore stop */
			); //FSNS.open
		} else{
			return_error = new Error(`Neither "options.filehandle" nor "options.path" are valid.`);
			return_error.code = 'ERR_INVALID_ARG_VALUE';
			throw return_error;
		} 
		_return = _return.then(
			( file_handle ) => {
				//filehandle = file_handle;
				var size_promise = Promise.resolve();
				var block_size = NaN;
				var file_size = NaN;
				var blocksize_specified = ( options.blockSize > 0 && typeof(options.blockSize) === typeof(0) );
				var filesize_specified = ( options.fileSize > 0 && typeof(options.fileSize) === typeof(0) );
				console.log("blockSize: %d (%d) fileSize: %d (%d)", block_size, blocksize_specified, file_size, filesize_specified ); 
				if( blocksize_specified === true && filesize_specified === true ){
					block_size = options.blockSize;
					file_size = options.fileSize;
					size_promise = Promise.resolve( { file_handle: file_handle, block_size: block_size, file_size: file_size } );
				} else{
					console.log( "statObject: type: %s value %o", typeof(options.statObject), options.statObject ); 
					if( options.statObject != null && typeof(options.statObject) === typeof(null) ){
						/*const blksize_type = typeof(options.statObject.blksize);
						if( blksize_type === 'number' ){*/
						if( options.statObject.blksize != 0 && typeof(options.statObject.blksize) === typeof(0) ){
							//options.blockSize = options.statObject.blksize;
							block_size ??= options.statObject.blksize;
						} else{
							return_error = new Error(`"options.statObject.blksize" is not a valid number; type: ${typeof( options.statObject.blksize )} value: ${options.statObject.blksize}`);
							return_error.code = 'ERR_INVALID_ARG_VALUE';
							throw return_error;
						}
						if( options.statObject.size != 0 && typeof(options.statObject.size) === typeof(0) ){
							file_size ??= options.statObject.size;
						} else{
							return_error = new Error(`"options.statObject.size" is not a valid number; type: ${typeof( options.statObject.size )} value: ${options.statObject.size}`);
							return_error.code = 'ERR_INVALID_ARG_VALUE';
							throw return_error;
						}
						size_promise = Promise.resolve( { file_handle: file_handle, block_size: block_size, file_size: file_size } );
					} else{
						console.log('Stat\'ing filehandle.');
						size_promise = file_handle.stat().then(
							( stat_object ) => {
								//options.statObject = stat_object;
								//options.blockSize = options.statObject.blksize;
								block_size ??= stat_object.blksize;
								file_size ??= stat_object.size;
								return { file_handle: file_handle, block_size: block_size, file_size: file_size };
							},
							/* c8 ignore start */ ( error ) => {
								return_error = new Error(`options.filehandle.stat threw an error: ${error}`);
								throw return_error;
							} /* c8 ignore stop */
						); //options.filehandle.stat
					}
				}
				return size_promise;
			},
			null,
		);
		_return = _return.then(
			( resolve_object ) => {
				var read_promise = Promise.resolve();
				var read_u8array = new Uint8Array( resolve_object.block_size );
				for( var block_index = 0; block_index <= ( resolve_object.file_size / read_u8array.length ); block_index++ ){
					read_promise = read_promise.then(
						() => {
							return resolve_object.file_handle.read( read_u8array, 0, read_u8array.length, ( block_index * read_u8array.length ) ).then(
								options.onReadBlockFunction,
								/* c8 ignore start */ ( error ) => {
									return_error = new Error( `For ${resolve_object.file_handle.fd}#${block_index}: file_handle.read threw an error: ${error}` );
									throw return_error;
								} /* c8 ignore stop */
							); //file_handle.read
						},
						null
					); // read_promise
				} //for block_index
				return read_promise;
			},
			null
		);
		if( options.closeFileHandle === true ){
			_return = _return.then(
				() => {
					return filehandle.close().then(
						options.onCloseFunction,
						/* c8 ignore start */ ( error ) => {
							return_error = new Error( `For ${filehandle.fd}: file_handle.close threw an error: ${error}` );
							throw return_error;
						} /* c8 ignore stop */
					);
				},
				null
			);
		} else{
			_return = _return.then(
				() => {
					return filehandle;
				},
				null
			);
		}
	} // noop
	// Return
	this?.logger?.log({file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `returned: ${_return}`});
	return _return;
} // readByBlock

export { readByBlock as default, readByBlock };

// lib.js EOF

