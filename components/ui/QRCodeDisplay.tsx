'use client'

import React, { useState, useEffect } from 'react'

interface QRCodeDisplayProps {
  value: string
  size?: number
  title?: string
  className?: string
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  value, 
  size = 200, 
  title = 'QR Code', 
  className = '' 
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  useEffect(() => {
    const generateQRCode = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = size
      canvas.height = size

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, size, size)

      ctx.fillStyle = '#000000'
      const moduleSize = size / 25
      const modules = value.split('').map((char, index) => char.charCodeAt(0) % 2 === 0)

      for (let i = 0; i < 25; i++) {
        for (let j = 0; j < 25; j++) {
          if (modules[(i + j) % modules.length]) {
            ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize)
          }
        }
      }

      const drawPositionMarker = (x: number, y: number) => {
        ctx.fillStyle = '#000000'
        ctx.fillRect(x, y, 7 * moduleSize, 7 * moduleSize)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(x + moduleSize, y + moduleSize, 5 * moduleSize, 5 * moduleSize)
        ctx.fillStyle = '#000000'
        ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize)
      }

      drawPositionMarker(0, 0)
      drawPositionMarker(size - 7 * moduleSize, 0)
      drawPositionMarker(0, size - 7 * moduleSize)

      setQrCodeUrl(canvas.toDataURL())
    }

    generateQRCode()
  }, [value, size])

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {qrCodeUrl ? (
        <img 
          src={qrCodeUrl} 
          alt={title}
          className="border-2 border-gray-300 rounded-lg"
          style={{ width: size, height: size }}
        />
      ) : (
        <div 
          className="border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-100"
          style={{ width: size, height: size }}
        >
          <div className="text-gray-500 text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span className="text-xs">Génération...</span>
          </div>
        </div>
      )}
      {title && (
        <p className="mt-2 text-sm text-gray-600 text-center">{title}</p>
      )}
    </div>
  )
}
