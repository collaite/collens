# 🎨 Version Comparison Heatmap - Quick Start Guide

## 🚀 How to Access the Heatmap

### Option 1: Demo Mode (Recommended for First-Time Users)

1. **Start the development server:**
   ```bash
   bun dev
   ```

2. **Navigate to the Demo page:**
   - Open your browser to `http://localhost:5173/demo`
   - Or click the "🎨 Demo" link in the navigation bar

3. **Launch the Heatmap Demo:**
   - Click the **"🚀 Launch Heatmap Demo"** button
   - This loads a comprehensive example with all color variations

4. **Switch to Heatmap View:**
   - Look for the view toggle buttons: `[Table View] [Heatmap View]`
   - Click **"Heatmap View"**
   - The heatmap visualization will appear!

### Option 2: Using Your Own Documents

1. **Upload documents** through the main interface
2. **Navigate to a document** with multiple witnesses
3. **Go to the CollateX page:** Click the alignment/comparison button
4. **Switch to Heatmap View:** Click the "Heatmap View" button

## 🎯 What You'll See

### Color Legend
- 🟢 **Green**: Identical text (0% difference)
- 🔵 **Blue**: Minor changes (1-25% difference)
- 🟡 **Yellow**: Moderate changes (26-50% difference)
- 🟠 **Orange**: Major changes (51-75% difference)
- 🔴 **Red**: Complete rewrites (76-100% difference)

### Interactive Features

#### Hover Over Cells
- See witness IDs (W1, W3, W14, etc.)
- View average difference percentages
- Get quick comparison stats

#### Click on Cells
Opens a detailed popover showing:
- Current witness text
- All other witness versions
- Difference percentages for each comparison
- Full text content (not truncated)

#### Toggle Controls
- **View Mode**: Switch between Table and Heatmap
- **Orientation**: Toggle horizontal/vertical layout
- **Witness Filter**: Enable/disable specific witnesses

## 📍 Direct URLs

### Demo with Mock Data
```
http://localhost:5173/document/x?demo=true
```

### Your Document
```
http://localhost:5173/document/x?id=[your-document-id]
```

## 🎭 Demo Data Features

The demo showcases:
1. **Identical text** across all witnesses (Position 1, 7)
2. **Minor punctuation** differences (Position 2)
3. **Word substitutions** (Position 3)
4. **Phrase replacements** (Position 4)
5. **Complete rewrites** (Position 5)
6. **Outlier witnesses** (Position 9)
7. **Empty cells** handling (Position 11)
8. **Long text truncation** (Position 12)

## 💡 Pro Tips

1. **Start with vertical orientation** for an overview
2. **Click red/orange cells first** to find major variations
3. **Use horizontal orientation** when comparing few witnesses
4. **Toggle witnesses on/off** to focus comparisons
5. **Hover before clicking** to preview difference levels

## 🛠️ Troubleshooting

### Can't see the heatmap?
- Ensure you clicked "Heatmap View" (not "Table View")
- Check that alignment data has loaded
- Try the demo mode first to verify it works

### Colors not showing?
- Make sure you have multiple witnesses enabled
- Verify witnesses contain different text
- Check browser console for errors

### Performance issues?
- Reduce number of active witnesses
- Use Chrome/Firefox for best performance
- Close other heavy applications

## 📚 Full Documentation

For comprehensive documentation, visit:
`http://localhost:5173/docs/heatmap-comparison`

## 🎉 Quick Test

1. Go to: `http://localhost:5173/demo`
2. Click: "🚀 Launch Heatmap Demo"
3. Click: "Heatmap View"
4. Click any colored cell
5. Enjoy the visualization!

---

**Need help?** Check the full documentation or open an issue on GitHub.