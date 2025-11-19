import { Request, Response, NextFunction } from "express";

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session?.userId) {
        res.redirect("/login");
        return;
    }
    console.log(' User authenticated:', req.session.userId);
    next();
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session.userId) {
        console.log('Admin access required - no user ID in session');
        res.redirect('/admin/loginAdmin');
        return;
    }

    if (!req.session.isAdmin) {
        console.log(' Admin Access Required - user is not admin');
        res.status(403).send('Access denied. Admin privileges required');
        return;
    }
    
    console.log(' Admin access granted:', req.session.userId);
    next();
}

export const redirectIfAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    
    if (req.session.userId) {
        console.log(' User already authenticated, redirecting to home');
        res.redirect('/home');
        return;
    }
    next();
}

export const redirectIfAdminAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    
    if (req.session.userId && req.session.isAdmin) {
        console.log(' Admin already authenticated, redirecting to dashboard');
        res.redirect('/admin/dashboard');
        return;
    }
    next();
}

export const preventCache = (req: Request, res: Response, next: NextFunction): void => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
}