import { render } from '@react-email/render';

const templatesCache = new Map<string, any>();

function loadTemplate(templateName: string): any {
  if (templatesCache.has(templateName)) {
    return templatesCache.get(templateName);
  }

  try {
    const template = require(`./${templateName}`).default;
    templatesCache.set(templateName, template);
    return template;
  } catch {
    throw new Error(
      `Template "${templateName}" not found. Available templates are in packages/email/src/templates/`,
    );
  }
}

export async function renderTemplate(
  templateName: string,
  data: Record<string, unknown>,
): Promise<{ html: string; text: string }> {
  const Template = loadTemplate(templateName);
  const html = await render(Template(data));
  const text = await render(Template(data), { plainText: true });
  return { html, text };
}

export function getAvailableTemplates(): string[] {
  return ['welcome'];
}
