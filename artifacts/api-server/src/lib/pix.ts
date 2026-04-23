export function getPixKey(): string {
  return (process.env.PIX_KEY ?? "").trim();
}

export function getPixQrUrl(pixKey: string): string {
  const data = encodeURIComponent(pixKey);
  return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&data=${data}`;
}
