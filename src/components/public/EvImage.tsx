import Image, { type ImageProps } from "next/image";

const OPTIMIZABLE = [/\.supabase\.co\/storage\/v1\/object\/public\//, /^https:\/\/images\.unsplash\.com\//, /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/storage\/v1\/object\/public\//];

export function canOptimize(src: string) {
  return !src.toLowerCase().split("?")[0].endsWith(".svg") && OPTIMIZABLE.some((r) => r.test(src));
}

/** next/image com fallback seguro para URLs externas e SVG. */
export function EvImage({ src, alt, ...rest }: Omit<ImageProps, "src"> & { src: string }) {
  return <Image src={src} alt={alt} unoptimized={!canOptimize(src)} {...rest} />;
}
