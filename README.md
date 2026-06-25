# Budget Manager PWA

Offline-first személyes költségvetés-kezelő — ingyenes, szerver nélküli, telefonra telepíthető.

## Fájlszerkezet

```
index.html          — Teljes alkalmazás (HTML + CSS + JS)
manifest.json       — PWA manifest
service-worker.js   — Cache-first service worker
icon-192.svg        — App ikon (192px)
icon-512.svg        — App ikon (512px)
README.md           — Ez a fájl
```

---

## Lokális tesztelés

A service worker **nem működik** `file://` protokollról — HTTP szerver szükséges.

### Python (ajánlott)
```bash
cd budget-pwa/
python -m http.server 8080
# Megnyitás: http://localhost:8080
```

### Node.js (npx, telepítés nélkül)
```bash
npx serve .
```

### VS Code Live Server
Telepítsd a „Live Server" extension-t, jobb klikk az `index.html`-en → „Open with Live Server".

> **Fontos:** Chrome DevTools → Application → Service Workers → ✅ „Update on reload" jelöld be fejlesztés közben, hogy az SW mindig frissüljön.

---

## PWA telepítés mobilon

### Android — Chrome
1. Nyisd meg az appot Chrome-ban (`http://localhost:8080` vagy a szervered URL-je)
2. A böngésző alul mutat egy **„Telepítés"** bannert — nyomd meg
3. Ha nem jelenik meg: menü (⋮) → **„Hozzáadás a főképernyőhöz"**
4. Az app ikonja megjelenik a főképernyőn; megnyitva standalone módban fut (böngésző chrome nélkül)

### iPhone / iPad — Safari
1. Nyisd meg az appot **Safari**-ban (Chrome iOS nem támogatja a PWA telepítést)
2. Érintsd meg a **Megosztás** gombot (négyzet felfelé mutató nyíllal, képernyő alján)
3. Görgess le → **„Főképernyőhöz adás"** (Add to Home Screen)
4. Adj nevet, majd nyomd a **Hozzáadás** gombot
5. Az ikon megjelenik a főképernyőn — az app standalone módban nyílik meg

> **Megjegyzés iOS-en:** A service worker és az offline cache iOS 11.3+ óta támogatott. A `beforeinstallprompt` esemény Safariban nem tüzel — az app ezért a fejlécben mutat telepítési útmutatót.

---

## OCR — Bizonylat felismerés

### Ajánlott képformátum
- **Formátum:** JPG vagy PNG
- **Minimális felbontás:** 300 DPI (kb. 1200×800 px egy A5-ös bizonylathoz)
- **Megvilágítás:** egyenletes, árnyékmentes
- **Szín:** színes vagy szürkeárnyalatos egyaránt működik

### Hogyan működik
Az app a **Tesseract.js** könyvtárral on-device OCR-t futtat — semmilyen adat nem kerül szerverre.

1. Navigálj az **OCR** fülre
2. Koppints a feltöltési területre vagy húzd rá a képet
3. Várd meg a felismerést (néhány másodperc)
4. Az előtöltött form-ban ellenőrizd az összeget és a dátumot, javítsd ha szükséges
5. Mentés gombbal rögzítsd a tranzakciót

### Felismert minták
| Pénznem | Minta példa |
|---------|-------------|
| HUF     | `12 500 Ft`, `12500 HUF` |
| EUR     | `€ 12,50`, `€12.50` |
| USD     | `$12.50`, `$ 12,50` |
| Dátum   | `2024-03-15`, `15.03.2024`, `15/03/2024` |

Ha a felismerés sikertelen, az app megjeleníti a nyers szöveget és manuális kitöltést kér.

---

## Adattárolás

Minden adat az eszköz **IndexedDB** adatbázisában tárolódik. Szinkronizálás, regisztráció és internet-kapcsolat nem szükséges.

### Adatbázis törlése (reset)
Chrome DevTools → Application → Storage → Clear site data

---

## Fejlesztői megjegyzések

- Build tool nélküli, egyetlen `index.html` fájl
- A service worker az app gyökerében van (`./service-worker.js`) — scope: `./`
- CDN scriptek (Dexie, Chart.js, Tesseract.js) az első betöltés után cache-elődnek offline használatra
- Update flow: ha új SW vár, egy toast jelenik meg a „Frissítés / Újratöltés" gombbal
