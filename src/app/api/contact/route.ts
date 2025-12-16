import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/mail'

export async function POST(request: Request) {
  try {
    const { name, email, category, message } = await request.json()

    // バリデーション
    if (!name || !email || !category || !message) {
      return NextResponse.json(
        { error: '必須項目をすべて入力してください' },
        { status: 400 }
      )
    }

    // メールアドレスの簡易バリデーション
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '有効なメールアドレスを入力してください' },
        { status: 400 }
      )
    }

    // カテゴリのラベル
    const categoryLabels: Record<string, string> = {
      general: '一般的なお問い合わせ',
      account: 'アカウントに関するお問い合わせ',
      bug: '不具合の報告',
      feature: '機能のご要望',
      report: 'ユーザーの通報',
      payment: 'お支払いに関するお問い合わせ',
      withdrawal: '退会に関するお問い合わせ',
      other: 'その他',
    }

    // 管理者への通知メール
    const adminHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ec4899; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .field { margin-bottom: 20px; }
          .label { font-weight: bold; color: #666; margin-bottom: 5px; }
          .value { background: white; padding: 10px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>お見合い - お問い合わせ</h1>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">お名前</div>
              <div class="value">${name}</div>
            </div>
            <div class="field">
              <div class="label">メールアドレス</div>
              <div class="value">${email}</div>
            </div>
            <div class="field">
              <div class="label">お問い合わせ種別</div>
              <div class="value">${categoryLabels[category] || category}</div>
            </div>
            <div class="field">
              <div class="label">お問い合わせ内容</div>
              <div class="value">${message.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    // 管理者にメール送信
    await sendEmail({
      to: 'kahyousei@gmail.com',
      subject: `【お見合い】お問い合わせ: ${categoryLabels[category] || category}`,
      html: adminHtml,
    })

    // ユーザーへの自動返信メール
    const userHtml = `
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
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>お見合い</h1>
          </div>
          <div class="content">
            <p>${name} 様</p>
            <p>お問い合わせいただきありがとうございます。</p>
            <p>以下の内容でお問い合わせを受け付けいたしました。</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p><strong>お問い合わせ種別：</strong>${categoryLabels[category] || category}</p>
            <p><strong>お問い合わせ内容：</strong></p>
            <p style="background: white; padding: 15px; border-radius: 5px;">${message.replace(/\n/g, '<br>')}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p>内容を確認の上、担当者より2〜3営業日以内にご連絡させていただきます。</p>
            <p>今しばらくお待ちくださいますようお願いいたします。</p>
          </div>
          <div class="footer">
            <p>※このメールは自動送信されています。このメールへの返信はできません。</p>
            <p>&copy; お見合い - 国籍を超えた出会いを</p>
          </div>
        </div>
      </body>
      </html>
    `

    await sendEmail({
      to: email,
      subject: '【お見合い】お問い合わせを受け付けました',
      html: userHtml,
    })

    return NextResponse.json({
      message: 'お問い合わせを受け付けました',
    })
  } catch (error) {
    console.error('お問い合わせ送信エラー:', error)
    return NextResponse.json(
      { error: 'お問い合わせの送信に失敗しました' },
      { status: 500 }
    )
  }
}
