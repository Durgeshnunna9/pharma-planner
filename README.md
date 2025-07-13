# Pharma Flow Planner Pro

A comprehensive pharmaceutical manufacturing management system built with React, TypeScript, and modern UI components.

## 🚀 Features

### Product Management
- **Product Catalog**: Browse and search through pharmaceutical products
- **Product Details**: Click on any product to view detailed information
- **Add Products**: Add new products with comprehensive form validation
- **Search & Filter**: Search products by name, description, or category
- **Category Support**: Separate products for Human and Veterinary use

### User Interface
- **Modern Design**: Clean, responsive interface using Tailwind CSS
- **Interactive Cards**: Hover effects and clickable product cards
- **Floating Modals**: Detailed product information in elegant dialogs
- **Toast Notifications**: User feedback for all actions
- **Responsive Layout**: Works on desktop, tablet, and mobile

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Data**: Local JSON file (product.js)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/pharma-flow-planner-pro.git
   cd pharma-flow-planner-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:8080](http://localhost:8080)

## 🏗️ Project Structure

```
pharma-flow-planner-pro/
├── src/
│   ├── components/
│   │   ├── ProductsTab.tsx      # Main product management
│   │   ├── ProductionTab.tsx    # Production management
│   │   ├── DashboardTab.tsx     # Dashboard
│   │   └── ui/                  # shadcn/ui components
│   ├── data/
│   │   └── product.js           # Product data
│   ├── hooks/
│   │   └── use-toast.ts         # Toast notifications
│   ├── App.tsx                  # Main app component
│   └── main.tsx                 # Entry point
├── public/                      # Static assets
├── package.json                 # Dependencies
├── tailwind.config.ts           # Tailwind configuration
└── README.md                    # This file
```

## 🎯 Usage

### Product Management
1. **View Products**: Browse the product catalog on the Products tab
2. **Search Products**: Use the search bar to find specific products
3. **View Details**: Click on any product card to see detailed information
4. **Add Products**: Click "Add Product" to create new products

### Product Details Modal
- **Product Information**: View complete product details
- **Packing Sizes**: See all available packaging options
- **Reference Data**: Access internal references and IDs
- **Actions**: Placeholder buttons for future features

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Adding New Features
1. Create new components in `src/components/`
2. Add data to `src/data/` if needed
3. Update the main App.tsx to include new tabs
4. Test thoroughly before committing

## 📊 Data Structure

Products are stored in `src/data/product.js` with the following structure:
```javascript
{
  external_id: "P001",
  product_name: "Product Name",
  category: "Human" | "Veterinary",
  internal_reference: "REF: DL-001",
  sales_description: "Product description",
  packing_sizes: ["60ml", "100ml"],
  uqc: "unit"
}
```

## 🚧 Roadmap

### Planned Features
- [ ] **Product Editing**: Edit existing products
- [ ] **Production Orders**: Create and manage manufacturing orders
- [ ] **Excel Import**: Import product data from Excel files
- [ ] **User Authentication**: Login and user management
- [ ] **Database Integration**: Connect to Firebase or other database
- [ ] **Advanced Filtering**: Filter by category, size, etc.
- [ ] **Product Images**: Add product photos
- [ ] **Export Functionality**: Export data to various formats

### Technical Improvements
- [ ] **State Management**: Implement Redux or Zustand
- [ ] **API Integration**: Connect to backend services
- [ ] **Testing**: Add unit and integration tests
- [ ] **Performance**: Optimize for large datasets
- [ ] **Accessibility**: Improve accessibility features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@pharmaflowplanner.com or create an issue in this repository.

---

**Built with ❤️ for the pharmaceutical industry**
