import { Image } from 'https://deno.land/x/imagescript/mod.ts';

export const getDominantRGB = async (url: string): Promise<RGB> => {
  const arrayBuffer = await (await fetch(url)).arrayBuffer();

  const bytes = new Uint8Array(arrayBuffer);

  if (!bytes) {
    throw Error('Failed to fetch image');
  }

  const image = await Image.decode(bytes);

  const color = image.dominantColor();

  const [r, g, b] = Image.colorToRGBA(color);

  return {
    r,
    g,
    b,
  };
};
