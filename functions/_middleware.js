/**
 * Cloudflare Pages - Dynamic HTTP Status Router
 * クエリパラメータ (?st=404 や ?st=503 など) をキャッチし、
 * クローラーやcurl、ブラウザに対して本物のHTTPレスポンスコードを返却します。
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const st = url.searchParams.get('st') || '503';
  
  // 有効なステータスコードをマップ形式で定義
  const statusMap = {
    "400": 400,
    "401": 401,
    "403": 403,
    "404": 404,
    "408": 408,
    "429": 429,
    "500": 500,
    "502": 502,
    "503": 503,
    "504": 504
  };

  // 生成されたHTMLなどのレスポンスオブジェクトをそのまま取得
  const response = await context.next();

  // 指定されたステータスコードに変換 (該当しない場合は503をデフォルトとする)
  const finalStatus = statusMap[st] || 503;

  // 新しいHTTPステータスコードでレスポンスを包み直してクライアントへ送信
  return new Response(response.body, {
    status: finalStatus,
    statusText: response.statusText,
    headers: response.headers
  });
}
