import {generateComponents} from '@uploadthing/react'
import {generateReactHelpers} from '@uploadthing/react/hooks'


// export const UploadButton = generateUploadButton<OurFileRouter>()
// export const UploadDropzone = generateUploadDropzone<OurFileRouter>()
// export const Uploader = generateUploader<OurFileRouter>()
export const {UploadButton, UploadDropzone, Uploader} = generateComponents<OurFileRouter>()
export const {useUploadThing, uploadFiles} = generateReactHelpers<OurFileRouter>()