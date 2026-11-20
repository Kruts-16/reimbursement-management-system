export const config = {
  api: {
    bodyParser: {
      sizeLimit: "25mb",
    },
  },
};
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const clientId = process.env.VERYFI_CLIENT_ID;
    const username = process.env.VERYFI_USERNAME;
    const apiKey = process.env.VERYFI_API_KEY;

    if (!clientId || !username || !apiKey) {
      return res.status(500).json({
        error: "Veryfi credentials are not configured.",
      });
    }

    const { file_data, file_name } = req.body || {};

    if (!file_data || !file_name) {
      return res.status(400).json({
        error: "Receipt file is required.",
      });
    }

    const base64Data = file_data.replace(
      /^data:[^;]+;base64,/,
      ""
    );

    const fileSize = Buffer.from(base64Data, "base64").length;

    if (fileSize === 0 || fileSize > 20 * 1024 * 1024) {
      return res.status(400).json({
        error: "File must be smaller than 20 MB.",
      });
    }

    const veryfiResponse = await fetch(
      "https://api.veryfi.com/api/v8/partner/documents/",
      {
        method: "POST",
        headers: {
          "CLIENT-ID": clientId,
          "AUTHORIZATION": `apikey ${username}:${apiKey}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          file_data: base64Data,
          file_name: file_name,
        }),
      }
    );

    const result = await veryfiResponse.json();

    if (!veryfiResponse.ok) {
      console.error("Veryfi API error:", result);

      return res.status(veryfiResponse.status).json({
        error: result.message || "Veryfi receipt scanning failed.",
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error("Receipt scanning error:", error);

    return res.status(500).json({
      error: "Unable to process receipt.",
    });
  }
}
