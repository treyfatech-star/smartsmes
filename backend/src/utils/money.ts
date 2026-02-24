export const koboToNgn = (kobo: number) => (kobo / 100).toFixed(2);
export const ngnToKobo = (amount: number) => Math.round(amount * 100);
