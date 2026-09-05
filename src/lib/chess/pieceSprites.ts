/**
 * Hinh quan co, dung NGUYEN VAN bo "pixel" cua lichess.
 *
 * Sau 10 lan tu ve tay du kieu (khoi hinh hoc, ky hieu lap trinh, gumball tron, voxel gia
 * 3D) deu bi che xau, doi han chien luoc: khong tu ve nua, dung lai tai nguyen da qua
 * kiem chung tham my that -- dung cach da thanh cong voi bo Cburnett truoc do. lichess tu
 * dong goi hang chuc bo quan trong kho ma nguon mo cua ho; bo "pixel" do therealqtpi ve
 * la bo duoc chon.
 *
 * Toa do lay NGUYEN VAN tu public/piece/pixel/{w,b}{K,Q,R,B,N,P}.svg trong repo
 * lichess-org/lila (tai qua raw.githubusercontent.com, khong go tay). Moi quan la mot
 * chuoi cac nhom <path stroke="..." d="...">  -- moi nhom gom cac doan thang ngang 1 don
 * vi cung mot tong mau xam thanh MOT path duy nhat, tai tao lai y het hoa tiet bong do
 * tung pixel goc ma khong phai mot the <rect> cho moi o vuong.
 *
 * KHAC bo Cburnett: quan trang va quan den khong dung chung mot silhouette roi to lai
 * mau -- day la hai buc pixel-art RIENG BIET (duong vien giong het nhau o 5/6 quan, nhung
 * Ma trang va Ma den la hai cach ve khac nhau that su, xem lai neu nghi ngo: doi chieu
 * wN va bN ben duoi, khong cung toa do). Vi vay giu nguyen 12 muc rieng (6 quan x 2
 * mau) thay vi cau truc "mot hinh, hai mau" nhu Cburnett.
 *
 * Giay phep: AGPLv3+ (tac gia therealqtpi, xem COPYING.md cua lichess-org/lila) -- khac
 * Cburnett (CC BY-SA 3.0, chi can ghi cong). AGPL doi cong khai ma nguon khi chay nhu dich
 * vu mang; repo Typre da public san tren GitHub nen dieu kien nay da thoa. Dong ghi cong
 * nam o ChessMode.tsx, khong phai o day.
 */

/** Mot nhom net cung mau -- path SVG gop san nhieu doan ngang 1 don vi cua dung tong do. */
export interface StrokeGroup {
  stroke: string
  d: string
}

/** Khung nhin goc cua bo pixel -- luoi 16x16, dich len 0.5 don vi (xem viewBox goc). */
export const SPRITE_VIEW_BOX = "0 -0.5 16 16"

/** Khoa theo dung quy uoc lichess: chu mau thuong + CHU CAI QUAN IN HOA ("wK", "bN", ...). */
export const PIECE_SPRITES: Record<string, StrokeGroup[]> = {
  wK: [
    { stroke: "#000", d: "M7 1h2M6 2h1m2 0h1M6 3h1m2 0h1M3 4h3m1 0h2m1 0h3M2 5h1m3 0h1m2 0h1m3 0h1M2 6h1m2 0h1m1 0h2m1 0h1m2 0h1M2 7h1m3 0h1m2 0h1m3 0h1M2 8h1m1 0h1m6 0h1m1 0h1M3 9h1m1 0h2m2 0h2m1 0h1M3 10h1m8 0h1m-9 1h1m6 0h1m-8 1h8m-9 1h1m8 0h1M3 14h10" },
    { stroke: "#fdfdfd", d: "M7 2h1M3 5h1" },
    { stroke: "#a7a7a7", d: "M8 2h1M8 3h1m3 2h1m-1 1h1m-1 1h1m-1 1h1m-2 1h1m-2 1h2m-3 1h2m-2 2h3" },
    { stroke: "#e1e1e1", d: "M7 3h1M3 6h1M3 7h1M3 8h1m0 1h1m-1 1h2m-1 1h1m-2 2h2" },
    { stroke: "#c1c1c1", d: "M4 5h2m4 0h2M6 6h1m2 0h1M7 7h2M7 8h2M7 9h2m-3 1h4m-4 1h3m-3 2h3" },
  ],
  bK: [
    { stroke: "#000", d: "M7 1h2M6 2h1m2 0h1M6 3h1m2 0h1M3 4h3m1 0h2m1 0h3M2 5h1m3 0h1m2 0h1m3 0h1M2 6h1m2 0h1m1 0h2m1 0h1m2 0h1M2 7h1m3 0h1m2 0h1m3 0h1M2 8h1m1 0h1m6 0h1m1 0h1M3 9h1m1 0h2m2 0h2m1 0h1M3 10h1m8 0h1m-9 1h1m6 0h1m-8 1h8m-9 1h1m8 0h1M3 14h10" },
    { stroke: "#6d6d6d", d: "M7 2h1M3 5h1" },
    { stroke: "#151515", d: "M8 2h1M8 3h1m3 2h1m-1 1h1m-1 1h1m-1 1h1m-2 1h1m-2 1h2m-3 1h2m-2 2h3" },
    { stroke: "#494949", d: "M7 3h1M3 6h1M3 7h1M3 8h1m0 1h1m-1 1h2m-1 1h1m-2 2h2" },
    { stroke: "#242424", d: "M4 5h2m4 0h2M6 6h1m2 0h1M7 7h2M7 8h2M7 9h2m-3 1h4m-4 1h3m-3 2h3" },
  ],
  wQ: [
    { stroke: "#000", d: "M7 1h2M6 2h1m2 0h1M6 3h1m2 0h1M7 4h2M1 5h1m12 0h1M2 6h2m3 0h2m3 0h2M2 7h1m1 0h1m1 0h1m2 0h1m1 0h1m1 0h1M2 8h1m2 0h1m4 0h1m2 0h1M3 9h1m8 0h1M3 10h1m8 0h1m-9 1h1m6 0h1m-8 1h8m-9 1h1m8 0h1M3 14h10" },
    { stroke: "#fdfdfd", d: "M7 2h1M3 7h1M3 8h1" },
    { stroke: "#a7a7a7", d: "M8 2h1M8 3h1m3 4h1m-2 1h2m-2 1h1m-2 1h2m-3 1h2m-2 2h3" },
    { stroke: "#e1e1e1", d: "M7 3h1M7 7h1M4 8h1m1 0h1M4 9h2m-2 1h2m-1 1h1m-2 2h2" },
    { stroke: "#c1c1c1", d: "M8 7h1M7 8h3M6 9h5m-5 1h4m-4 1h3m-3 2h3" },
  ],
  bQ: [
    { stroke: "#000", d: "M7 1h2M6 2h1m2 0h1M6 3h1m2 0h1M7 4h2M1 5h1m12 0h1M2 6h2m3 0h2m3 0h2M2 7h1m1 0h1m1 0h1m2 0h1m1 0h1m1 0h1M2 8h1m2 0h1m4 0h1m2 0h1M3 9h1m8 0h1M3 10h1m8 0h1m-9 1h1m6 0h1m-8 1h8m-9 1h1m8 0h1M3 14h10" },
    { stroke: "#6d6d6d", d: "M7 2h1M3 7h1M3 8h1" },
    { stroke: "#151515", d: "M8 2h1M8 3h1m3 4h1m-2 1h2m-2 1h1m-2 1h2m-3 1h2m-2 2h3" },
    { stroke: "#494949", d: "M7 3h1M7 7h1M4 8h1m1 0h1M4 9h2m-2 1h2m-1 1h1m-2 2h2" },
    { stroke: "#242424", d: "M8 7h1M7 8h3M6 9h5m-5 1h4m-4 1h3m-3 2h3" },
  ],
  wR: [
    { stroke: "#000", d: "M3 1h3m1 0h6M3 2h1m1 0h1m1 0h1m4 0h1M3 3h1m1 0h3m4 0h1M3 4h1m8 0h1M3 5h10M4 6h1m6 0h1M5 7h6M5 8h1m4 0h1M5 9h1m4 0h1m-6 1h1m4 0h1m-7 1h1m6 0h1m-9 1h10M2 13h1m10 0h1M2 14h12" },
    { stroke: "#fdfdfd", d: "M4 2h1m0 4h1m-1 5h1m-3 2h3" },
    { stroke: "#c1c1c1", d: "M8 2h3M8 3h3M5 4h5M7 6h2M7 8h2M7 9h2m-2 1h2m-2 1h2m-2 2h3" },
    { stroke: "#a7a7a7", d: "M11 2h1m-1 1h1m-2 1h2M9 6h2M9 8h1M9 9h1m-1 1h1m-1 1h2m-1 2h3" },
    { stroke: "#e1e1e1", d: "M4 3h1M4 4h1m1 2h1M6 8h1M6 9h1m-1 1h1m-1 1h1m-1 2h1" },
  ],
  bR: [
    { stroke: "#000", d: "M3 1h3m1 0h6M3 2h1m1 0h1m1 0h1m4 0h1M3 3h1m1 0h3m4 0h1M3 4h1m8 0h1M3 5h10M4 6h1m6 0h1M5 7h6M5 8h1m4 0h1M5 9h1m4 0h1m-6 1h1m4 0h1m-7 1h1m6 0h1m-9 1h10M2 13h1m10 0h1M2 14h12" },
    { stroke: "#6d6d6d", d: "M4 2h1m0 4h1m-1 5h1m-3 2h1" },
    { stroke: "#242424", d: "M8 2h3M8 3h3M5 4h5M7 6h2M7 8h2M7 9h2m-2 1h2m-2 1h2m-3 2h4" },
    { stroke: "#151515", d: "M11 2h1m-1 1h1m-2 1h2M9 6h2M9 8h1M9 9h1m-1 1h1m-1 1h2m-1 2h3" },
    { stroke: "#494949", d: "M4 3h1M4 4h1m1 2h1M6 8h1M6 9h1m-1 1h1m-1 1h1m-3 2h2" },
  ],
  wB: [
    { stroke: "#000", d: "M7 1h2M6 2h1m2 0h1M6 3h1m2 0h1M7 4h2M6 5h1m2 0h1M5 6h1m4 0h1M4 7h1m4 0h1m1 0h1M4 8h1m3 0h1m2 0h1M4 9h1m6 0h1m-8 1h1m6 0h1m-7 1h1m4 0h1m-7 1h8m-9 1h1m8 0h1M3 14h10" },
    { stroke: "#fdfdfd", d: "M7 2h1M6 6h1M5 7h1" },
    { stroke: "#a7a7a7", d: "M8 2h1M8 3h1M8 5h1m1 2h1m-1 1h1m-1 1h1m-1 1h1m-2 1h1m-1 2h3" },
    { stroke: "#e1e1e1", d: "M7 3h1M5 8h1M5 9h1m-1 1h1m0 1h1m-3 2h2" },
    { stroke: "#c1c1c1", d: "M7 5h1M7 6h2M6 7h2M6 8h2m1 0h1M6 9h4m-4 1h4m-3 1h2m-3 2h3" },
  ],
  bB: [
    { stroke: "#000", d: "M7 1h2M6 2h1m2 0h1M6 3h1m2 0h1M7 4h2M6 5h1m2 0h1M5 6h1m4 0h1M4 7h1m4 0h1m1 0h1M4 8h1m3 0h1m2 0h1M4 9h1m6 0h1m-8 1h1m6 0h1m-7 1h1m4 0h1m-7 1h8m-9 1h1m8 0h1M3 14h10" },
    { stroke: "#6d6d6d", d: "M7 2h1M6 6h1M5 7h1" },
    { stroke: "#151515", d: "M8 2h1M8 3h1M8 5h1m1 2h1m-1 1h1m-1 1h1m-1 1h1m-2 1h1m-1 2h3" },
    { stroke: "#494949", d: "M7 3h1M7 5h1M5 8h1M5 9h1m-1 1h1m0 1h1m-3 2h2" },
    { stroke: "#242424", d: "M7 6h2M6 7h2M6 8h2m1 0h1M6 9h4m-4 1h4m-3 1h2m-3 2h3" },
  ],
  wN: [
    { stroke: "#000", d: "M4 1h4M4 2h1m3 0h3M5 3h1m5 0h1M4 4h1m7 0h1M3 5h1m8 0h1M2 6h1m5 0h1m3 0h1M2 7h1m2 0h3m4 0h1M3 8h2m2 0h1m4 0h1M6 9h1m5 0h1m-8 1h1m5 0h1m-8 1h1m6 0h1m-8 1h8m-9 1h1m8 0h1M3 14h10" },
    { stroke: "#fdfdfd", d: "M5 2h1m-1 9h1m-2 2h1" },
    { stroke: "#e1e1e1", d: "M6 2h1M6 3h1M5 4h1M4 5h1M3 6h1M3 7h1m4 0h1M8 8h1M7 9h1m-2 1h1m-1 1h1m-2 2h1" },
    { stroke: "#c1c1c1", d: "M7 2h1M7 3h3M7 4h4M5 5h3m1 0h2M4 6h3m2 0h2M4 7h1m4 0h2M9 8h2M8 9h3m-4 1h3m-3 1h2m-3 2h3" },
    { stroke: "#a7a7a7", d: "M10 3h1m0 1h1M8 5h1m2 0h1M7 6h1m3 0h1m-1 1h1m-1 1h1m-1 1h1m-2 1h1m-2 1h2m-2 2h3" },
    { stroke: "#494949", d: "M6 4h1" },
  ],
  bN: [
    { stroke: "#000", d: "M4 1h4M4 2h1m3 0h3M5 3h1m5 0h1M4 4h1m1 0h1m5 0h1M3 5h1m8 0h1M2 6h1m5 0h1m3 0h1M2 7h1m2 0h3m4 0h1M3 8h2m2 0h1m4 0h1M6 9h1m5 0h1m-8 1h1m5 0h1m-8 1h1m6 0h1m-8 1h8m-9 1h1m8 0h1M3 14h10" },
    { stroke: "#6d6d6d", d: "M5 2h1m-1 9h1" },
    { stroke: "#494949", d: "M6 2h1M6 3h1M5 4h1M4 5h1M3 6h1M3 7h1m4 0h1M8 8h1M7 9h1m-2 1h1m-1 1h1m-3 2h2" },
    { stroke: "#242424", d: "M7 2h1M7 3h3M7 4h4M5 5h3m1 0h2M4 6h3m2 0h2M4 7h1m4 0h2M9 8h2M8 9h3m-4 1h3m-3 1h2m-3 2h3" },
    { stroke: "#151515", d: "M10 3h1m0 1h1M8 5h1m2 0h1M7 6h1m3 0h1m-1 1h1m-1 1h1m-1 1h1m-2 1h1m-2 1h2m-2 2h3" },
  ],
  wP: [
    { stroke: "#000", d: "M6 2h4M5 3h1m4 0h1M5 4h1m4 0h1M5 5h1m4 0h1M6 6h1m2 0h1M5 7h1m4 0h1M5 8h1m4 0h1M6 9h1m2 0h1m-5 1h1m4 0h1m-7 1h1m6 0h1m-8 1h1m6 0h1m-8 1h8" },
    { stroke: "#fdfdfd", d: "M6 3h1" },
    { stroke: "#e1e1e1", d: "M7 3h2M6 4h1M6 7h2m-2 3h1m-2 1h2m-2 1h1" },
    { stroke: "#a7a7a7", d: "M9 3h1M9 4h1M9 5h1M8 6h1m0 1h1M7 8h3M8 9h1m0 1h1m0 1h1m-5 1h5" },
    { stroke: "#c1c1c1", d: "M7 4h2M6 5h3M7 6h1m0 1h1M6 8h1m0 1h1m-1 1h2m-2 1h3" },
  ],
  bP: [
    { stroke: "#000", d: "M6 2h4M5 3h1m4 0h1M5 4h1m4 0h1M5 5h1m4 0h1M6 6h1m2 0h1M5 7h1m4 0h1M5 8h1m4 0h1M6 9h1m2 0h1m-5 1h1m4 0h1m-7 1h1m6 0h1m-8 1h1m6 0h1m-8 1h8" },
    { stroke: "#6d6d6d", d: "M6 3h1M6 7h1m-1 3h1m-2 1h1" },
    { stroke: "#494949", d: "M7 3h2M6 4h1m0 3h1m-2 4h1m-2 1h1" },
    { stroke: "#151515", d: "M9 3h1M9 4h1M9 5h1M8 6h1m0 1h1M7 8h3M8 9h1m0 1h1m0 1h1m-5 1h5" },
    { stroke: "#242424", d: "M7 4h2M6 5h3M7 6h1m0 1h1M6 8h1m0 1h1m-1 1h2m-2 1h3" },
  ],
}
