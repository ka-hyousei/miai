import nodemailer from 'nodemailer'
import type SMTPTransport from 'nodemailer/lib/smtp-transport'

// 開発環境ではコンソール出力、本番環境ではSMTP
const transportConfig: SMTPTransport.Options | { jsonTransport: true } = process.env.SMTP_HOST
  ? {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    }
  : {
      // 開発環境: JSON Transport（コンソール出力）
      jsonTransport: true,
    }

const transporter = nodemailer.createTransport(transportConfig as SMTPTransport.Options)

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const from = process.env.SMTP_FROM || 'ミアイ <noreply@miai.jp>'

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    })

    // 開発環境ではコンソールに出力
    if (!process.env.SMTP_HOST) {
      console.log('============================================')
      console.log('メール送信 (開発モード)')
      console.log('宛先:', to)
      console.log('件名:', subject)
      console.log('本文:', html)
      console.log('============================================')
    }

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('メール送信エラー:', error)
    return { success: false, error }
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const resetUrl = `${baseUrl}/reset-password?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #ec4899; margin: 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 10px; }
        .button {
          display: inline-block;
          background: #ec4899;
          color: white !important;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 8px;
          margin: 20px 0;
        }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { color: #666; font-size: 13px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ミアイ</h1>
        </div>
        <div class="content">
          <h2>パスワードリセットのご依頼</h2>
          <p>パスワードリセットのリクエストを受け付けました。</p>
          <p>下のボタンをクリックして、新しいパスワードを設定してください。</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">パスワードをリセット</a>
          </p>
          <p class="warning">
            ※このリンクは1時間後に無効になります。<br>
            ※このメールに心当たりがない場合は、無視してください。
          </p>
        </div>
        <div class="footer">
          <p>© ミアイ - 在日華人向けマッチングアプリ</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: '【ミアイ】パスワードリセットのご案内',
    html,
  })
}
