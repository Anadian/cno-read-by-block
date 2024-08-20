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
> readByBlock

#### Parametres
| name | type | description |
| --- | --- | --- |
| filehandle | object | The filehandle to read.  |
| stat_object | object | A [stat object](https://nodejs.org/api/fs.html#class-fsstats).  |
| start | number | The byte to begin reading on. \[default: 0\] |
| end | number | Where to stop; values less than start are treated as "until the end of the file" \[default: -1\] |
| onReadFunction | function | A function to be "then'd" to for each block read. \[default: null\] |

#### Returns
| type | description |
| --- | --- |
| Promise | A promise which resolves when all requested blocks have been read. |

#### Throws
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | TypeError | Thrown if a given argument isn't of the correct type. |

#### History
| version | change |
| --- | --- |
| 0.0.1 | WIP |
*/
function readByBlock( filehandle, stat_object, start = 0, end = -1, onReadFunction = null/*, onBlockErrorFunction = null*/ ){
	const FUNCTION_NAME = 'readByBlock';
	// Variables
	//var arguments_array = Array.from(arguments);
	var _return = null;
	var return_error = null;
	this?.logger?.log({file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received filehandle: ${filehandle.fd}`});
	const reference_fd = filehandle.fd;
	// Parametre checks
	/*if( typeof(filehandle) !== 'object' ){
		return_error = new TypeError('Param "filehandle" is not of type object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}
	if( typeof(stat_object) !== 'object' ){
		return_error = new TypeError('Param "stat_object" is not of type object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}
	if( typeof(start) !== 'number' ){
		return_error = new TypeError('Param "start" is not of type number.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}
	if( typeof(end) !== 'number' ){
		return_error = new TypeError('Param "end" is not of type number.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}
	if( typeof(callback ) !== 'function' ){
		return_error = new TypeError('Param "callback," is not of type function.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}*/
	var read_promise = Promise.resolve();
	var read_end = Number.POSITIVE_INFINITY;
	const block_size = stat_object.blksize;
	// Function
	if( end <= start ){
		read_end = stat_object.size;
	} else{
		read_end = Math.min( end, stat_object.size );
	}
	const blocks = ( ( read_end - start ) / block_size );
	var read_u8array = new Uint8Array( block_size );
	for( var block_index = 0; block_index <= blocks; block_index++ ){
		var read_position = ( ( block_index * read_u8array.length ) + start );
		read_promise = read_promise.then(
			() => {
				return filehandle.read( read_u8array, 0, read_u8array.length, read_position ).then(
					onReadFunction,
					/* c8 ignore start */ ( error ) => {
						return_error = new Error( `For ${filehandle.fd}(${reference_fd})#${block_index}(${read_position}): filehandle.read threw an error: ${error}` );
						throw return_error;
					} /* c8 ignore stop */
				); //file_handle.read
			},
			null
		); // read_promise
	} //for block_index
	_return = read_promise;

	// Return
	this?.logger?.log({file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `returned: ${_return}`});
	return _return;
} // readByBlock

/**
### readByBlockFromOptions
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
| closeFileHandle | boolean | false | Whether to close the filehandle immediately after reading is finished; dynamically defaults to `true` when `options.filehandle` is `null`. |
| path | string | '' | The path of the file to open, only used if `options.filehandle` isn't specified. |
| blockSize | number | NaN | The IO block size to use for read operations, if neither this nor `options.statObject.blksize` are specified, the file will be stat'd to get its optimal block size. |
| fileSize | number | NaN | The number of bytes to read into the file. if neither this nor `options.statObject.size` are specified, the file will be stat'd to find its length. |
| statObject | object | null | An object in the form of those returned by NodeJS's `stat` function; its property (`options.statObject.blksize`) will be used as the block size if `options.blockSize` isn't specified. |
| canStat | boolean | true | Whether to `stat` the filehandle if either block size or file size can't be derived by the prior three options; when false, this function will reject the returned promise instead. |
| start | number | 0 | The byte position in the file to starting reading. |
| end | number | Number.POSITIVE_INFINITY | The byte position in the file to stop reading; if not specified the end of the file will be used. |
| onReadFunction | function | null | A function to be "then"'d with the return of each read call. |
| onCloseFunction | function | null | A function to be "then"'d when closing a newly opened filehandle. |
| onEndFnction | function | null | \[Removed\] A function to be "then"'d when everything else is finished. |

#### Returns
| type | description |
| --- | --- |
| Promise | A promise which resolves to an object with the following properties. |

##### Returned Object Properties
| name | type | description |
| --- | --- | --- |
| filehandle | [Filehandle](https://nodejs.org/api/fs.html#class-filehandle) | The filehandle used or created; may be `null` if `options.closeFileHandle` is `true`. |
| statObject | [Stats](https://nodejs.org/api/fs.html#class-fsstats) | The stats object; will be `null` if `options.canStat` is `false` and	`options.statObject` is not provided. |
| blockSize | number | The final block size used for the read. |
| fileSize | number | The size of the file in bytes. |
| readPromise | Promise | A promise which resolves when the actual file reading is finished. |
| close | function | An alias for `filehandle.close()`. |

#### Throws
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | TypeError | Thrown if a given argument isn't of the correct type. |

#### History
| version | change |
| --- | --- |
| 0.0.1 | WIP |
*/
function readByBlockFromOptions( input_options = {} ){
	const FUNCTION_NAME = 'readByBlockFromOptions';
	const DEFAULT_OPTIONS = {
		noop: false, // Skip primary functionality.
		noDefaults: false, // Don't apply static default options.
		noDynamic: false, // Don't apply dynamic default options.
		filehandle: null, // The filehandle to read, takes precedence over `options.path`.
		closeFileHandle: false, // Any filehandle created will be closed to avoid extreneous cloning.
		path: '', // The path of the file to open, only used if `options.filehandle` isn't specified.
		blockSize: 0, // The IO block size to use for read operations, if neither this nor `options.statObject.blksize` are specified, the file will be stat'd to get its optimal block size.
		fileSize: 0,
		statObject: null, // An object in the form of those returned by NodeJS's `stat` function; its property (`options.statObject.blksize`) will be used as the block size if `options.blockSize` isn't specified.
		canStat: true,
		start: 0, // Position at which to start reading the file.
		end: Number.POSITIVE_INFINITY,
		onReadFunction: null, // A function to be "then"'d with the return of each read call.
		onCloseFunction: null,
		onEndFunction: null,
		logOptions: null
	};
	// Variables
	var arguments_array = Array.from(arguments);
	var _return = Promise.resolve( null );
	var return_error = null;
	var options = null;
	var state = {
		filehandle: null,
		statObject: null,
		blockSize: 0,
		fileSize: 0,
		readPromise: null
	};
	this?.logger?.log({file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	// Parametre checks
	if( typeof(input_options) !== 'object' ){
		return_error = new TypeError('Param "input_options" is not of type object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}
	//console.log( 'Yo. %o', input_options );

	// Options
	if( input_options.noDefaults !== true ){
		if( input_options.noDynamic !== true ){
			var dynamic_defaults = {};
			if( input_options.filehandle == null ){
				dynamic_defaults.closeFileHandle = true;
			}
			options = Object.assign( {}, DEFAULT_OPTIONS, dynamic_defaults, input_options );
		} else{
			options = Object.assign( {}, DEFAULT_OPTIONS, input_options );
		} // noDynamic
	} else{
		options = Object.assign( {}, input_options );
	} // noDefaults
	if( typeof(options.logOptions) === 'function' ){
		options.logOptions( options );
	}
	//console.log( 'Yo2.' );
	if( options.noop !== true ){
		// Function
		if( options.filehandle != null && typeof(options.filehandle) === 'object' ){
			state.filehandle = options.filehandle;
			_return = Promise.resolve( state );
		} else if( options.path != '' && typeof(options.path) === typeof('') ){
			this?.logger?.log({file: FILENAME, function: FUNCTION_NAME, level: 'debug', message:  'Going with options.path.' });
			_return = FSNS.open( options.path ).then(
				( file_handle ) => {
					this?.logger?.log({file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `Opened filehandle: ${file_handle.fd}`});
					state.filehandle = file_handle;
					return state;
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
			( state ) => {
				this?.logger?.log({file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `Getting statObject; filehandle: ${state.filehandle.fd}`});
				var stat_promise = null;
				if( options.statObject != null && typeof(options.statObject) === typeof(null) ){
					state.statObject = options.statObject;
					stat_promise = Promise.resolve( state );
				} else if( options.canStat === true ){
					stat_promise = state.filehandle.stat().then(
						( stat_object ) => {
							state.statObject = stat_object;
							return state;
						},
						/* c8 ignore start */ ( error ) => {
							return_error = new Error(`state.filehandle.stat threw an error: ${error}`);
							throw return_error;
						} /* c8 ignore stop */
					); //options.filehandle.stat
				} else{
					return_error = new Error(`Error: "options.statObject" is null but "options.canStat" is not true.`);
					return_error.code = 'ERR_INVALID_ARG_VALUE';
					this?.logger?.log({file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `Closing filehandle: ${state.filehandle.fd}`});
					state.filehandle.close();
					throw return_error;
				}
				this?.logger?.log({file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: 'Returnig stat promise.'});
				return stat_promise;
			},
			null
		); // statObject
		_return = _return.then(
			( state ) => {
				this?.logger?.log({file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: 'Setting blocksize.'});
				if( options.blockSize > 0 && typeof(options.blockSize) === typeof(0) ){
					state.blockSize = options.blockSize;
				} else{
					state.blockSize = state.statObject.blksize;
				}
				if( options.fileSize != 0 && typeof(options.fileSize) === typeof(0) ){
					state.fileSize = options.fileSize;
				} else{
					state.fileSize = state.statObject.size;
				}
				return state;
			},
			null
		);
		_return = _return.then(
			( state ) => {
				state.readPromise = readByBlock.call( { logger: this.logger }, state.filehandle, { blksize: state.blockSize, size: state.fileSize }, options.start, options.end, options.onReadFunction );
				return state;
			},
			null
		).then(
			null,
			( error ) => {
				this?.logger?.log({file: FILENAME, function: FUNCTION_NAME, level: 'error', message: `readPromise rejected with error: ${error}`});
				throw error;
			}
		);
		if( options.closeFileHandle === true ){ // Close filehandle we created.
			_return = _return.then(
				( state ) => {
					this?.logger?.log({file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `Closing filehandle: ${state.filehandle.fd}`});
					return state.readPromise.then(
						() => {
							state.closePromise = state.filehandle.close().then(
								options.onCloseFunction,
								/* c8 ignore start */ ( error ) => {
									return_error = new Error( `For ${state.filehandle.fd}: file_handle.close threw an error: ${error}` );
									throw return_error;
								} /* c8 ignore stop */
							);
							return state;
						},
						null
					);
				},
				( error ) => {
					this?.logger?.log({file: FILENAME, function: FUNCTION_NAME, level: 'error', message: `${error}`});
					throw error;
				}
			);
		} // closeFileHandle
		_return = _return.then(
			( state ) => {
				state.close = () => {
					return state.filehandle.close();
				};
				return state;
			},
			null
		);
		/*if( typeof(options.onEndFunction) === 'function' ){
			_return = _return.then(
				( state ) => {
					state.endPromise = options.onEndFunction( state );
					return state;
				},
				null
			);
		} // onEndFunction*/
	} // noop
	// Return
	this?.logger?.log({file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `returned: ${_return}`});
	return _return;
} // readByBlockFromOptions

const NAMESPACE = { unsafe: { readByBlock: readByBlock }, readByBlockFromOptions: readByBlockFromOptions };
export { NAMESPACE as default, readByBlock, readByBlockFromOptions };

// lib.js EOF

