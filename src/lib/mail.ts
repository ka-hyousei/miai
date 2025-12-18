import nodemailer from 'nodemailer'

// トランスポーターを取得（環境変数を毎回読み込む）
function getTransporter() {
  if (process.env.SMTP_HOST) {
    // Gmail用設定
    if (process.env.SMTP_HOST === 'smtp.gmail.com') {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      })
    }
    // その他のSMTPサーバー
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  }
  // 開発環境: JSON Transport（コンソール出力）
  return nodemailer.createTransport({ jsonTransport: true })
}

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const from = process.env.SMTP_FROM || 'お見合い <noreply@miai.jp>'
  const transporter = getTransporter()

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

export async function sendVerificationCodeEmail(email: string, code: string) {
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
        .code-box {
          background: #fff;
          border: 2px solid #ec4899;
          border-radius: 10px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
        }
        .code {
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #ec4899;
        }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { color: #666; font-size: 13px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>お見合い</h1>
        </div>
        <div class="content">
          <h2>メールアドレス認証</h2>
          <p>ご登録ありがとうございます。</p>
          <p>以下の認証コードを入力して、メールアドレスを確認してください。</p>
          <div class="code-box">
            <span class="code">${code}</span>
          </div>
          <p class="warning">
            ※この認証コードは10分間有効です。<br>
            ※このメールに心当たりがない場合は、無視してください。
          </p>
        </div>
        <div class="footer">
          <p>© お見合い - 国籍を超えた出会いを</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: '【お見合い】メールアドレス認証コード',
    html,
  })
}

// 管理者への新規ユーザー登録通知
export async function sendNewUserNotificationEmail(userEmail: string) {
  const adminEmail = 'kahyousei@gmail.com'
  const registrationTime = new Date().toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

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
        .info-box {
          background: #fff;
          border: 2px solid #ec4899;
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
        }
        .info-item { margin: 10px 0; }
        .label { font-weight: bold; color: #666; }
        .value { color: #333; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>お見合い - 管理者通知</h1>
        </div>
        <div class="content">
          <h2>🎉 新規ユーザー登録</h2>
          <p>新しいユーザーがお見合いに登録しました。</p>
          <div class="info-box">
            <div class="info-item">
              <span class="label">メールアドレス：</span>
              <span class="value">${userEmail}</span>
            </div>
            <div class="info-item">
              <span class="label">登録日時：</span>
              <span class="value">${registrationTime}</span>
            </div>
          </div>
        </div>
        <div class="footer">
          <p>© お見合い - 管理者通知システム</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: adminEmail,
    subject: '【お見合い】新規ユーザー登録通知',
    html,
  })
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
          <h1>お見合い</h1>
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
          <p>© お見合い - 国籍を超えた出会いを</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: '【お見合い】パスワードリセットのご案内',
    html,
  })
}
