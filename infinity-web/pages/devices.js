import { escapeHTML } from '../components/utils/html.js';

function normalizeDevices(input = []) {
  if (Array.isArray(input)) return input;
  if (input && Array.isArray(input.devices)) return input.devices;
  return [];
}

export function renderDevicesPage(devices = []) {
  const items = normalizeDevices(devices);

  return `
    <section class="inf-page">
      <h2>Devices</h2>
      <div class="inf-grid">
        ${items.length
          ? items.map((device) => `
              <article class="inf-tile">
                <strong>${escapeHTML(device.name || device.label || '')}</strong>
                <p>${escapeHTML(device.note || device.description || '')}</p>
              </article>
            `).join('')
          : '<div class="inf-tile">No device entries available.</div>'}
      </div>
    </section>
  `;
}
