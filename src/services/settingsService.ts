import { apiFetch } from './api';

export const settingsService = {
  getAllSettings: async () => {
    return apiFetch('/api/settings');
  },
  
  getSettingByName: async (name: string) => {
    return apiFetch(`/api/settings/${name}`);
  },

  upsertSetting: async (name: string, content: string) => {
    return apiFetch('/api/settings', {
      method: 'POST',
      body: JSON.stringify({ name, content }),
    });
  }
};
