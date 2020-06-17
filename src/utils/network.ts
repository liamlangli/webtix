export async function fetch_string(uri: string): Promise<string> {
  return await(await fetch(uri)).text();
}

export async function fetch_object<T>(uri: string): Promise<T> {
  return await(await fetch(uri)).json() as T;
}

export async function fetch_arraybuffer(uri: string): Promise<ArrayBuffer> {
  return await(await fetch(uri)).arrayBuffer();
}

