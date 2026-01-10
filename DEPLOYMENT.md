# Deployment Guide

## Quick Start - Local Testing

Your app is ready to run! Here are three ways to test it locally:

### Option 1: Python HTTP Server (Recommended)
```bash
python -m http.server 8000
# Open http://localhost:8000 in your browser
```

### Option 2: Node.js HTTP Server
```bash
npx http-server
# Open http://localhost:8080 in your browser
```

### Option 3: VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## GitHub Pages Deployment

### Step 1: Push to GitHub
```bash
# If you haven't already
git remote add origin https://github.com/YOUR_USERNAME/friendly-octo-train.git

# Push your code
git push -u origin main
```

### Step 2: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings**
3. Scroll down to **Pages** (left sidebar)
4. Under "Source", select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**
6. Wait 1-2 minutes for deployment
7. Your site will be live at: `https://YOUR_USERNAME.github.io/friendly-octo-train`

## Testing Checklist

Before deploying, test these features:

### Core Functionality
- [ ] Fretboard renders correctly
- [ ] Key selector works (try C, F#, Bb)
- [ ] Scale selector works (try Major, Minor Pentatonic, Blues)
- [ ] Display mode toggles work (Notes → Degrees → Intervals)
- [ ] Notes appear on fretboard correctly
- [ ] Root notes are highlighted in red

### Chord Features
- [ ] Triads display correctly
- [ ] 7th chords display correctly
- [ ] Clicking a chord highlights its notes on fretboard
- [ ] Common progressions display
- [ ] Show chords toggle works

### Responsive Design
- [ ] Desktop view looks good (>1024px)
- [ ] Tablet view works (768-1024px)
- [ ] Mobile view works (<768px)
- [ ] Horizontal scroll works on mobile
- [ ] All controls are accessible

### Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Troubleshooting

### Issue: Blank page or errors
**Solution:** Open browser console (F12) and check for errors. Most likely:
- CORS issues: Use a local server, don't open file:// directly
- Module import errors: Ensure all file paths are correct

### Issue: Fretboard doesn't render
**Solution:**
- Check that Tailwind CSS CDN loaded (inspect network tab)
- Verify SVG container exists in DOM
- Check browser console for JavaScript errors

### Issue: Scales don't show notes
**Solution:**
- Verify scale data is loading correctly
- Check that ScaleEngine is generating positions
- Open console and look for error messages

### Issue: GitHub Pages shows 404
**Solution:**
- Wait 2-3 minutes after enabling Pages
- Verify branch and folder settings
- Check that index.html is in root directory
- Clear browser cache

## Performance Optimization

For production deployment, consider:

1. **Minify JavaScript**
   - Use a tool like Terser
   - Reduce file size by ~40%

2. **Optimize SVG**
   - The fretboard SVG is already optimized
   - No additional changes needed

3. **Add Service Worker**
   - Enable offline functionality
   - Cache static assets

4. **CDN Optimization**
   - Tailwind CSS is already served via CDN
   - Consider self-hosting for faster loads

## Custom Domain Setup

To use a custom domain with GitHub Pages:

1. Buy a domain (e.g., guitarscales.com)
2. In GitHub repo settings → Pages:
   - Enter your custom domain
   - Enable "Enforce HTTPS"
3. Add DNS records at your domain provider:
   ```
   Type: CNAME
   Host: www
   Value: YOUR_USERNAME.github.io

   Type: A
   Host: @
   Values:
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```
4. Wait for DNS propagation (up to 48 hours)

## Monitoring & Analytics

Add Google Analytics (optional):

1. Create GA4 property
2. Add this to `index.html` before `</head>`:
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## Security

This app is already secure because:
- ✅ No backend or database
- ✅ No user authentication
- ✅ No sensitive data storage
- ✅ All code is client-side
- ✅ No third-party scripts (except Tailwind CDN)

## Updates & Maintenance

To update the app:

1. Make changes locally
2. Test thoroughly
3. Commit and push:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```
4. GitHub Pages will auto-deploy in 1-2 minutes

## Support

If you encounter issues:

1. Check browser console for errors
2. Verify all files are present
3. Test in incognito/private mode
4. Try a different browser
5. Clear cache and reload

---

**Your app is ready to deploy! 🚀**
