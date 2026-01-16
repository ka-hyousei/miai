import pg from 'pg';
import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: 'postgresql://neondb_owner:npg_6hxcKCtl5MBP@ep-rough-violet-ahzr1tmi-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

function getTransporter() {
  if (process.env.SMTP_HOST) {
    if (process.env.SMTP_HOST === 'smtp.gmail.com') {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return nodemailer.createTransport({ jsonTransport: true });
}

async function sendDailyPickNotificationEmail(targetEmail, fromUserNickname, fromUserProfileId) {
  const baseUrl = 'https://www.seekpair.org';
  const profileUrl = `${baseUrl}/profile/${fromUserProfileId}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #dc2626; margin: 0; }
        .content { background: linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%); padding: 30px; border-radius: 10px; border: 2px solid #fecaca; }
        .highlight-box {
          background: #fff;
          border: 2px solid #dc2626;
          border-radius: 10px;
          padding: 25px;
          text-align: center;
          margin: 20px 0;
        }
        .nickname {
          font-size: 28px;
          font-weight: bold;
          color: #dc2626;
          margin-bottom: 10px;
        }
        .message {
          font-size: 18px;
          color: #666;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%);
          color: white !important;
          padding: 14px 40px;
          text-decoration: none;
          border-radius: 25px;
          margin: 20px 0;
          font-weight: bold;
          font-size: 16px;
        }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .unsubscribe { color: #999; font-size: 12px; margin-top: 20px; }
        .decoration { color: #f59e0b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏮 ミアイ 🏮</h1>
        </div>
        <div class="content">
          <h2 style="text-align: center; color: #dc2626;">✨ 今日の縁 ✨</h2>
          <div class="highlight-box">
            <div class="nickname">${fromUserNickname}</div>
            <div class="message">さんと今日、ご縁がありました！</div>
          </div>
          <p style="text-align: center;">
            システムがあなたに特別な縁を見つけました。<br>
            プロフィールをチェックして、素敵な出会いを見つけましょう。
          </p>
          <p style="text-align: center;">
            <a href="${profileUrl}" class="button">プロフィールを見る</a>
          </p>
        </div>
        <div class="footer">
          <p><span class="decoration">囍</span> ミアイ - 在日華人のための出会い <span class="decoration">囍</span></p>
          <p class="unsubscribe">
            ※このメールの配信を停止するには、アプリの設定画面から通知設定を変更してください。
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || 'ミアイ <noreply@seekpair.org>';

  try {
    const info = await transporter.sendMail({
      from,
      to: targetEmail,
      subject: `【ミアイ】${fromUserNickname}さんと今日、ご縁がありました！`,
      html,
    });

    if (!process.env.SMTP_HOST) {
      console.log('============================================');
      console.log('メール送信 (開発モード - 実際には送信されません)');
      console.log('宛先:', targetEmail);
      console.log('件名:', `【ミアイ】${fromUserNickname}さんと今日、ご縁がありました！`);
      console.log('============================================');
    } else {
      console.log('✓ 邮件已发送!');
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('メール送信エラー:', error);
    return { success: false, error };
  }
}

async function main() {
  console.log('=== 给 kiyosi 推荐女性用户并发送邮件 ===\n');

  // kiyosi 的信息
  const kiyosiUserId = 'cmj9baqp0000204l5swdkdypk';
  const kiyosiEmail = 'kahyousei@gmail.com';

  // 栀子花开的信息（推荐给 kiyosi 的女性）
  const recommendedNickname = '栀子花开';
  const recommendedProfileId = 'cmjgummbs000004js3lk3dtmg';
  const recommendedUserId = 'cmjgudj2u000104l7dqqqisga';

  console.log(`接收推荐的用户: kiyosi (${kiyosiEmail})`);
  console.log(`被推荐的女性: ${recommendedNickname}`);
  console.log('');

  // 创建推荐记录
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // 删除今天的旧推荐
    await pool.query(
      'DELETE FROM "DailyRecommendation" WHERE "userId" = $1 AND date = $2',
      [kiyosiUserId, today]
    );

    // 创建新的推荐记录
    await pool.query(
      'INSERT INTO "DailyRecommendation" (id, "userId", "targetId", date, "createdAt") VALUES ($1, $2, $3, $4, $5)',
      [
        'test_kiyosi_' + Date.now(),
        kiyosiUserId,  // kiyosi 接收推荐
        recommendedUserId,  // 栀子花开 被推荐
        today,
        new Date()
      ]
    );
    console.log('✓ 推荐记录已创建: 系统给 kiyosi 推荐了 栀子花开');

    // 发送邮件给 kiyosi
    console.log('\n正在发送邮件给 kiyosi...');
    const result = await sendDailyPickNotificationEmail(
      kiyosiEmail,  // 发给 kiyosi
      recommendedNickname,  // 邮件内容显示被推荐者的名字
      recommendedProfileId  // 链接到被推荐者的资料
    );

    if (result.success) {
      console.log('✓ 测试完成!');
    } else {
      console.log('✗ 邮件发送失败:', result.error);
    }
  } catch (error) {
    console.error('错误:', error);
  }

  await pool.end();
}

main();
