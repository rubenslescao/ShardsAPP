# GoalSync 💑

A premium couples goal-setting platform to collaboratively set, track, and achieve shared life goals together.

## ✨ Features

- 👥 **Couples Account System** - Shared account with both partner names
- 🎯 **Goal Management** - Create, edit, complete, and archive goals
- 📊 **4 Life Categories**:
  - ❤️ Dates & Relationship Goals
  - 🤸 Fitness & Wellness Goals
  - 🎓 Skill-Up & Career Goals
  - 🏝️ Adventure & Travel Goals
- ⏱️ **3 Timeframes** with auto-calculated deadlines:
  - Short-term (0-3 months)
  - Mid-term (3-6 months)
  - Long-term (6+ months)
- 📈 **Analytics Dashboard** - Visual progress tracking with beautiful charts
- 🎉 **Celebration Animations** - Confetti when you complete goals!
- 📱 **Fully Responsive** - Works perfectly on mobile and desktop
- 🌙 **Premium Dark Mode** - Beautiful glassmorphic design
- ⚡ **Lightning Fast** - Under 2 second load times

## 🚀 Quick Start

### 1. Start the Server

Since this app uses ES6 modules, you need to serve it via HTTP:

```bash
cd /Users/hubi006/Desktop/GoalSync
python3 server.py
```

### 2. Open in Browser

Navigate to: **http://localhost:8000**

### 3. Create Your Account

- Enter both partner names
- Provide email and password
- Click "Create Account"

### 4. Start Setting Goals!

- Click "+ Create Goal"
- Fill in the details
- Track your progress together

## 📁 Project Structure

```
GoalSync/
├── index.html              # Main entry point
├── src/
│   ├── main.js            # App initialization
│   ├── styles/            # Design system & CSS
│   ├── data/              # Data models & services
│   ├── router/            # Client-side routing
│   ├── components/        # Reusable UI components
│   └── pages/             # Application pages
└── README.md
```

## 🛠️ Technology Stack

- **Pure Vanilla JavaScript** - No frameworks, just ES6 modules
- **CSS3** - Custom properties, Grid, Flexbox, animations
- **LocalStorage** - Client-side data persistence
- **Client-side Router** - SPA navigation

## 📱 Browser Support

Works on all modern browsers:
- Chrome/Edge (latest)
- Safari (macOS/iOS)
- Firefox (latest)
- Mobile browsers

## 🎨 Design Highlights

- **Premium dark mode** with vibrant accent colors
- **Glassmorphism effects** for modern aesthetic
- **Smooth micro-animations** on all interactions
- **Inter font** from Google Fonts
- **Responsive grid layouts** that adapt to any screen size

## 🔒 Data & Privacy

All data is stored locally in your browser using LocalStorage:
- No external servers or databases
- No tracking or analytics
- Data stays on your device
- Easy to export or clear

## 📚 Usage Guide

### Creating Goals

1. Click "+ Create Goal"
2. Enter a clear, specific title
3. Add description and notes
4. Select category and timeframe
5. Click "Create Goal"

### Managing Goals

- **Start Goal**: Move to "In Progress" status
- **Complete Goal**: Mark as done (triggers celebration!)
- **Edit Goal**: Modify any details
- **Archive Goal**: Remove from active view

### Filtering

Use the filter buttons to:
- View specific categories
- Filter by timeframe
- See goals by status
- Combine multiple filters

### Analytics

Navigate to Analytics to see:
- Overall completion rate
- Goals breakdown by category
- Timeframe distribution
- Achievement badges

## 🚀 Deployment

### Static Hosting (Recommended)

Deploy to any static host:
- **Netlify**: Drag and drop the folder
- **Vercel**: Connect to GitHub
- **GitHub Pages**: Push to gh-pages branch
- **Cloudflare Pages**: One-click deployment

### Local Network

Share with partner on local network:
```bash
python3 server.py
# Access from other devices at: http://YOUR_IP:8000
```

## 🎯 Future Enhancements

Potential improvements for v2:
- Backend integration (Firebase/Supabase)
- Separate logins for each partner
- Photo uploads for goals
- Push notifications
- PWA support for offline access
- Goal templates
- Export to PDF

## 📄 License

This project is built as an MVP for couples goal-setting. Feel free to customize and extend it!

## 🤝 Contributing

Want to improve GoalSync? Ideas welcome:
- Add new categories
- Improve animations
- Add more analytics charts
- Enhance mobile experience

## 💡 Tips for Success

1. **Start small** - 2-3 goals per category max
2. **Be specific** - Clear goals are more likely to be completed
3. **Use shared notes** - Document your progress together
4. **Celebrate wins** - Enjoy the confetti animation!
5. **Review weekly** - Check analytics to stay motivated

---

Built with ❤️ for couples who dream together and achieve together.
