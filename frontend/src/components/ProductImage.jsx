import React, { useState } from 'react'
import { FALLBACK_IMAGE } from '../lib/catalog'

// An <img> that degrades to a branded placeholder if the remote asset fails,
// so the layout never shows a broken-image icon (e.g. when offline).
const ProductImage = ({ src, alt = '', className = '', ...rest }) => {
  const [failed, setFailed] = useState(false)
  return (
    <img
      src={failed || !src ? FALLBACK_IMAGE : src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
      {...rest}
    />
  )
}

export default ProductImage