# Where in the World Do You Belong?

A free astrocartography calculator. Enter your birth date, time, and birthplace time zone, and discover the cities on Earth where your planetary lines shine brightest, with a full world map of your Sun, Moon, Mercury, Venus, Mars, Jupiter, and Saturn lines.

**Live site:** https://brittanynation.github.io/where-in-the-world-do-you-belong/

## How it works

1. Your birth details are converted to an exact UTC moment (daylight saving handled automatically).
2. Planetary positions are computed in your browser with Paul Schlyter's public-domain algorithm (sub-arcminute accuracy, validated against the Swiss Ephemeris).
3. For each planet, the longitudes where it stood on your Ascendant, Midheaven, Descendant, and IC are drawn as lines across a world map.
4. 122 cities are scored by how closely your Sun, Jupiter, and Venus lines pass, and your top 8 are ranked with plain-language interpretations.

Everything runs client-side. No data ever leaves the page.

## Files

- `index.html` — page + birth-details form
- `styles.css` — blush/pink/cream theme
- `astro.js` — planetary math + astrocartography line engine (also loads in Node for testing)
- `cities.js` — 122-city database
- `interpretations.js` — original line interpretations
- `app.js` — UI, map rendering, city scoring

## Run locally

Open `index.html` in any modern browser (internet needed once for the map coastline data).

## Notes

Astrocartography is a tool for reflection and fun, not a directive. The best place is still the one you love.
