# Budget Manager PWA

Offline-first személyes költségvetés-kezelő — szerver, regisztráció és internet-kapcsolat nélkül.

---

## Fájlstruktúra

```
index.html          — Teljes app (HTML + CSS + JS)
manifest.json       — PWA manifest
service-worker.js   — Cache-first service worker
icon-192.svg        — App ikon (192×192)
icon-512.svg        — App ikon (512×512)
README.md           — Ez a fájl
```

---

## Lokális tesztelés

A service worker `file://` protokollról **nem működik** — mindig HTTP szerveren futtasd.

```bash
# Python 3 (ajánlott)
python -m http.server 8080

# Majd nyisd meg böngészőben:
# http://localhost:8080
```

Alternatíva Node.js-sel:
```bash
npx serve .
```

---

## PWA telepítés mobilon

### Android — Chrome

1. Nyisd meg az appot Chrome-ban
2. Vár, amíg megjelenik a telepítési banner (általában 30 másodpercen belül), **vagy**
3. Nyomd a Chrome menüt (⋮) → **„Hozzáadás a kezdőképernyőhöz"**
4. Erősítsd meg a nevet → **Hozzáadás**
5. Az app ikonja megjelenik a kezdőképernyőn — ettől kezdve teljesen offline is működik

### iOS — Safari

1. Nyisd meg az appot **Safari**-ban (Chrome iOS-en nem támogatja a PWA telepítést)
2. Nyomd a **Megosztás** ikont (⬆️ ikon az alsó sávban)
3. Görgess le és válaszd: **„Főképernyőre adás"**
4. Adj nevet az appnak → **Hozzáadás**
5. Az app ikonja megjelenik a kezdőképernyőn

> **Megjegyzés iOS-re:** Az iOS Safari a service worker cache-t támogatja, de a `beforeinstallprompt` eseményt nem — ezért az automatikus telepítési banner helyett manuális lépések szükségesek.

---

## OCR tesztelés

Az OCR funkció (📷 Bizonylat beolvasás) a Tesseract.js könyvtárat használja, amely teljes egészében az eszközön fut — nincs adatfeltöltés.

**Ajánlott képformátum:**
- JPG vagy PNG
- Minimális felbontás: **800 × 600 px** (kisebb képen a felismerés pontatlan lehet)
- Jó kontrasztú, nem elhomályosított fotó

**Felismerési minták:**
- HUF: `1 234 Ft`, `1234 HUF`
- EUR: `€ 12,34`, `12.34€`
- USD: `$12.34`
- Dátum: `2024-03-15`, `15.03.2024`, `2024/03/15`

Az OCR eredmény mindig szerkeszthető előtöltött formban jelenik meg — az app soha nem ment automatikusan megerősítés nélkül.

---

## Technikai megjegyzések

- **Adattárolás:** IndexedDB (Dexie.js) — minden adat kizárólag a böngészőben tárolódik
- **Offline működés:** Az első betöltés után teljesen offline is fut
- **CDN-függőségek:** Dexie.js, Chart.js, Tesseract.js — első használat után a service worker cache-eli őket
- **Nincs backend, nincs fizetős API, nincs regisztráció**
