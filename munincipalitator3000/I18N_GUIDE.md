# Internationalization (i18n) Guide

Your Next.js application now supports **English** and **Dutch** using `next-intl`.

## 🌍 How It Works

The application automatically detects the user's preferred language and displays content accordingly. Users can also manually switch between languages using the language switcher buttons.

## 📁 Project Structure

```
munincipalitator3000/
├── app/
│   ├── [locale]/                    # Locale-specific routes
│   │   ├── layout.tsx               # Layout with i18n provider
│   │   ├── page.tsx                 # Homepage with translations
│   │   └── events/                  # Events pages with translations
│   └── layout.tsx                   # Minimal root layout
├── i18n/
│   ├── routing.ts                   # Routing configuration (locales, default)
│   └── request.ts                   # Request configuration (message loading)
├── messages/
│   ├── en.json                      # English translations
│   └── nl.json                      # Dutch translations
├── components/
│   └── LanguageSwitcher.tsx         # Language switcher component
└── middleware.ts                    # Locale detection middleware
```

## 🔗 URLs

- English: `http://localhost:3000/en`
- Dutch: `http://localhost:3000/nl`

When users visit `http://localhost:3000`, they'll be automatically redirected to their preferred language based on browser settings.

## 📝 Adding Translations

### 1. Add Translation Keys

Add your translation keys to both language files:

**messages/en.json:**
```json
{
  "HomePage": {
    "title": "Welcome",
    "description": "This is the homepage"
  }
}
```

**messages/nl.json:**
```json
{
  "HomePage": {
    "title": "Welkom",
    "description": "Dit is de homepage"
  }
}
```

### 2. Use Translations in Components

```tsx
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('HomePage');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

## 🔄 Language Switcher

The `LanguageSwitcher` component is already included on all pages. It allows users to switch between English and Dutch.

## 🚀 Running the Application

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

## 🎯 Key Features

1. **Automatic Language Detection**: Browser language preferences are automatically detected
2. **URL-based Locales**: Each language has its own URL path (`/en`, `/nl`)
3. **Type-safe Navigation**: Using `Link`, `useRouter`, and `usePathname` from `@/i18n/routing`
4. **Easy Translation Management**: All translations in JSON files

## 🛠️ Technical Details

- **Framework**: Next.js 16 with App Router
- **i18n Library**: next-intl 4.5.0
- **Default Locale**: English (en)
- **Supported Locales**: English (en), Dutch (nl)
- **Locale Prefix**: Always included in URLs for consistency

## 📚 Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)

