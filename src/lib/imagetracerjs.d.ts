declare module 'imagetracerjs' {
  interface ImageTracerInstance {
    imagedataToSVG(imgData: ImageData, options?: string | object): string
    imageToSVG(url: string, callback: (svgstr: string) => void, options?: string | object): void
  }
  const ImageTracer: ImageTracerInstance
  export default ImageTracer
}
