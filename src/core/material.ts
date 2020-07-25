import { Vector3 } from '../math';

export class Material {
  public static readonly BUFFER_STRIDE: number = 7;

  public static makeMaterialBuffer(materials: Material[]): Float32Array {
    const buffer = new Float32Array(materials.length * Material.BUFFER_STRIDE * 3);
    let offset = 0;
    for (let i = 0; i < materials.length; i++) {
      materials[i].write(buffer, offset);
      offset += 21;
    }
    return buffer;
  }

  public emission = new Vector3();
  public color = new Vector3(1.0, 1.0, 1.0);
  public absorption = new Vector3();

  public eta: number = 1.6;;
  public metallic: number = 0.0;
  public subsurface: number = 0.0;

  public specular: number = 0.0;
  public roughness: number = 0.0;
  public specularTint: number = 0.0;

  public anisotropy: number = 0.0;
  public sheen: number = 0.0;
  public sheenTint: number = 0.0;

  public clearcoat: number = 0.0;
  public clearcoatGlossiness: number = 0.0;
  public transmission: number = 0.0;

  write(buffer: Float32Array, offset: number = 0): Material {
    this.emission.write(buffer, offset);
    this.color.write(buffer, offset + 3);
    this.absorption.write(buffer, offset + 6);

    buffer.set([
      this.eta, this.metallic, this.subsurface,
      this.specular, this.roughness, this.specularTint,
      this.anisotropy, this.sheen, this.sheenTint,
      this.clearcoat, this.clearcoatGlossiness, this.transmission
    ], offset + 9);

    return this;
  }

  read(buffer: Float32Array, offset: number = 0): Material {
    this.emission.read(buffer, offset);
    this.color.read(buffer, offset + 3);
    this.absorption.read(buffer, offset + 6);

    this.eta = buffer[offset + 9];
    this.metallic = buffer[offset + 10];
    this.subsurface = buffer[offset + 11];

    this.specular = buffer[offset + 12];
    this.roughness = buffer[offset + 13];
    this.specularTint = buffer[offset + 14];

    this.anisotropy = buffer[offset + 15];
    this.sheen = buffer[offset + 16];
    this.sheenTint = buffer[offset + 17];

    this.clearcoat = buffer[offset + 18];
    this.clearcoatGlossiness = buffer[offset + 19];
    this.clearcoatGlossiness = buffer[offset + 20];

    return this;
  }
}

