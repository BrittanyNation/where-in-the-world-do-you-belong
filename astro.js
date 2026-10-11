/* Where in the World Do You Belong — astro engine
 * Planetary positions via Paul Schlyter's public-domain algorithm
 * ("How to compute planetary positions", J2000 elements).
 * Good to ~1 arcminute for Sun/Moon/planets: plenty for astrocartography.
 */
"use strict";

const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const norm360 = d => ((d % 360) + 360) % 360;

// Orbital elements: [N, i, w, a, e, M] at J2000 + daily rates
// [N0, dN, i0, di, w0, dw, a, e0, de, M0, dM]
const ELEMENTS = {
  Sun:     [0, 0,           0, 0,          282.9404, 4.70935e-5,  1.0,     0.016709, -1.151e-9,  356.0470, 0.9856002585],
  Moon:    [125.1228, -0.0529538083, 5.1454, 0,    318.0634, 0.1643573223, 60.2666, 0.054900, 0,        115.3654, 13.0649929509],
  Mercury: [48.3313, 3.24587e-5,  7.0047, 5.00e-8,  29.1241, 1.01444e-5,  0.387098, 0.205635, 5.59e-10,  168.6562, 4.0923344368],
  Venus:   [76.6799, 2.46590e-5,  3.3946, 2.75e-8,  54.8910, 1.38374e-5,  0.723330, 0.006773, -1.302e-9, 48.0052, 1.6021304744],
  Mars:    [49.5574, 2.11081e-5,  1.8497, -1.78e-8, 286.5016, 2.92961e-5,  1.523688, 0.093405, 2.516e-9,  18.6021, 0.5240207766],
  Jupiter: [100.4542, 2.76854e-5, 1.3030, -1.557e-7,273.8777, 1.64505e-5,  5.20256,  0.048498, 4.469e-9,  19.8950, 0.0830853001],
  Saturn:  [113.6634, 2.38980e-5, 2.4886, -1.081e-7,339.3939, 2.97661e-5,  9.55475,  0.055546, -9.499e-9, 316.9670, 0.0334442282],
};
const PLANETS = ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn"];

function julianDay(y, m, d, uth /* hours */) {
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5 + uth / 24;
}

function planetRaDec(name, d /* days since 2000 Jan 0.0 */, Ms /* sun M */, Mm /* moon M */) {
  const e = ELEMENTS[name];
  const N = norm360(e[0] + e[1] * d), incl = e[2] + e[3] * d;
  const w = norm360(e[4] + e[5] * d), a = e[6];
  const ecc = e[7] + e[8] * d, M = norm360(e[9] + e[10] * d);

  // eccentric anomaly (degrees)
  let E = M + R2D * ecc * Math.sin(M * D2R) * (1 + ecc * Math.cos(M * D2R));
  for (let k = 0; k < 4; k++)
    E = E - (E - R2D * ecc * Math.sin(E * D2R) - M) / (1 - ecc * Math.cos(E * D2R));

  const xv = a * (Math.cos(E * D2R) - ecc);
  const yv = a * Math.sqrt(1 - ecc * ecc) * Math.sin(E * D2R);
  const v = Math.atan2(yv, xv) * R2D, r = Math.hypot(xv, yv);

  const vw = (v + w) * D2R, Nd = N * D2R, id = incl * D2R;
  const xh = r * (Math.cos(Nd) * Math.cos(vw) - Math.sin(Nd) * Math.sin(vw) * Math.cos(id));
  const yh = r * (Math.sin(Nd) * Math.cos(vw) + Math.cos(Nd) * Math.sin(vw) * Math.cos(id));
  const zh = r * Math.sin(vw) * Math.sin(id);

  let lon = Math.atan2(yh, xh) * R2D, lat = Math.atan2(zh, Math.hypot(xh, yh)) * R2D;

  if (name !== "Sun" && name !== "Moon") return planetGeocentric(name, d, Ms, Mm);
  // Sun and Moon are already geocentric here

  // lunar perturbations
  if (name === "Moon") {
    const sE = ELEMENTS.Sun;
    const Ls = norm360(norm360(sE[9] + sE[10] * d) + norm360(sE[4] + sE[5] * d)); // sun mean longitude
    const Lm = norm360(N + w + M);                                                // moon mean longitude
    const D = norm360(Lm - Ls);                                                   // mean elongation
    const F = norm360(Lm - N);                                                    // argument of latitude
    const dD = D * D2R, dM = M * D2R, dMs = Ms * D2R, dF = F * D2R, dMm = Mm * D2R;
    lon += -1.274 * Math.sin(dMm - 2 * dD) + 0.658 * Math.sin(2 * dD)
         - 0.186 * Math.sin(dMs) - 0.059 * Math.sin(2 * dMm - 2 * dD)
         - 0.057 * Math.sin(dMm - 2 * dD + dMs);
    lat += -0.173 * Math.sin(dF - 2 * dD) - 0.055 * Math.sin(dMm - dF - 2 * dD)
         - 0.046 * Math.sin(dMm + dF - 2 * dD) + 0.033 * Math.sin(dF + 2 * dD)
         + 0.017 * Math.sin(2 * dMm + dF);
  }
  if (name === "Jupiter") {
    const dMj = M * D2R, dMs = Ms * D2R;
    lon += -0.332 * Math.sin(2 * dMj - 5 * dMs - 67.6 * D2R)
         - 0.056 * Math.sin(2 * dMj - 2 * dMs + 21 * D2R)
         + 0.042 * Math.sin(3 * dMj - 5 * dMs + 21 * D2R);
  }
  if (name === "Saturn") {
    const dMj = norm360(19.8950 + 0.0830853001 * d) * D2R, dMs = Ms * D2R;
    lon += 0.812 * Math.sin(2 * dMj - 5 * dMs - 67.6 * D2R)
         - 0.229 * Math.sin(2 * dMs - 4 * dMj - 2 * D2R)
         + 0.119 * Math.sin(dMs - 2 * dMj)
         + 0.046 * Math.sin(2 * dMs - 6 * dMj - 49 * D2R);
  }

  const ecl = (23.4393 - 3.563e-7 * d) * D2R;
  const lonr = lon * D2R, latr = lat * D2R;
  const xe = Math.cos(lonr), ye = Math.sin(lonr) * Math.cos(ecl) - Math.sin(latr) * Math.sin(ecl);
  const ze = Math.sin(lonr) * Math.sin(ecl) + Math.sin(latr) * Math.cos(ecl);
  return { ra: norm360(Math.atan2(ye, xe) * R2D), dec: Math.atan2(ze, Math.hypot(xe, ye)) * R2D,
           lon: norm360(lon), _lon: norm360(lon) };
}

// Geocentric position for planets: heliocentric + Sun's geocentric vector
function planetGeocentric(name, d, Ms, Mm) {
  const e = ELEMENTS[name];
  const N = norm360(e[0] + e[1] * d), incl = (e[2] + e[3] * d) * D2R;
  const w = norm360(e[4] + e[5] * d), a = e[6];
  const ecc = e[7] + e[8] * d, M = norm360(e[9] + e[10] * d);
  let E = M + R2D * ecc * Math.sin(M * D2R) * (1 + ecc * Math.cos(M * D2R));
  for (let k = 0; k < 4; k++)
    E = E - (E - R2D * ecc * Math.sin(E * D2R) - M) / (1 - ecc * Math.cos(E * D2R));
  const xv = a * (Math.cos(E * D2R) - ecc);
  const yv = a * Math.sqrt(1 - ecc * ecc) * Math.sin(E * D2R);
  const v = Math.atan2(yv, xv) * R2D, r = Math.hypot(xv, yv);
  const vw = (v + w) * D2R, Nd = N * D2R;
  const xh = r * (Math.cos(Nd) * Math.cos(vw) - Math.sin(Nd) * Math.sin(vw) * Math.cos(incl));
  const yh = r * (Math.sin(Nd) * Math.cos(vw) + Math.cos(Nd) * Math.sin(vw) * Math.cos(incl));
  const zh = r * Math.sin(vw) * Math.sin(incl);
  // Sun geocentric (Earth's orbital elements give Sun as seen from Earth)
  const se = ELEMENTS.Sun;
  const sw = norm360(se[4] + se[5] * d), sa = se[6];
  const secc = se[7] + se[8] * d, sM = norm360(se[9] + se[10] * d);
  let sE = sM + R2D * secc * Math.sin(sM * D2R) * (1 + secc * Math.cos(sM * D2R));
  for (let k = 0; k < 4; k++)
    sE = sE - (sE - R2D * secc * Math.sin(sE * D2R) - sM) / (1 - secc * Math.cos(sE * D2R));
  const sxv = sa * (Math.cos(sE * D2R) - secc), syv = sa * Math.sqrt(1 - secc * secc) * Math.sin(sE * D2R);
  const sv = Math.atan2(syv, sxv) * R2D, sr = Math.hypot(sxv, syv);
  const svw = (sv + sw) * D2R;
  const xs = sr * Math.cos(svw), ys = sr * Math.sin(svw); // geocentric Sun, ecliptic plane
  const xg = xh + xs, yg = yh + ys, zg = zh;
  let lon = Math.atan2(yg, xg) * R2D, lat = Math.atan2(zg, Math.hypot(xg, yg)) * R2D;
  if (name === "Jupiter") {
    const dMj = M * D2R, dMs = Ms * D2R;
    lon += -0.332 * Math.sin(2 * dMj - 5 * dMs - 67.6 * D2R)
         - 0.056 * Math.sin(2 * dMj - 2 * dMs + 21 * D2R)
         + 0.042 * Math.sin(3 * dMj - 5 * dMs + 21 * D2R);
  }
  if (name === "Saturn") {
    const dMj = norm360(19.8950 + 0.0830853001 * d) * D2R, dMs = Ms * D2R;
    lon += 0.812 * Math.sin(2 * dMj - 5 * dMs - 67.6 * D2R)
         - 0.229 * Math.sin(2 * dMs - 4 * dMj - 2 * D2R)
         + 0.119 * Math.sin(dMs - 2 * dMj)
         + 0.046 * Math.sin(2 * dMs - 6 * dMj - 49 * D2R);
  }
  const ecl = (23.4393 - 3.563e-7 * d) * D2R;
  const lonr = lon * D2R, latr = lat * D2R;
  const xe = Math.cos(lonr), ye = Math.sin(lonr) * Math.cos(ecl) - Math.sin(latr) * Math.sin(ecl);
  const ze = Math.sin(lonr) * Math.sin(ecl) + Math.sin(latr) * Math.cos(ecl);
  return { ra: norm360(Math.atan2(ye, xe) * R2D), dec: Math.atan2(ze, Math.hypot(xe, ye)) * R2D,
           lon: norm360(lon), _lon: norm360(lon) };
}

// Main entry: birth UTC components -> { planets: {name: {ra, dec, lon}}, gmstDeg }
function computeChart(y, mo, day, uth) {
  const jd = julianDay(y, mo, day, uth);
  const d = jd - 2451543.5; // days since 2000 Jan 0.0
  const Ms = norm360(356.0470 + 0.9856002585 * d);
  const Mm = norm360(115.3654 + 13.0649929509 * d);
  const planets = {};
  for (const p of PLANETS) planets[p] = planetRaDec(p, d, Ms, Mm);
  // GMST at 0h + UT progression
  const d0 = Math.floor(jd - 0.5) + 0.5 - 2451543.5 + 0; // d at 0h UT
  const dd0 = (Math.floor(jd - 0.5) + 0.5) - 2451543.5;
  const Ms0 = norm360(356.0470 + 0.9856002585 * dd0);
  const w0 = 282.9404 + 4.70935e-5 * dd0;
  const Ls0 = norm360(Ms0 + w0);
  const utHours = (jd - (Math.floor(jd - 0.5) + 0.5)) * 24;
  const gmst = norm360(Ls0 + 180 + utHours * 15 * 1.00273790935);
  return { planets, gmstDeg: gmst };
}

// Astrocartography line: east longitude (0-360) of planet's angle-line at latitude
function lineLon(pl, kind, latDeg, gmstDeg) {
  const ra = pl.ra, dec = pl.dec;
  if (kind === "MC") return norm360(ra - gmstDeg);
  if (kind === "IC") return norm360(ra - gmstDeg + 180);
  const c = -Math.tan(latDeg * D2R) * Math.tan(dec * D2R);
  if (Math.abs(c) > 1) return null;
  const H = Math.acos(c) * R2D;
  return norm360(kind === "ASC" ? ra - H - gmstDeg : ra + H - gmstDeg);
}

if (typeof module !== "undefined") module.exports = { computeChart, lineLon, norm360, PLANETS };
