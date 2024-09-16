# ConvImg - Better Cover Image Generator

[![GitHub stars](https://img.shields.io/github/stars/sylvor-pro/conv-img)](https://github.com/sylvor-pro/conv-img/stargazers)

## Overview

***ConvImg*** is a powerful cover image generator designed for bloggers, content creators, developers, and designers. Create professional and stunning cover images in just a few steps for Medium, YouTube, BiliBili, personal blogs, and other platforms.



## ✨ Key Features


- 🖼️ **Rich Image Resources** - Access high-quality images directly through the Unsplash API
- 🎨 **Flexible Editing** - Customize titles, author info, fonts, colors, and transparency
- 📱 **Multiple Aspect Ratios** - Support for both landscape and portrait formats for different platforms
- 🔍 **Real-time Preview** - See all changes instantly with a WYSIWYG interface
- 🌈 **Developer Icons** - Built-in tech-related icons perfect for technical article covers
- 📥 **Multiple Export Formats** - Support for JPG, PNG, and SVG exports
- 🌐 **Multilingual Support** - Interface available in multiple languages
- 🎯 **Responsive Design** - Perfectly adapts to both desktop and mobile devices


## 🚀 Getting Started


### Installation

```bash
# Clone the repository
git clone https://github.com/sylvor-pro/conv-img.git

# Navigate to the project directory
cd conv-img

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with the following content:

```bash
UNSPLASH_API_KEY = your_unsplash_api_key
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id
```

## Deploy with Docker


```sh
docker run -d --name conv-img -e UNSPLASH_API_KEY=xxx -p 3000:3000 hausen1012/ConvImg
```

## Built By 

    sylvor-pro ( William Moore )

## Contact Info

*phone* : +1 408 521 9934
*email* : william.moore.9115@gmail.com