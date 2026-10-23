// Vercel Serverless Function - 安全轉發 Instagram Graph API
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { imageUrl, caption } = req.body;

        const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
        const IG_USER_ID = process.env.IG_USER_ID;

        if (!IG_ACCESS_TOKEN || !IG_USER_ID) {
            return res.status(500).json({ error: 'Vercel 環境變數尚未設定完成 (IG_ACCESS_TOKEN 或 IG_USER_ID)' });
        }

        // 步驟 1: 建立 Instagram 媒體容器 (Media Container)
        const createContainerUrl = `https://graph.facebook.com/v18.0/${IG_USER_ID}/media?image_url=${encodeURIComponent(imageUrl)}&caption=${encodeURIComponent(caption)}&access_token=${IG_ACCESS_TOKEN}`;
        
        const containerRes = await fetch(createContainerUrl, { method: 'POST' });
        const containerData = await containerRes.json();

        if (containerData.error) {
            return res.status(400).json({ error: containerData.error.message });
        }

        const creationId = containerData.id;

        // 步驟 2: 發布貼文 (Publish)
        const publishUrl = `https://graph.facebook.com/v18.0/${IG_USER_ID}/media_publish?creation_id=${creationId}&access_token=${IG_ACCESS_TOKEN}`;
        
        const publishRes = await fetch(publishUrl, { method: 'POST' });
        const publishData = await publishRes.json();

        if (publishData.error) {
            return res.status(400).json({ error: publishData.error.message });
        }

        return res.status(200).json({ success: true, postId: publishData.id });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}