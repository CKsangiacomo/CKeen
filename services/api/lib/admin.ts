export function requireAdmin(req: Request): boolean {
  try {
    const hdr = (req.headers.get('x-ckeen-admin') || '').trim();
    const secret = (process.env.INTERNAL_ADMIN_KEY || '').trim();
    return !!hdr && !!secret && hdr === secret;
  } catch {
    return false;
  }
}


