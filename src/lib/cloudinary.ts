import { v2 as cloudinary } from 'cloudinary'

// 設定を関数呼び出し時に行う（環境変数の遅延読み込み対応）
const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('Cloudinary環境変数が設定されていません:', {
      cloudName: !!cloudName,
      apiKey: !!apiKey,
      apiSecret: !!apiSecret,
    })
    throw new Error('Cloudinary環境変数が設定されていません')
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  })
}

export const uploadImage = async (
  file: string, // base64 encoded image
  folder: string = 'miai/photos'
): Promise<{ url: string; publicId: string }> => {
  // 毎回設定を確認
  configureCloudinary()

  console.log('Cloudinary upload開始 - folder:', folder)

  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      transformation: [
        { width: 1200, crop: 'limit' }, // 最大幅1200px
        { quality: 'auto:good' }, // 自動品質調整
        { fetch_format: 'auto' }, // 自動フォーマット（WebP対応ブラウザにはWebP）
      ],
    })

    console.log('Cloudinary upload完了 - public_id:', result.public_id)

    return {
      url: result.secure_url,
      publicId: result.public_id,
    }
  } catch (error) {
    console.error('Cloudinary upload失敗:', error)
    throw error
  }
}

export const deleteImage = async (publicId: string): Promise<void> => {
  configureCloudinary()
  await cloudinary.uploader.destroy(publicId)
}

export default cloudinary
