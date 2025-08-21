import { Request, Response } from 'express';
import { prisma } from '../config/db';

const TEMPLATE_LINK_KEY = 'templateLink';

export async function getTemplateLink(_req: Request, res: Response) {
    const settingModel = (prisma as any).setting;
    if (!settingModel) {
        // Prisma client not regenerated yet (migration not applied)
        return res.json({ templateLink: null });
    }
    const s = await settingModel.findUnique({ where: { key: TEMPLATE_LINK_KEY } });
    res.json({ templateLink: s?.value || null });
}

export async function setTemplateLink(req: Request, res: Response) {
    const { templateLink } = req.body as { templateLink?: string };
    if (!templateLink) return res.status(400).json({ message: 'templateLink is required' });
    const settingModel = (prisma as any).setting;
    if (!settingModel) return res.status(500).json({ message: 'Settings storage not ready. Please run Prisma migrate.' });
    const s = await settingModel.upsert({
        where: { key: TEMPLATE_LINK_KEY },
        update: { value: templateLink },
        create: { key: TEMPLATE_LINK_KEY, value: templateLink }
    });
    res.json({ templateLink: s.value });
}
