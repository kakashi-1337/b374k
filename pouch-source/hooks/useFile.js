import { useState } from 'react'
import axios from 'axios'
import { v4 as uuid } from 'uuid'

export const useFile = () => {
  const [loading, setLoading] = useState(false)

  const getFile = async (key) => {
    try {
      setLoading(true)
      const res = await axios.get('/api/v3/files', {
        params: {
          key,
        },
      })
      /**
       * Response:
       * type: string;
       * url: string;
       * name: string;
       * description: string;
       */
      return res.data.data
    } finally {
      setLoading(false)
    }
  }

  // TODO: Refactor

  const uploadFile = async (userId, file, name) => {
    try {
      setLoading(true)
      const key = uuid()
      const newFileName = key // Specify the new file name here
      const modifiedFile = new File([file], newFileName, {
        type: 'application/pdf',
      })

      const formData = new FormData()
      formData.append('key', key) // key must be first in the form because of multer bug
      formData.append('file', modifiedFile)

      const res = await axios.post(
        `/api/v3/bridge/files/upload/${userId}`,
        formData,
      )
      return res.data.data
    } catch (err) {
      console.log(err.response)
      alert('Failed to upload file.')
    } finally {
      setLoading(false)
    }
  }

  const uploadImage = async (userId, image) => {
    try {
      setLoading(true)
      const key = uuid()
      const newFileName = key // Specify the new file name here
      const modifiedFile = new File([image], newFileName, {
        type: image.type,
      })

      const formData = new FormData()
      formData.append('key', key) // key must be first in the form because of multer bug
      formData.append('file', modifiedFile)

      const res = await axios.post(
        `/api/v3/bridge/files/upload/${userId}`,
        formData,
      )
      return res.data.data
    } catch (err) {
      console.log(err.response)
      alert('Failed to upload file.')
    } finally {
      setLoading(false)
    }
  }

  return {
    getFile,
    uploadFile,
    uploadImage,
    loading,
  }
}
