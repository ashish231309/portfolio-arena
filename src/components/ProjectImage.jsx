/**
 * Project screenshot pipeline (T32).
 *
 * Renders one gallery item as a <picture> when a lossless WebP sibling exists
 * (the seven BMW screenshots) and as a plain <img> otherwise (the Coding Ninjas
 * JPEGs, where lossless WebP tested ~2x bigger and no lossy re-encode was
 * approved).
 *
 * Two candidates are offered: a 700 px-wide lossless WebP for small viewports
 * and the native-width lossless WebP (pixel-identical to the PNG) for large
 * ones. Because `sizes` is passed per placement, the browser resolves the right
 * candidate from its own layout instead of guessing.
 *
 * `width`/`height` always carry the intrinsic size, so the slot is reserved
 * before the bytes arrive — no layout shift — and `picture` uses
 * `display: contents` so the wrapper never changes how the image is laid out.
 */
export default function ProjectImage({
  item,
  sizes = '100vw',
  className = '',
  loading = 'lazy',
  decoding = 'async',
  ...rest
}) {
  const { src, webp, w, h, alt } = item
  return (
    <picture className="contents">
      {webp && (
        <source
          type="image/webp"
          srcSet={`${webp.replace(/\.webp$/, '-700.webp')} 700w, ${webp} ${w}w`}
          sizes={sizes}
        />
      )}
      <img
        src={src}
        alt={alt}
        width={w}
        height={h}
        loading={loading}
        decoding={decoding}
        className={className}
        {...rest}
      />
    </picture>
  )
}
