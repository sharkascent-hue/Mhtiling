# Project rules

## Footer credit (applies to every website we build)

Every website must carry a small "Website by" + AlmLab logo credit on its own row,
centred at the very bottom of the footer, as the last thing inside `<footer>`.
The whole credit is one link to our website.

- Link: `https://almlabmarketing.com`, opened in a new tab (`target="_blank" rel="noopener"`)
- Logo: `https://almlabmarketing.com/almlab-credit.png` (transparent, white "Alm" + glowing green "Lab")
  for dark footers; `https://almlabmarketing.com/almlab-credit-dark.png` (dark "Alm") for light footers.
  Never put it in a box or pill; the background stays transparent.
- Size: logo 28px tall (the image includes its glow), "Website by" in 11px text (white at 55% on dark footers, black at 55% on light).
- Spacing: keep it tight, `padding:12px 16px 4px`; no big gap under it.
- Styles are inline so they don't depend on the site's stylesheet.

Example (dark footer):

```html
<div class="almlab-credit-row" style="display:flex;justify-content:center;padding:12px 16px 4px"><a class="almlab-credit" href="https://almlabmarketing.com" target="_blank" rel="noopener" aria-label="Website by AlmLab" style="display:inline-flex;align-items:center;gap:3px;color:rgba(255,255,255,.55);font-size:11px;letter-spacing:.06em;line-height:1;text-decoration:none;white-space:nowrap"><span>Website by</span><img src="https://almlabmarketing.com/almlab-credit.png" alt="AlmLab" width="74" height="28" loading="lazy" style="height:28px;width:auto;display:block"></a></div>
```

Never remove this credit when editing or rebuilding a footer.
