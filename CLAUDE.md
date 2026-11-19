# Project rules

## Footer credit (applies to every website we build)

Every website must carry a "Website by AlmLab" credit on its own row at the
very bottom-right of the footer, as the last thing inside `<footer>`. The whole
"Website by AlmLab" text is one link to our website, not just the word "AlmLab".

- Text: `Website by AlmLab`
- Link: `https://almlabmarketing.com`
- Open in a new tab: `target="_blank" rel="noopener"`
- Style: glowing neon green wording (`#5dff7f` with a soft green text-shadow glow),
  set inline so it doesn't depend on the site's stylesheet.
- On a light footer, put the wording in a small dark pill so the glow stays readable.
- If a floating button (WhatsApp, call, back-to-top) sits in the bottom-right corner,
  add bottom padding to the row so the button never covers the credit.

Example:

```html
<div class="almlab-credit-row" style="display:flex;justify-content:flex-end;padding:16px 24px 18px"><a class="almlab-credit" href="https://almlabmarketing.com" target="_blank" rel="noopener" style="color:#5dff7f;font-weight:600;font-size:13px;letter-spacing:.03em;text-decoration:none;white-space:nowrap;text-shadow:0 0 4px rgba(93,255,127,.95),0 0 10px rgba(57,255,106,.6),0 0 22px rgba(57,255,106,.35)">Website by AlmLab</a></div>
```

Never remove this credit when editing or rebuilding a footer.
