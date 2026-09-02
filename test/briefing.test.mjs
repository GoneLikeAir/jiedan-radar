import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

const root = resolve(import.meta.dirname, "..");
const facts = JSON.parse(readFileSync(resolve(root, "test/required-facts.json"), "utf8"));
const html = readFileSync(resolve(root, "index.html"), "utf8");
const css = readFileSync(resolve(root, "styles.css"), "utf8");

function hrefs(doc) {
  const found = [];
  const re = /href="([^"]+)"/g;
  let m;
  while ((m = re.exec(doc))) found.push(m[1]);
  return found;
}

test("title, research date, and social cards", () => {
  assert.match(html, /<title>接单雷达 · 2026-09-02<\/title>/);
  assert.match(html, /og:title" content="接单雷达 · 2026-09-02"/);
  assert.match(html, /twitter:card" content="summary_large_image"/);
  assert.match(html, /twitter:image" content="https:\/\/gonelikeair\.github\.io\/jiedan-radar\/public\/og\.png"/);
  assert.match(html, /og:image" content="https:\/\/gonelikeair\.github\.io\/jiedan-radar\/public\/og\.png"/);
  assert.match(html, /og:image:width" content="1200"/);
  assert.match(html, /og:image:height" content="630"/);
  assert.match(html, /rel="icon" href="public\/favicon\.svg"/);
  assert.match(html, /2026-09-02/);
  assert.match(html, /Asia\/Shanghai/);
});

test("favicon is geometric SVG and OG is 1200x630", () => {
  const fav = readFileSync(resolve(root, "public/favicon.svg"), "utf8");
  assert.match(fav, /viewBox="0 0 16 16"/);
  assert.match(fav, /circle/);
  assert.ok(!existsSync(resolve(root, "src")), "keep this a static page; no src/ tree");

  const png = readFileSync(resolve(root, "public/og.png"));
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
});

test("every source URL is a clickable href", () => {
  const links = hrefs(html);
  const missing = facts.urls.filter((url) => !links.includes(url));
  assert.deepEqual(missing, [], `missing hrefs:\n${missing.join("\n")}`);
});

test("every required price token is on the page", () => {
  const missing = facts.priceTokens.filter((token) => !html.includes(token));
  assert.deepEqual(missing, [], `missing price tokens:\n${missing.join("\n")}`);
});

test("required phrases and unofficial labels", () => {
  for (const phrase of facts.mustPhrases) {
    assert.ok(html.includes(phrase), `missing phrase: ${phrase}`);
  }
  for (const name of facts.mustLabelUnofficial) {
    assert.ok(html.includes(name), `missing source name: ${name}`);
  }
  assert.match(html, /非正式|编辑综述|how-to|非成交样|不是挂牌成交|不是知乎成交/);
  assert.match(html, /不是发票/);
});

test("missing CN channels are not listed as entries", () => {
  for (const name of facts.mustSayNotFound) {
    assert.ok(html.includes(name), name);
  }
  assert.match(html, /未找到/);
  assert.doesNotMatch(html, /豪赞云<\/h3>/);
});

test("real CSS filters for 推荐 / 国内 / 海外 / 陷阱", () => {
  assert.match(html, /<label for="f-rec">推荐<\/label>/);
  assert.match(html, /<label for="f-cn">国内<\/label>/);
  assert.match(html, /<label for="f-os">海外<\/label>/);
  assert.match(html, /<label for="f-trap">陷阱<\/label>/);
  assert.match(html, /type="radio" name="lane" id="f-rec"/);
  assert.match(css, /#f-rec:checked ~ \.app \[data-lanes\]:not\(\[data-lanes~="rec"\]\)/);
  assert.match(css, /#f-cn:checked ~ \.app \[data-lanes\]:not\(\[data-lanes~="cn"\]\)/);
  assert.match(css, /#f-os:checked ~ \.app \[data-lanes\]:not\(\[data-lanes~="os"\]\)/);
  assert.match(css, /#f-trap:checked ~ \.app \[data-lanes\]:not\(\[data-lanes~="trap"\]\)/);
  assert.match(html, /data-lanes="cn rec"/);
  assert.match(html, /data-lanes="os rec"/);
  assert.match(html, /data-lanes="trap/);
  assert.doesNotMatch(html, /<script/);
});

test("ticket IA fields exist", () => {
  const fieldCounts = {
    品类: (html.match(/<dt>品类<\/dt>/g) || []).length,
    平台: (html.match(/<dt>平台<\/dt>/g) || []).length,
    价位: (html.match(/<dt>价位<\/dt>/g) || []).length,
    AI交付: (html.match(/<dt>AI交付<\/dt>/g) || []).length,
    进入: (html.match(/<dt>进入<\/dt>/g) || []).length,
  };
  for (const [key, n] of Object.entries(fieldCounts)) {
    assert.ok(n >= 15, `${key} only appeared ${n} times`);
  }
  assert.match(html, /落地顺序/);
  assert.match(html, /闲鱼挂 3 个标品/);
  assert.match(html, /数字只收录能回溯 URL 的来源/);
});

test("usable at 390px, keyboard focus, reduced motion, named tokens", () => {
  assert.match(css, /@media \(max-width: 430px\)/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /--board-slate: #1A3A48/);
  assert.match(css, /--stamp-rose: #C43A6E/);
  assert.match(css, /--font-display/);
  assert.match(css, /--font-body/);
  assert.match(css, /--font-data/);
  assert.match(css, /overflow-x: hidden/);
  assert.match(html, /class="skip"/);
});

test("do not present BetOnAI invoice card as market rate", () => {
  assert.match(html, /不是 BetOnAI \$95–\$235 发票卡/);
  assert.match(html, /Freelancer\.com：没有已核实的 2026 中位数/);
});
