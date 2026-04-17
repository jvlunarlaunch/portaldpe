<?php
/**
 * og.php — Injeta Open Graph meta tags para bots do WhatsApp, Telegram, etc.
 *
 * Como funciona:
 *   1. O .htaccess redireciona /article/SLUG para este script (apenas bots)
 *   2. O script busca o artigo no Supabase via API REST
 *   3. Retorna o index.html com as OG tags injetadas
 *   4. Navegadores normais nunca chegam aqui (vão direto ao index.html via SPA)
 */

// Supabase public credentials (anon key é segura para expor — já está no bundle JS)
define('SUPABASE_URL', 'https://dldsnfzqguoewnyxkxay.supabase.co');
define('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsZHNuZnpxZ3VvZXdueXhreGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0NDEyOTksImV4cCI6MjA2MTAxNzI5OX0.3zsl_E60gN-Gfzv2T1hmYGyS0-xpxmwkPOMquNH1kpY');

// Bots de redes sociais que leem OG tags
$botPatterns = [
    'whatsapp', 'facebookexternalhit', 'facebot', 'twitterbot',
    'linkedinbot', 'telegrambot', 'slackbot', 'discordbot',
    'googlebot', 'bingbot', 'applebot', 'ia_archiver',
    'rogerbot', 'embedly', 'pinterest', 'vkshare',
];

$userAgent = strtolower($_SERVER['HTTP_USER_AGENT'] ?? '');
$isBot = false;
foreach ($botPatterns as $bot) {
    if (str_contains($userAgent, $bot)) {
        $isBot = true;
        break;
    }
}

// Pega o slug da URL: /article/meu-artigo → meu-artigo
$slug = trim($_GET['slug'] ?? '');
$slug = preg_replace('/[^a-z0-9\-_]/', '', $slug); // sanitiza

$indexPath = __DIR__ . '/index.html';

if (!$isBot || empty($slug)) {
    // Navegador normal: serve o SPA
    readfile($indexPath);
    exit;
}

// Bot: busca artigo no Supabase
$apiUrl = SUPABASE_URL . '/rest/v1/articles_portaldpe'
    . '?slug=eq.' . urlencode($slug)
    . '&status=eq.published'
    . '&select=title,excerpt,image_url,slug'
    . '&limit=1';

$ch = curl_init($apiUrl);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'apikey: ' . SUPABASE_ANON_KEY,
        'Authorization: Bearer ' . SUPABASE_ANON_KEY,
    ],
    CURLOPT_TIMEOUT => 5,
]);
$response = curl_exec($ch);
curl_close($ch);

$articles = json_decode($response, true);
$article = $articles[0] ?? null;

if (!$article) {
    readfile($indexPath);
    exit;
}

// Monta URL canônica do artigo
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'];
$articleUrl = "{$protocol}://{$host}/article/{$slug}";

// Escapa valores para uso em HTML
function esc(string $str): string {
    return htmlspecialchars($str, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

$title       = esc($article['title'] ?? '');
$description = esc($article['excerpt'] ?? '');
$imageUrl    = esc($article['image_url'] ?? '');
$articleUrl  = esc($articleUrl);

// Monta bloco de OG tags
$ogTags = <<<HTML
  <meta property="og:site_name" content="Portal DPE" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="{$title}" />
  <meta property="og:description" content="{$description}" />
  <meta property="og:url" content="{$articleUrl}" />
HTML;

if ($imageUrl) {
    $ogTags .= <<<HTML

  <meta property="og:image" content="{$imageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="{$title}" />
HTML;
}

$ogTags .= <<<HTML

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{$title}" />
  <meta name="twitter:description" content="{$description}" />
HTML;

if ($imageUrl) {
    $ogTags .= "\n  <meta name=\"twitter:image\" content=\"{$imageUrl}\" />";
}

// Injeta no index.html
$html = file_get_contents($indexPath);

// Remove OG/Twitter tags padrão do index.html para evitar duplicatas
$html = preg_replace('/<meta\s[^>]*(property="og:[^"]*"|name="twitter:[^"]*")[^>]*>\s*/i', '', $html);

$html = preg_replace('/<title>[^<]*<\/title>/', "<title>{$title} | Portal DPE</title>", $html);
$html = str_replace('</head>', $ogTags . "\n</head>", $html);

header('Content-Type: text/html; charset=utf-8');
echo $html;
