function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Faça login para continuar.' });
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user) return res.status(401).json({ error: 'Faça login para continuar.' });
    if (!roles.includes(req.session.user.role)) return res.status(403).json({ error: 'Acesso não autorizado.' });
    next();
  };
}

module.exports = { requireAuth, requireRole };
