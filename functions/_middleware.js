/**
 * Cloudflare Pages - Dynamic Path-Based Router & Redirector
 * * 1. トップページ (/) にアクセスされた場合は、https://ryopc.f5.si へ 302 リダイレクトします。
 * 2. /503 や /404 などのパスを検知し、アセットを内部処理しながら本物のHTTPステータスヘッダーを返却します。
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // 1. トップページ (/) または /index.html へのアクセスは https://ryopc.f5.si へ302リダイレクト
  if (pathname === '/' || pathname === '/index.html') {
    return Response.redirect('https://ryopc.f5.si', 302);
  }

  // 2. パスの最初のセグメントから3桁のステータスコードを抽出 (例: /503 -> "503")
  const pathSegments = pathname.split('/');
  const st = pathSegments[1];

  // サポートするステータスコードの検証マップ
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

  const finalStatus = statusMap[st];

  // 10種類のエラーパスに該当する場合の特別内部ルーティング
  if (finalStatus) {
    // 内部的にメインの index.html データを読み出し
    const assetUrl = new URL('/index.html', url.origin);
    const response = await context.env.ASSETS.fetch(assetUrl);

    // 本物のエラーコード（404, 503など）をヘッダーにセットして返却
    return new Response(response.body, {
      status: finalStatus,
      headers: response.headers
    });
  }

  // 静的アセット（JS, CSS, 画像など）や該当しない普通のパスはそのまま通過
  return context.next();
}
