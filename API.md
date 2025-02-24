
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


## Functions

### readOperation
> \[Unsafe\] An atomic read operation.

#### Parametres
| name | type | description |
| --- | --- | --- |
| filehandle | object | Filehandle to read from. |
| read_u8array | Uint8Array | A buffer to fill with the read data.  |
| read_position | number | Where to begin reading.  |
| onReadFunction | function | Function to be then'd to when the read operation is complete. \[default: null\] |

#### Returns
| type | description |
| --- | --- |
| Promise | A promise which resolves when the read operation is complete. |

#### History
| version | change |
| --- | --- |
| 0.0.1 | WIP |


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


### readByBlockFromOptions
> Reads a file, denoted either by an existing file handle or opened from the given path, asynchronously one optimally-sized IO block at a time.

#### Parametres
| name | type | description |
| --- | --- | --- |
| input_options | object | Run-time options. \[default: {}\] |

##### `options` Properties
| name | type | default | description |
| --- | --- | --- | --- |
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
| onEndFnction | function | null | A function to be "then"'d when everything else is finished. |

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
| closePromise | Promise | A promise which resolves when the filehandle has successfully been closed or when reading is finished if `options.closeFileHandle` is false. |
| endPromise | Promise | A promise which resolves when any reading and/or closing is finished. |

#### Throws
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | TypeError | Thrown if a given argument isn't of the correct type. |

#### History
| version | change |
| --- | --- |
| 0.0.1 | WIP |

