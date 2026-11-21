import Image, { type ImageProps } from 'next/image';
import { canOptimizeImage } from '@/lib/image';

type SiteImageProps = Omit<ImageProps, 'src'> & { src?: string | null };

/**
 * next/image com duas proteções: sem `src` mostra um bloco cinza (em vez de
 * quebrar a página) e imagens de domínios fora da lista saem sem otimização.
 */
export function SiteImage({ src, alt, className = '', fill, ...rest }: SiteImageProps) {
  if (!src) {
    return <div aria-hidden="true" className={`bg-slate-100 ${fill ? 'absolute inset-0' : ''} ${className}`} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      unoptimized={!canOptimizeImage(src)}
      {...rest}
    />
  );
}
