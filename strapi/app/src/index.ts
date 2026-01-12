import type { Core } from '@strapi/strapi';

const PUBLIC_ACTIONS = [
  'api::scene.scene.find',
  'api::scene.scene.findOne',
  'api::asset.asset.find',
  'api::asset.asset.findOne',
  'api::zone.zone.find',
  'api::zone.zone.findOne',
  'api::portal.portal.find',
  'api::portal.portal.findOne',
  'api::audio-beacon.audio-beacon.find',
  'api::audio-beacon.audio-beacon.findOne',
];

// DEV-only Toggle (optional via ENV)
const DEV_ONLY = process.env.NODE_ENV !== 'production';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    if (!DEV_ONLY) {
      strapi.log.info('Permissions seeding skipped (NODE_ENV=production)');
      return;
    }

    try {
      // 1) Public Role finden (plugin::users-permissions.role, type='public')
      const publicRole = await strapi.db
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' } });

      if (!publicRole) {
        strapi.log.warn('Public role not found; users-permissions plugin missing?');
        return;
      }

      const roleId = publicRole.id;

      // 2) Hilfsfunktionen: lesen/erstellen/aktivieren von Permission-Einträgen
      const findPermission = (action: string) =>
        strapi.db.query('plugin::users-permissions.permission').findOne({
          where: { action, role: roleId },
        });

      const createPermission = (action: string) =>
        strapi.db.query('plugin::users-permissions.permission').create({
          data: { action, role: roleId, enabled: true },
        });

      const enablePermission = (id: number) =>
        strapi.db.query('plugin::users-permissions.permission').update({
          where: { id },
          data: { enabled: true },
        });

      // 3) Alle gewünschten Aktionen sicherstellen (idempotent)
      strapi.log.info('🔧 Seeding Public permissions (find/findOne) …');
      for (const action of PUBLIC_ACTIONS) {
        const existing = await findPermission(action);
        if (!existing) {
          await createPermission(action);
          strapi.log.info(`  ➕ created ${action}`);
        } else if (!existing.enabled) {
          await enablePermission(existing.id);
          strapi.log.info(`  ✅ enabled ${action}`);
        } else {
          strapi.log.info(`  ✔ already enabled ${action}`);
        }
      }
      strapi.log.info('✅ Public permissions seeded (DEV)');
    } catch (e) {
      strapi.log.error('Permission seeding failed: ' + (e as Error).message);
      if (e instanceof Error && e.stack) {
        strapi.log.error('Stack:', e.stack);
      }
    }
  },
};
