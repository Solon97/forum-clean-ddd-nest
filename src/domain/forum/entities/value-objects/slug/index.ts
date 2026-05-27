export class Slug {
  private constructor(readonly value: string) {}

  static createFromText(text: string) {
    return new Slug(Slug.normalize(text));
  }

  static createFromExistingSlug(value: string) {
    if (!Slug.isValid(value)) throw new Error('Invalid slug');
    return new Slug(value);
  }

  private static isValid(value: string) {
    return Slug.normalize(value) === value;
  }

  private static normalize(text: string) {
    return (
      text
        .normalize('NFKD')
        .toLowerCase()
        .trim()
        // Replace one or more whitespace characters with a single hyphen
        .replace(/\s+/g, '-')
        // Remove all characters that are not word characters (a-z, A-Z, 0-9) or a hyphen
        .replace(/[^\w-]+/g, '')
        // Collapse multiple consecutive hyphens into a single hyphen
        .replace(/--+/g, '-')
        // Remove leading or trailing hyphens
        .replace(/^-+|-+$/g, '')
    );
  }
}
