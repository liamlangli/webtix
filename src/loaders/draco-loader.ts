import { BufferArray } from '../types';

const taskCache = new WeakMap();

// draco variables
const decoderPath = 'https://www.gstatic.com/draco/v1/decoders/';
const decoderConfig: any = {};
let decoderPending: Promise<any> | null = null;

// worker variables
const workerLimit = 4;
const workerPool: any[] = [];
let workerNextTaskID = 1;
let workerSourceURL = '';

export interface DracoAttribute {
  array: BufferArray;
  itemSize: number;
}

export interface DracoNamedAttribute extends DracoAttribute {
  name: string;
}

export interface DracoGeometry {
  attributes: DracoNamedAttribute[];
  index: DracoAttribute
}

export function draco_get_attribute(geometry: DracoGeometry, name: string): DracoNamedAttribute | undefined {
  for (let i = 0; i < geometry.attributes.length; ++i) {
    if (name === geometry.attributes[i].name) {
      return geometry.attributes[i];
    }
  }
  return undefined;
}

export function draco_set_attribute(geometry: DracoGeometry, name: string, array: BufferArray, itemSize: number): void {
  geometry.attributes.push({name, array, itemSize});
}

/**
 * decode draco geometry from arraybuffer
 */
export async function draco_decode(source: string): Promise<DracoGeometry> {
  const config = {
    attributeIDs: {
      position: 'POSITION',
      normal: 'NORMAL',
      color: 'COLOR',
      uv: 'TEX_COORD'
    },
    attributeTypes: {
      position: 'Float32Array',
      normal: 'Float32Array',
      color: 'Float32Array',
      uv: 'Float32Array'
    },
    useUniqueIDs: false
  }

  const buffer = await (await fetch(source)).arrayBuffer();
  return decodeGeometry(buffer, config);
};

async function decodeGeometry(buffer: ArrayBuffer, taskConfig: any): Promise<any> {

  // TODO: For backward-compatibility, support 'attributeTypes' objects containing
  // references (rather than names) to typed array constructors. These must be
  // serialized before sending them to the worker.
  for (let attribute in taskConfig.attributeTypes) {
    const type = taskConfig.attributeTypes[attribute];
    if (type.BYTES_PER_ELEMENT !== undefined) {
      taskConfig.attributeTypes[attribute] = type.name;
    }
  }

  //
  const taskKey = JSON.stringify(taskConfig);

  // Check for an existing task using this buffer. A transferred buffer cannot be transferred
  // again from this thread.
  if (taskCache.has(buffer)) {
    const cachedTask = taskCache.get(buffer);
    if (cachedTask.key === taskKey) {
      return cachedTask.promise;
    } else if (buffer.byteLength === 0) {
      // Technically, it would be possible to wait for the previous task to complete,
      // transfer the buffer back, and decode again with the second configuration. That
      // is complex, and I don't know of any reason to decode a Draco buffer twice in
      // different ways, so this is left unimplemented.
      throw new Error(
        'Unable to re-decode a buffer with different settings. Buffer has already been transferred.'
      );
    }
  }

  //

  let worker: any;
  let taskID = workerNextTaskID++;
  let taskCost = buffer.byteLength;

  // Obtain a worker and assign a task, and construct a geometry instance
  // when the task completes.
  let geometryPending = getWorker(taskID, taskCost)
    .then((_worker) => {
      worker = _worker;
      return new Promise((resolve, reject) => {
        worker._callbacks[taskID] = { resolve, reject };
        worker.postMessage({ type: 'decode', id: taskID, taskConfig, buffer }, [buffer]);
      });
    })
    .then((message: any) => onload(message.geometry));

  // Remove task from the task list.
  geometryPending
    .finally(() => {
      if (worker && taskID) {
        releaseTask(worker, taskID);
      }
    });

  // Cache the task result.
  taskCache.set(buffer, {
    key: taskKey,
    promise: geometryPending
  });
  return geometryPending;
}

function onload(geometryData: any) {
 return geometryData;
}

enum ResponseType {
  Text = 'text',
  ArrayBuffer = 'arraybuffer',
}

function loadLibrary(url: string, type: ResponseType): Promise<any> {
  return new Promise<any>(function(resolve): void {
    fetch(`${decoderPath}${url}`).then(function(response): void {
      switch(type) {
        case ResponseType.Text:
          response.text().then(function(content): void {
            resolve(content);
          });
          break;

        case ResponseType.ArrayBuffer:
          response.arrayBuffer().then(function(content): void {
            resolve(content);
          });
          break;

        default:
          throw 'unsupported response type';
      }
    });
  });
}

async function initDecoder(): Promise<any> {
  if (!!decoderPending) return decoderPending;

  const useJS = typeof WebAssembly !== 'object' || decoderConfig.type === 'js';
  const librariesPending = [];
  if (useJS) {
    librariesPending.push(loadLibrary('draco_decoder.js', ResponseType.Text));
  } else {
    librariesPending.push(loadLibrary('draco_wasm_wrapper.js', ResponseType.Text));
    librariesPending.push(loadLibrary('draco_decoder.wasm', ResponseType.ArrayBuffer));
  }

  decoderPending = Promise.all(librariesPending)
    .then((libraries) => {
      const jsContent = libraries[0];
      if (!useJS) {
        decoderConfig.wasmBinary = libraries[1];
      }

      const fn = DRACOWorker.toString();
      const body = [
        '/* draco decoder */',
        jsContent,
        '',
        '/* worker */',
        fn.substring(fn.indexOf('{') + 1, fn.lastIndexOf('}'))
      ].join('\n');
      workerSourceURL = URL.createObjectURL(new Blob([body]));
    });

  return decoderPending;
}

async function getWorker(taskID: number, taskCost: number): Promise<Worker> {
  return initDecoder().then(() => {
    if (workerPool.length <  workerLimit) {
      const worker = new Worker(workerSourceURL) as any;

      worker._callbacks = {};
      worker._taskCosts = {};
      worker._taskLoad = 0;

      worker.postMessage({ type: 'init', decoderConfig });
      worker.onmessage = function (e: MessageEvent) {
        const message = e.data;
        switch (message.type) {
          case 'decode':
            worker._callbacks[message.id].resolve(message);
            break;

          case 'error':
            worker._callbacks[message.id].reject(message);
            break;

          default:
            console.error(`DRACOLoader: Unexpected message, ${message.type}`);
        }
      };

      workerPool.push(worker);

    } else {
      workerPool.sort(function (a, b) {
        return a._taskLoad > b._taskLoad ? - 1 : 1;
      });
    }

    const worker = workerPool[workerPool.length - 1];
    worker._taskCosts[taskID] = taskCost;
    worker._taskLoad += taskCost;
    return worker;
  });
}

function releaseTask(worker: any, taskID: number): void {
  worker._taskLoad -= worker._taskCosts[taskID];
  delete worker._callbacks[taskID];
  delete worker._taskCosts[taskID];
}

export function dispose() {
  for (let i = 0; i < workerPool.length; ++i) {
    workerPool[i].terminate();
  }
  workerPool.length = 0;
}

/* WEB WORKER */

const DRACOWorker = function () {
  let decoderConfig: any;
  let decoderPending: any;

  onmessage = function (e) {
    const message = e.data;
    switch (message.type) {

      case 'init':
        decoderConfig = message.decoderConfig;
        decoderPending = new Promise(function (resolve/*, reject*/) {

          decoderConfig.onModuleLoaded = function (draco: any) {
            // Module is Promise-like. Wrap before resolving to avoid loop.
            resolve({ draco: draco });
          };
          (self as any).DracoDecoderModule(decoderConfig);
        });
        break;

      case 'decode':
        var buffer = message.buffer;
        var taskConfig = message.taskConfig;
        decoderPending.then((module: any) => {

          var draco = module.draco;
          var decoder = new draco.Decoder();
          var decoderBuffer = new draco.DecoderBuffer();
          decoderBuffer.Init(new Int8Array(buffer), buffer.byteLength);

          try {

            var geometry = decodeGeometry(draco, decoder, decoderBuffer, taskConfig);
            var buffers = geometry.attributes.map((attr: any) => attr.array.buffer);
            if (geometry.index) buffers.push(geometry.index.array.buffer);
            self.postMessage({ type: 'decode', id: message.id, geometry }, buffers);

          } catch (error) {

            console.error(error);
            (self as any).postMessage({ type: 'error', id: message.id, error: error.message });

          } finally {

            draco.destroy(decoderBuffer);
            draco.destroy(decoder);

          }
        });
        break;
    }

  };

  function decodeGeometry(draco: any, decoder: any, decoderBuffer: any, taskConfig: any) {

    let attributeIDs = taskConfig.attributeIDs;
    let attributeTypes = taskConfig.attributeTypes;

    let dracoGeometry;
    let decodingStatus;

    let geometryType = decoder.GetEncodedGeometryType(decoderBuffer);

    if (geometryType === draco.TRIANGULAR_MESH) {

      dracoGeometry = new draco.Mesh();
      decodingStatus = decoder.DecodeBufferToMesh(decoderBuffer, dracoGeometry);

    } else if (geometryType === draco.POINT_CLOUD) {

      dracoGeometry = new draco.PointCloud();
      decodingStatus = decoder.DecodeBufferToPointCloud(decoderBuffer, dracoGeometry);

    } else {
      throw new Error('DRACOLoader: Unexpected geometry type.');
    }

    if (!decodingStatus.ok() || dracoGeometry.ptr === 0) {
      throw new Error('DRACOLoader: Decoding failed: ' + decodingStatus.error_msg());
    }

    const geometry = { index: null, attributes: [] } as any;

    // Gather all vertex attributes.
    for (let attributeName in attributeIDs) {

      let attributeType = self[attributeTypes[attributeName]];

      let attribute;
      let attributeID;

      // A Draco file may be created with default vertex attributes, whose attribute IDs
      // are mapped 1:1 from their semantic name (POSITION, NORMAL, ...). Alternatively,
      // a Draco file may contain a custom set of attributes, identified by known unique
      // IDs. glTF files always do the latter, and `.drc` files typically do the former.
      if (taskConfig.useUniqueIDs) {
        attributeID = attributeIDs[attributeName];
        attribute = decoder.GetAttributeByUniqueId(dracoGeometry, attributeID);
      } else {
        attributeID = decoder.GetAttributeId(dracoGeometry, draco[attributeIDs[attributeName]]);
        if (attributeID === - 1) continue;
        attribute = decoder.GetAttribute(dracoGeometry, attributeID);
      }
      geometry.attributes.push(decodeAttribute(draco, decoder, dracoGeometry, attributeName, attributeType, attribute));
    }

    // Add index.
    if (geometryType === draco.TRIANGULAR_MESH) {

      // Generate mesh faces.
      var numFaces = dracoGeometry.num_faces();
      var numIndices = numFaces * 3;
      var dataSize = numIndices * 4;
      var ptr = draco._malloc(dataSize);
      decoder.GetTrianglesUInt32Array(dracoGeometry, dataSize, ptr);
      var index = new Uint32Array(draco.HEAPU32.buffer, ptr, numIndices).slice();
      draco._free(ptr);

      geometry.index = { array: index, itemSize: 1 };

    }

    draco.destroy(dracoGeometry);

    return geometry;

  }

  function decodeAttribute(draco: any, decoder: any, dracoGeometry: any, attributeName: any, attributeType: any, attribute: any) {

    var numComponents = attribute.num_components();
    var numPoints = dracoGeometry.num_points();
    var numValues = numPoints * numComponents;
    var dracoArray;
    var ptr;
    var array;

    switch (attributeType) {

      case Float32Array:
        var dataSize = numValues * 4;
        ptr = draco._malloc(dataSize);
        decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, attribute, draco.DT_FLOAT32, dataSize, ptr);
        array = new Float32Array(draco.HEAPF32.buffer, ptr, numValues).slice();
        draco._free(ptr);
        break;

      case Int8Array:
        ptr = draco._malloc(numValues);
        decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, attribute, draco.DT_INT8, numValues, ptr);
        (self as any).geometryBuffer[attributeName] = new Int8Array(draco.HEAP8.buffer, ptr, numValues).slice();
        draco._free(ptr);
        break;

      case Int16Array:
        var dataSize = numValues * 2;
        ptr = draco._malloc(dataSize);
        decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, attribute, draco.DT_INT16, dataSize, ptr);
        array = new Int16Array(draco.HEAP16.buffer, ptr, numValues).slice();
        draco._free(ptr);
        break;

      case Int32Array:
        var dataSize = numValues * 4;
        ptr = draco._malloc(dataSize);
        decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, attribute, draco.DT_INT32, dataSize, ptr);
        array = new Int32Array(draco.HEAP32.buffer, ptr, numValues).slice();
        draco._free(ptr);
        break;

      case Uint8Array:
        ptr = draco._malloc(numValues);
        decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, attribute, draco.DT_UINT8, numValues, ptr);
        (self as any).geometryBuffer[attributeName] = new Uint8Array(draco.HEAPU8.buffer, ptr, numValues).slice();
        draco._free(ptr);
        break;

      case Uint16Array:
        var dataSize = numValues * 2;
        ptr = draco._malloc(dataSize);
        decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, attribute, draco.DT_UINT16, dataSize, ptr);
        array = new Uint16Array(draco.HEAPU16.buffer, ptr, numValues).slice();
        draco._free(ptr);
        break;

      case Uint32Array:
        var dataSize = numValues * 4;
        ptr = draco._malloc(dataSize);
        decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, attribute, draco.DT_UINT32, dataSize, ptr);
        array = new Uint32Array(draco.HEAPU32.buffer, ptr, numValues).slice();
        draco._free(ptr);
        break;

      default:
        throw new Error('DRACOLoader: Unexpected attribute type.');
    }

    return {
      name: attributeName,
      array: array,
      itemSize: numComponents
    };
  }
};
