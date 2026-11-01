export function canonicalPhone(phone: string): string {
  return phone.replace(/[\s().-]/g, '');
}
