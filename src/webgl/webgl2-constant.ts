// Filters
export enum TextureFilter {}
export const NearestFilter: TextureFilter = 9728;
export const NearestMipmapNearestFilter: TextureFilter = 9984;
export const NearestMipmapLinearFilter: TextureFilter = 9986;
export const LinearFilter: TextureFilter = 9729;
export const LinearMipmapNearestFilter: TextureFilter = 9985;
export const LinearMipmapLinearFilter: TextureFilter = 9987;

// Mapping modes
export enum Mapping { }
export const UVMapping: Mapping = 300;
export const CubeReflectionMapping: Mapping = 301;

// Data types
export enum TextureDataType { }
export const UnsignedByteType: TextureDataType = 5121;
export const ByteType: TextureDataType = 5120;
export const ShortType: TextureDataType = 5122;
export const UnsignedShortType: TextureDataType = 5123;
export const IntType: TextureDataType = 5124;
export const UnsignedIntType: TextureDataType = 5125;
export const FloatType: TextureDataType = 5126;
export const HalfFloatType: TextureDataType = 5131;

// Pixel formats
export enum PixelFormat { }
export const AlphaFormat: PixelFormat = 6406;
export const RGBFormat: PixelFormat = 6407;
export const RGBAFormat: PixelFormat = 6408;
export const LuminanceFormat: PixelFormat = 6409;
export const LuminanceAlphaFormat: PixelFormat = 6410;
export const DepthFormat: PixelFormat = 6145;
export const DepthStencilFormat: PixelFormat = 34041;
export const RedFormat: PixelFormat = 6403;
export const RedIntegerFormat: PixelFormat = 36244;
export const RGFormat: PixelFormat = 33319;
export const RGIntegerFormat: PixelFormat = 33320;
export const RGBIntegerFormat: PixelFormat = 36248;

// Compressed texture formats
// DDS / ST3C Compressed texture formats
export enum CompressedPixelFormat { }
export const RGB_S3TC_DXT1_Format: CompressedPixelFormat = 33776;
export const RGBA_S3TC_DXT1_Format: CompressedPixelFormat = 33777;
export const RGBA_S3TC_DXT3_Format: CompressedPixelFormat = 33778;
export const RGBA_S3TC_DXT5_Format: CompressedPixelFormat = 33779;

// PVRTC compressed './texture formats
export const RGB_PVRTC_4BPPV1_Format: CompressedPixelFormat = 35840;
export const RGB_PVRTC_2BPPV1_Format: CompressedPixelFormat = 35841;
export const RGBA_PVRTC_4BPPV1_Format: CompressedPixelFormat = 35842;
export const RGBA_PVRTC_2BPPV1_Format: CompressedPixelFormat = 35843;

// ETC compressed texture formats
export const RGB_ETC1_Format: CompressedPixelFormat = 36196;

// ASTC compressed texture formats
export const RGBA_ASTC_4x4_Format: CompressedPixelFormat = 37808;
export const RGBA_ASTC_5x4_Format: CompressedPixelFormat = 37809;
export const RGBA_ASTC_5x5_Format: CompressedPixelFormat = 37810;
export const RGBA_ASTC_6x5_Format: CompressedPixelFormat = 37811;
export const RGBA_ASTC_6x6_Format: CompressedPixelFormat = 37812;
export const RGBA_ASTC_8x5_Format: CompressedPixelFormat = 37813;
export const RGBA_ASTC_8x6_Format: CompressedPixelFormat = 37814;
export const RGBA_ASTC_8x8_Format: CompressedPixelFormat = 37815;
export const RGBA_ASTC_10x5_Format: CompressedPixelFormat = 37816;
export const RGBA_ASTC_10x6_Format: CompressedPixelFormat = 37817;
export const RGBA_ASTC_10x8_Format: CompressedPixelFormat = 37818;
export const RGBA_ASTC_10x10_Format: CompressedPixelFormat = 37819;
export const RGBA_ASTC_12x10_Format: CompressedPixelFormat = 37820;
export const RGBA_ASTC_12x12_Format: CompressedPixelFormat = 37821;

// Texture Type
export enum TextureType { }
export const TEXTURE_2D: TextureType = 3553;
export const TEXTURE_3D: TextureType = 32879;
export const TEXTURE_CUBE: TextureType = 34067;

// buffer type
export enum BufferType { }
export const ARRAY_BUFFER: BufferType = 0x8892;
export const ELEMENT_ARRAY_BUFFER: BufferType = 0x8893;

// buffer data type
export enum GPUBufferDataType {}
export const GPUByte: GPUBufferDataType = 0x1400;
export const GPUUnsignedByte: GPUBufferDataType = 0x1401;
export const GPUShort: GPUBufferDataType = 0x1402;
export const GPUUnsignedShort: GPUBufferDataType = 0x1403;
export const GPUInt: GPUBufferDataType = 0x1404;
export const GPUUnsignedInt: GPUBufferDataType = 0x1405;
export const GPUFloat: GPUBufferDataType = 5126;
