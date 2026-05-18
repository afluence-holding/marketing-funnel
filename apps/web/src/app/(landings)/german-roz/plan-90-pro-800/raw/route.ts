import { GET as getOriginalLanding } from '../../plan-90-pro/raw/route';

function overridePrice(html: string) {
  return html
    .replace(/\$650 USD/g, '$800 USD')
    .replace(/SÍ, QUIERO EMPEZAR HOY POR \$650/g, 'SÍ, QUIERO EMPEZAR HOY POR $800')
    .replace(/>\s*650(<span style="font-size:0\.35em; color:rgba\(255,255,255,0\.5\)">USD<\/span>)/g, '>800$1')
    .replace(/Ahorras \$450 USD/g, 'Ahorras $300 USD')
    .replace(
      /https:\/\/whop\.com\/checkout\/1U9SFTVfwaUqxtbLa1-cIsC-aWVj-Ok3M-sHjDntR15Rcl\//g,
      'https://whop.com/checkout/plan_QlDoR6wsD07O7',
    );
}

export async function GET() {
  const originalResponse = await getOriginalLanding();
  const originalHtml = await originalResponse.text();
  const updatedHtml = overridePrice(originalHtml);

  return new Response(updatedHtml, {
    status: originalResponse.status,
    headers: originalResponse.headers,
  });
}
