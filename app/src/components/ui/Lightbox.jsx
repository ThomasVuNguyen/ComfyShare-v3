import React, { useState, useContext, createContext } from 'react'

export const LightboxContext = createContext({})

export function LightboxProvider({ children }) {
  const [image, setImage] = useState(null)

  const openLightbox = (src) => setImage(src)
  const closeLightbox = () => setImage(null)

  return (
    <>
      <LightboxContext.Provider value={{ openLightbox }}>
        {children}
      </LightboxContext.Provider>

      {image && (
        <dialog open className="lightbox" onClick={closeLightbox}>
          <img src={image} className="lightbox__image" alt="" />
          <form method="dialog" className="lightbox__btn">
            <button className="btn fill-white">
              <img src="/images/remove.svg" alt="Close" />
            </button>
          </form>
        </dialog>
      )}
    </>
  )
}

export function LightboxImage({ src, alt, className = '' }) {
  const { openLightbox } = useContext(LightboxContext)

  return (
    <a
      href={src}
      onClick={(e) => {
        e.preventDefault()
        openLightbox(src)
      }}
      data-lightbox
    >
      <img src={src} alt={alt} className={className} />
    </a>
  )
}
